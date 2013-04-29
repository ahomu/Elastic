'use strict';

/**
 * @class ViewDomain
 * @extends AbstractDomain
 */
var ViewDomain = AbstractDomain.extends({
  /**
   * @property {String}
   */
  name: UNDEFINED_UNIQUE_NAME,

  /**
   *     events: {
   *       'click .js_event_selector': 'someMethod'
   *     }
   *     // $('.js_event_selector').click() => someMethod()
   *
   * @property {Object}
   */
  events: {
  },

  /**
   *     ui: {
   *       partOf: '.js_ui_selector'
   *     }
   *     // view.ui.partOf => element.js_ui_selector
   *
   * @property {Object}
   */
  ui: {
  },

  /**
   *     components: {
   *       likeBtn: LikeBtnComponent
   *     }
   *     // <button data-component="likeBtn"></button> => LikeBtnComponent
   *
   * @property {Object}
   */
  components: {

  },

  /**
   * @constructor
   */
  constructor: function() {
    if (typeof this.el === 'string') {
      this._element(this._selector(this.el));
    }
    if (this.name === UNDEFINED_UNIQUE_NAME) {
      throw new LogicException('You must specify a unique name for the View')
    }
    this.onCreate();
  },

  /**
   * @param {HTMLElement} el
   */
  attachElement: function(el) {
    this._element(el);

    this.onAttach(el);

    this.delegateEvents();
  },

  detachElement: function() {
    this.el = this.$el = null;

    this.onDetach();

    this.undelegateEvents();
  },

  delegateEvents: function() {
    // View自身のイベントに加えて、
    // ComponentのイベントもViewで委譲して管理できるようにする
    // delegateEventsWithComponents 的な？
  },

  undelegateEvents: function() {

  },

  dispatchComponent: function() {

  },

  /**
   * @param {String} alias
   * @param {ComponentDomain} component
   */
  use: function(alias, component) {
    this.components[alias] = component;
  },

  /**
   *
   */
  destroy: function() {
    this.onDestroy();
  },

  /**
   * @param {HTMLElement} el
   */
  onAttach: function(el) {},
  onDetach: function() {}
});
