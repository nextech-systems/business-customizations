import frappe
from frappe.utils import now_datetime

def update_last_sync():
    """
    Advances Shift Type.last_sync_of_checkin to now for every shift with
    auto-attendance enabled. HRMS's own hourly process_auto_attendance_for_all_shifts
    job filters Employee Checkins by shift_actual_end < last_sync_of_checkin,
    but never advances that field itself — something has to. This is that
    something, and it needs to run BEFORE HRMS's hourly_long job, which is
    why it's scheduled every 10 minutes rather than hourly.
    """
    # Temporarily paused while Hikvision first-IN/last-OUT sync is implemented.
    # Do not advance the HRMS attendance cutoff until synchronization is verified.
    frappe.logger().info("Hikvision attendance cutoff update temporarily paused")
    return

    shift_types = frappe.get_all("Shift Type", filters={"enable_auto_attendance": 1}, pluck="name")
    if not shift_types:
        print("No auto-attendance-enabled Shift Types found")
        return

    now = now_datetime()
    for shift in shift_types:
        frappe.db.set_value("Shift Type", shift, "last_sync_of_checkin", now, update_modified=False)
        print(f"Updated {shift} to {now}")

    frappe.db.commit()
    print("Done")
