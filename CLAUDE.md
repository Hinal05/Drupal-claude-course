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
| `drupal-config-manager` | Export, import, diff, and sync Drupal configuration |
| `drupal-security-auditor` | Dedicated security scan — XSS, SQLi, CSRF, access control |

## Custom Skills (Slash Commands)

| Command | What it does |
|---------|-------------|
| `/drupal-install` | Bootstrap a brand new DDEV + Drupal project from scratch |
| `/drupal-module <name>` | Scaffold a new custom module |
| `/drupal-review [file]` | Review code for Drupal standards + security |
| `/drush <command>` | Run any drush command with explanation |
| `/drupal-config [export\|import\|status\|get]` | Manage Drupal config sync |
| `/drupal-audit` | Run parallel 3-agent audit (standards + security + performance) |
| `/drupal-deploy` | Run deploy sequence: cim → updb → cr |
| `/theme-component <description>` | Build or override a Twig template, CSS library, preprocess hook, or block template |

## MCP Servers

Configured in `.mcp.json` — available to Claude as tools, resources, and prompts:

### `drupal` (custom — `mcp/drupal-mcp/`)
Wraps `ddev drush` commands for direct Claude access.

| Type | Name | What it does |
|------|------|-------------|
| Tool | `drush_cache_clear` | Clear all Drupal caches |
| Tool | `drush_status` | Get site status (version, DB, bootstrap) |
| Tool | `drush_module_list` | List all enabled modules |
| Tool | `drush_module_enable` | Enable a module by machine name |
| Tool | `drush_config_get` | Read a config value |
| Tool | `drush_config_export` | Export active config to config/sync |
| Tool | `drush_config_import` | Import config/sync into active database |
| Tool | `drush_config_status` | Diff active config vs config/sync |
| Tool | `drush_update_db` | Run pending database updates (updb) |
| Tool | `drush_watchdog` | View recent Drupal log messages |
| Tool | `drush_node_list` | List nodes by content type |
| Resource | `drupal://site/status` | Site status as JSON |
| Resource | `drupal://modules/enabled` | Enabled modules as JSON |
| Resource | `drupal://modules/custom` | Custom module list |
| Resource | `drupal://config/system.site` | Site config as JSON |
| Resource | `drupal://config/status` | Config diff (active vs sync) as JSON |
| Prompt | `drupal-debug` | Debug a Drupal error message |
| Prompt | `drupal-review` | Review a Drupal file for standards |
| Prompt | `drupal-module-plan` | Plan a new custom module |
| Prompt | `drupal-deploy` | Step-by-step deployment sequence |
| Prompt | `drupal-config-review` | Review config/sync files for a feature |

### `github` (via `@modelcontextprotocol/server-github`)
GitHub API access — create PRs, post comments, read files, manage issues.

## Active Hooks

Configured in `.claude/settings.json` — run automatically:

| Event | Trigger | Action |
|-------|---------|--------|
| `PostToolUse` | Edit or Write any file | `ddev drush cr` — auto-clears Drupal cache |
| `PostToolUse` | Edit or Write a `.php` file | `php -l` — syntax check before cache clear |
| `PostToolUse` | Bash with `git commit` | `git log --oneline -5` — shows recent commits |
| `PreToolUse` | Bash with `git commit` | `phpcs --standard=Drupal` — checks coding standards |
| `PreToolUse` | Read or Grep any file | Blocks `.env`, `.pem`, `.key`, `.mcp.json` — sensitive file guard |
| `PreCompact` | Manual `/compact` | Injects reminder to preserve in-progress task context |
| `Stop` | Claude finishes a task | Desktop notification via `notify-send` |
| `SessionStart` | Every new session | Injects Drupal project context (DDEV commands, config path, site URL) |
| `UserPromptSubmit` | Every user message | Appends prompt to `.claude/prompt-log.txt` (gitignored) |

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
- [x] Hooks deep dive: added php -l, sensitive file blocker, SessionStart context, UserPromptSubmit audit log

### Introduction to Subagents
- [x] drupal-config-manager: export/import/diff config operations
- [x] drupal-security-auditor: dedicated security scanning agent

### Introduction to Agent Skills
- [x] /drupal-config: config management skill (cex/cim/status/get)
- [x] /drupal-audit: one-command parallel audit trigger
- [x] /drupal-deploy: cim → updb → cr deploy sequence

### MCP Advanced Topics
- [x] Config tools added to Drupal MCP server (export, import, status, updb)
- [x] drupal://config/status resource (live config diff)
- [x] drupal-deploy and drupal-config-review prompts added
