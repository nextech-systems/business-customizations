# business_customizations/hr/salary_slip_hooks.py
import frappe
from frappe import _

def ensure_calculated_totals(doc, method):
    """
    Ensure salary slip totals are calculated properly
    """
    try:
        # Make sure calculate_component_amounts is called
        if hasattr(doc, 'calculate_component_amounts'):
            doc.calculate_component_amounts()
        
        # Additional calculations if needed
        calculate_gross_pay(doc)
        calculate_total_deductions(doc)
        calculate_net_pay(doc)
        
    except Exception as e:
        frappe.log_error(f"Error in ensure_calculated_totals: {str(e)}")

def calculate_gross_pay(doc):
    """Calculate gross pay from earnings"""
    doc.gross_pay = sum(e.amount or 0 for e in doc.earnings if not e.do_not_include_in_total)

def calculate_total_deductions(doc):
    """Calculate total deductions"""
    doc.total_deduction = sum(d.amount or 0 for d in doc.deductions if not d.do_not_include_in_total)

def calculate_net_pay(doc):
    """Calculate net pay"""
    doc.net_pay = (doc.gross_pay or 0) - (doc.total_deduction or 0)

def set_taxable_earnings(doc, method):
    """
    Set taxable earnings for tax calculations
    This should run after ensure_calculated_totals
    """
    try:
        # Define non-taxable earning components
        non_taxable_earnings = [
            'Traveling Allowance',
            'Reimbursements', 
            'Medical Allowance',
            # Add other non-taxable components as needed
        ]
        
        # Calculate taxable earnings total
        taxable_total = 0
        for earning in doc.earnings:
            if earning.salary_component not in non_taxable_earnings and not earning.do_not_include_in_total:
                taxable_total += earning.amount or 0
        
        # Set taxable earnings (you may need to add this as a custom field)
        doc.taxable_earnings_total = taxable_total
        
        # Also set variables that can be used in salary component formulas
        set_formula_variables(doc)
        
        frappe.logger().info(f"Set taxable earnings to {taxable_total} for {doc.employee}")
        
    except Exception as e:
        frappe.log_error(f"Error in set_taxable_earnings: {str(e)}")

def set_formula_variables(doc):
    """
    Set variables that can be used in salary component formulas
    """
    try:
        # Set commonly used variables for formula calculations
        
        # Get National Insurance Employee amount
        nis_ee_amount = 0
        for deduction in doc.deductions:
            if deduction.salary_component == 'National Insurance Scheme':
                nis_ee_amount = deduction.amount or 0
                break
        
        # Get ScotiaBridge amount  
        sb_amount = 0
        for deduction in doc.deductions:
            if deduction.salary_component == 'ScotiaBridge':
                sb_amount = deduction.amount or 0
                break
        
        # Set variables in doc for formula access
        doc.NIS_EE = nis_ee_amount
        doc.SB = sb_amount
        
        # Log for debugging
        frappe.logger().info(f"Set formula variables - NIS_EE: {nis_ee_amount}, SB: {sb_amount}")
        
    except Exception as e:
        frappe.log_error(f"Error in set_formula_variables: {str(e)}")

def before_insert_handler(doc, method):
    """
    Combined handler for before_insert event
    """
    ensure_calculated_totals(doc, method)

def validate_handler(doc, method): 
    """
    Combined handler for validate event
    """
    ensure_calculated_totals(doc, method)
    set_taxable_earnings(doc, method)
