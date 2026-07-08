---
name: drupal-audit
description: Run the parallel Drupal audit workflow — code standards, security, and performance scanned simultaneously by 3 agents with a synthesis report. Triggers on /drupal-audit.
---

Launch the parallel Drupal audit workflow using the Workflow tool:

```
Workflow({ name: "drupal-audit" })
```

This fans out 3 agents simultaneously:
1. **Code Standards** — phpcs against Drupal standard on all custom code
2. **Security** — XSS, SQL injection, CSRF, access control, unsafe patterns
3. **Performance** — N+1 queries, missing render cache, heavy preprocess hooks

Then a 4th synthesis agent combines findings into a prioritised report: **Critical / Warning / Info**.

After the workflow completes, present the report to the user and ask which findings to fix first.
