---
name: drupal-config
description: Export, import, or diff Drupal configuration. Triggers on /drupal-config or when the user asks to export config, import config, sync config, or check config status. Runs ddev drush cex/cim/config:status with clear output.
---

Run the appropriate Drupal config operation based on the user's input:

- **`/drupal-config export`** → run `ddev drush cex --yes`, report which files changed
- **`/drupal-config import`** → run `ddev drush cim --yes`, then `ddev drush cr`
- **`/drupal-config status`** (or no argument) → run `ddev drush config:status` and show a diff table
- **`/drupal-config get <name>`** → run `ddev drush config:get <name>`

## Rules
- Always show the before/after diff when exporting or importing
- Warn the user before running `cim` since it modifies the live database
- After import, always clear caches
- If no argument is given, default to `status` to show what's out of sync
