---
name: drupal-install
description: Bootstrap a fresh Drupal project from scratch — DDEV config, Composer, and site install. Triggers on /drupal-install. Use when setting up a brand new project, not for an existing DDEV environment.
---

Set up a brand new Drupal 11 project end-to-end using DDEV. Arguments (optional): $ARGUMENTS may specify a project name, site name, or admin credentials — otherwise use sensible defaults matching this project's conventions (site name "Claude Code Course", admin/admin).

Steps, run in order and stop on the first failure:

1. **Check prerequisites**
   ```bash
   ddev version
   composer --version
   ```
   If DDEV isn't installed, tell the user to install it first (do not attempt to install DDEV itself).

2. **Configure DDEV** (skip if `.ddev/config.yaml` already exists — ask before overwriting)
   ```bash
   ddev config --project-type=drupal11 --docroot=web --create-docroot
   ```

3. **Start the environment**
   ```bash
   ddev start
   ```

4. **Create the Drupal codebase** (skip if `composer.json` already has drupal/core-recommended)
   ```bash
   ddev composer create-project drupal/recommended-project . --no-interaction
   ddev composer require drupal/core-dev drush/drush --dev
   ```

5. **Install the site**
   ```bash
   ddev drush site-install standard \
     --site-name="Claude Code Course" \
     --account-name=admin \
     --account-pass=admin \
     --yes
   ```

6. **Verify**
   ```bash
   ddev drush status
   ddev launch
   ```

## Notes
- This scaffolds a new project. If DDEV and Drupal are already set up (as in this repo), use `/drupal-deploy` instead.
- After install, remind the user to add `cc_*` custom modules/themes per this project's conventions and to run `ddev drush uli` for a one-time login link.
- Report the result of each step clearly; stop and show the error if any command fails.
