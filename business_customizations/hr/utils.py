import frappe

def get_taxable_earnings_total(salary_slip):
    """
    Calculate total taxable earnings:
    - is_tax_applicable = True
    """
    total = 0.0

    # Fetch all relevant components in one query
    component_map = {
        comp.name: comp
        for comp in frappe.get_all(
            "Salary Component",
            fields=["name", "is_tax_applicable"],
            filters={"name": ["in", [e.salary_component for e in salary_slip.earnings]]}
        )
    }

    for e in salary_slip.earnings:
        comp = component_map.get(e.salary_component)
        if comp and comp.is_tax_applicable:
            total += e.amount

    return round(total, 2)
