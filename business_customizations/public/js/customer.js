(function () {
    const color_map = {
        "Good Standing": "#22c55e",        // green-500
        "Overdue": "#f59e0b",              // amber-500
        "Exceeded Credit Limit": "#ef4444" // red-500
    };

    function render_credit_status_pill(frm) {
        const status = frm.doc.custom_credit_status;
        if (!status) return;

        // grey pill if disabled, else mapped color
        const bg = frm.doc.disabled ? "#6b7280" : (color_map[status] || "#6b7280");

        const pill = `
            <span style="
                display:inline-block;
                padding:2px 10px;
                border-radius:9999px;
                font-weight:600;
                font-size:12px;
                line-height:1.4;
                color:#fff;
                background:${bg};
            ">
                ${frappe.utils.escape_html(status)}
            </span>
        `;

        const field = frm.get_field("custom_credit_status");
        if (field && field.$wrapper) {
            // Replace the read-only display with our pill
            const $cv = field.$wrapper.find(".control-value");
            if ($cv.length) {
                $cv.html(pill);
            }
        }
    }

    frappe.ui.form.on("Customer", {
        refresh(frm) {
            // Defer slightly to ensure field DOM exists
            setTimeout(() => render_credit_status_pill(frm), 0);
        },
        custom_credit_status(frm) {
            render_credit_status_pill(frm);
        },
        disabled(frm) {
            render_credit_status_pill(frm);
        }
    });
})();

// OPTIONAL header indicator (coexists with Enabled)
function add_header_indicator(frm) {
    const s = frm.doc.custom_credit_status;
    if (!s) return;
    const map = { "Good Standing": "green", "Overdue": "orange", "Exceeded Credit Limit": "red" };
    const color = frm.doc.disabled ? "gray" : (map[s] || "gray");
    // append without clearing existing "Enabled" chip
    frm.dashboard.add_indicator(__("Credit Status: {0}", [s]), color);
}
