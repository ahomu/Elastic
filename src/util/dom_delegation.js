'use strict';

/**
 * Unique id number for delegation original handler.
 *
 * @type {number}
 */
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
   */
  add: function(type, selector, origHandler) {
    var delegateHandler;

    delegateHandler = this._createDelegateHandler(type, selector, origHandler);
    this._root.addEventListener(type, delegateHandler, true);
  },

  /**
   * @private
   * @param {String} type
   * @param {String} selector
   * @param {Function} origHandler
   * @return {DelegateHandler}
   */
  _createDelegateHandler: function(type, selector, origHandler) {
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

      return origHandler.call(el, evt);
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
      if (eventHandler && eventHandler._uid && eventHandler._uid !== handlerUid) {
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