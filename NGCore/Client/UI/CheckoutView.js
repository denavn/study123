var AbstractView = require('./AbstractView').AbstractView;
var ViewGeometry = require('././ViewGeometry');
var Commands = require('./Commands').Commands;

var CheckoutView = exports.CheckoutView = AbstractView.subclass(
/** @lends UI.CheckoutView.prototype */
{
	'type':'checkoutview',
	/**
	 * @class The `UI.CheckoutView` class is used to support in-app payments.
	 * @name UI.CheckoutView
     * @constructs Create a checkout view.
	 * @augments UI.AbstractView
	 * @deprecated As of version 1.6, this class is no longer supported. It will be removed in a
	 *		future version.
     * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.CheckoutView` object.
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (CheckoutView._init) CheckoutView._init();
		$super(properties);
	}
});

// Properties
CheckoutView._init = function() {
	delete CheckoutView._init;
	if (AbstractView._init) AbstractView._init();
	
	// THESE ARE METHODS NOT PROPERTIES... THIS SHOULD BE FIXED.
	// We define ONLY setters, and no getters (write-only props, no local copies)
	/**
	 * Set the post data for the checkout view.
	 * @name UI.CheckoutView#setPostData
	 * @function
	 * @deprecated Since version 1.6. The UI.CheckoutView class will be removed in a future
	 *		version.
	 * @param {String} postData The new post data for the checkout view.
	 * @returns {void}
	 * @status Android
	 */
	CheckoutView.registerAccessors('postData', null, Commands.setPostData);
	/**
	 * Set the URL to use for an HTTP `POST` request.
	 * @name UI.CheckoutView#setPostURL
	 * @function
	 * @deprecated Since version 1.6. The UI.CheckoutView class will be removed in a future
	 *		version.
	 * @param {String} postURL The URL to use.
	 * @returns {void}
	 * @status Android
	 */
	CheckoutView.registerAccessors('postURL', null, Commands.loadPostURL);
	/**
	 * Set the URL to use for an HTTP `GET` request.
	 * @name UI.CheckoutView#setGetURL
	 * @function
	 * @deprecated Since version 1.6. The UI.CheckoutView class will be removed in a future
	 *		version.
	 * @param {String} getURL The URL to load.
	 * @returns {void}
	 * @status Android
	 */
	CheckoutView.registerAccessors('getURL', null, Commands.loadGetURL);
};
