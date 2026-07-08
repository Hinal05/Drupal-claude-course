---
name: theme-component
description: Build or override a Drupal theme component — Twig template, CSS library, preprocess hook, or block template. Usage - /theme-component <description>
---

Build a Drupal theme component using the `theme-component-builder` agent.

Request: $ARGUMENTS (if empty, ask the user what component they need before proceeding)

Steps:
1. Use `theme-component-builder` agent to identify which template/component is needed
2. Check if a template already exists before creating a new one
3. Create/override the template in the correct subdirectory under `web/themes/custom/<theme>/templates/`
4. Add a `.libraries.yml` entry if CSS/JS is needed, and attach it in the Twig template
5. Run `ddev drush cr` to clear the theme registry cache
6. Confirm the component renders as expected
