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

    this.onCreate();
  },

  /**
   *
   */
  destroy: function() {
    this.el = this.$el = null;

    this.onDestroy();
  }
});
