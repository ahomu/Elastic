'use strict'

/**
 * @class Elastic
 */
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
