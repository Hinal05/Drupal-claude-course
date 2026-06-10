# Drupal Claude Course

A hands-on practice project for the [Anthropic Claude Code](https://claude.ai/code) courses, using a Drupal 11 codebase as a real-world context.

---

## Requirements

- [Docker](https://docs.docker.com/get-docker/) (Desktop or Engine)
- [DDEV](https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/) v1.22+
- [Composer](https://getcomposer.org/download/) v2
- [Claude Code](https://claude.ai/code) CLI

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/drupal-claude-course.git
cd drupal-claude-course
```

### 2. Install PHP dependencies

```bash
ddev composer install
```

### 3. Start DDEV

```bash
ddev start
```

### 4. Install Drupal

```bash
ddev drush site:install --account-name=admin --account-pass=admin --yes
```

### 5. Get a login link

```bash
ddev drush uli
```

Open the URL in your browser. The site runs at **https://drupal-claude-course.ddev.site**.

---

## Common Commands

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
| Check site status | `ddev drush status` |
| Open site in browser | `ddev launch` |
| Run coding standards check | `vendor/bin/phpcs --standard=Drupal web/modules/custom web/themes/custom` |

---

## Project Structure

```
drupal-claude-course/
├── CLAUDE.md                   # Claude Code project context
├── composer.json               # PHP dependencies
├── composer.lock
├── vendor/                     # Installed by composer (not committed)
├── web/                        # Drupal webroot
│   ├── core/                   # Drupal core (not committed)
│   ├── modules/custom/         # Custom modules — cc_* prefix
│   └── themes/custom/          # Custom themes
├── .ddev/
│   └── config.yaml             # DDEV environment config
└── .claude/
    ├── settings.json           # Claude hooks
    ├── agents/                 # Custom Claude subagents
    └── skills/                 # Custom Claude slash commands
```

---

## Claude Code Setup

This project includes Claude Code agents, skills, and hooks pre-configured in `.claude/`.

### Agents

Invoke these when working on specific Drupal tasks:

| Agent | Purpose |
|-------|---------|
| `drupal-module-generator` | Scaffold a new `cc_*` custom module |
| `drupal-code-reviewer` | Review PHP/Twig/YAML for standards and security |
| `drush-task-runner` | Run and explain drush commands |
| `theme-component-builder` | Build Twig templates, CSS libraries, preprocess hooks |

### Slash Commands (Skills)

| Command | What it does |
|---------|-------------|
| `/drupal-module <name>` | Scaffold a new custom module |
| `/drupal-review [file]` | Review code for Drupal standards and security |
| `/drush <command>` | Run any drush command with explanation |

### Automatic Hooks

These run automatically during Claude Code sessions:

| Trigger | Action |
|---------|--------|
| After editing any file | `ddev drush cr` — clears Drupal cache |
| Before `git commit` | `phpcs --standard=Drupal` — checks coding standards |
| After `git commit` | `git log --oneline -5` — shows recent commits |
| When Claude finishes | Desktop notification via `notify-send` |

---

## Stack

| Component | Version |
|-----------|---------|
| Drupal | 11.3 |
| PHP | 8.3 |
| MariaDB | 10.11 |
| DDEV | 1.24+ |
| Drush | 13.x |

---

## Coding Standards

- Follow [Drupal coding standards](https://www.drupal.org/docs/develop/standards)
- Custom module machine names use the `cc_` prefix (e.g. `cc_events`)
- Namespace pattern: `Drupal\cc_<name>`
- snake_case for PHP variables and functions
- PSR-4 autoloading for all classes

---

## Troubleshooting

**DDEV won't start**
```bash
ddev poweroff && ddev start
```

**Cache issues**
```bash
ddev drush cr
```

**Composer install fails**
```bash
ddev composer install --no-interaction
```

**Database connection error after cloning**
Run the Drupal installer again:
```bash
ddev drush site:install --account-name=admin --account-pass=admin --yes
```
