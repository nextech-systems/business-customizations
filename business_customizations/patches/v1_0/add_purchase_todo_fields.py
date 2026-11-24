import frappe

def _make_custom_field(dt, fieldname, label, fieldtype, **kwargs):
    if frappe.db.exists("Custom Field", f"{dt}-{fieldname}"):
        return
    doc = frappe.get_doc({
        "doctype": "Custom Field",
        "dt": dt,
        "label": label,
        "fieldname": fieldname,
        "fieldtype": fieldtype,
        **kwargs,
    })
    doc.insert(ignore_permissions=True)

def execute():
    doctypes = ["Purchase Order", "Purchase Invoice"]
    for dt in doctypes:
        _make_custom_field(
            dt, "create_todo", "Create ToDo", "Check",
            insert_after="posting_date", default="0",
        )
        _make_custom_field(
            dt, "assign_to", "Assign To", "Link",
            options="User", insert_after="create_todo",
        )
        _make_custom_field(
            dt, "follow_up_by", "Follow Up By", "Date",
            insert_after="assign_to",
        )
        _make_custom_field(
            dt, "todo_created", "ToDo Created", "Check",
            insert_after="follow_up_by", hidden=1, read_only=1, default="0",
        )
