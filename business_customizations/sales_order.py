import frappe
from frappe import _

def validate_sales_order_credit(doc, method):
    customer = frappe.get_doc("Customer", doc.customer)
    if customer.get("approved_for_credit"):
        return  # credit approved, allow

    credit_limit = customer.get("credit_limit") or 0.0

    # Calculate outstanding invoices
    outstanding = frappe.db.sql("""
        SELECT SUM(outstanding_amount)
        FROM `tabSales Invoice`
        WHERE customer = %s AND docstatus = 1 AND outstanding_amount > 0
    """, (doc.customer,))[0][0] or 0.0

    if outstanding > credit_limit:
        frappe.throw(_(
            f"Customer has outstanding invoices of {outstanding:.2f}, "
            f"which exceeds the credit limit of {credit_limit:.2f}. "
            "Sales Order not allowed."
        ))

    # Check if any credit terms (days) apply and if they are breached
    # Optionally, you could fetch payment terms and check invoice ages here.
