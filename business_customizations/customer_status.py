import frappe
from frappe.utils import flt

def update_customer_status(customer, company):
    # Get credit limit
    credit_limit = flt(frappe.db.get_value("Customer Credit Limit", {
        "parent": customer,
        "parenttype": "Customer",
        "company": company
    }, "credit_limit") or 0)

    # Calculate net outstanding = total invoices - unapplied payments
    total_outstanding = flt(frappe.db.sql("""
        SELECT IFNULL(SUM(outstanding_amount), 0)
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer = %s AND company = %s
    """, (customer, company))[0][0])

    unapplied_payments = flt(frappe.db.sql("""
        SELECT IFNULL(SUM(unallocated_amount), 0)
        FROM `tabPayment Entry`
        WHERE docstatus = 1 AND party_type = 'Customer' AND party = %s AND company = %s
    """, (customer, company))[0][0])

    net_outstanding = total_outstanding - unapplied_payments

    # Determine new status based on credit limit and outstanding
    if credit_limit == 0 and net_outstanding <= 0:
        status = "Good Standing"
    elif credit_limit == 0 and net_outstanding > 0:
        status = "Overdue"
    elif net_outstanding > credit_limit:
        status = "Exceeded Credit Limit"
    else:
        status = "Good Standing"

    # Update Customer doc if status changed
    current_status = frappe.db.get_value("Customer", customer, "custom_credit_status")
    if current_status != status:
        frappe.db.set_value("Customer", customer, "custom_credit_status", status)
        frappe.db.commit()


def update_customer_status_on_submit(doc, method):
    customer = getattr(doc, "customer", None) or getattr(doc, "party", None)
    if customer:
        update_customer_status(customer, doc.company)


def update_customer_status_on_cancel(doc, method):
    customer = getattr(doc, "customer", None) or getattr(doc, "party", None)
    if customer:
        update_customer_status(customer, doc.company)
