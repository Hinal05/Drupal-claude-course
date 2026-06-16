# Reusing Claude Code Config Across Drupal Projects (Option 3: Global Agents & Skills)

This guide explains how to move reusable Claude Code agents, skills, and hooks to your global
user-level config so they are available in every Drupal project — no copying required.

---

## What Goes Where

| Location | Purpose |
|----------|---------|
| `~/.claude/agents/` | Global subagents — available in all projects |
| `~/.claude/skills/` | Global skills (slash commands) — available in all projects |
| `~/.claude/settings.json` | Global hooks and settings — apply everywhere |
| `.claude/` in each project | Project-specific agents, skills, hooks, and CLAUDE.md |

---

## Step 1 — Decide What Is Generic vs Project-Specific

### Move to global (works on any Drupal project)

| Type | Name | Why it's generic |
|------|------|-----------------|
| Agent | `drupal-security-auditor` | No hardcoded paths or module names |
| Agent | `drupal-code-reviewer` | Generic Drupal standards check |
| Agent | `drush-task-runner` | Works with any DDEV Drupal project |
| Skill | `/drupal-audit` | Triggers the audit workflow |
| Skill | `/drupal-deploy` | `cim → updb → cr` works everywhere |
| Skill | `/drupal-review` | Generic code review |
| Skill | `/drush` | Generic drush command runner |
| Hook | Sensitive file blocker | Protects `.env`/`.pem`/`.key` in any project |
| Hook | Stop notification | `notify-send` is not project-specific |

### Keep in project (has project-specific context)

| Type | Name | Why it's project-specific |
|------|------|--------------------------|
| Agent | `drupal-module-generator` | Uses `cc_*` module prefix |
| Agent | `drupal-config-manager` | References project `config/sync/` path |
| Agent | `theme-component-builder` | References `cc_ecommerce` theme |
| Skill | `/drupal-module` | Uses `cc_*` prefix and project namespace |
| Skill | `/drupal-config` | References project-specific sync path |
| Hook | `ddev drush cr` on Edit/Write | Can stay global too, but path may vary |
| Hook | `phpcs` before commit | Project path is hardcoded |

---

## Step 2 — Create Global Directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
```

---

## Step 3 — Copy Generic Agents to Global

```bash
cp .claude/agents/drupal-security-auditor.md ~/.claude/agents/
cp .claude/agents/drupal-code-reviewer.md ~/.claude/agents/
cp .claude/agents/drush-task-runner.md ~/.claude/agents/
```

---

## Step 4 — Copy Generic Skills to Global

```bash
cp .claude/skills/drupal-audit.md ~/.claude/skills/
cp .claude/skills/drupal-deploy.md ~/.claude/skills/
cp .claude/skills/drupal-review.md ~/.claude/skills/
cp .claude/skills/drush.md ~/.claude/skills/
```

---

## Step 5 — Add Global Hooks to `~/.claude/settings.json`

Create or edit `~/.claude/settings.json` and add the hooks that are not project-specific.
**Always merge with existing content — never replace the whole file.**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '(.tool_input.file_path // .tool_input.path // .tool_input.pattern // \"\")' | grep -qE '(\\.env|\\.pem|\\.key|\\.mcp\\.json|id_rsa|credentials)' && echo '{\"decision\": \"block\", \"reason\": \"Blocked: sensitive file detected (.env / .pem / .key). Do not read credential files.\"}' || true",
            "statusMessage": "Checking for sensitive files..."
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Task complete' 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

> **Note:** On macOS replace `notify-send` with `osascript -e 'display notification "Task complete" with title "Claude Code"'`

---

## Step 6 — Remove Project-Specific References from Copied Agents

Open each copied agent in `~/.claude/agents/` and remove any hardcoded paths.

**Before (project-specific):**
```markdown
Project root: `/home/hinal/Documents/Documents/self/Claude/drupal-claude-course`
Custom modules: cc_featured
Custom theme: cc_ecommerce
```

**After (generic):**
```markdown
Run all commands from the project root.
Custom modules are in `web/modules/custom/`.
Custom themes are in `web/themes/custom/`.
```

The agent will pick up the actual project root from wherever Claude Code is launched.

---

## Step 7 — Verify Global Config Is Loaded

Open Claude Code in any directory and run:

```
/drupal-deploy
```

If the skill triggers, global config is working. You can also check with:

```
/help
```

Global skills appear in the skill list regardless of which project you're in.

---

## Step 8 — Set Up a New Drupal Project

For each new Drupal project, you only need a minimal `.claude/` setup:

### Minimal `CLAUDE.md`

```markdown
# My New Drupal Project

## Stack
- Drupal 11, PHP 8.3, MariaDB, DDEV

## Local Development
- Start: `ddev start`
- Cache clear: `ddev drush cr`
- Site URL: https://my-project.ddev.site

## Coding Standards
- Module prefix: `myproject_*`
- Namespace: `Drupal\myproject_<name>`
- Run: `vendor/bin/phpcs --standard=Drupal web/modules/custom web/themes/custom`
```

### Optional — Project-Specific Hooks (`.claude/settings.json`)

Only add hooks that are specific to this project, e.g. cache clear after edits:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "ddev drush cr 2>/dev/null || true",
            "statusMessage": "Clearing Drupal cache..."
          }
        ]
      }
    ]
  }
}
```

Global hooks from `~/.claude/settings.json` will also apply automatically.

---

## Result

After following these steps, every new Drupal project gets:

- `/drupal-audit` — parallel security + standards + performance audit
- `/drupal-deploy` — `cim → updb → cr` in one command
- `/drupal-review` — code review against Drupal standards
- `/drush <command>` — drush with explanation
- `drupal-security-auditor` agent — on-demand security scanning
- `drupal-code-reviewer` agent — on-demand code review
- `drush-task-runner` agent — on-demand drush operations
- Sensitive file blocker hook — protects `.env`, `.pem`, `.key`, `.mcp.json`
- Stop notification — desktop alert when Claude finishes a task

With only a `CLAUDE.md` needed per project to provide local context.

---

## Settings Load Order

Claude Code loads settings in this order — later files override earlier ones:

```
~/.claude/settings.json        (global — your personal defaults)
       ↓
.claude/settings.json          (project — committed, shared with team)
       ↓
.claude/settings.local.json    (local override — gitignored, personal)
```

This means project hooks extend global hooks rather than replacing them.
