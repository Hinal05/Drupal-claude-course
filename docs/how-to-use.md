# How to Use — Commands & Reference

Everything implemented in this project. Copy-paste ready.

---

## Skills (Slash Commands)

Type these directly in the Claude Code chat.

### `/drupal-module <name>`
Scaffolds a new custom Drupal module.

```
/drupal-module cart
/drupal-module wishlist
/drupal-module product-slider
```

What happens:
- Creates `web/modules/custom/cc_<name>/` with all required files
- Generates `cc_<name>.info.yml`, `src/` directory
- Runs `ddev drush en cc_<name>` to enable it
- Confirms with `ddev drush status`

---

### `/drupal-review [target]`
Reviews Drupal code for standards and security issues.

```
/drupal-review                         # reviews all custom modules + themes
/drupal-review cc_featured             # reviews one module
/drupal-review web/modules/custom/cc_featured/src/Plugin/Block/FeaturedProductsBlock.php
```

What happens:
- Runs `phpcs --standard=Drupal` checks automatically
- Follows with manual security and best-practice review
- Reports: Errors → Warnings → Suggestions

---

### `/drush <command>`
Runs any drush command inside DDEV with an explanation.

```
/drush cr                  # clear all caches
/drush en cc_featured      # enable a module
/drush uli                 # get one-time admin login link
/drush cex                 # export config to config/sync/
/drush cim                 # import config from config/sync/
/drush updb                # run pending database updates
/drush status              # check Drupal status
```

What happens:
- Agent explains the command before running it
- Runs `ddev drush <command>` inside the container
- Explains the output

---

## Hooks

Hooks run **automatically** — you do not type anything to trigger them.

| Hook | Triggered when | What runs |
|------|---------------|-----------|
| Cache clear | Claude edits or writes any file | `ddev drush cr` |
| Standards check | Claude runs `git commit` | `phpcs --standard=Drupal` |
| Git log | After a `git commit` completes | `git log --oneline -5` |
| Context save | You type `/compact` | Reminds Claude to save task state |
| Notification | Claude finishes any task | Desktop notification via `notify-send` |

**To see hooks config:** Open [.claude/settings.json](../.claude/settings.json)

**To add a hook:** Add an entry under the matching event in `settings.json`. Example — run a custom script after every commit:
```json
{
  "matcher": "Bash",
  "hooks": [{ "type": "command", "command": "echo 'committed!'" }]
}
```

**To disable a hook temporarily:** Remove its entry from `settings.json` and save.

---

## Custom Agents

Agents are invoked by describing your task — Claude picks the right one. Or call explicitly.

### `drupal-module-generator`
```
"Use drupal-module-generator to create a cc_cart module"
"Scaffold a new module called cc_newsletter"
```
Creates complete module file structure following `cc_*` conventions.

---

### `drupal-code-reviewer`
```
"Use drupal-code-reviewer to review FeaturedProductsBlock.php"
"Review all files changed in this PR using drupal-code-reviewer"
```
Reviews PHP, Twig, YAML for Drupal coding standards and security issues.

---

### `drush-task-runner`
```
"Use drush-task-runner to enable the cc_featured module"
"Run ddev drush cex using drush-task-runner"
```
Runs and explains drush commands.

---

### `theme-component-builder`
```
"Use theme-component-builder to create a product card component"
"Build a Twig template for the homepage hero using theme-component-builder"
```
Creates Twig templates, CSS libraries, and preprocess hooks in `cc_ecommerce` theme.

---

## DDEV Commands

Run these in the terminal from the project root.

```bash
ddev start                 # start local environment
ddev stop                  # stop local environment
ddev drush cr              # clear Drupal cache
ddev drush uli             # get admin login link
ddev drush en <module>     # enable a module
ddev drush status          # check Drupal + DB status
ddev launch                # open site in browser
```

Site URL: https://drupal-claude-course.ddev.site

---

## Coding Standards Check

Run manually anytime (also runs automatically before `git commit`):

```bash
vendor/bin/phpcs --standard=Drupal web/modules/custom web/themes/custom
```

---

## MCP Servers

MCP (Model Context Protocol) servers give Claude direct access to external tools. Configured in [.mcp.json](../.mcp.json) — loaded automatically when Claude Code starts.

### GitHub MCP

Lets Claude interact with GitHub — PRs, issues, branches, files — without leaving the terminal.

**Common things to say:**

```
"Create a PR from feature/cc-ecommerce-theme to main"
"List open pull requests"
"Post a review comment on PR #1"
"Get the files changed in PR #1"
"Create an issue titled 'Fix product card layout'"
"Check the status of PR #1"
```

**Available actions via GitHub MCP:**

| What to ask Claude | What it does |
|--------------------|-------------|
| `"List open PRs"` | Lists all open pull requests |
| `"Create a PR for this branch"` | Opens a new PR on GitHub |
| `"Review PR #N and post comments"` | Runs code review + posts inline GitHub comments |
| `"Get files changed in PR #N"` | Shows diff of changed files |
| `"Create an issue: <title>"` | Creates a new GitHub issue |
| `"Comment on issue #N"` | Adds a comment to an issue |
| `"Merge PR #N"` | Merges a pull request |

**To update the GitHub token:**
Open `.mcp.json` and replace the value of `GITHUB_PERSONAL_ACCESS_TOKEN`.

---

### Drupal MCP

Local MCP server — use these **directly in Claude chat**, no terminal needed.

**Config:** `mcp/drupal-mcp/index.js`

| What to say in Claude | MCP Tool called | What it does |
|-----------------------|----------------|-------------|
| `"Clear the Drupal cache"` | `drush_cache_clear` | Clears all Drupal caches |
| `"List all enabled modules"` | `drush_module_list` | Shows all currently enabled modules |
| `"Enable module cc_featured"` | `drush_module_enable` | Enables a module by machine name |
| `"Get the site status"` | `drush_status` | Returns Drupal version, DB connection, bootstrap status |
| `"Show recent Drupal logs"` | `drush_watchdog` | Shows recent Drupal watchdog log messages |
| `"Get config system.site"` | `drush_config_get` | Reads a specific Drupal config value |
| `"List nodes of type product"` | `drush_node_list` | Lists nodes filtered by content type |

**Examples:**
```
"Clear the Drupal cache"
"Show me the last 20 Drupal log messages"
"List all enabled modules"
"Get the value of system.site name"
"Show all product nodes"
```

---

### How to add a new MCP server

1. Open `.mcp.json`
2. Add an entry under `mcpServers`:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```
3. Restart Claude Code — the new tools are available immediately.

---

## Multi-Agent Audit Workflow

Runs a parallel audit across all custom code — standards, security, and performance simultaneously.

```
"Run the drupal-audit workflow"
```

Or via the Workflow tool — script at [.claude/workflows/drupal-audit.js](../.claude/workflows/drupal-audit.js)

Spawns 3 agents in parallel:
1. Standards — phpcs + Drupal conventions
2. Security — common Drupal security issues
3. Performance — caching, query, and render issues
