var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

/** @private */
var AdView = exports.AdView = AbstractView.subclass(
{
	'type':'adview',

	/**
	 * @class The <code>AdView</code> class constructs objects that handle event callback functions and ad event metadata.
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @param {String} properties
	 * @augments UI.AbstractView
	 * @deprecated As of version 1.6, this class is no longer supported. It will be removed in a
	 *		future version.
	 * @since 1.0
	 */
	initialize: function($super, properties) {
		if (AdView._init) AdView._init();
		$super(properties);
		
		this.onappear = this.bind(this._onappear);
		this.ondisappear = this.bind(this._ondisappear);
		this.onclick = this.bind(this._onclick);
	},
	
	/**
	 * An event for signaling when an <code>AdView</code> is on display.
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 * @since 1.0
	 */
	onappear: function() {
	 },
	
	/**
	 * An event for signaling when an <code>AdView</code> has been closed.
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 * @since 1.0
	 */
	ondisappear: function() { 
	},
	
	/**
	 * @protected
	 * @since 1.0
	 */
	_onappear: function($super, event) {
		( $super || function(){} )(event);
//		Core.Analytics._getPipe().revenueEvent("ADSHOW",  this.getAdEventMetadata());
	},
	
	/**
	 * @protected
	 * @since 1.0
	 */
	_ondisappear: function($super, event) {
		( $super || function(){} )(event);
//		Core.Analytics._getPipe().revenueEvent("ADCLOSE", this.getAdEventMetadata());
	},
	
	performEventCallback: function($super, event) {
		if (event.eventType == 'click')
		{
//			Core.Analytics._getPipe().revenueEvent("ADCLCK", this.getAdEventMetadata());
			NgLogD("AD WAS CLICKED in AdView wooo!!!!");
			( $super || function(){} )(event);
		}
		if (event.eventType == 'load')
		{
//			Core.Analytics._getPipe().revenueEvent("ADLOAD", this.getAdEventMetadata());
			NgLogD("AD WAS LOADED in AdView wooo!!!!");
			( $super || function(){} )(event);
		}
	},
	/**
	* Pause this <code>AdView</code>.<br /><br />
	* <b>Note:</b> If an <code>AdView</code> is already paused, this call does nothing.
	* @see UI.AdView#resumeAds
	* @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	* @status Android
	* @since 1.0
	*/
	pauseAds: function() {
		Commands.pauseAds.call(this);
	},
	/**
	* Resume this <code>AdView</code> from a paused state. Setting this will resume the <code>AdView</code> from the current position.
	* @see UI.AdView#resumeAds
	* @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	* @status Android
	* @since 1.0
	*/
	resumeAds: function() {
		Commands.resumeAds.call(this);
	},
	/**
	* Set the refresh rate for this <code>AdView</code>. 
	* @param {Number} refreshRate The amount of time each ad is on display (in milliseconds).
	* @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	* @status Android
	* @since 1.0
	*/
	setRefreshRate: function(refreshRate) {
		Commands.setAdRefreshRate.call(this, refreshRate);
	},
	/**
	* Set this <code>AdView</code> to automatically play.
	* @status Android
	* @param {Boolean} autoplay Set as <code>true</code> if autoplay is enabled.
	* @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	* @since 1.0
	*/
	setAutoplay: function(autoplay) {
		Commands.setAdRefreshRate.call(this, autoplay);
	},
	
	/**
	 * Retrieve event metadata from this <code>AdView</code>. 
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 * @since 1.0
	 */
	getAdEventMetadata: function(){
		NgLogD("AD EventMetetData was requested!");
		var AdMeteData = "DefaultAdEventMetaData";
		return AdMeteData;
	}
});

// Event Handlers
AdView._init = function() {
	delete AdView._init;
	if (AbstractView._init) AbstractView._init();

    /**
	 * @name UI.AdView#getActive
	 * @description Retrieve the value of the <code>active</code> property.
	 * @returns {Boolean} Returns <code>true</code> if the <code>AdView</code> object is set to active.
	 * @see UI.AdView#setActive
	 * @status iOS, Android, Flash, Test
	 * @function
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 */
	AdView.synthesizeProperty('active', Commands.setActive);
    
	/**
	 * @name UI.AdView#setOnClick
	 * @description Set a function to call on <code>click</code> events.	 
	 * @param {Function} clickCallback The new <code>click</code> callback function. <br /><br />
	 * <b>Note:</b> The <code>click</code> event is disabled if the value for this parameter is not a function.<br />
	 * @see UI.AdView#event:setOnClick
 	 * @status Android, Test
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 */
	/**
	 * @name UI.AdView#getOnClick
	 * @description Retrieve the function to call on <code>click</code> events.<br />
	 * @see UI.AdView#event:getOnClick
	 * @returns {Function} The current <code>click</code> callback function.<br />
 	 * @status Android, Test
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 */
	AdView.registerEventType('click');
	/**
	 * @name UI.AdView#setOnLoad
	 * @description Set a function to call on <code>load</code> events.	 
	 * @param {Function} loadCallback The new <code>load</code> callback function. <br /><br />
	 * <b>Note:</b> The <code>load</code> event is disabled if the value for this parameter is not a function.<br />
	 * @see UI.AdView#event:getOnClick
 	 * @status Android, Test
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 */
	/**
	 * @name UI.AdView#getOnLoad
	 * @description Retrieve the function to call on <code>load</code> events.<br />
	 * @see UI.AdView#event:getOnClick
	 * @returns {Function} The current <code>load</code> callback function.<br />
 	 * @status Android, Test
	 * @event
	 * @deprecated Since version 1.6. The UI.AdView class will be removed in a future version.
	 */
	AdView.registerEventType('load');
};
