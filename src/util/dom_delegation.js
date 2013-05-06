'use strict';

/**
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
   * @type {HTMLElement}
   */
  _root: null,

  /**
   * @type {String}
   */
  _matcher: null,

  /**
   * @type {Object}
   */
  _stack: {},

  /**
   * @constructor
   * @param {HTMLElement} el
   */
  constructor: function(el) {
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
      var node     = evt.target;
      do {
        if (node !== evt.target && node === that._root) {
          return false;
        }
        // TODO matcher は documentから探索するため、
        // div > _root > p の際に、 div p なセレクタもtrueになるので厳密には不正
        if (node[that._matcher](selector)) {
          break;
        }
      } while (node = node.parentNode);

      return origHandler.call(node, evt);
    };
    delegateHandler._type     = type;
    delegateHandler._selector = selector;

    uid = origHandler._uid || (origHandler._uid = ++DOM_DELEGATION_UID);
    this._stack[uid] || (this._stack[uid] = []);
    this._stack[uid].push(delegateHandler);

    return delegateHandler;
  },

  /**
   * @param {String} type
   * @param {String} selector
   * @param {EventHandler} eventHandler
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