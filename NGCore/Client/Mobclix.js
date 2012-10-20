//
//  Mobclix.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

/**
 * Classes and objects contained by the Mobclix package. Please note the  
 * Mobclix Advertising service is a local offering, subject to change.
 * <br /><br />
 * <strong>Note</strong>: The Mobclix service is available only on the US/worldwide platform.
 * @name Mobclix
 * @namespace Display ads from the Mobclix service.
 */

exports.Mobclix = {
	AdView: require('./Mobclix/AdView').AdView,

	/**
	 * AdView class for the 320x50 unit.
	 * @name Mobclix#AdView_320x50
	 * @see Mobclix.AdView_320x50
	 * @see Mobclix.AdView
	 */
	AdView_320x50: require('./Mobclix/AdView').AdView_320x50,

	/**
	 * AdView class for the 300x250 unit.
	 * @name Mobclix#AdView_300x250
	 * @see Mobclix.AdView_300x250
	 * @see Mobclix.AdView
	 */
	AdView_300x250: require('./Mobclix/AdView').AdView_300x250,

	/**
	 * AdView class for the FullScreen unit.
	 * @name Mobclix#AdView_FullScreen
	 * @see Mobclix.AdView_FullScreen
	 * @see Mobclix.FullScreenAdView
	 */
	AdView_FullScreen: require('./Mobclix/FullScreenAdView').AdView_FullScreen,
	
	/**
	 * Start up the Mobclix SDK, this must be called prior to requesting ads.
	 * @name Mobclix#startWithApplicationId
	 * @function
	 * @param	{String}	applicationId	The Mobclix Application ID for your app.
	 * @returns {void}
	 * @since 1.1.5
	 */
	startWithApplicationId: function(applicationId) {
		require('./Mobclix/Core/Controller').Controller.startWithApplicationId(applicationId);
	}
};
