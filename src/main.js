'use strict'

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
