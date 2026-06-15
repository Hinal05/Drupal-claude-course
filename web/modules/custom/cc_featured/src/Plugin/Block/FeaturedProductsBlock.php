<?php

namespace Drupal\cc_featured\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Featured Products' block.
 *
 * @Block(
 *   id = "cc_featured_products",
 *   admin_label = @Translation("Featured Products"),
 *   category = @Translation("Claude Course")
 * )
 */
class FeaturedProductsBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Constructs a FeaturedProductsBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EntityTypeManagerInterface $entity_type_manager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $view_builder = $this->entityTypeManager->getViewBuilder('node');

    $nids = $node_storage->getQuery()
      ->condition('type', 'product')
      ->condition('status', 1)
      ->sort('created', 'DESC')
      ->range(0, 3)
      ->accessCheck(TRUE)
      ->execute();

    $nodes = $node_storage->loadMultiple($nids);

    $items = [];
    foreach ($nodes as $node) {
      $items[] = $view_builder->view($node, 'teaser');
    }

    $build = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['cc-featured'],
      ],
      'header' => [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['cc-featured__header'],
        ],
        'title' => [
          '#type' => 'html_tag',
          '#tag' => 'h2',
          '#value' => $this->t('Featured Products'),
          '#attributes' => [
            'class' => ['cc-featured__title'],
          ],
        ],
        'subtitle' => [
          '#type' => 'html_tag',
          '#tag' => 'p',
          '#value' => $this->t('Handpicked just for you'),
          '#attributes' => [
            'class' => ['cc-featured__subtitle'],
          ],
        ],
      ],
      'grid' => [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['cc-featured__grid'],
        ],
        'items' => $items,
      ],
      'footer' => [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['cc-featured__footer'],
        ],
        'cta' => [
          '#type' => 'link',
          '#title' => $this->t('View All Products'),
          '#url' => Url::fromUserInput('/products'),
          '#attributes' => [
            'class' => ['cc-featured__cta', 'button'],
          ],
        ],
      ],
      '#attached' => [
        'library' => ['cc_featured/featured'],
      ],
      '#cache' => [
        'tags' => ['node_list:product'],
        'contexts' => ['languages', 'user.permissions'],
        'max-age' => Cache::PERMANENT,
      ],
    ];

    return $build;
  }

}
