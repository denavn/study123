//
//  Mobclix.FullScreenAdView.Base.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var AdViewInternal = require('./AdViewInternal').AdViewInternal;

var FullScreenAdView = exports.FullScreenAdView = AdViewInternal.subclass(
/** @lends Mobclix.FullScreenAdView.prototype */
{
	__className: "Mobclix.FullScreenAdView",
	_subsequent: false,
	_canRequestNextAd: true,
    
	/**
	 * @class 
	 * This class should not be instantiated directly, instead use one of the following subclasses:
	 * <ul>
	 * <li>{@link Mobclix.AdView_FullScreen}</li>
	 * </ul>
     * <br />
     * This view does not need to be added to the view hierarchy. The
     * requested fullscreen ad will automatically be attached.
     * The easiest implementation of the FullScreenAdView can be done in
     * the following manner:<br /><br />
     * var fullScreenAdView = new Mobclix.AdView_FullScreen();<br />
     * fullScreenAdView.requestAndDisplayAd();<br />
     *
	 * @constructs The default constructor.
	 * @public
	 * @since 1.3.1b
	 */
	initialize: function($super) {
		$super();
	},

	/**
	 * Requests a new ad from the server. This ad will preload, but will not
     * display until displayAd is called.
     *
	 * @public
	 * @returns {void}
	 * @since 1.3.1b
	 */
	requestAd: function() {
        if (!this._canRequestNextAd)
            return;
        this._canRequestNextAd = false;
		this._subsequent = false;
        this.prefetchAd();
	},


    /**
	 * Displays a requested ad. If no ad has been previously requested, this
     * method will not do anything.
     *
	 * @public
	 * @returns {void}
	 * @since 1.3.1b
	 */
	displayAd: function() {
		AdViewInternal.prototype.displayAd.apply(this, arguments);
	},
    
    /**
	 * Requests and displays a requested ad as soon as it is finished
     * loading.
     *
	 * @public
	 * @returns {void}
	 * @since 1.3.1b
	 */
	requestAndDisplayAd: function() {
        if (!this._canRequestNextAd)
            return;
        this._canRequestNextAd = false;
        this.getAd();
	},
    
    /**
	 * Returns if the FullScreenAdView has an ad prepared for display.
     *
     * @return	{Boolean}	If true, the FullScreenAdView is ready to display an
     * ad via the displayAd method.
	 * @public
	 * @since 1.3.1b
	 */
    hasAd: function() {
        return this._hasPrefetchedAd;
    },

	/**
	 * Cancels any ads currently load and calls pauseAdRefresh().
	 *
	 * This should be called in viewDidUnload/dealloc.
	 * @public
	 * @returns {void}
	 * @since 1.3.1b
	 */
	cancelAd: function() {
		this._cancelAd();
	}
});

/**
 * @class
 * Use this class to create a full screen adview.
 * @name Mobclix.AdView_FullScreen
 * @extends Mobclix.FullScreenAdView
 * @public
 */
exports.AdView_FullScreen = FullScreenAdView.subclass({
	_size: {
		width: 999,
		height: 999
	}
});
