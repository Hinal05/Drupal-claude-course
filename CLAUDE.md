# Claude Code Course — Drupal Practice Project

## Project Purpose

This is a hands-on practice project for the Anthropic Claude Code courses:
- Claude Code 101: https://anthropic.skilljar.com/claude-code-101
- Claude Code in Action: https://anthropic.skilljar.com/claude-code-in-action

The project uses a Drupal codebase as a real-world context to practice Claude Code workflows.

## Project Structure

```
drupal-claude-course/
├── CLAUDE.md               # This file — project context for Claude Code
├── web/                    # Drupal webroot
│   ├── modules/custom/     # Custom Drupal modules (exercises go here)
│   └── themes/custom/      # Custom Drupal themes (exercises go here)
├── .claude/
│   ├── commands/           # Custom slash commands (course module 4)
│   └── agents/             # Custom subagents (course module 4)
└── docs/
    └── exercises/          # Notes and exercise logs per course module
```

## Stack

- Drupal 10/11
- PHP 8.2+
- Composer for dependency management

## Coding Standards

- Follow Drupal coding standards: https://www.drupal.org/docs/develop/standards
- Use snake_case for PHP variables and functions
- Use PSR-4 autoloading for custom modules
- Module machine names: `cc_*` prefix (cc = claude course)

## Common Tasks

- Create a custom module: `drush generate module`
- Clear cache: `drush cr`
- Run tests: `phpunit -c core/phpunit.xml.dist`

## Course Modules Checklist

### Claude Code 101
- [ ] Module 1: Explore → Plan → Code → Commit workflow on a Drupal task
- [ ] Module 2: Create this CLAUDE.md and iterate on it
- [ ] Module 3: Build a custom subagent for Drupal tasks
- [ ] Module 4: Set up a hook (e.g., run `drush cr` after code changes)

### Claude Code in Action
- [ ] Context management: use /compact and context window strategies on a large Drupal codebase task
- [ ] Visual workflow: provide a screenshot/mockup and implement a Drupal block or page
- [ ] Custom commands: create a `/drupal-module` slash command
- [ ] MCP integration: connect an external tool (e.g., Jira, GitHub)
- [ ] GitHub workflow: automated code review on a Drupal PR
