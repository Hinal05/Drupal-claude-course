---
name: drupal-deploy
description: Run the standard Drupal deploy sequence — config import, database updates, cache rebuild. Triggers on /drupal-deploy. Use after pulling new code or merging a branch.
---

Run the standard Drupal deployment sequence in order:

```bash
ddev drush cim --yes      # Import configuration
ddev drush updb --yes     # Run database updates
ddev drush cr             # Clear all caches
```

After each step, report success or failure. If any step fails, stop and show the error — do not proceed to the next step.

## When to use
- After `git pull` or merging a branch with config changes
- After enabling a new module
- After importing a database from another environment

## Output
Show the result of each command clearly. If all three succeed, confirm the deployment is complete and the site is ready.
