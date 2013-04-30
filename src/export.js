'use strict'

/**
 * @class Elastic
 */
var Elastic = {
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
