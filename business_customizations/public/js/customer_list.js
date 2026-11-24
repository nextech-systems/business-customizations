frappe.listview_settings["Customer"] = {
    onload(listview) {
        listview.add_fields(["custom_credit_status", "disabled"]);
    },

    // Optional: keep the native colored dot at left (won't affect your pill)
    get_indicator(doc) {
        if (doc.disabled) return [__("Disabled"), "gray", "disabled,=,1"];
        const map = {
            "Good Standing": "green",
            "Overdue": "orange",
            "Exceeded Credit Limit": "red",
        };
        const s = doc.custom_credit_status;
        if (s && map[s]) return [__(s), map[s], `custom_credit_status,=,${s}`];
    },

    // Pill inside the "Credit Status" column
    formatters: {
        custom_credit_status(value, df, doc) {
            if (!value) return value;

            const active_bg = {
                "Good Standing": "#22c55e",        // green-500
                "Overdue": "#f59e0b",              // amber-500
                "Exceeded Credit Limit": "#ef4444" // red-500
            };
            const bg = doc.disabled ? "#6b7280" : (active_bg[value] || "#6b7280");

            return `
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
                    ${frappe.utils.escape_html(value)}
                </span>
            `;
        },
    },
};
