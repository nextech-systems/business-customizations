import frappe
import erpnext.stock.doctype.pick_list.pick_list as pick_list_module

def execute():
    """Custom patch to prevent Pick List from selecting disabled or zero-qty warehouses."""
    frappe.reload_doc("stock", "doctype", "pick_list")

    def get_available_item_locations_for_other_item(
        item_code,
        from_warehouses,
        required_qty,
        company,
        total_picked_qty=0,
        consider_rejected_warehouses=False,
    ):
        return frappe.db.sql(f"""
            SELECT
                b.item_code,
                b.warehouse,
                b.actual_qty AS qty
            FROM
                `tabBin` b
            JOIN
                `tabWarehouse` w ON w.name = b.warehouse
            WHERE
                b.item_code = %(item_code)s
                AND b.actual_qty > 0
                AND w.disabled = 1
                AND w.company = %(company)s
                { "AND b.warehouse IN %(from_warehouses)s" if from_warehouses else "" }
            ORDER BY
                b.actual_qty DESC
        """, {
            "item_code": item_code,
            "company": company,
            "from_warehouses": tuple(from_warehouses or [])
        }, as_dict=True)

    pick_list_module.get_available_item_locations_for_other_item = get_available_item_locations_for_other_item

    frappe.msgprint("✅ Patched Pick List to skip disabled and empty warehouses.")


import frappe
import erpnext.stock.doctype.pick_list.pick_list as pick_list_module

def execute():
    """Patch batched item picking to skip disabled or zero-qty warehouses."""
    frappe.reload_doc("stock", "doctype", "pick_list")

    original = pick_list_module.get_available_item_locations_for_batched_item

    def patched_batched_item_locations(
        item_code,
        from_warehouses,
        required_qty,
        company,
        total_picked_qty=0,
        consider_rejected_warehouses=False,
    ):
        results = original(
            item_code,
            from_warehouses,
            required_qty,
            company,
            total_picked_qty,
            consider_rejected_warehouses
        )
        # Filter out disabled or zero-qty bins
        filtered = []
        for r in results:
            if r.get("qty", 0) <= 0:
                continue
            if frappe.db.get_value("Warehouse", r["warehouse"], "disabled"):
                continue
            filtered.append(r)
        return filtered

    pick_list_module.get_available_item_locations_for_batched_item = patched_batched_item_locations

    frappe.msgprint("✅ Patched batched item picking to skip disabled/empty warehouses.")


