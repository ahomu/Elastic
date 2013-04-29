'use strict'

/**
 * @abstract
 * @class AbstractException
 * @extends Klass
 */
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