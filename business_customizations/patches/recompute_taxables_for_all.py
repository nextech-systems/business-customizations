import frappe
from business_customizations.payroll import salary_slip_hooks

def execute():
    slips = frappe.get_all("Salary Slip", filters={"docstatus": ["<", 2]}, pluck="name")
    for name in slips:
        try:
            ss = frappe.get_doc("Salary Slip", name)
            ss.flags.ignore_permissions = True
            salary_slip_hooks.recompute_tax_bases(ss)
            ss.save()
            frappe.db.commit()
            frappe.logger().info(f"✅ Recomputed {name}")
        except Exception as e:
            frappe.log_error(f"❌ Error recomputing {name}: {e}")
