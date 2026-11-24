frappe.ready(function () {
  document.getElementById("order-search").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const query = e.target.value;
      frappe.call({
        method: "business_customizations.api.get_order_tracking_info",
        args: { query },
        callback: function (r) {
          const results = r.message || [];
          const container = document.getElementById("order-tracking-results");
          container.innerHTML = "";

          if (!results.length) {
            container.innerHTML = "<p>No records found.</p>";
            return;
          }

          results.forEach(doc => {
            const div = document.createElement("div");
            div.className = "mb-2 p-2 border rounded";
            div.innerHTML = `<strong>${doc.doctype}</strong>: <a href="/app/${doc.doctype.replace(/ /g, "-").toLowerCase()}/${doc.name}" target="_blank">${doc.name}</a> - <span class="badge bg-secondary">${doc.status}</span>`;
            container.appendChild(div);
          });
        }
      });
    }
  });
});
