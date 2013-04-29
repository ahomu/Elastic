/*! Elastic.js - v0.0.0 ( 2013-04-30 ) - MIT */
(function() {

"use strict";

var DEFINE_NOT_WRITABLE   = {writable: false},
    UNDEFINED_UNIQUE_NAME = '__UNDEFINED__';

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

  handleEvent: function(evt) {
    // event.target.webkitMatchesSelector();
  }
});

var ElementDomain = AbstractDomain.extends({

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
      throw new LogicException('You must specify a unique name for the Layout')
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

var AsyncCallbackTrait = {

};
var ObservableTrait = {

};
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
window.Elastic = {
  klass : klass,
  domain: {
    Layout   : LayoutDomain,
    View     : ViewDomain,
    Compontnt: ComponentDomain,
    Element  : ElementDomain
  },
  exception: {
    Runtime  : RuntimeException,
    Logic    : LogicException
  },
  util: {
    History  : History,
    Router   : Router,
    Storage  : Storage,
    Validator: Validator
  },
  trait: {
    AsyncCallback: AsyncCallbackTrait,
    Observable   : ObservableTrait
  }
};

// for RequireJS
if (typeof window.define == 'function' && typeof window.define.amd == 'object') {
  window.define(function() {
    return window.Elastic;
  });
}

})();