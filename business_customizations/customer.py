import frappe
from frappe.utils import flt
from frappe import _

# ---- Policy toggles ----
ALLOWED_ROLES = {"Accounts Manager", "Credit Controller"}  # optional role-based bypass
# If True: allowed headroom = credit_limit + credits_on_account
# If False: allowed headroom = max(credit_limit, credits_on_account)
POLICY_ADD_CREDITS_TO_LIMIT = True


# ---------- Utilities (no erpnext imports) ----------

def _get_company_credit_limit(customer: str, company: str) -> float:
    """Read the per-company limit from the Customer Credit Limit child table."""
    return flt(
        frappe.db.get_value(
            "Customer Credit Limit",
            {"parent": customer, "parenttype": "Customer", "company": company},
            "credit_limit",
        ) or 0
    )

def _get_party_balance(company: str, customer: str) -> float:
    """
    Party ledger balance = SUM(debit - credit) from GL Entry.
    > 0 => customer owes you (outstanding)
    < 0 => you owe customer (credits on account)
    """
    return flt(
        frappe.db.sql(
            """
            SELECT COALESCE(SUM(debit - credit), 0)
            FROM `tabGL Entry`
            WHERE is_cancelled = 0
              AND company = %s
              AND party_type = 'Customer'
              AND party = %s
            """,
            (company, customer),
        )[0][0]
    )

def _get_unapplied_payment_entries(company: str, customer: str) -> float:
    """
    Unallocated advances still sitting on Payment Entries (Receive).
    """
    return flt(
        frappe.db.sql(
            """
            SELECT COALESCE(SUM(unallocated_amount), 0)
            FROM `tabPayment Entry`
            WHERE docstatus = 1
              AND payment_type = 'Receive'
              AND party_type = 'Customer'
              AND party = %s
              AND company = %s
            """,
            (customer, company),
        )[0][0]
    )

def _new_total_base(d) -> float:
    """Get the new document's total in base currency for SO/SI/DN."""
    for f in ("base_grand_total", "base_rounded_total", "base_total", "base_net_total"):
        v = flt(d.get(f))
        if v:
            return v
    total = 0.0
    cr = flt(getattr(d, "conversion_rate", 1) or 1)
    for it in (getattr(d, "items", []) or []):
        total += (
            flt(it.get("base_amount"))
            if it.get("base_amount") is not None
            else flt(it.get("amount")) * cr
        )
    return total


# ---------- Hooks ----------

def check_customer_credit_limit(doc, method):
    """Hook for SO/SI/DN (validate/before_insert as per hooks.py). Read-only check."""
    if not doc.customer or not doc.company:
        return

    # Optional: privileged bypass
    if ALLOWED_ROLES & set(frappe.get_roles(frappe.session.user)):
        return

    company = doc.company
    customer = doc.customer

    # 1) Configured per-company credit limit
    credit_limit = _get_company_credit_limit(customer, company)

    # 2) Party ledger balance -> outstanding/credits
    party_balance = _get_party_balance(company, customer)
    outstanding = party_balance if party_balance > 0 else 0.0             # they owe you
    credits_on_account = abs(party_balance) if party_balance < 0 else 0.0  # you owe them

    # 3) Consider unallocated advances as credits on account
    unapplied_pe = _get_unapplied_payment_entries(company, customer)
    credits_on_account = max(credits_on_account, unapplied_pe)

    # 4) New document total (base)
    new_total = _new_total_base(doc)

    # 5) Allowed headroom per policy
    allowed_headroom = (
        credit_limit + credits_on_account
        if POLICY_ADD_CREDITS_TO_LIMIT
        else max(credit_limit, credits_on_account)
    )

    # 6) Block if the new exposure would exceed allowed headroom
    cur = getattr(doc, "currency", None) or frappe.get_cached_value("Company", company, "default_currency")
    if (outstanding + new_total) > allowed_headroom:
        frappe.throw(
            _(
                "Customer <b>{cust}</b> exceeds allowed credit.<br>"
                "Allowed: {allowed} (Limit: {limit}, Credits on account: {credits})<br>"
                "Outstanding: {outst} + This Document: {new}"
            ).format(
                cust=customer,
                allowed=frappe.utils.fmt_money(allowed_headroom, currency=cur),
                limit=frappe.utils.fmt_money(credit_limit, currency=cur),
                credits=frappe.utils.fmt_money(credits_on_account, currency=cur),
                outst=frappe.utils.fmt_money(outstanding, currency=cur),
                new=frappe.utils.fmt_money(new_total, currency=cur),
            )
        )

def validate_credit_limit(doc, method):
    """
    Runs on Customer.validate (per hooks).
    Only block when a user actually CHANGES a non-zero limit without the proper role.
    """
    if not getattr(doc, "credit_limits", None):
        return

    user_roles = set(frappe.get_roles(frappe.session.user))

    # Load previous state to detect changes
    prev_limits_by_company = {}
    if not doc.is_new():
        prev = frappe.get_doc("Customer", doc.name)
        for r in (prev.get("credit_limits") or []):
            prev_limits_by_company[r.company] = flt(r.credit_limit or 0)

    for row in doc.credit_limits:
        new_limit = flt(row.credit_limit or 0)
        old_limit = flt(prev_limits_by_company.get(row.company, 0))

        if new_limit < 0:
            frappe.throw(
                _("Credit limit cannot be negative for company {company}. Use 0 to disable credit.")
                .format(company=row.company or _("(unspecified)"))
            )

        is_changing = (new_limit != old_limit) or row.get("__islocal")
        if is_changing and new_limit > 0 and not (ALLOWED_ROLES & user_roles):
            frappe.throw(
                _(
                    "Only users with these roles can set a non-zero credit limit: {roles}. Company: {company}"
                ).format(
                    roles=", ".join(sorted(ALLOWED_ROLES)),
                    company=row.company or _("(unspecified)"),
                )
            )
