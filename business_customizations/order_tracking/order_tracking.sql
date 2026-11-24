SELECT DISTINCT 
    so.`status` AS sales_order_status, 
    so.`name` AS sales_order_number, 
    so.`customer_name`, 
    mr.`name` AS material_request_name, 
    CASE 
        WHEN wo.`status` = 'Completed' THEN 'Ready for Picking'
        WHEN mr.`status` = 'Manufactured' THEN 'In Production'
        ELSE mr.`status`
    END AS material_request_status,
    CASE 
        WHEN wo.`status` = 'Completed' THEN 'Ready for Picking'
        ELSE wo.`status`
    END AS work_order_status,
    wo.`name` AS work_order_name,
    pli.`parent` AS pick_list_name,
    CASE 
        WHEN pl.`status` = 'Open' THEN 'Please create a delivery note'
        ELSE pl.`status`
    END AS pick_list_status
FROM `tabSales Order` AS so
LEFT JOIN `tabMaterial Request Item` AS mri 
    ON so.`name` = mri.`sales_order`
LEFT JOIN `tabMaterial Request` AS mr 
    ON mri.`parent` = mr.`name`
LEFT JOIN `tabWork Order` AS wo
    ON so.`name` = wo.`sales_order`
LEFT JOIN `tabPick List Item` AS pli
    ON so.`name` = pli.`sales_order`
LEFT JOIN `tabPick List` AS pl
    ON pli.`parent` = pl.`name`
WHERE so.`status` = 'To Deliver and Bill'

{% if filters.sales_order %}
    AND so.`name` = %(sales_order)s
{% endif %}

{% if filters.customer %}
    AND so.`customer` = %(customer)s
{% endif %}

{% if filters.from_date %}
    AND so.`transaction_date` >= %(from_date)s
{% endif %}

{% if filters.to_date %}
    AND so.`transaction_date` <= %(to_date)s
{% endif %}

GROUP BY so.`name`;
