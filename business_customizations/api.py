import re
import json
import frappe
from frappe import _
from frappe.utils import flt, cint, getdate
from frappe.model.mapper import get_mapped_doc


# ─────────────────────────────────────────────────────────────────────────────
# Order Tracking
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist()
def get_order_tracking_info(query):
    result = []

    # Match Sales Order by name or customer
    sales_orders = frappe.get_all(
        "Sales Order",
        fields=["name", "status", "customer"],
        filters={"name": ["like", f"%{query}%"]}
        if query.startswith("SO-")
        else {"customer": ["like", f"%{query}%"]},
    )

    frappe.log_error(f"Query: {query} | Results: {sales_orders}", "Order Tracking Debug")

    if not sales_orders:
        return result

    for so in sales_orders:
        result.append({"doctype": "Sales Order", "name": so.name, "status": so.status})

        # Material Requests
        material_requests = frappe.get_all(
            "Material Request",
            fields=["name", "status"],
            filters={"sales_order": so.name},
        )
        for mr in material_requests:
            result.append({"doctype": "Material Request", "name": mr.name, "status": mr.status})

        # Work Orders
        work_orders = frappe.get_all(
            "Work Order",
            fields=["name", "status"],
            filters={"sales_order": so.name},
        )
        for wo in work_orders:
            result.append({"doctype": "Work Order", "name": wo.name, "status": wo.status})

        # Pick Lists
        pick_lists = frappe.get_all(
            "Pick List",
            fields=["name", "status"],
            filters={"sales_order": so.name},
        )
        for pl in pick_lists:
            result.append({"doctype": "Pick List", "name": pl.name, "status": pl.status})

        # Delivery Notes
        delivery_notes = frappe.get_all(
            "Delivery Note",
            fields=["name", "status"],
            filters={"against_sales_order": so.name},
        )
        for dn in delivery_notes:
            result.append({"doctype": "Delivery Note", "name": dn.name, "status": dn.status})

        # Delivery Trips
        delivery_trips = frappe.get_all(
            "Delivery Trip",
            fields=["name", "status"],
            filters={"reference_sales_order": so.name},
        )
        for dt in delivery_trips:
            result.append({"doctype": "Delivery Trip", "name": dt.name, "status": dt.status})

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Lead → Customer Conversion
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist()
def make_customer(source_name, target_doc=None):
    lead = frappe.get_doc("Lead", source_name)

    # Block duplicate conversion
    if lead.get("customer"):
        frappe.throw(_("Customer already created for this Lead: {0}").format(lead.customer))

    def set_missing_values(source, target):
        # ---- Customer Name (MANDATORY) ----
        customer_name = (
            source.get("company_name")
            or source.get("lead_name")
            or " ".join(
                [p for p in [source.get("first_name"), source.get("middle_name"), source.get("last_name")] if p]
            )
            or source.name
        )
        target.customer_name = customer_name
        target.customer_type = "Company" if source.get("company_name") else "Individual"

        # ---- Customer Group ----
        cg = source.get("customer_group") or source.get("custom_customer_group")
        if cg:
            target.customer_group = cg

        # ---- Credit Limit ----
        cl = source.get("credit_limit")
        if cl is None:
            cl = source.get("custom_credit_limit")
        if cl is None:
            cl = 0

        company = (
            frappe.defaults.get_user_default("Company")
            or frappe.db.get_default("company")
            or (frappe.get_all("Company", pluck="name") or [None])[0]
        )

        if not target.get("credit_limits"):
            target.append(
                "credit_limits",
                {
                    "company": company,
                    "credit_limit": cl,
                    "bypass_credit_limit_check": 0,
                },
            )

    customer = get_mapped_doc(
        "Lead",
        source_name,
        {"Lead": {"doctype": "Customer"}},
        target_doc,
        set_missing_values,
    )

    customer.insert(ignore_permissions=True)

    # Always set these so the UI treats the lead as converted
    lead.db_set("customer", customer.name, update_modified=False)
    lead.db_set("status", "Converted", update_modified=False)

    # Move quotations to customer, but keep lead_reference so they show on Lead too
    quotations = frappe.get_all(
        "Quotation",
        filters={"quotation_to": "Lead", "party_name": source_name},
        pluck="name",
    )

    for q in quotations:
        frappe.db.set_value(
            "Quotation",
            q,
            {
                "quotation_to": "Customer",
                "party_name": customer.name,
                "customer_name": customer.customer_name,
                "lead_reference": source_name,
            },
            update_modified=False,
        )

    if quotations:
        frappe.msgprint(
            _("Linked {0} quotation(s) to Customer and kept Lead reference.").format(len(quotations)),
            indicator="green",
        )

    return customer


# ─────────────────────────────────────────────────────────────────────────────
# Incoming Shipments Dashboard
# ─────────────────────────────────────────────────────────────────────────────


    # Fall back to the standard `instructions` field
    val = frappe.db.get_value("Purchase Order", po_name, "instructions")
    if val:
        return val.strip()

    return ""


@frappe.whitelist()
def get_incoming_shipments_dashboard_data(limit=200, supplier=None):
    limit = cint(limit) or 200

    # FIX 1: `notes` is NOT a standard ERPNext Purchase Order field — removed.
    # FIX 2: `supplier_delivery_note` added to fields list so `po.so` populates.
    po_rows = frappe.get_all(
        "Purchase Order",
        fields=[
            "name",
            "supplier",
            "supplier_name",
            "transaction_date",
            "schedule_date",
            "status",
            "grand_total",
            "base_grand_total",
            "advance_paid",
            "per_received",
            "per_billed",
            "currency",
            "company",
            "incoterm",
            "container_no",
            "bill_of_lading",
            "vessel_name",
            "carrier",
            "eta_kingston",
            "container_status",
            "customs_status",
            "local_charges",
            "shipping_notes",
        ],
        filters={"docstatus": 1, "status": ["not in", ["Completed", "Closed"]]},
        order_by="transaction_date desc",
        limit_page_length=limit,
    )

    if not po_rows:
        return {
            "summary": {
                "total": 0,
                "in_transit": 0,
                "overdue": 0,
                "clearing": 0,
                "received": 0,
                "total_value_usd": 0,
            },
            "rows": [],
        }

    po_names = [d.name for d in po_rows]

    item_rows = frappe.get_all(
        "Purchase Order Item",
        fields=[
            "parent",
            "item_code",
            "item_name",
            "description",
            "qty",
            "uom",
            "received_qty",
            "billed_amt",
            "amount",
        ],
        filters={"parent": ["in", po_names], "docstatus": 1},
        order_by="idx asc",
        limit_page_length=5000,
    )

    items_by_po = {}
    for d in item_rows:
        items_by_po.setdefault(d.parent, []).append(d)

    pr_rows = frappe.get_all(
        "Purchase Receipt Item",
        fields=["purchase_order", "parent", "item_code", "qty"],
        filters={"purchase_order": ["in", po_names], "docstatus": 1},
        limit_page_length=5000,
    )
    pr_by_po = {}
    for d in pr_rows:
        pr_by_po.setdefault(d.purchase_order, []).append(d)

    pi_rows = frappe.get_all(
        "Purchase Invoice Item",
        fields=["purchase_order", "parent", "item_code", "amount", "base_amount"],
        filters={"purchase_order": ["in", po_names], "docstatus": 1},
        limit_page_length=5000,
    )
    pi_by_po = {}
    for d in pi_rows:
        pi_by_po.setdefault(d.purchase_order, []).append(d)

    pe_refs = frappe.get_all(
        "Payment Entry Reference",
        fields=["reference_name", "allocated_amount", "parent", "reference_doctype"],
        filters={
            "reference_doctype": "Purchase Order",
            "reference_name": ["in", po_names],
            "docstatus": 1,
        },
        limit_page_length=5000,
    )
    pe_by_po = {}
    for d in pe_refs:
        pe_by_po.setdefault(d.reference_name, []).append(d)

    today = getdate()
    out = []
    total_value_usd = 0

    for po in po_rows:
        po_items = items_by_po.get(po.name, [])
        prs = pr_by_po.get(po.name, [])
        pis = pi_by_po.get(po.name, [])
        pes = pe_by_po.get(po.name, [])

        ordered_qty = sum(flt(x.qty) for x in po_items)
        received_qty = sum(flt(x.received_qty) for x in po_items)
        billed_amt = sum(flt(x.billed_amt) for x in po_items)
        allocated_amount = sum(flt(x.allocated_amount) for x in pes)

        product_parts = []
        for x in po_items[:3]:
            label = x.item_name or x.item_code or x.description or "Item"
            product_parts.append(label)
        product_summary = ", ".join(product_parts) if product_parts else "Various Items"
        if len(po_items) > 3:
            product_summary += " ..."

        eta = po.eta_kingston or po.schedule_date or po.transaction_date
        eta_date = getdate(eta) if eta else None
        days_away = None
        if eta_date:
            days_away = (eta_date - today).days

        # Read real custom shipping fields from PO
        notes = po.shipping_notes or ""
        notes_l = notes.lower()

        container_no = po.container_no or ""
        bol_no = po.bill_of_lading or ""
        vessel = po.vessel_name or ""

        if flt(po.per_received) >= 100 or (received_qty >= ordered_qty and ordered_qty > 0):
            shipment_status = "Fully Received"
        elif received_qty > 0:
            shipment_status = "Partially Received"
        elif po.container_status:
            shipment_status = po.container_status
        elif "customs" in notes_l or "clearing" in notes_l:
            shipment_status = "Customs Clearing"
        elif "overland" in notes_l or "truck" in notes_l:
            shipment_status = "Overland Freight"
        elif "delay" in notes_l or (days_away is not None and days_away < 0):
            shipment_status = "Delayed"
        elif container_no or bol_no or vessel or po.status in ("To Receive", "To Receive and Bill"):
            shipment_status = "En Route"
        else:
            shipment_status = "Ordered"

        if allocated_amount > 0 and flt(po.base_grand_total or po.grand_total):
            base_total = flt(po.base_grand_total) or flt(po.grand_total)
            paid_pct = int(round((allocated_amount / base_total) * 100)) if base_total else 0
        else:
            paid_pct = 0

        if paid_pct >= 100:
            payment_status = "Fully Paid"
        elif paid_pct > 0:
            payment_status = "Partially Paid"
        else:
            payment_status = "Unpaid"

        customs_status = po.customs_status or ("Filed" if "customs" in notes_l else "Not Filed")
        if not po.customs_status:
            if "cleared" in notes_l:
                customs_status = "Cleared"
            if "hold" in notes_l or "held" in notes_l:
                customs_status = "Held"

        local_charges = po.local_charges or ("Paid" if "local charges paid" in notes_l else "Not Paid")

        value_usd = flt(po.grand_total)
        total_value_usd += value_usd

        out.append({
            "po": po.name,
            "so": po.supplier_delivery_note or "",   # FIX 2: now in fields list
            "supplier": po.supplier_name or po.supplier,
            "product": product_summary,
            "value": value_usd,
            "currency": po.currency or "USD",
            "transaction_date": str(po.transaction_date) if po.transaction_date else None,
            "eta": str(eta_date) if eta_date else None,
            "days_away": days_away,
            "status": shipment_status,
            "payment": payment_status,
            "paid_pct": max(0, min(100, paid_pct)),
            "customs": customs_status,
            "local_charges": local_charges,
            "tracking": container_no,
            "container_no": container_no,
            "bol": bol_no,
            "vessel": vessel,
            "carrier": po.carrier or "",
            "notes": notes,
            "ordered_qty": ordered_qty,
            "received_qty": received_qty,
            "billed_amt": billed_amt,
            "allocated_amount": allocated_amount,
            "purchase_receipts": len({x.parent for x in prs}),
            "purchase_invoices": len({x.parent for x in pis}),
            "erpnext_status": po.status,
            "company": po.company,
            "incoterm": po.incoterm,
        })

    summary = {
        "total": len(out),
        "in_transit": len([x for x in out if x["status"] in ("En Route", "Overland Freight")]),
        "overdue": len([x for x in out if x["days_away"] is not None and x["days_away"] < 0 and x["status"] != "Fully Received"]),
        "clearing": len([x for x in out if x["status"] == "Customs Clearing"]),
        "received": len([x for x in out if x["status"] == "Fully Received"]),
        "total_value_usd": total_value_usd,
    }

    return {"summary": summary, "rows": out}


# ─────────────────────────────────────────────────────────────────────────────
# Save Shipment Notes (called from the Edit modal in the dashboard)
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist()
def update_shipment_notes(po_name, data):
    """
    Persist dashboard edits (notes, tracking, BOL, customs status, etc.) back
    to the Purchase Order's custom_shipment_notes field.

    The dashboard encodes all editable fields into `data` as a JSON string.
    Only `notes` is written back to ERPNext; the other fields (tracking, bol,
    customs, local_charges, status) are derived/display fields managed by the
    dashboard's own logic and do not map to standard PO fields.

    To also persist tracking/BOL you would need additional custom fields on
    Purchase Order (e.g. custom_container_no, custom_bol_no). Add them via
    Customize Form and extend the db_set block below accordingly.
    """
    if isinstance(data, str):
        data = json.loads(data)

    if not frappe.db.exists("Purchase Order", po_name):
        frappe.throw(_("Purchase Order {0} not found.").format(po_name))

    # Only System Manager or Purchase users should be able to update
    frappe.only_for(["System Manager", "Purchase Manager", "Purchase User"])

    updates = {}

    if "notes" in data:
        updates["custom_shipment_notes"] = (data["notes"] or "").strip()

    # Extend here if you add custom_container_no / custom_bol_no fields:
    # if "tracking" in data:
    #     updates["custom_container_no"] = (data["tracking"] or "").strip()
    # if "bol" in data:
    #     updates["custom_bol_no"] = (data["bol"] or "").strip()

    if updates:
        frappe.db.set_value("Purchase Order", po_name, updates, update_modified=False)
        frappe.db.commit()

    return {"status": "ok", "po": po_name}


import frappe
from frappe.www.printview import get_print_format_doc, get_rendered_template

import frappe
from frappe.www.printview import get_print_format_doc, get_rendered_template


import frappe
from frappe.www.printview import get_print_format_doc, get_rendered_template


import frappe
from frappe.utils import escape_html, flt


@frappe.whitelist()
def print_draft_pick_list(name):
    doc = frappe.get_doc("Pick List", name)

    if not frappe.has_permission("Pick List", "read", doc=doc):
        frappe.throw("Not permitted")

    rows = ""
    for row in doc.get("locations", []):
        desc = row.description or row.item_name or row.item_code
        qty = row.qty or row.stock_qty or 0
        warehouse = row.warehouse or ""

        rows += f"""
        <tr>
            <td class="desc">{escape_html(desc)}</td>
            <td class="qty">{flt(qty)}</td>
            <td class="wh">{escape_html(warehouse)}</td>
        </tr>
        """

    html = f"""
    <!doctype html>
    <html>
    <head>
        <style>
            @page {{
                width: 63.5mm;
                margin: 0;
            }}

            html, body {{
                width: 63.5mm;
                margin: 0;
                padding: 0;
            }}

            body {{
                font-family: Arial, sans-serif;
                font-size: 14px;
                zoom: 1.5;
            }}

            h3 {{
                margin: 0 0 4px 0;
                font-size: 18px;
                text-align: center;
            }}

            .small {{
                font-size: 13px;
                margin-bottom: 6px;
                line-height: 1.2;
            }}

            table {{
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }}

            th {{
                text-align: left;
                border-bottom: 2px solid #000;
                font-size: 11px;
                padding-bottom: 3px;
            }}

            td {{
                padding: 4px 0;
                border-bottom: 1px dashed #999;
                vertical-align: top;
                font-size: 13px;
            }}

            .desc {{
                width: 55%;
                word-wrap: break-word;
            }}

            .qty {{
                width: 15%;
                text-align: right;
                font-size: 15px;
                font-weight: bold;
                white-space: nowrap;
            }}

            .wh {{
                width: 30%;
                text-align: left;
                font-size: 11px;
                padding-left: 4px;
                word-wrap: break-word;
            }}
        </style>
    </head>
    <body>
        <h3>PICK LIST</h3>

        <div class="small">
            <b>{escape_html(doc.name)}</b><br>
            Customer:<br>
            <b>{escape_html(doc.customer_name or doc.customer or "")}</b>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="desc">Description</th>
                    <th class="qty">Qty</th>
                    <th class="wh">WH</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>

        <script>
            window.onload = function() {{
                window.print();
            }};
        </script>
    </body>
    </html>
    """

    return {"html": html}
