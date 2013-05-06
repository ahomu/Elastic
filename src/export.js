'use strict'

/**
 * @class Elastic
 */
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
