import frappe
from frappe.utils import getdate, nowdate, add_days

def execute(filters=None):
    columns = [
        {"label": "Date", "fieldname": "posting_date", "fieldtype": "Date", "width": 100},
        {"label": "Truck", "fieldname": "truck", "fieldtype": "Data", "width": 100},
        {"label": "Deliveries", "fieldname": "num_deliveries", "fieldtype": "Int", "width": 100},
        {"label": "Total Value", "fieldname": "total_value", "fieldtype": "Currency", "width": 120},
        {"label": "Target Deliveries", "fieldname": "target_deliveries", "fieldtype": "Int", "width": 120},
        {"label": "Target Value", "fieldname": "target_value", "fieldtype": "Currency", "width": 120},
    ]

    data = frappe.db.sql("""
        SELECT
            dn.posting_date,
            dn.vehicle_no AS truck,
            COUNT(dn.name) AS num_deliveries,
            SUM(dn.grand_total) AS total_value
        FROM `tabDelivery Note` dn
        WHERE dn.docstatus = 1
        GROUP BY dn.posting_date, dn.vehicle_no
        ORDER BY dn.posting_date DESC
    """, as_dict=True)

    # Fetch targets
    targets = {
        (d.date, d.truck): d for d in frappe.get_all(
            "Delivery Target",
            fields=["date", "truck", "target_deliveries", "target_value"]
        )
    }

    # Merge target info into report
    for row in data:
        key = (row.posting_date, row.truck)
        target = targets.get(key)
        if target:
            row["target_deliveries"] = target.target_deliveries
            row["target_value"] = target.target_value
        else:
            row["target_deliveries"] = 0
            row["target_value"] = 0

    return columns, data
