/*! Elastic.js - v0.0.0 ( 2013-05-07 ) - MIT */
(function(window) {

"use strict";

var DEFINE_NOT_WRITABLE   = {writable: false};

/**
 * Base Class of OOP feature
 *
 *     // e.g 1
 *     var Klass = klass.of({
 *       constructor: function() {
 *         console.log('Hello World');
 *       },
 *       foo: 'bar',
 *       baz: 'qux'
 *     });
 *
 *     // e.g 2
 *     function NewClass() {
 *       console.log('This is constructor');
 *     }
 *     klass.of(NewClass, {
 *       hoge: 'fuga',
 *       hige: 'piyo'
 *     };
 *
 * @abstract
 * @class Klass
 * @returns {*}
 */
var klass = {
  of      : of,
  mix     : mix,
  inherits: inherits
};

/**
 * `mix` is Helper function, extend a given object in passed object
 *
 * @static
 * @param {*} given
 * @param {*} passed
 * @return {Object}
 */
function mix(given, passed) {
  var i = 0, ary = Object.keys(passed), iz = ary.length, prop;
  for (; i<iz; i++) {
    prop = ary[i];
    given[prop] = passed[prop];
  }
  return given;
}

/**
 * `inherits` is Helper function, OOP inheritance shim
 *
 * @static
 * @param {Object|Function} parent
 * @param {Object|Function} child
 * @returns {Object}
 */
function inherits(parent, child) {
  var SuperClass, SubClass, addChildMembers;

  SuperClass = parent;

  if (child.hasOwnProperty('constructor')) {
    // Child has `constructor` function
    SubClass = child.constructor;
    delete child.constructor;
    addChildMembers = child;
  } else if (Object.prototype.toString.call(child) === '[object Function]') {
    // Child is constructive `Function`
    SubClass = child;
    addChildMembers = child.prototype;
  } else {
    // Child is plain `Object`
    SubClass = __constructorClosure(SuperClass);
    addChildMembers = child;
  }

  // Inherit static members
  mix(SubClass, SuperClass);

  // Inherit(clone) super class properties & methods
  SubClass.prototype = Object.create(SuperClass.prototype);

  // Specify the constructor itself
  SubClass.prototype.constructor = SubClass;

  // Add sub class properties & methods
  mix(SubClass.prototype, addChildMembers);

  // Remember the super class
  SubClass.__super__ = SuperClass.prototype;
  SubClass.__super__.constructor = SuperClass;

  /**
   * Call a specific method of the parent class
   *
   *     var SuperClass = Klass.of({
   *       onCreate: function() {
   *         alert('Yup!');
   *       }
   *     });
   *     var SubClass = SuperClass.extends({
   *       onCreate: function() {
   *         this.super('onCreate', arguments); // => alert('Yup!')
   *       }
   *     });
   *
   * @method super
   * @param {String} methodName
   * @param {Object|Arguments} args
   * @type {Function}
   */
  SubClass.prototype.super = __superClosure(SubClass);

  return SubClass;
}

/**
 * `of` is Helper function, to generate Object like Class with basic oop fetures
 *
 * @static
 * @param {Function|Object} constructor_or_members
 * @param {Object} [members]
 */
function of(constructor_or_members, members) {
  var constructor;

  if (arguments.length === 1) {
    members = constructor_or_members;
  } else {
    constructor = constructor_or_members;
  }

  var Constructor = typeof constructor === 'function' ? constructor
                                                      : members.hasOwnProperty('constructor') ? members.constructor
                                                                                              : function() {};

  delete members.constructor;
  mix(Constructor.prototype, members);

  /**
   * By inheriting an existing class, you create a new class
   *
   *     var classDefinition = {
   *       // ...
   *     };
   *     var ExtendedClass = SomeClass.extends(classDefinition)
   *
   * @method extends
   * @param {Function|Object} constructor_or_child
   * @param {Object} [child]
   * @return {Klass}
   */
  Constructor.extends = __extends;
  Object.defineProperty(Constructor, 'extends', DEFINE_NOT_WRITABLE);

  /**
   * Mixin the trait in the `prototype` of the class.
   * Is a feature that is for a simple mixin, not the exact trait.
   * Not support multiple inheritance like "Squeak Smalltalk".
   *
   *     var classDefinition = {
   *       // ...
   *     };
   *     var ExtendedWithTrait = SomeClass.extends(classDefinition)
   *                                      .with(AsyncCallbackTrait)
   *                                      .with(ObservableTrait, {
   *                                        method: 'aliasedMethod'
   *                                      });
   *
   * @method with
   * @param {Object} trait
   * @param {Object} [aliases]
   * @return {Klass}
   */
  Constructor.with = __with;
  Object.defineProperty(Constructor, 'with', DEFINE_NOT_WRITABLE);

  /**
   * Method which can be used instead of the `new` statement
   *
   *     var instance = Klass.create();
   *
   * @method create
   * @return {*}
   */
  Constructor.create = __create;
  Object.defineProperty(Constructor, 'create', DEFINE_NOT_WRITABLE);

  return Constructor;
}

function __extends(constructor_or_child, child) {
  if (arguments.length === 1) {
    child = constructor_or_child;
  } else {
    child.constructor = constructor_or_child
  }
  return inherits(this, child);
}

function __with(trait, aliases) {
  var i = 0, keys = Object.keys(trait), iz = keys.length,
      prop, processed_trait = {};

  aliases || (aliases = {});

  for (; i<iz; i++) {
    prop = keys[i]
    if (aliases[prop]) {
      processed_trait[aliases[prop]] = trait[prop];
    } else {
      processed_trait[prop] = trait[prop];
    }
  }

  mix(this.prototype, processed_trait);
  return this;
}

function __create() {
  var instance = Object.create(this.prototype);
  this.apply(instance, arguments);
  return instance;
}

function __constructorClosure(superClass) {
  return function() {
    return superClass.apply(this, arguments);
  }
}

function __superClosure(SubClass) {
  return function(methodName, args) {
    // TODO: this.super() で連鎖的に先祖のメソッドを呼び出したい
    return SubClass.__super__[methodName].apply(this, args);
  }
}

/**
 * @see http://uupaa.hatenablog.com/entry/2012/02/04/145400
 * @param {Array|Object} list
 * @param {Function} iter
 */
function looper(list, iter) {
  if (list == null) {
    return;
  }

  var isArray = Object.prototype.toString.call(list) == '[object Array]',
      subjects = isArray ? list : Object.keys(list),
      i = 0,
      iz = subjects.length,
      subject;

  for (; i<iz; i++) {
    subject = subjects[i];
    iter(subject, i);
  }
}

/**
 * @param {Object} object - traverse target object
 * @param {String} methodName
 * @return {String}
 */
function detectVendorMethodName(object, methodName) {
  var upperName, detectedMethod;

  upperName = methodName.charAt(0).toUpperCase()+methodName.slice(1);

  if (methodName in object) {
    detectedMethod = methodName;
  } else if ('webkit'+upperName in object) {
    detectedMethod = 'webkit' + upperName;
  } else if ('moz' + upperName in object) {
    detectedMethod = 'moz' + upperName;
  } else if ('ms' + upperName in object) {
    detectedMethod = 'ms' + upperName;
  } else if ('o' + upperName in object) {
    detectedMethod = 'o' + upperName;
  }

  if (detectedMethod) {
    return detectedMethod;
  } else {
    throw new RuntimeException(methodName+' not found in specified object');
  }
}

/**
 * @param {*} el
 * @return {Boolean}
 */
function isElement(el) {
  return !!(el && el.nodeType === 1);
}
var AbstractException = klass.of({
  /**
   * @param {String} type
   */
  type: UNDEFINED_UNIQUE_NAME,

  /**
   * @constructor
   * @param {String} msg
   */
  constructor: function(msg) {
    if (this.type === UNDEFINED_UNIQUE_NAME) {
      throw new LogicException('You must specify a unique type for the Exception')
    }

    this.error = new Error(msg)
    this.error.name = this.type + 'Exception';
  },

  /**
   * @return {String}
   */
  getMessage: function() {
    return this.error.message;
  },

  /**
   * @return {String}
   */
  getTraceAsString: function() {
    return this.error.stack;
  },

  /**
   * @return {String}
   */
  toString: function() {
    return this.error.toString();
  }
});
var LogicException = AbstractException.extends({
  type: 'Logic'
});

var RuntimeException = AbstractException.extends({
  type: 'Runtime'
});

var UNDEFINED_UNIQUE_NAME = '__UNDEFINED__';

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

var LayoutDomain = AbstractDomain.extends({
  /**
   * @property {String}
   */
  name: UNDEFINED_UNIQUE_NAME,

  /**
   * @property {Object}
   */
  regions: {},

  /**
   * Correspondence table of the region name and assigned View.
   *
   *     laput.assign(regionName, viewDomain);
   *     // layout._assignedMap => { regionName: viewDomain }
   *
   * @private
   * @property {Object}
   */
  _assignedMap: {},

  /**
   * @constructor
   * @param {Object} options
   */
  constructor: function(options) {
    if (this.name === UNDEFINED_UNIQUE_NAME) {
      throw new LogicException('You must specify a unique name for the Layout');
    }

    options || (options = {});

    if (options.regions) {
      this.regions = mix(options.regions, this.regions)
    }

    if (typeof this.el === 'string') {
      this._element(this._selector(this.el));
    }

    this.onCreate();
  },

  /**
   * Assign new View to element in layout.
   * And destroy old View automatically.
   *
   * @param {String} regionName
   * @param {ViewDomain} view
   */
  assign: function(regionName, view) {
    var selector, el, oldView;

    selector = this.regions[regionName];
    oldView  = this.getRegionView(regionName);

    if (!selector) {
      throw new LogicException('Could not get a selector from the region ' + regionName);
    }
    el = this._selector(selector);

    this.onChange(regionName, view, oldView);

    if (oldView instanceof ViewDomain) {
      oldView.destroy();
    }
    view.attachElement(el);

    this._assignedMap[regionName] = view;
  },

  /**
   * @param {String} regionName
   * @returns {ViewDomain}
   */
  getRegionView: function(regionName) {
    if (!regionName in this.regions) {
      throw new LogicException('Undefined region `' + regionName + '` is specified');
    }
    return this._assignedMap[regionName] || null;
  },

  /**
   * @param {String} regionName
   * @return {ViewDomain}
   */
  withdraw: function(regionName) {
    var view;

    view = this.getRegionView(regionName);

    if (view instanceof ViewDomain) {
      view.detachElement();
      this._assignedMap[regionName] = null;
    }

    return view;
  },

  /**
   * When the layout is destroyed, View which encloses also destroy all.
   */
  destroy: function() {
    this.onDestroy();

    var i = 0, regions = Object.keys(this.regions),
        iz = this.regions.length, regionName;

    for (; i<iz; i++) {
      regionName = regions[i]
      this.withdraw(regionName).destroy();
    }
  },

  /**
   * @abstract
   * @param {String} regionName
   * @param {ViewDomain} newView
   * @param {ViewDomain} oldView
   */
  onChange: function(regionName, newView, oldView) {}
});

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

var AsyncCallbackTrait = {

};
var ObservableTrait = {

};
var DOM_DELEGATION_UID = 0;

/**
 * Only manage  bubbling events from capturing phase.
 *
 * @class
 * @extend Klass
 */
var DomDelegation = klass.of({
  /**
   * DOM Events delegation root element
   *
   * @type {HTMLElement}
   */
  _root: null,

  /**
   * Use for bubbling 'event.target' matching defined selector.
   * If run on the WebKit when `_mather` is `webkitMathcesSelector`
   *
   * @type {String}
   */
  _matcher: null,

  /**
   * That structure object stores assigned delegate handlers.
   *
   * _stack : {
   *   {EventHandler}.uid: [
   *     {DelegateHandler}
   *   ]
   * }
   *
   * DelegateHandler has own event type and assigned selector
   * Compare those properties when remove handler
   *
   * @type {Object}
   */
  _stack: {},

  /**
   * @constructor
   * @param {HTMLElement} el
   */
  constructor: function(el) {
    if (el) {
      this.setRoot(el);
    }
  },

  /**
   * @param {HTMLElement} el
   */
  setRoot: function(el) {
    if (isElement(this._root)) {
      this.remove();
    }
    this._root    = el;
    this._matcher = detectVendorMethodName(el, 'matchesSelector');
  },

  /**
   * @param {String} type
   * @param {String} selector
   * @param {Function} origHandler
   * @param {Object} [context]
   */
  add: function(type, selector, origHandler, context) {
    var delegateHandler;

    delegateHandler = this._createDelegateHandler(type, selector, origHandler, context);
    this._root.addEventListener(type, delegateHandler, true);
  },

  /**
   * @private
   * @param {String} type
   * @param {String} selector
   * @param {Function} origHandler
   * @param {Object} [context]
   * @return {DelegateHandler}
   */
  _createDelegateHandler: function(type, selector, origHandler, context) {
    var that = this, uid, delegateHandler;

    delegateHandler = function(evt) {
      var el = evt.target;
      do {
        if (el !== evt.target && el === that._root || !(that._matcher in el)) {
          return false;
        }
        // TODO matcher は documentから探索するため、
        // div > _root > p の際に、 div p なセレクタもtrueになるので厳密には不正
        if (el[that._matcher](selector)) {
          break;
        }
      } while (el = el.parentNode);

      // TODO evt を clonedEvent.originalEventに退避させて
      // currentTargetプロパティに that._root を指定できるようにする
      return origHandler.call(context || el, evt);
    };

    delegateHandler._type     = type;
    delegateHandler._selector = selector;

    uid = origHandler._uid || (origHandler._uid = ++DOM_DELEGATION_UID);
    this._stack[uid] || (this._stack[uid] = []);
    this._stack[uid].push(delegateHandler);

    return delegateHandler;
  },

  /**
   * @param {String} [type]
   * @param {String} [selector]
   * @param {EventHandler} [eventHandler]
   */
  remove: function(type, selector, eventHandler) {
    var that = this;

    looper(this._stack, function(handlerUid) {
      // handlerUid is number, beacause that is key string from object
      if (eventHandler && eventHandler._uid && eventHandler._uid != handlerUid) {
        return;
      }
      looper(that._stack[handlerUid], function(delegateHandler, i) {
        if (that._isRemoveApprovable(type, selector, delegateHandler)) {
          that._stack[handlerUid].splice(i, 1);
          that._root.removeEventListener(delegateHandler._type, delegateHandler, true);
        }
      });
    })
  },

  /**
   * @private
   * @param {String} type
   * @param {String} selector
   * @param {DelegateHandler} removeHandler
   */
  _isRemoveApprovable: function(type, selector, removeHandler) {
    return (!type || type === removeHandler._type) && (!selector || selector === removeHandler._selector)
  }
});

/**
 * @class EventHandler
 * @extends Event
 * @property {Number} _uid
 */

/**
 * @class DelegateHandler
 * @property {String} _type
 * @property {String} _selector
 */
var History = klass.of({
  constructor: function() {

  }
});
var Router = klass.of({
  constructor: function() {

  }
});
var Storage = klass.of({
  constructor: function() {

  }
});
var Validator = klass.of({
  constructor: function() {

  }
});
var Elastic = {
  // like OOP
  klass : klass,

  // shorthand
  Layout   : LayoutDomain,
  View     : ViewDomain,
  Component: ComponentDomain,

  // classes
  domain: {
    Layout   : LayoutDomain,
    View     : ViewDomain,
    Compontnt: ComponentDomain
  },
  exception: {
    Runtime  : RuntimeException,
    Logic    : LogicException
  },
  util: {
    History  : History,
    Router   : Router,
    Storage  : Storage,
    Validator: Validator,
    DomDelegation: DomDelegation
  },
  trait: {
    AsyncCallback: AsyncCallbackTrait,
    Observable   : ObservableTrait
  }
};

// for RequireJS
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
  window.define(function() {
    return Elastic;
  });
}
// for Node.js & browserify
else if (typeof module == 'object' && module &&
         typeof exports == 'object' && exports &&
         module.exports == exports
  ) {
  module.exports = Elastic;
}
// for Browser
else {
  window.Elastic = Elastic;
}

})(this);