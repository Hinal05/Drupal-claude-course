(function (Drupal) {
  'use strict';
  Drupal.behaviors.ccProductDetail = {
    attach: function (context, settings) {
      const gallery = context.querySelector('.cc-product-detail__gallery');
      if (!gallery) return;

      const mainImg = gallery.querySelector('.cc-product-detail__gallery-main img');
      const thumbs = gallery.querySelectorAll('.cc-product-detail__thumb');

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          if (mainImg) {
            mainImg.src = thumb.dataset.src || thumb.src;
          }
          thumbs.forEach(function (t) { t.classList.remove('is-active'); });
          thumb.classList.add('is-active');
        });
      });
    }
  };
})(Drupal);
