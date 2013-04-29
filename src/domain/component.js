'use strict';

/**
 * @class ComponentDomain
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

  handleEvent: function(evt) {
    // event.target.webkitMatchesSelector();
  }
});
