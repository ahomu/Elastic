'use strict';

/**
 * @class
 * @extends AbstractDomain
 */
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
