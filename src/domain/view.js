'use strict';

/**
 * @class
 * @extends AbstractDomain
 */
var ViewDomain = AbstractDomain.extends({
  /**
   * @property {String}
   */
  name: UNDEFINED_UNIQUE_NAME,

  /**
   *     events: {
   *       'click .js_event_selector': 'someMethodName'
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
   *     components: {
   *       likeBtn: LikeBtnComponent
   *     }
   *     // <button data-component="likeBtn"></button> => LikeBtnComponent
   *
   * @property {Object}
   */
  components: {},

  /**
   * @property {DomDelegation}
   */
  _delegater: null,

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

    this._delegater = new DomDelegation(this.el);

    if (isElement(this.el)) {
      this.attachElement(this.el);
    }
    this.onCreate();
  },

  /**
   * Attach root element to this view.
   * @see ViewDomain.onAttach()
   * @param {HTMLElement} el
   */
  attachElement: function(el) {
    if (!isElement(this.el)) {
      throw new RuntimeException('Gived argument `el` is not an element');
    }

    this._element(el);
    this._delegater.setRoot(el);

    this.onAttach(el);
    this.setupUi();

    this.delegateEvents();
  },

  /**
   * Detach root element from this view.
   * @see ViewDomain.onDetach()
   */
  detachElement: function() {
    this.undelegateEvents();

    this.teardownUi();
    this.onDetach(this.el);

    this.el = this.$el = null;
  },

  /**
   * Assign delegate events defined by `this.events`
   */
  delegateEvents: function() {
    var that = this,
        event, selector, method;

    looper(this.events, function(event_selector) {
      method = that[that.events[event_selector]];
      event_selector = event_selector.split(' ');
      event = event_selector[0];
      selector = event_selector[1];

      that._delegater.add(event, selector, method);
    });

    // components event
//    looper(this.components, function(component) {
//      looper(component.events, function(type_selector) {
//        var type, selector, handler;
//
//        type_selector = type_selector.split(' ');
//        type     = type_selector[0];
//        selector = type_selector[1];
//        handler  = component[component.events[type_selector]];
//
//        if (typeof handler !== 'function') {
//          throw new LogicException('Specified method name is not function');
//        }
//
//        el.addEventListener(type, function(evt) {
//          // TODO detect function's vendor prefix required
//          if (el.webkitMatchesSelector(selector, evt.currentTarget)) {
//            handler.call(component, evt);
//          };
//        }, false);
//      });
//    });

    // or instantly all specified event type binding
    // and when that events fired then detect component from event.currentTarget & call components method
  },

  /**
   * Remove all delegated events from this view.
   */
  undelegateEvents: function() {
    this._delegater.remove();
  },

  /**
   * @param {String} alias
   * @param {ComponentDomain} component
   */
  use: function(alias, component) {
    this.components[alias] = component;
  },

  /**
   * From the selector defined by this.ui, caching to explore the elements.
   */
  setupUi: function() {
    var engine = '$' in window ? this.$el.find : this.el.querySelectorAll,
        name, selector;

    for (name in this.ui) {
      selector = this.ui[name];
      this.ui[name] = engine(selector);
    }
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
  },

  /**
   *
   */
  destroy: function() {
    this.detachElement();
    this.onDestroy();
  },

  /**
   * @abstract
   * @chainable
   * @param {String} html
   * @return {*}
   */
  render: function(html) { this.el.innerHTML = html; return this; },

  /**
   * @abstract
   * @param {HTMLElement} el
   */
  onAttach: function(el) {},

  /**
   * @abstract
   * @param {HTMLElement} el
   */
  onDetach: function(el) {}
});
