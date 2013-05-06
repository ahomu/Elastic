'use strict';

/**
 * @abstract
 * @class
 * @extends Klass
 */
var AbstractDomain = klass.of({

  /**
   * @property {HTMLElement}
   */
  el: null,

  /**
   * @property {jQuery|Zepto}
   */
  $el: null,

  /**
   * Get element by selector string
   *
   * @private
   * @param {String} selector
   * @returns {*}
   */
  _selector: function(selector) {
    var el;
    if (selector.charAt(0) === '#') {
      el = document.getElementById(selector.slice(1));
    } else {
      el = document.querySelector(selector);
    }
    return el;
  },

  /**
   * Set element to `el` and `$el`.
   * `$el` require one of `$` selector based libraries
   *
   * @param el
   * @private
   */
  _element: function(el) {
    this.el = el;
    window.$ && (this.$el = $(this.el));
  },

  /**
   * @abstract
   */
  onCreate: function() {},

  /**
   * @abstract
   */
  onDestroy: function() {}
});
