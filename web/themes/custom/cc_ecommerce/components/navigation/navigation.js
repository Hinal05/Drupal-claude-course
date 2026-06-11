(function (Drupal) {
  'use strict';
  Drupal.behaviors.ccNavigation = {
    attach: function (context, settings) {
      const nav = context.querySelector('.cc-nav') || document.querySelector('.cc-nav');
      const hamburger = context.querySelector('.cc-hamburger') || document.querySelector('.cc-hamburger');
      const mobileNav = context.querySelector('.cc-nav-mobile') || document.querySelector('.cc-nav-mobile');

      if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function () {
          const isOpen = mobileNav.classList.toggle('is-open');
          hamburger.classList.toggle('is-open', isOpen);
          hamburger.setAttribute('aria-expanded', isOpen);
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
          mobileNav.classList.remove('is-open');
          if (hamburger) { hamburger.classList.remove('is-open'); hamburger.setAttribute('aria-expanded', 'false'); }
        }
      });

      document.addEventListener('click', function (e) {
        if (mobileNav && mobileNav.classList.contains('is-open') && !mobileNav.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
          mobileNav.classList.remove('is-open');
          hamburger.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  };
})(Drupal);
