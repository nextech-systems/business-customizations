# business_customizations/payroll/salary_slip_hooks.py
# ------------------------------------------------------------
# Salary Slip hooks — upgrade-safe, idempotent recompute
# ------------------------------------------------------------
# What this module does:
#   • Maintains `taxable_earnings_total` on Salary Slip using flags on earnings.
#   • Evaluates ALL deduction formulas (employee first, then employer) with
#     access to helpful ABBR variables (e.g., NIS_EE, NHT_ER, SB).
#   • Computes parent totals (gross_pay, total_deduction, net_pay) in-memory.
#   • Avoids DB writes (no frappe.db.set_value) during save hooks.
#   • Avoids mutating in after_save — everything happens before insert/save/submit.
#
# Paste the following into your app at:
#   apps/business_customizations/business_customizations/payroll/salary_slip_hooks.py
#
# And update hooks.py as shown at the bottom of this file (commented snippet).
# ------------------------------------------------------------

from __future__ import annotations

import math
import frappe
from frappe import _
from frappe.utils import flt, cint

# -------------------------
# Configuration
# -------------------------

# If you want to enforce a base set for *all* employees,
# list them here — leave both sets empty to rely entirely
# on the Salary Structure.
REQUIRED_EMP_DEDUCTIONS: set[str] = set()
REQUIRED_ER_DEDUCTIONS: set[str] = set()

#--------------------------
# Guards / helpers
# -------------------------

def _in_migration() -> bool:
    return bool(getattr(frappe.flags, "in_migrate", False) or getattr(frappe.flags, "in_patch", False))


def _get_component_meta(name: str, cache: dict):
    name = (name or "").strip()
    if not name:
        return None
    if name in cache:
        return cache[name]
    try:
        cache[name] = frappe.get_cached_doc("Salary Component", name)
    except Exception:  # component might be missing
        cache[name] = None
    return cache[name]


def _get_component_abbr(comp) -> str:
    # Primary field is usually `abbr`; keep a fallback for customizations
    return (getattr(comp, "abbr", "") or getattr(comp, "salary_component_abbr", "") or "").strip()


def _is_employer_row(name: str) -> bool:
    return bool(name and "employer" in name.lower())


# -------------------------
# ABBR aliasing
# -------------------------

def _maybe_add_alias(abbr_map: dict, comp_name: str, amount: float) -> None:
    """Heuristics so common Jamaica payroll formulas like `NIS_EE`, `NHT_ER`, `SB`
    resolve even when Salary Component masters have no `abbr` set."""
    nm = (comp_name or "").strip().lower()
    if not nm:
        return

    # National Insurance Scheme
    if "national insurance scheme" in nm or nm == "nis":
        if "employer" in nm or "- employer" in nm:
            abbr_map.setdefault("NIS_ER", amount)
        else:
            abbr_map.setdefault("NIS_EE", amount)

    # National Housing Trust
    if "national housing trust" in nm or "nht" in nm:
        if "employer" in nm or "- employer" in nm:
            abbr_map.setdefault("NHT_ER", amount)
        else:
            abbr_map.setdefault("NHT_EE", amount)

    # Education Tax
    if "education tax" in nm or nm == "et":
        if "employer" in nm or "- employer" in nm:
            abbr_map.setdefault("ET_ER", amount)
        else:
            abbr_map.setdefault("ET_EE", amount)

    # Standard Benefit / Threshold
    if "standard benefit" in nm or "standard threshold" in nm or nm == "sb":
        abbr_map.setdefault("SB", amount)


def _build_abbr_map(doc, comp_cache: dict) -> dict:
    """Map Salary Component abbreviations + aliases => amounts (earnings + deductions)."""
    abbr_map: dict[str, float] = {}

    # Earnings
    for row in (doc.earnings or []):
        name = (getattr(row, "salary_component", "") or "").strip()
        if not name:
            continue
        comp = _get_component_meta(name, comp_cache)
        amt = flt(getattr(row, "amount", 0))
        abbr = _get_component_abbr(comp) if comp else ""
        if abbr:
            abbr_map[abbr] = amt
        _maybe_add_alias(abbr_map, name, amt)

    # Deductions
    for row in (doc.deductions or []):
        name = (getattr(row, "salary_component", "") or "").strip()
        if not name:
            continue
        comp = _get_component_meta(name, comp_cache)
        amt = flt(getattr(row, "amount", 0))
        abbr = _get_component_abbr(comp) if comp else ""
        if abbr:
            abbr_map[abbr] = amt
        _maybe_add_alias(abbr_map, name, amt)

    return abbr_map


# ---------------------------------------
# Taxable earnings (includes Commission)
# ---------------------------------------

def _earning_is_taxable(row, comp_cache: dict) -> tuple[bool, str]:
    """Treat earning as taxable unless row/component flags say otherwise."""
    if flt(getattr(row, "amount", 0)) <= 0:
        return False, "zero_or_negative_amount"

    # row-level gates
    if cint(getattr(row, "do_not_include_in_total", 0)):
        return False, "row_do_not_include_in_total"
    if cint(getattr(row, "statistical_component", 0)):
        return False, "row_statistical"
    if cint(getattr(row, "exempted_from_income_tax", 0)):
        return False, "row_exempted_from_income_tax"
    if hasattr(row, "is_tax_applicable") and not cint(getattr(row, "is_tax_applicable", 1)):
        return False, "row_is_tax_applicable_false"

    # master gates
    name = (getattr(row, "salary_component", "") or "").strip()
    comp = _get_component_meta(name, comp_cache)
    if comp:
        if getattr(comp, "type", "Earning") != "Earning":
            return False, "component_not_earning"
        if cint(getattr(comp, "statistical_component", 0)):
            return False, "component_statistical"
        if cint(getattr(comp, "exempted_from_income_tax", 0)):
            return False, "component_exempted_from_income_tax"
        if hasattr(comp, "is_tax_applicable") and not cint(getattr(comp, "is_tax_applicable", 1)):
            return False, "component_is_tax_applicable_false"

    return True, "taxable"


def safe_taxable_earnings_only(doc, method=None) -> None:
    """Recompute doc.taxable_earnings_total from ALL taxable earnings.
    Never mutates earnings/deductions.
    """
    if _in_migration() or not doc:
        return
    try:
        comp_cache: dict = {}
        total = 0.0
        for e in (doc.earnings or []):
            comp = _get_component_meta(e.salary_component, comp_cache)
            if not comp:
                continue
            try:
                # Refresh key flags dynamically so outdated slips fix themselves
                e.is_tax_applicable = cint(getattr(comp, "is_tax_applicable", 1))
                e.do_not_include_in_total = cint(getattr(comp, "do_not_include_in_total", 0))
                e.statistical_component = cint(getattr(comp, "statistical_component", 0))
            except Exception:
                pass
            
            # Check if this earning is taxable and add to total
            is_taxable, reason = _earning_is_taxable(e, comp_cache)
            if is_taxable:
                total += flt(getattr(e, "amount", 0))
        
        # Set the taxable earnings total on the document
        doc.taxable_earnings_total = round(total, 2)
        
    except Exception as ex:
        frappe.log_error(f"Error in safe_taxable_earnings_only: {ex}")

# ------------------------------------------------
# Evaluate Salary Component formulas for ALL deductions
# ------------------------------------------------

def _safe_eval(expr: str, doc, ctx_extra: dict | None = None) -> float:
    """Evaluate condition/formula with safe context + abbr/alias variables."""
    if not expr:
        return 0.0
    localctx = {
        "doc": doc,
        "math": math,
        "round": round,
        "min": min,
        "max": max,
        "abs": abs,
        "flt": flt,
        "cint": cint,
    }
    # Allow direct access to doc fields like taxable_earnings_total, gross_pay, etc.
    try:
        localctx.update(doc.as_dict())
    except Exception:
        pass
    # Add abbr/alias values (e.g., NIS_EE, NHT_ER, SB)
    if ctx_extra:
        localctx.update(ctx_extra)
    return frappe.safe_eval(expr, None, localctx)


def _eval_deduction_rows(doc, employer_rows: bool, changes: list[str], comp_cache: dict, abbr_map: dict) -> None:
    """Two passes: 1) employee rows 2) employer rows. Compute statistical rows too.
    """
    for row in (doc.deductions or []):
        comp_name = (row.salary_component or "").strip()
        if not comp_name:
            continue

        is_er = _is_employer_row(comp_name)
        if employer_rows != is_er:
            continue

        comp = _get_component_meta(comp_name, comp_cache)
        if not comp or getattr(comp, "type", "Deduction") != "Deduction":
            continue

        comp_abbr = _get_component_abbr(comp)
        old = flt(getattr(row, "amount", 0))

        # Condition (optional)
        cond_expr = getattr(comp, "condition", "") or getattr(comp, "condition_formula", "")
        do_apply = True
        if cond_expr:
            try:
                do_apply = bool(_safe_eval(cond_expr, doc, abbr_map))
            except Exception as e:
                frappe.log_error(f"Error evaluating condition for {comp_name}: {e}")
                do_apply = False

        if do_apply:
            formula_expr = getattr(comp, "formula", "") or getattr(comp, "amount_formula", "")
            if formula_expr:
                try:
                    new_val = round(flt(_safe_eval(formula_expr, doc, abbr_map)), 2)
                    if new_val != old:
                        row.amount = new_val  # in-memory; persisted by the save
                        # keep abbr + alias values in sync for later components
                        if comp_abbr:
                            abbr_map[comp_abbr] = new_val
                        _maybe_add_alias(abbr_map, comp_name, new_val)
                        tag = "[ER]" if is_er else "[EMP]"
                        changes.append(f"{tag} {comp_name}: {old} -> {new_val}")
                except Exception as e:
                    frappe.log_error(f"Error evaluating formula for {comp_name}: {e}")
        else:
            if old != 0:
                row.amount = 0.0
                if comp_abbr:
                    abbr_map[comp_abbr] = 0.0
                _maybe_add_alias(abbr_map, comp_name, 0.0)
                tag = "[ER]" if is_er else "[EMP]"
                changes.append(f"{tag} {comp_name}: {old} -> 0.0 (condition false)")


def recalc_deductions_from_taxable(doc, method=None) -> None:
    """Fire Salary Component formulas for ALL deduction rows (employee + employer)."""
    if _in_migration() or not doc:
        return
    try:
        if not getattr(doc, "deductions", None):
            return
        comp_cache: dict = {}
        abbr_map = _build_abbr_map(doc, comp_cache)
        changes: list[str] = []
        # Employee first so Employer rows can depend on them
        _eval_deduction_rows(doc, employer_rows=False, changes=changes, comp_cache=comp_cache, abbr_map=abbr_map)
        _eval_deduction_rows(doc, employer_rows=True, changes=changes, comp_cache=comp_cache, abbr_map=abbr_map)
        if changes:
            slip = getattr(doc, "name", "(new)")
            frappe.logger().info(f"[Salary Slip] Deduction formulas fired for {slip}\n" + "\n".join(changes))
    except Exception as ex:
        frappe.log_error(f"Error in recalc_deductions_from_taxable: {ex}")


# -------------------------
# Parent totals (in-memory)
# -------------------------

def _set_parent_totals(doc) -> None:
    """Compute doc.gross_pay / doc.total_deduction / doc.net_pay from child rows."""
    gross = sum(flt(e.amount) for e in (doc.earnings or []))

    total_ded = 0.0
    comp_cache: dict = {}
    for d in (doc.deductions or []):
        comp = _get_component_meta((d.salary_component or "").strip(), comp_cache)
        is_stat = cint(getattr(d, "statistical_component", 0)) or (comp and cint(getattr(comp, "statistical_component", 0)))
        is_employer = _is_employer_row(getattr(d, "salary_component", ""))
        if not is_stat and not is_employer:
            total_ded += flt(d.amount)

    doc.gross_pay = round(gross, 2)
    doc.total_deduction = round(total_ded, 2)
    doc.net_pay = round(gross - total_ded, 2)


# =============================================================
# Structure-aware deduction injection (instead of hard-coded)
# =============================================================

def _ensure_deductions_from_structure(doc):
    """Append missing deduction rows that exist in the employee's Salary Structure."""
    if not getattr(doc, "salary_structure", None):
        return

    try:
        structure = frappe.get_doc("Salary Structure", doc.salary_structure)
        structure_deductions = {d.salary_component for d in structure.get("deductions", [])}
        existing = {(d.salary_component or "").strip() for d in (doc.deductions or [])}

        for nm in structure_deductions - existing:
            doc.append("deductions", {"salary_component": nm, "amount": 0})
            frappe.logger().info(f"[Salary Slip] Added missing deduction from structure: {nm}")

    except Exception as e:
        frappe.log_error(f"Error in _ensure_deductions_from_structure: {e}")


# -------------------------
# Orchestrators
# -------------------------

def _ensure_deductions_from_structure(doc):
    """Append missing deduction rows that exist in the employee's Salary Structure."""
    if not getattr(doc, "salary_structure", None):
        return

    try:
        structure = frappe.get_doc("Salary Structure", doc.salary_structure)
        structure_deductions = {d.salary_component for d in structure.get("deductions", [])}
        existing = {(d.salary_component or "").strip() for d in (doc.deductions or [])}

        for nm in structure_deductions - existing:
            doc.append("deductions", {"salary_component": nm, "amount": 0})
            frappe.logger().info(f"[Salary Slip] Added missing deduction from structure: {nm}")

    except Exception as e:
        frappe.log_error(f"Error in _ensure_deductions_from_structure: {e}")


def recompute_tax_bases(doc, method=None) -> None:
    """Idempotent one-pass recompute.

    Steps:
      1) (Optional) Ensure deduction rows from the assigned Salary Structure
      2) Sync earnings-row flags from Salary Component master (self-healing)
      3) Recompute taxable_earnings_total (flags-driven)
      4) Evaluate formulas for all deductions (EMP then ER)
      5) Compute parent totals (gross/total_deduction/net_pay)
    """
    if _in_migration() or not doc:
        return

    # 1) Ensure deduction rows come from the structure (only if you created this helper)
    try:
        if "_ensure_deductions_from_structure" in globals():
            _ensure_deductions_from_structure(doc)
    except Exception as e:
        frappe.log_error(f"ensure_deductions_from_structure failed: {e}")

    # 2) Sync earnings-row flags from the component master (prevents stale flags)
    comp_cache: dict = {}
    for e in (doc.earnings or []):
        comp = _get_component_meta(getattr(e, "salary_component", ""), comp_cache)
        if not comp:
            continue
        try:
            e.is_tax_applicable = cint(getattr(comp, "is_tax_applicable", 1))
            e.do_not_include_in_total = cint(getattr(comp, "do_not_include_in_total", 0))
            e.statistical_component = cint(getattr(comp, "statistical_component", 0))
        except Exception:
            pass

    # 3) Recompute taxable_earnings_total in-memory
    safe_taxable_earnings_only(doc)

    # 4) Fire formulas for all deductions (employee rows first, then employer rows)
    recalc_deductions_from_taxable(doc)

    # 5) Set parent totals on the doc
    _set_parent_totals(doc)


def finalize_totals_before_submit(doc, method=None) -> None:
    """Final safety pass before locking the document."""
    recompute_tax_bases(doc)

# ------------------------------------------------
# Journal Entry helpers (unchanged from your version)
# ------------------------------------------------

def create_or_update_journal_entry(doc, method=None) -> None:
    """Create/update JE for Salary Advance Repayment on submit."""
    try:
        amount = sum(
            flt(d.amount)
            for d in (doc.deductions or [])
            if (d.salary_component or "").strip() == "Salary Advance Repayment" and flt(d.amount) > 0
        )
        if amount <= 0:
            return

        existing = frappe.get_all("Journal Entry", filters={"salary_slip": doc.name, "docstatus": 1}, fields=["name"])
        if existing:
            je = frappe.get_doc("Journal Entry", existing[0].name)
            je.cancel()
            je.reload()
            je.set("accounts", [])
        else:
            je = frappe.new_doc("Journal Entry")
            je.voucher_type = "Journal Entry"
            je.posting_date = doc.posting_date
            je.company = doc.company
            je.salary_slip = doc.name
            je.remark = f"Salary Advance Repayment for {doc.employee} from Salary Slip {doc.name}"
            je.user_remark = je.remark

        # Debit expense
        je.append("accounts", {"account": _get_payroll_account(doc.company, "expense_account"), "debit_in_account_currency": amount, "debit": amount})
        # Credit advance
        je.append(
            "accounts",
            {
                "account": _get_payroll_account(doc.company, "advance_account"),
                "party_type": "Employee",
                "party": doc.employee,
                "credit_in_account_currency": amount,
                "credit": amount,
            },
        )

        je.save(ignore_permissions=True)
        je.submit()
        frappe.msgprint(_(f"Journal Entry <a href='/app/journal-entry/{je.name}'>{je.name}</a> created/updated and submitted."))
    except Exception as e:
        frappe.log_error(f"Error in create_or_update_journal_entry: {str(e)}")
        frappe.throw(_(f"Error creating journal entry: {str(e)}"))


def cancel_linked_journal_entry(doc, method=None) -> None:
    """Cancel any submitted JEs linked to this slip. No manual commits."""
    try:
        if not doc.name:
            return
        for je_name in frappe.get_all("Journal Entry", filters={"salary_slip": doc.name, "docstatus": 1}, pluck="name"):
            je = frappe.get_doc("Journal Entry", je_name)
            if je.docstatus == 1:
                je.cancel()
        frappe.msgprint(_("Linked Journal Entries have been canceled."))
    except Exception as e:
        frappe.log_error(f"Error in cancel_linked_journal_entry: {str(e)}")


def _get_payroll_account(company, role):
    import frappe

    settings = frappe.get_conf().get("business_customizations_payroll_accounts") or {}
    company_accounts = settings.get(company) or {}
    account = company_accounts.get(role)

    if not account or not frappe.db.exists(
        "Account", {"name": account, "company": company, "is_group": 0}
    ):
        frappe.throw(
            frappe._("Configure a valid {0} for {1} in business_customizations_payroll_accounts.")
            .format(role, company)
        )
    return account
