"""OpenWA WhatsApp gateway integration.

Sends messages through the OpenWA gateway configured for the site.
Config lives in site_config.json: openwa_url, openwa_api_key, openwa_session_id.
"""

import re
import requests
import frappe


def normalize_number(number):
    """Normalize a phone number to OpenWA chatId format (1876XXXXXXX@c.us).

    Handles common Jamaican formats: 876-XXX-XXXX, (876) XXX XXXX,
    +1876XXXXXXX, 1876XXXXXXX, and bare 7-digit local numbers.
    Returns None if the number can't be normalized.
    """
    if not number:
        return None

    digits = re.sub(r"\D", "", str(number))

    if len(digits) == 7:           # local: 3428354
        digits = "1876" + digits
    elif len(digits) == 10 and digits.startswith(("876", "658")):
        digits = "1" + digits      # 8763428354
    elif len(digits) == 11 and digits.startswith("1"):
        pass                       # 18763428354 — already full
    elif len(digits) >= 11:
        pass                       # international, assume full with country code
    else:
        return None

    return f"{digits}@c.us"


def send_whatsapp(number, message):
    """Send a WhatsApp text message via OpenWA. Returns True on success.

    Never raises — failures are written to the Error Log so document
    submission is never blocked by gateway problems.
    """
    try:
        conf = frappe.conf
        url = conf.get("openwa_url")
        api_key = conf.get("openwa_api_key")
        session_id = conf.get("openwa_session_id")

        if not (url and api_key and session_id):
            frappe.log_error("OpenWA config missing in site_config.json", "WhatsApp Gateway")
            return False

        chat_id = normalize_number(number)
        if not chat_id:
            frappe.log_error(f"Could not normalize number: {number}", "WhatsApp Gateway")
            return False

        resp = requests.post(
            f"{url}/api/sessions/{session_id}/messages/send-text",
            headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
            json={"chatId": chat_id, "text": message},
            timeout=10,
        )
        resp.raise_for_status()
        return True

    except Exception:
        frappe.log_error(frappe.get_traceback(), "WhatsApp Gateway")
        return False


@frappe.whitelist()
def send_test(number, message="Test from ERPNext via OpenWA"):
    """Manual test: bench execute or browser console."""
    frappe.only_for("System Manager")
    return send_whatsapp(number, message)
