import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execAsync = promisify(exec);
const PROJECT_ROOT = '/home/hinal/Documents/Documents/self/Claude/drupal-claude-course';

async function drush(command) {
  const { stdout, stderr } = await execAsync(`ddev drush ${command} 2>&1`, {
    cwd: PROJECT_ROOT,
  });
  return stdout || stderr;
}

const server = new McpServer({
  name: 'drupal-mcp',
  version: '1.0.0',
});

// ── Tools ──────────────────────────────────────────────────────────────────

server.tool(
  'drush_cache_clear',
  'Clear all Drupal caches (ddev drush cr)',
  {},
  async () => {
    const result = await drush('cr');
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_status',
  'Get Drupal site status including version, database, and bootstrap info',
  {},
  async () => {
    const result = await drush('status --format=json');
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_module_list',
  'List all enabled Drupal modules',
  {},
  async () => {
    const result = await drush('pm:list --status=enabled --format=json');
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_module_enable',
  'Enable a Drupal module by machine name',
  { module_name: z.string().describe('Machine name of the module to enable') },
  async ({ module_name }) => {
    const result = await drush(`en ${module_name} -y`);
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_config_get',
  'Get a Drupal configuration value',
  {
    config_name: z.string().describe('Config object name, e.g. system.site'),
    key: z.string().optional().describe('Optional specific key, e.g. name'),
  },
  async ({ config_name, key }) => {
    const cmd = key ? `config:get ${config_name} ${key}` : `config:get ${config_name}`;
    const result = await drush(cmd);
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_watchdog',
  'Get recent Drupal log messages (watchdog)',
  {
    count: z.number().optional().describe('Number of messages to return (default 20)'),
    severity: z.string().optional().describe('Filter by severity: emergency, alert, critical, error, warning, notice, info, debug'),
  },
  async ({ count = 20, severity }) => {
    const severityFlag = severity ? `--severity=${severity}` : '';
    const result = await drush(`watchdog:show --count=${count} ${severityFlag} --format=json`);
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_node_list',
  'List Drupal nodes of a given content type',
  {
    content_type: z.string().describe('Content type machine name, e.g. product, about_us'),
    limit: z.number().optional().describe('Max number of nodes to return (default 10)'),
  },
  async ({ content_type, limit = 10 }) => {
    const result = await drush(
      `php:eval "
        \\$nodes = \\Drupal::entityTypeManager()->getStorage('node')
          ->loadByProperties(['type' => '${content_type}', 'status' => 1]);
        \\$out = [];
        foreach (array_slice(\\$nodes, 0, ${limit}) as \\$node) {
          \\$out[] = ['id' => \\$node->id(), 'title' => \\$node->label(), 'created' => date('Y-m-d', \\$node->getCreatedTime())];
        }
        echo json_encode(\\$out, JSON_PRETTY_PRINT);
      "`
    );
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_config_export',
  'Export active Drupal configuration to config/sync directory',
  {},
  async () => {
    const result = await drush('cex --yes');
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_config_import',
  'Import configuration from config/sync into the active Drupal database',
  {},
  async () => {
    const exportResult = await drush('cim --yes');
    const cacheResult = await drush('cr');
    return { content: [{ type: 'text', text: `${exportResult}\n${cacheResult}` }] };
  }
);

server.tool(
  'drush_config_status',
  'Show differences between active Drupal config and config/sync (what would change on cim)',
  {},
  async () => {
    const result = await drush('config:status --format=json');
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'drush_update_db',
  'Run pending Drupal database updates (updb)',
  {},
  async () => {
    const result = await drush('updb --yes');
    return { content: [{ type: 'text', text: result }] };
  }
);

// ── Resources ──────────────────────────────────────────────────────────────

server.resource(
  'site-status',
  'drupal://site/status',
  { mimeType: 'application/json' },
  async () => {
    const result = await drush('status --format=json');
    return { contents: [{ uri: 'drupal://site/status', text: result, mimeType: 'application/json' }] };
  }
);

server.resource(
  'enabled-modules',
  'drupal://modules/enabled',
  { mimeType: 'application/json' },
  async () => {
    const result = await drush('pm:list --status=enabled --format=json');
    return { contents: [{ uri: 'drupal://modules/enabled', text: result, mimeType: 'application/json' }] };
  }
);

server.resource(
  'custom-modules',
  'drupal://modules/custom',
  { mimeType: 'text/plain' },
  async () => {
    const { stdout } = await execAsync('find web/modules/custom -name "*.info.yml" | xargs grep -l "type: module" 2>/dev/null', { cwd: PROJECT_ROOT });
    return { contents: [{ uri: 'drupal://modules/custom', text: stdout || 'No custom modules found.', mimeType: 'text/plain' }] };
  }
);

server.resource(
  'site-config',
  'drupal://config/system.site',
  { mimeType: 'application/json' },
  async () => {
    const result = await drush('config:get system.site --format=json');
    return { contents: [{ uri: 'drupal://config/system.site', text: result, mimeType: 'application/json' }] };
  }
);

// ── Prompts ────────────────────────────────────────────────────────────────

server.prompt(
  'drupal-debug',
  'Generate a debugging prompt for a Drupal error message',
  { error_message: z.string().describe('The Drupal error or exception message to debug') },
  ({ error_message }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `I have a Drupal 11 error on my local DDEV environment. Please help me debug it.

Error:
${error_message}

Project details:
- Drupal 11, PHP 8.3, MariaDB 10.11
- DDEV local environment
- Custom theme: cc_ecommerce (extends Olivero)
- Custom modules: cc_featured (Featured Products block)

Steps to help me:
1. Identify the root cause
2. Check if it's a config, code, or cache issue
3. Suggest the drush commands to diagnose further
4. Provide a fix`,
      },
    }],
  })
);

server.prompt(
  'drupal-review',
  'Generate a code review prompt for a Drupal PHP or Twig file',
  { file_path: z.string().describe('Path to the file to review, relative to project root') },
  ({ file_path }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Please review this Drupal 11 file for coding standards, security, and best practices:

File: ${file_path}

Check for:
1. Drupal coding standards (docblocks, snake_case, hook naming)
2. Security issues (XSS, SQL injection, missing access checks)
3. Performance (N+1 queries, missing cache metadata)
4. Best practices (dependency injection, render arrays, t() usage)

Format findings as: Critical / Warning / Info with file + line references.`,
      },
    }],
  })
);

server.prompt(
  'drupal-module-plan',
  'Generate a plan for a new custom Drupal module',
  {
    module_name: z.string().describe('Module machine name (without cc_ prefix)'),
    description: z.string().describe('What the module should do'),
  },
  ({ module_name, description }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Plan a new custom Drupal 11 module for this project.

Module name: cc_${module_name}
Description: ${description}

Project conventions:
- Module prefix: cc_* (Claude Course)
- Namespace: Drupal\\cc_${module_name}
- PSR-4 autoloading in src/
- Drupal coding standards

Please provide:
1. Recommended file structure
2. Key classes/hooks needed
3. Any dependencies (other modules, services)
4. Implementation steps in order`,
      },
    }],
  })
);

server.resource(
  'config-status',
  'drupal://config/status',
  { mimeType: 'application/json' },
  async () => {
    const result = await drush('config:status --format=json');
    return { contents: [{ uri: 'drupal://config/status', text: result, mimeType: 'application/json' }] };
  }
);

server.prompt(
  'drupal-deploy',
  'Generate a step-by-step deployment prompt for applying config and DB updates',
  { environment: z.string().optional().describe('Target environment: local, staging, production') },
  ({ environment = 'local' }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Run the standard Drupal deployment sequence for the ${environment} environment.

Steps to execute in order:
1. ddev drush cim --yes  (import config)
2. ddev drush updb --yes (run DB updates)
3. ddev drush cr         (clear caches)

For each step:
- Show the command output
- Report success or failure
- Stop immediately if any step fails — do not proceed

After all steps complete, confirm the site is operational.`,
      },
    }],
  })
);

server.prompt(
  'drupal-config-review',
  'Review config/sync files for a specific feature to understand what will be imported',
  { feature: z.string().describe('Feature name or config prefix to review, e.g. views, pathauto, node.type') },
  ({ feature }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Review the Drupal config/sync files related to "${feature}".

1. List all config/sync/*.yml files matching "${feature}"
2. Summarise what each file configures
3. Identify any dependencies between them (e.g. field storage before field instance)
4. Flag anything that looks unusual or potentially problematic
5. Confirm the correct import order if order matters

Project config directory: config/sync/`,
      },
    }],
  })
);

// ── Start server ───────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
