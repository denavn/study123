//
//  Mobclix.CreativeView.Base.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var MMView = require('../Core/MMView').MMView;

var Base = exports.Base = MMView.subclass(
/** @lends Mobclix.CreativeView.Base.prototype */
{
	__className: "Mobclix.CreativeView.Base",
	adView: null,
	
	/**
	 * @class Base CreativeView class.
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @private
	 */
	initialize: function($super) { $super(); },
	
	/**
	 * Tells AdView what kind of view this is
	 * and when to reuse it
	 * @since 1.1.5
	 */
	reuseIdentifier: function() {
		return null;
	},
	
	/**
	 * Should prepare the current creative view to be reused
	 * Only called if canBeReused returns true
	 * @since 1.1.5
	 */
	prepareForReuse: function() {
		
	},
	
	/**
	 * Whether or not the current creative view can be reused
	 * Reuseable creative views are encouraged to lower memory and cpu usage
	 * @since 1.1.5
	 */
	canBeReused: function() {
		return false;
	},
	
	/**
	 * Load the current creative
	 * @since 1.1.5
	 */
	loadWithCreative: function(creative) {
		this.currentCreative = creative;
	},
	
	/**
	 * Stop all loading of the creative
	 * @since 1.1.5
	 */
	stopLoading: function() {
		
	},
	
	/**
	 * Called after a creative has been displayed, any post-display 
	 * events or actions that need to be triggered, should be triggered here
	 * @since 1.1.5
	 */
	creativeHasBeenDisplayed: function() {
		
	},
	
	/**
	 * Clean up!
	 * @since 1.1.5
	 */
	destroy: function($super) {
		this.currentCreative = null;
		$super();
	}
});

(function() {
	Base.addProperty('currentCreative', true);
})();

