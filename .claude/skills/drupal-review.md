---
name: drupal-review
description: Review Drupal PHP/Twig/YAML code for standards and security. Usage - /drupal-review [file or module name]
---

Run a Drupal code review using the drupal-code-reviewer agent.

Target: $ARGUMENTS (if empty, review all files in web/modules/custom/ and web/themes/custom/)

Steps:
1. Use `drupal-code-reviewer` agent to review the target
2. Run phpcs automated checks first
3. Follow with manual security and best-practice review
4. Report: Errors → Warnings → Suggestions
