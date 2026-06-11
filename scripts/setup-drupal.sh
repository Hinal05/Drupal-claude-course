#!/usr/bin/env bash
# Setup script for cc_ecommerce Drupal project.
# Run from project root: bash scripts/setup-drupal.sh

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step()  { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()    { echo -e "${GREEN}✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ── Preflight ──────────────────────────────────────────────────────────────────
step "Checking DDEV is running"
ddev status 2>&1 | grep -q "drupal-claude-course" || error "DDEV is not running. Run: ddev start"
ok "DDEV is running"

# ── Clear cache before we start ───────────────────────────────────────────────
step "Clearing caches"
ddev drush cr -q
ok "Cache cleared"

# ── Import content type + field config ────────────────────────────────────────
step "Importing content types and fields from config/setup/"

CONFIG_DIR="/var/www/html/config/setup"

echo "  Importing all YAMLs from config/setup/..."
ddev drush config:import --partial --source="$CONFIG_DIR" -y
ok "Config imported"

# ── Run DB updates (in case new fields need schema updates) ───────────────────
step "Running database updates"
ddev drush updb -y -q
ok "DB updates done"

# ── Verify content types exist ────────────────────────────────────────────────
step "Verifying content types"

TYPES=$(ddev drush php:eval "
  \$types = \Drupal::entityTypeManager()->getStorage('node_type')->loadMultiple();
  echo implode(',', array_keys(\$types));
" 2>/dev/null)

echo "  Found: $TYPES"

echo "$TYPES" | grep -q "product" && ok "product content type exists" || warn "product content type missing"
echo "$TYPES" | grep -q "about_us" && ok "about_us content type exists" || warn "about_us content type missing"

# ── Verify blocks are in correct regions ──────────────────────────────────────
step "Verifying block placement"

ddev drush php:eval "
  \$map = [
    'cc_ecommerce_site_branding' => 'header',
    'cc_ecommerce_main_menu'     => 'primary_menu',
  ];
  \$storage = \Drupal::entityTypeManager()->getStorage('block');
  foreach (\$map as \$id => \$expected_region) {
    \$block = \$storage->load(\$id);
    if (!\$block) { echo \"MISSING: \$id\n\"; continue; }
    \$region = \$block->getRegion();
    \$status = (\$region === \$expected_region) ? 'OK' : 'WRONG REGION';
    echo \"\$status: \$id → \$region\n\";
  }
" 2>/dev/null

# ── Add footer block if none exists ───────────────────────────────────────────
step "Checking footer region"

FOOTER_BLOCKS=$(ddev drush php:eval "
  \$blocks = \Drupal::entityTypeManager()->getStorage('block')->loadByProperties([
    'theme' => 'cc_ecommerce',
    'region' => 'footer',
  ]);
  echo count(\$blocks);
" 2>/dev/null)

if [ "$FOOTER_BLOCKS" -eq "0" ]; then
  warn "No blocks in footer region. Placing 'Powered by Drupal' as placeholder..."
  ddev drush php:eval "
    \$block = \Drupal\block\Entity\Block::create([
      'id' => 'cc_ecommerce_footer_powered',
      'plugin' => 'system_powered_by_block',
      'region' => 'footer',
      'theme' => 'cc_ecommerce',
      'weight' => 0,
      'settings' => ['label' => 'Footer', 'label_display' => '0'],
    ]);
    \$block->save();
    echo 'Footer block placed.';
  " 2>/dev/null
  ok "Footer block placed"
else
  ok "Footer already has $FOOTER_BLOCKS block(s)"
fi

# ── Add primary menu items if menu is empty ───────────────────────────────────
step "Checking Primary Menu items"

MENU_COUNT=$(ddev drush php:eval "
  \$items = \Drupal::entityTypeManager()->getStorage('menu_link_content')
    ->loadByProperties(['menu_name' => 'main']);
  echo count(\$items);
" 2>/dev/null)

if [ "$MENU_COUNT" -eq "0" ]; then
  echo "  No menu items found — creating defaults..."
  ddev drush php:eval "
    \$items = [
      ['Home',     'route:<front>',   0],
      ['Products', '/products', 1],
      ['About Us', '/about',    2],
      ['Contact',  '/contact',  3],
    ];
    foreach (\$items as [\$title, \$path, \$weight]) {
      \Drupal\menu_link_content\Entity\MenuLinkContent::create([
        'title'     => \$title,
        'link'      => ['uri' => 'internal:' . \$path],
        'menu_name' => 'main',
        'weight'    => \$weight,
        'expanded'  => FALSE,
      ])->save();
      echo \"Created: \$title\n\";
    }
  " 2>/dev/null
  ok "Menu items created"
else
  ok "Menu already has $MENU_COUNT item(s)"
fi

# ── Create sample content ─────────────────────────────────────────────────────
step "Creating sample content"

ddev drush php:eval "
  // Sample About Us page
  \$about = \Drupal::entityTypeManager()->getStorage('node')
    ->loadByProperties(['type' => 'about_us', 'title' => 'About Us']);
  if (empty(\$about)) {
    \Drupal\node\Entity\Node::create([
      'type'   => 'about_us',
      'title'  => 'About Us',
      'status' => 1,
      'body'   => [
        'value'  => '<h2>Our Story</h2><p>We are a passionate team building great products.</p>',
        'format' => 'basic_html',
      ],
    ])->save();
    echo \"Created: About Us page\n\";
  } else {
    echo \"Exists: About Us page\n\";
  }

  // Sample products
  \$products = [
    ['Product One',   '29.99'],
    ['Product Two',   '49.99'],
    ['Product Three', '19.99'],
  ];
  foreach (\$products as [\$title, \$price]) {
    \$existing = \Drupal::entityTypeManager()->getStorage('node')
      ->loadByProperties(['type' => 'product', 'title' => \$title]);
    if (empty(\$existing)) {
      \Drupal\node\Entity\Node::create([
        'type'        => 'product',
        'title'       => \$title,
        'status'      => 1,
        'field_price' => \$price,
        'body'        => [
          'value'  => '<p>A great product you will love.</p>',
          'format' => 'basic_html',
        ],
      ])->save();
      echo \"Created: \$title\n\";
    } else {
      echo \"Exists: \$title\n\";
    }
  }
" 2>/dev/null

ok "Sample content ready"

# ── Final cache clear ─────────────────────────────────────────────────────────
step "Final cache rebuild"
ddev drush cr -q
ok "Cache rebuilt"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Site:       https://drupal-claude-course.ddev.site"
echo "  Admin:      $(ddev drush uli 2>/dev/null)"
echo ""
echo "  Content types: product, about_us"
echo "  Blocks:        header, primary_menu, footer"
echo "  Menu items:    Home, Products, About Us, Contact"
echo "  Sample nodes:  3 products + About Us page"
echo ""
