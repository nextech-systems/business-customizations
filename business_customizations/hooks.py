from . import __version__ as app_version

app_name = "business_customizations"
app_title = "Business Customizations"
app_publisher = 'Nexxttech Solutions Ja'
app_description = "Business Customizations"
app_email = "nexxttechja@gmail.com"
app_license = "MIT"


# Whitelisted frontend methods
whitelisted_methods = [
    "business_customizations.api.get_order_tracking_info"
]


# 🔹 Override ERPNext Lead → Create Customer mapping
override_whitelisted_methods = {
    "erpnext.crm.doctype.lead.lead.make_customer": "business_customizations.api.make_customer"
}


doc_events = {
    "Salary Slip": {
        "before_insert": [
            "business_customizations.payroll.salary_slip_hooks.recompute_tax_bases",
        ],
        "before_save": [
            "business_customizations.payroll.salary_slip_hooks.recompute_tax_bases",
        ],
        "before_submit": [
            "business_customizations.payroll.salary_slip_hooks.recompute_tax_bases",
            "business_customizations.payroll.salary_slip_hooks.finalize_totals_before_submit",
        ],
        "on_submit": "business_customizations.payroll.salary_slip_hooks.create_or_update_journal_entry",
        "on_cancel": "business_customizations.payroll.salary_slip_hooks.cancel_linked_journal_entry",
    },

    # --- Sales / Credit hooks ---
    "Sales Order": {
        "validate": "business_customizations.customer.check_customer_credit_limit",
        "before_insert": "business_customizations.customer.check_customer_credit_limit",
    },
    "Sales Invoice": {
        "before_insert": "business_customizations.customer.check_customer_credit_limit",
        "on_submit": "business_customizations.customer_status.update_customer_status_on_submit",
        "on_cancel": "business_customizations.customer_status.update_customer_status_on_cancel",
    },
    "Delivery Note": {
        "before_insert": "business_customizations.customer.check_customer_credit_limit",
    },
    "Payment Entry": {
        "on_submit": "business_customizations.customer_status.update_customer_status_on_submit",
        "on_cancel": "business_customizations.customer_status.update_customer_status_on_cancel",
    },
    "Customer": {
        "validate": "business_customizations.customer.validate_credit_limit",
    },
}


# Keep your custom Lead class override
override_doctype_class = {
    "Lead": "business_customizations.custom.lead.CustomLead"
}

# Page is auto-discovered — no hooks.py change needed

scheduler_events = {
    "cron": {
        "*/10 * * * *": [
            "business_customizations.attendance.update_last_sync"
        ]
    }
}


