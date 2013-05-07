'use strict';

var ATTR_COMPONENT     = 'data-component',
    ATTR_COMPONENT_UID = 'data-component-uid';

var STORE_COMPONENTS = {};

var INCREMENT_COMPONENT_UID = 0;

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
    if (!isElement(el)) {
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
        event, selector, method,
        CompProto, methodName, componentDelegateHandler;

    // view events
    looper(this.events, function(event_selector) {
      method = that[that.events[event_selector]];
      event_selector = event_selector.split(' ');
      event = event_selector[0];
      selector = event_selector[1];

      that._delegater.add(event, selector, method, that);
    });

    // component events
    looper(this.components, function(name) {
      CompProto = that.components[name].prototype;

      looper(CompProto.events, function(event_selector) {
        methodName = CompProto.events[event_selector];
        event_selector = event_selector.split(' ');
        event = event_selector[0];
        selector = event_selector[1];

        // TODO Need delegateHandler collection for remove event handler strictly
        componentDelegateHandler = function(evt) {
          var component = this.getComponent(evt.target)
          component[methodName].apply(component, arguments)
        };
        that._delegater.add(event, selector, componentDelegateHandler, that);
      });
    });
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
   * like singleton...
   *
   * @param {HTMLElement} el
   * @returns {*}
   */
  getComponent: function(el) {
    var componentName, componentUid;

    do {
      componentName = el.getAttribute(ATTR_COMPONENT);
    } while(!componentName && (el = el.parentNode));

    if (!componentName) {
      throw new RuntimeException('Component name is not detected from ' + ATTR_COMPONENT)
    }

    componentUid  = el.getAttribute(ATTR_COMPONENT_UID) || INCREMENT_COMPONENT_UID++;

    if (STORE_COMPONENTS[componentUid]) {
      return STORE_COMPONENTS[componentUid];
    } else {
      el.setAttribute(ATTR_COMPONENT_UID, componentUid);
      return STORE_COMPONENTS[componentUid] = new this.components[componentName](el, componentUid);
    }
  },

  /**
   * From the selector defined by this.ui, caching to explore the elements.
   */
  setupUi: function() {
    var name, selector;

    for (name in this.ui) {
      selector = this.ui[name];
      this.ui[name] = '$' in window ? this.$el.find(selector)
                                    : this.el.querySelectorAll(selector);
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

    // TODO destroy unused components

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
