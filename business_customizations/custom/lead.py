import frappe
from frappe import _
from erpnext.crm.doctype.lead.lead import Lead

class CustomLead(Lead):
    """Custom Lead class with automatic quotation transfer"""
    
    def make_customer(self, customer_name=None):
        """Override to update quotations after customer creation"""
        
        # Call the original method to create customer
        customer = super().make_customer(customer_name)
        
        # Update quotations to link to new customer
        if customer:
            quotations = frappe.get_all("Quotation",
                filters={
                    "quotation_to": "Lead",
                    "party_name": self.name
                },
                pluck="name"
            )
            
            for quotation_name in quotations:
                frappe.db.set_value("Quotation", quotation_name, {
                    "quotation_to": "Customer",
                    "party_name": customer.name,
                    "customer_name": customer.name
                }, update_modified=False)
            
            if quotations:
                frappe.msgprint(
                    _("Transferred {0} quotation(s) to customer").format(len(quotations)),
                    indicator="green"
                )
        
        return customer
