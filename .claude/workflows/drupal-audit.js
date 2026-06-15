export const meta = {
  name: 'drupal-audit',
  description: 'Parallel Drupal code audit — standards, security, and performance scanned simultaneously',
  phases: [
    { title: 'Audit', detail: 'Run 3 auditors in parallel: code standards, security scan, performance check' },
    { title: 'Synthesise', detail: 'Combine findings into a prioritised report' },
  ],
};

const PROJECT = '/home/hinal/Documents/Documents/self/Claude/drupal-claude-course';
const CUSTOM_CODE = `${PROJECT}/web/modules/custom and ${PROJECT}/web/themes/custom`;

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['Critical', 'Warning', 'Info'] },
          title: { type: 'string' },
          file: { type: 'string' },
          description: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['severity', 'title', 'description'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['findings', 'summary'],
};

phase('Audit');

const [standards, security, performance] = await parallel([
  () => agent(
    `You are a Drupal coding standards auditor. Review all PHP, Twig, and YAML files under ${CUSTOM_CODE}.

    Check for:
    - Missing @file, @param, @return docblocks on functions
    - Snake_case violations in variable and function names
    - Hook naming: must follow hook_<theme/module>_<hookname>() pattern
    - PSR-4 namespace correctness (Drupal\\cc_<name>)
    - Hardcoded strings that should use t() or formatPlural()
    - YAML formatting issues in .info.yml and .libraries.yml files

    Run: cd ${PROJECT} && vendor/bin/phpcs --standard=Drupal --report=json web/modules/custom web/themes/custom 2>/dev/null || true

    Return structured findings with file paths and line numbers where possible.`,
    { label: 'Code Standards', phase: 'Audit', schema: FINDINGS_SCHEMA }
  ),

  () => agent(
    `You are a Drupal security auditor. Review all PHP and Twig files under ${CUSTOM_CODE}.

    Check for:
    - Unescaped output in Twig ({{ var }} where var is user-controlled or raw PHP — look for missing |t, missing Markup wrapping)
    - CSS/JS injection via style attributes (e.g. style="url('{{ some_var }}')")
    - SQL injection: direct use of db_query() with string concat or missing placeholders
    - Missing access checks on routes or form callbacks
    - User input passed to shell commands (e.g. exec(), shell_exec())
    - XSS via Xss::filter() not being called on rendered user content
    - CSRF: form submissions without form tokens

    Read files in: ${PROJECT}/web/themes/custom/cc_ecommerce/cc_ecommerce.theme
    and all Twig templates under ${PROJECT}/web/themes/custom/cc_ecommerce/templates/

    Return structured findings with file paths.`,
    { label: 'Security Scan', phase: 'Audit', schema: FINDINGS_SCHEMA }
  ),

  () => agent(
    `You are a Drupal performance auditor. Review all PHP files under ${CUSTOM_CODE}.

    Check for:
    - N+1 queries: entity loads inside loops (e.g. Node::load() or entityTypeManager()->getStorage()->load() inside foreach)
    - Missing render cache metadata (#cache keys, contexts, tags) on custom render arrays
    - Heavy operations in preprocess hooks (file reads, external HTTP calls, large queries)
    - Static caches not used where repeated calls to \\Drupal::config() or service calls appear in loops
    - Missing lazy loading: services instantiated eagerly that could be lazy
    - Unoptimised image handling: missing image styles or srcset

    Read files in: ${PROJECT}/web/themes/custom/cc_ecommerce/cc_ecommerce.theme
    and any custom modules under ${PROJECT}/web/modules/custom/

    Return structured findings with file paths.`,
    { label: 'Performance', phase: 'Audit', schema: FINDINGS_SCHEMA }
  ),
]);

phase('Synthesise');

const allFindings = [
  ...(standards ? standards.findings : []),
  ...(security ? security.findings : []),
  ...(performance ? performance.findings : []),
];

log(`Total findings: ${allFindings.length} (standards: ${standards ? standards.findings.length : 0}, security: ${security ? security.findings.length : 0}, performance: ${performance ? performance.findings.length : 0})`);

const report = await agent(
  `Synthesise these Drupal audit findings into a final prioritised report.

  Findings from 3 parallel auditors:
  ${JSON.stringify(allFindings, null, 2)}

  Format the report as:
  1. Executive summary (2-3 sentences)
  2. Critical issues (must fix before merge)
  3. Warnings (should fix soon)
  4. Info / nice-to-haves
  5. Quick wins (easiest fixes first)

  Deduplicate overlapping findings. Be concise and actionable.`,
  { label: 'Synthesis', phase: 'Synthesise' }
);

return { report, totalFindings: allFindings.length };
