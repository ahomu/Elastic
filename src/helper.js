/**
 * Helper functions
 */

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