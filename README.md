# Business Customizations

Business Customizations is a collection of ERPNext extensions for customer operations, shipping, payroll, and integrations. The Bench app ID is `business_customizations`.

## Features and integration points

| Area | Included source |
| --- | --- |
| Customer operations | Lead-to-Customer mapping, credit-limit checks on sales documents, and customer status updates |
| Shipping | Incoming Shipments and Order Tracking, including a report SQL query |
| Payroll | Salary Slip hooks for tax-base calculations and Journal Entry creation or cancellation |
| Other integrations | Attendance helpers, a Hikvision settings DocType, and an optional OpenWA gateway client |

## Deployment status

The source was prepared from an ERPNext v14 deployment. The renamed copy passed Python and JavaScript syntax checks; it has not undergone a full site install or workflow test. Review [hooks.py](business_customizations/hooks.py) and [patches.txt](business_customizations/patches.txt) before installation. The patch list includes tax recomputation. The legacy stock patch is not registered with the migration runner.

The original Delivery Note Server Script and the one-off warehouse cleanup script are outside this release. Use a disposable staging site and a database backup to evaluate the remaining migration entries before attempting a rollout.

## Configuration

- **Payroll advance accounts**: In the site's private configuration, set `business_customizations_payroll_accounts` to a mapping keyed by ERPNext company name. Each participating company needs an `expense_account` and an `advance_account` from its own chart of accounts. Verify the accounting entries and cancellations with payroll test data first.
- **OpenWA**: Configure `openwa_url`, `openwa_api_key`, and `openwa_session_id` on the site if you use the integration. Keep credentials and deployment values out of Git.
- **Attendance and Hikvision**: Review the integration configuration and test using a dedicated account and test device before enabling it on a live site.

## Validation checklist

Check Lead-to-Customer mapping and credit rules, compare Order Tracking and Incoming Shipments with staged purchase records, and validate payroll posting and cancellation end to end. Inspect any site-specific custom fields that these features depend on before enabling them.

## License

[MIT](license.txt).
