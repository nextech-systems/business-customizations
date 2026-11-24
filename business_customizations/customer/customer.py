def get_dashboard_info(customer):
    credit_limit = customer.get("credit_limit") or 0
    outstanding = frappe.db.sql("""
        SELECT SUM(outstanding_amount)
        FROM `tabSales Invoice`
        WHERE customer = %s AND docstatus = 1
    """, (customer.name,))[0][0] or 0

    if outstanding > credit_limit and not customer.get("approved_for_credit"):
        return {
            "indicator": "red",
            "label": "Credit Blocked",
            "tooltip": f"Outstanding {outstanding} exceeds credit limit {credit_limit}"
        }
