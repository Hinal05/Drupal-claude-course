# Claude Code Course — Drupal Practice Project

## Project Purpose

This is a hands-on practice project for the Anthropic Claude Code courses.

The project uses a Drupal codebase as a real-world context to practice Claude Code workflows.

## Project Structure

```
drupal-claude-course/
├── CLAUDE.md                   # This file — project context for Claude Code
├── composer.json               # Drupal project dependencies
├── vendor/                     # Composer dependencies (includes drush, phpcs)
├── config/
│   └── setup/                  # Drupal content type + field config YAMLs (partial import)
├── web/                        # Drupal webroot
│   ├── core/                   # Drupal core (do not edit)
│   ├── modules/custom/
│   │   └── cc_featured/        # Featured Products block plugin
│   └── themes/custom/
│       └── cc_ecommerce/       # Custom theme extending Olivero (6 components)
├── .ddev/                      # DDEV local dev environment config
├── .mcp.json                   # GitHub MCP server config (gitignored)
├── .claude/
│   ├── settings.json           # Hooks configuration
│   ├── agents/                 # Custom subagents
│   ├── skills/                 # Custom slash commands
│   ├── workflows/
│   │   └── drupal-audit.js     # Parallel Drupal audit (SDK multi-agent)
│   └── commands/               # Legacy commands directory
└── docs/
    └── exercises/              # Notes and exercise logs per course module
```

## Stack

- Drupal 11
- PHP 8.3
- MariaDB 10.11
- DDEV for local development
- Composer 2 for dependency management

## Local Development (DDEV)

Run all commands from the project root (`drupal-claude-course/`).

| Task | Command |
|------|---------|
| Start environment | `ddev start` |
| Stop environment | `ddev stop` |
| Clear Drupal cache | `ddev drush cr` |
| One-time login link | `ddev drush uli` |
| Enable a module | `ddev drush en <module>` |
| Run DB updates | `ddev drush updb` |
| Export config | `ddev drush cex` |
| Import config | `ddev drush cim` |
| Check Drupal status | `ddev drush status` |
| Open site in browser | `ddev launch` |

Site URL: https://drupal-claude-course.ddev.site

## Coding Standards

- Follow Drupal coding standards: https://www.drupal.org/docs/develop/standards
- Use snake_case for PHP variables and functions
- Use PSR-4 autoloading for custom modules
- Module machine names: `cc_*` prefix (cc = claude course)
- Namespace pattern: `Drupal\cc_<name>`
- Run standards check: `vendor/bin/phpcs --standard=Drupal web/modules/custom web/themes/custom`

## Custom Agents

Invoke these agents for specialized Drupal tasks:

| Agent | When to use |
|-------|------------|
| `drupal-module-generator` | Scaffold a new `cc_*` module with correct structure |
| `drupal-code-reviewer` | Review PHP/Twig/YAML for standards and security |
| `drush-task-runner` | Run and explain drush commands |
| `theme-component-builder` | Build Twig templates, libraries, preprocess hooks |

## Custom Skills (Slash Commands)

| Command | What it does |
|---------|-------------|
| `/drupal-module <name>` | Scaffold a new custom module |
| `/drupal-review [file]` | Review code for Drupal standards + security |
| `/drush <command>` | Run any drush command with explanation |

## Active Hooks

Configured in `.claude/settings.json` — run automatically:

| Event | Trigger | Action |
|-------|---------|--------|
| `PostToolUse` | Edit or Write any file | `ddev drush cr` — auto-clears Drupal cache |
| `PostToolUse` | Bash with `git commit` | `git log --oneline -5` — shows recent commits |
| `PreToolUse` | Bash with `git commit` | `phpcs --standard=Drupal` — checks coding standards |
| `PreCompact` | Manual `/compact` | Injects reminder to preserve in-progress task context |
| `Stop` | Claude finishes a task | Desktop notification via `notify-send` |

## Course Modules Checklist

### Claude Code 101
- [x] Module 1: Explore → Plan → Code → Commit workflow on a Drupal task
- [x] Module 2: Create this CLAUDE.md and iterate on it
- [x] Module 3: Build custom subagents for Drupal tasks
- [x] Module 4: Set up hooks (drush cr, phpcs, git log, notify-send)

### Claude Code in Action
- [x] Context management: PreCompact hook added; use /compact on large tasks to preserve context
- [x] Visual workflow: designed and implemented Featured Products block (`cc_featured` module) placed on homepage
- [x] Custom commands: create `/drupal-module`, `/drupal-review`, `/drush` skills
- [x] MCP integration: GitHub MCP server connected via `.mcp.json`
- [x] GitHub workflow: automated code review posted on PR #1 via `drupal-code-reviewer` agent
- [x] SDK multi-agent: parallel Drupal audit workflow at `.claude/workflows/drupal-audit.js`
