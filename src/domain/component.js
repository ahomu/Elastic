'use strict';

/**
 * @class
 * @extends AbstractDomain
 */
var ComponentDomain = AbstractDomain.extends({
  /**
   *     events: {
   *       'click .js_event_selector': 'someMethod'
   *     }
   *     // $('.js_event_selector').click() => someMethod()
   *
   * @property {Object}
   */
  events: {},

  /**
   *     ui: {
   *       partOf: '.js_ui_selector'
   *     }
   *     // view.ui.partOf => element.js_ui_selector
   *
   * @property {Object}
   */
  ui: {},

  /**
   * instance's unique id nubmer
   * @property {Number}
   */
  uid: null,

  constructor: function(el, uid) {
    this._element(el);
    this.uid = uid;

    this.setupUi();

    this.onCreate();
  },

  /**
   *
   */
  destroy: function() {
    this.el = this.$el = null;

    this.teardownUi();

    this.onDestroy();
  },

  /**
   * From the selector defined by this.ui, caching to explore the elements.
   */
  setupUi: function() {
    var name, selector, thisUi = {};

    for (name in this.ui) {
      selector = this.ui[name];
      thisUi[name] = '$' in window ? this.$el.find(selector)
                                : this.el.querySelectorAll(selector);
    }

    this.ui = thisUi;
  },

  /**
   * Release ui elements reference.
   */
  teardownUi: function() {
    var name;

    for (name in this.ui) {
      this.ui[key] = null;
      delete this.ui[key];
    }
  }
});
