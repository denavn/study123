//
//  Mobclix.AdView.Base.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var AdViewInternal = require('./AdViewInternal').AdViewInternal;

var AdView = exports.AdView = AdViewInternal.subclass(
/** @lends Mobclix.AdView.prototype */
{
	__className: "Mobclix.AdView",
	_subsequent: false,
	
	/**
	 * @class 
	 * This class should not be instantiated directly, instead use one of the following subclasses:
	 * <ul>
	 * <li>{@link Mobclix.AdView_320x50}</li>
	 * <li>{@link Mobclix.AdView_300x250}</li>
	 * </ul>
     *<br />
     * Mobclix.AdViews are resized automatically for screen density. Please
     * do not override the width and height of the AdView.<br />
     * Thus, when positioning a Mobclix.AdView, do not override the AdView's
     * frame's width and height accidentally. Positioning of the AdView
     * should be done in the following manner:<br /><br />
     * var adViewFrame = adView.getFrame();<br />
     * adViewFrame[0] = x;<br />
     * adViewFrame[1] = y;<br />
     * adView.setFrame(adViewFrame);<br />
     *
	 * @constructs The default constructor.
	 * @public
	 * @since 1.1.5
	 */
	initialize: function($super) {
		$super();
	},

	/**
	 * Requests a new ad from the server.
	 * If ad refreshes are paused, this will also call resumeAdAutoRefresh().
	 *
	 * This should only be called when you want to manually refresh an ad.
	 * @public
	 * @returns {void}
	 * @since 1.1.5
	 */
	getAd: function() {
		this._subsequent = false;
		AdViewInternal.prototype.getAd.apply(this, arguments);
	},
	
	/**
	 * Pauses the autorefresh of ads.
	 *
	 * This should be called in viewWillDisappear().
	 * @public
	 * @returns {void}
	 * @since 1.1.5
	 */
	pauseAdAutoRefresh: function() {
		this.cancelScheduledGetAd();
	},

	/**
	 *	Resumes the autorefresh of ads.
	 *
	 * This should be called in viewDidAppear().
	 * @public
	 * @returns {void}
	 * @since 1.1.5
	 */
	resumeAdAutoRefresh: function() {
		if(!this._subsequent) {
			this.getAd();
		} else {
			this.scheduleNextGetAd();	
		}
	},

	/**
	 * Cancels any ads currently load and calls pauseAdRefresh.
	 *
	 * This should be called in viewDidUnload/dealloc.
	 * @public
	 * @returns {void}
	 * @since 1.1.5
	 */
	cancelAd: function() {
		this._cancelAd();
	}
});

/**
 * @class Use this class to create an ad view for the 320x50 unit.
 * @name Mobclix.AdView_320x50
 * @extends Mobclix.AdView
 * @public
 */
exports.AdView_320x50 = AdView.subclass({
	_size: {
		width: 320,
		height: 50
	}
});

/**
 * @class Use this class to create an ad view for the 300x250 unit.
 * @name Mobclix.AdView_300x250
 * @extends Mobclix.AdView
 * @public
 */
exports.AdView_300x250 = AdView.subclass({
	_size: {
		width: 300,
		height: 250
	}
});
