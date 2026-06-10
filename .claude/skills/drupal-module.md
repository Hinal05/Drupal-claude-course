---
name: drupal-module
description: Scaffold a new custom Drupal module with cc_* naming. Usage - /drupal-module <name> [description]
---

Create a new custom Drupal module using the drupal-module-generator agent.

The module name provided is: $ARGUMENTS

Steps:
1. Use `drupal-module-generator` agent to scaffold the module
2. Module machine name must be `cc_<name>`
3. Create minimum viable structure: info.yml + src/ directory
4. Enable the module with `ddev drush en cc_<name>`
5. Confirm success with `ddev drush status`
