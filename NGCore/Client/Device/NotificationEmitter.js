////////////////////////////////////////////////////////////////////////////////
// Class NotificationEmitter
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////
var TAG = "Device.NotificationEmitter";
exports.NotificationEmitter = Core.MessageEmitter.singleton(
/** @lends Device.NotificationEmitter.prototype */
{
	classname: 'NotificationEmitter',
	
	/**
	 * Retrieve a notification that was received before the app started. For example, if the app is
	 * not running, and the user taps a remote notification for your app, the app will launch; your
	 * app must then call <code>getPendingNotification()</code> to retrieve the notification
	 * payload.
	 * <br /><br />
	 * If there is no pending notification, or if the app has already called this method, the method
	 * will return <code>undefined</code>.
	 * <br /><br />
	 * <strong>Important</strong>: Call this method during your app's startup process.
	 * @name Device.NotificationEmitter.getPendingNotification
	 * @function
	 * @static
	 * @returns {Object} The payload for the pending notification, with the same properties as the
	 *		<code>payload</code> parameter to
	 *		<code>{@link Device.NotificationEmitter#scheduleLocal}</code>, or <code>undefined</code>
	 *		if there is no pending notification.
	 * @since 1.7
	 */
	
	$getPendingNotification: function() {
		var notification = Core.Capabilities._getPendingNotification();
		if (notification) {
			notification = this._adjustFormat(notification);
		}
		return notification;
	},
	
	/**
	 * @class <code>Device.NotificationEmitter</code> uses the native notification mechanisms on 
     * Android and iOS to allow scheduling local notifications (ex: scheduling the notification,
     * "Your crops are now ready" for 6 hours in the future) 
     * or to receive application-specific notifications and payload data from local and remote 
     * sources (ex: "John moved Rook to Queen Bishop 4. It's your move!").
     * <br/><br/>
	 * When the app starts, it must call
	 * <code>{@link Device.NotificationEmitter.getPendingNotification}</code>, which retrieves a
	 * notification that was received before the app started. To receive notifications while the app
	 * is running, call <code>{@link Device.NotificationEmitter#addListener}</code> to add a 
	 * listener to the notification emitter.
	 * <br/><br/>
     * In addition, applications can use the method <code>{@link Device.NotificationEmitter#scheduleLocal}</code>
     * to schedule <em>local</em> notifications. For sending remote notifications, 
     * applications should use <code>{@link Social.Common.RemoteNotification.send}.</code><br/><br/>
     *
	 * As you develop your app, keep the following limitations in mind:
	 *
	 * <ul><li>Remote notifications may take a long time to arrive, and there is no guarantee that users
	 * will receive them.</li>
	 * <li>If a user dismisses the notification, rather than tapping on it, the payload will not
	 * be delivered to the app.</li>
	 * <li>If an app sends multiple remote notifications, the user may receive only the most recent
	 * notification.</li></ul>
	 * 
	 *
	 * <strong>Important</strong>: Do not use push notifications to provide features that require reliable
	 * messaging, such as delivery of a virtual item.<br/><br/>
	 *
	 * @constructs The default constructor
	 * @augments Core.MessageEmitter
	 * @singleton
	 * @since 1.7
	 */
	initialize: function()
	{
		this._callbackIndexCounter = 1;
		this._callbacks = {};
		this._payloadKeys = {"message":true,"badge":true,"sound":true,"collapseKey":true,"style":true,"iconUrl":true,"extras":true};
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},

    /*
     * //Full Payload
	 * var payload = {
	 *   message: "Your blue item is ready!",
	 *   collapseKey: "my_game",	                // Only supported on Android
	 *   style: "normal",	                        // Only supported on Android
	 *   iconUrl: "internal/path/to/resource.png",	// Only supported on Android
	 *   badge: 3,	                                // Only supported on iOS
	 *   sound: "trumpets.caf",	                // Only supported on iOS
	 *   extras: {itemId: blueItem.id, itemType: "blue_item"}
	 * };    
    */
    	
	/**
	 * Schedule a local notification for some time in the future.<br/><br/>
	 *
	 * If you choose to pass a badge number in your payload, be sure to clear it appropriately
	 * by using {@link Device.NotificationEmitter#setAppBadgeCount}.
     *
	 * @example
	 * // A notification that will be fired in 15 minutes.
	 * 
	 * var payload = {
	 *   message: "Your blue item is ready!",
	 *   collapseKey: "my_game",	                        // Only supported on Android
	 *   style: "normal",	                                // Only supported on Android
	 *   iconUrl: "http://www.domain.com/notification.png",	// Only supported on Android
	 *   badge: 3,	                                        // Only supported on iOS
	 *   sound: "default",
	 *   extras: {itemId: blueItem.id, itemType: "blue_item"}
	 * };
	 * 
	 * var fireTime = (new Date().getTime() / 1000) + 15 * 60;
	 * 
	 * Device.NotificationEmitter.scheduleLocal(payload,fireTime,function(error,notification) {
	 *    if (error) {
	 *       console.log("Couldn't schedule the notification. Error: %s, code: %d", error.description, error.code);
	 *    } else {
	 *       console.log("Notification with message: %s, scheduled with systemId: %d", notification.payload.message, notification.id);
	 *    }
	 *    
	 * });
	 * 
	 * @param {Object} payload json options to describe how to show local notification.
	 * @param {String} payload.message The message that will be displayed to the user upon delivery of the notification. This is displayed by the native OS and delivered in the payload to the application.
	 * @param {String} payload.collapseKey This key is used by Android to group notifications. All notifications with the same collapseKey will be shown in the Notifications Window as one notification.
	 * @param {String} payload.style Determines the size of the icon in the Android Notifications Window. Options are <code>normal</code> and <code>largeIcon</code>.
	 * @param {String} payload.iconUrl A URL to an image file to use as an icon for this notification. This should be a network accessible URL.
	 * @param {Number} payload.badge iOS only. The number to display on the icon badge when viewing the application icon on the iOS home screen.
	 * @param {String} payload.sound Android only. Specifies whether to play a sound with the notification. 
	 * Possible values are <code>""</code> (no sound) or <code>"default"</code>.
	 * @param {Object} payload.extras A user-defined object that can be used to pass proprietary information.
	 * @param {Date or Number} time Time to fire the notification, as a Javascript Date or Unix Timestamp (seconds since the epoch).
	 * @cb {Function} callback called when the notification is scheduled.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {Object} notification Information about the notification that was scheduled.
	 * @cb-param {String} notification.id A unique ID for the notification.
	 * @cb-param {Object} notification.payload The payload for the notification, using the same
	 *		properties as the method's <code>payload</code> parameter.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.7
	 */
	scheduleLocal: function (payload,time,callback) {
		if (typeof callback != "function") {
			throw new Error(TAG + ".scheduleLocal: requires a callback function, given: " + callback);
		}
		if (!payload.message) {
			callback({code:-1,description:TAG + ".scheduleLocal: requires payload.message"});
			return;
		}
		
		if (time instanceof Date) {
			time = time.getTime() / 1000;
		}
			
		var cid = this._callbackIndexCounter++;
		this._callbacks[cid] = callback;
		
		this._scheduleSendGen(payload, ~~time ,cid);
	},
	
	_scheduleCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._scheduleCbRecvGen(cmd, msg)) {
			return;
		}

		var cid = msg.callbackId;
		
		var cb = this._callbacks[cid];
		if (!cb) {
			NgLogE(TAG + "._scheduleCbRecv command : No registered callback found, id = " + cid);
			return;
		}
		
		delete this._callbacks[cid];
		cb(null,msg.notification);
	},
	
	/**
	 * Cancel a previously scheduled notification.
	 * 
	 * @example
	 * Device.NotificationEmitter.cancelScheduled(scheduledNotificationId);
	 * 
	 * @param {String} id An ID returned by a previous NotificationEmitter.schedule call.
	 * @returns {void}
	 * @since 1.7
	 */
	cancelScheduled: function( id ) {
		this._cancelScheduledSendGen(id);
	},
	
	/**
	 * Cancel all the scheduled local notifications.
	 * 
	 * @example
	 * Device.NotificationEmitter.cancelAllScheduled();
	 * @returns {void}
	 * @since 1.7
	 */
	cancelAllScheduled: function() {
		this._cancelAllScheduledSendGen();
	},
	
	/**
	 * Returns an array of all currently scheduled notifications.
	 * @example
	 * // Return format:
	 * {
	 *     "type":0,
	 *     "id":"notificationId", 
	 *     "payload":{ 
	 *         "message":"You did a thing! Claim your prize!"
	 *     }, 
	 *     "time":1332461937 
	 * }, 
	 * {
	 *     "type":0,
	 *     "id":"notificationId", 
	 *     ...
	 * }
	 * 
	 * @example
	 * Device.NotificationEmitter.getAllScheduled(function(notifications){
	 *   for (var i = 0; i < notifications.length; i++) {
	 *     var notification = notifications[i];
	 *     console.log("Notification %s will fire at time %s with payload %s", 
	 *                     notification.id, 
	 *                     notification.time, 
	 *                     JSON.stringify(notification.payload));
	 *   }
	 * });
	 * 
	 * @cb {Function} callback The function to call after retrieving the currently scheduled
	 *		notifications.
	 * @cb-param {Object[]} notifications An array of notifications. An empty array will be returned if no notifications are scheduled.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.7
	 */
	getAllScheduled: function(callback) {
		var cid = this._callbackIndexCounter++;
		this._callbacks[cid] = callback;
		
		this._getAllScheduledSendGen(cid);
	},
	
	_getAllScheduledCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._getAllScheduledCbRecvGen(cmd, msg)) {
			return;
		}

		var cid = msg.callbackId;
		
		var cb = this._callbacks[cid];
		if (!cb) {
			NgLogE(TAG + "._getAllScheduledCbRecvGen command : No registered callback found, id = " + cid);
			return;
		}
		
		delete this._callbacks[cid];		
		cb(msg.notifications);
	},
	
	/**
	 * Adds a listener to receive notifications that arrive when the app is in the foreground. The
	 * listener will receive a <code>notification</code> object with the following properties:
	 * <ul>
	 * <li><code>notification.clicked</code>: Set to <code>true</code> if the user tapped the
	 * notification.</li>
	 * <li><code>notification.payload</code>: An object with the same properties that can be used
	 * in the <code>payload</code> parameter to
	 * <code>{@link Device.NotificationEmitter#scheduleLocal}</code>.</li>
	 * <li><code>notification.type</code>: The type of notification. Contains an enumerated value of
	 * <code>{@link Device.NotificationEmitter#Type}</code>.</li>
	 * </ul>
	 * @example
	 * Device.NotificationEmitter.addListener(new Core.MessageListener(), function(notification) {
	 *   if (notification.type == Device.NotificationEmitter.Type.Local) {
	 *      console.log("Local notification received. Notification message: " + notification.payload.message);
	 *   } else if (notification.type == Device.NotificationEmitter.Type.Remote) {
	 *      console.log("Remote notification received. Notification message: " + notification.payload.message);
	 *   } else {
	 *      console.log("Unknown type: " + notification.type);
	 *      return false;
	 *   }
	 *   return true;
	 * });
	 * @name Device.NotificationEmitter#addListener
	 * @function
	 * @param {Core.MessageListener} listener The <code>{@link Core.MessageListener}</code> object
	 *		that will listen to the emitter.
	 * @cb {Function} callback The function to call when the notification emitter is triggered. See
	 *		See the method description for details about the parameter that the callback will
	 *		receive.
	 * @cb-returns {Boolean} Set to <code>true</code> to halt propagation of the message to other
	 *		listeners or <code>false</code> to allow the message to propagate.
	 * @returns {void}
	 * @since 1.7
	 */

	 /*
	 * 	{notification} All keys defined by the notification spec in @link NotificationEmitter.schedule
	 * 	{notification.type} A Device.NotificationEmitter.Type enum, typically Local or Remote.
	 * 	{notification.clicked} Boolean. True if the system showed the user the notification, and the user decided to take action. If this bit is set, the application must perform the action described by the notification.
	 */
	addListener: function ($super, listener, callback){
		$super(listener,callback);
	},
	
    /**
     * Enumerated values for notification types.
     * @name Type
     * @fieldOf Device.NotificationEmitter#
     */
    
    /**
     * Local notification.
     * @name Type.Local
     * @fieldOf Device.NotificationEmitter#
     * @constant
     */
    
    /**
     * Remote notification.
     * @name Type.Remote
     * @fieldOf Device.NotificationEmitter#
     * @constant
     */


	/**
	 * Retrieves the current app badge count. 
	 * <br/><br/>
	 * This method is supported only on iOS. Calling this method on Android has no effect.
	 * 
	 * @example
	 * Device.NotificationEmitter.getAppBadgeCount( function(error, count) {} );
	 * 
	 * @cb {Function} callback The callback to be called with the current app badge.
	 * @cb-param {Object} error An error, if any.
	 * @cb-param {Number} badgeCount The current application icon badge count.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.7
	 */
	getAppBadgeCount: function(callback) {
		var cid = this._callbackIndexCounter++;
		this._callbacks[cid] = callback;
		
		this._getAppBadgeCountSendGen(cid);
	},
	
	_getAppBadgeCountCbRecv: function (cmd) {
		var msg = {};
		if (!this._getAppBadgeCountCbRecvGen(cmd, msg)) {
			return;
		}
		
		var cid = msg.callbackId;
		
		var cb = this._callbacks[cid];
		if (!cb) {
			NgLogE(TAG + "._getAppBadgeCountCbRecv command : No registered callback found, id = " + cid);
			return;
		}
		
		delete this._callbacks[cid];
		if (msg.error) {
			cb(JSON.parse(msg.error));
		} else {
			cb(null,msg.count);
		}
		
	},
	
	/**
	 * Set the badge count on the application's icon.
	 * <br/><br/>
	 * This method is supported only on iOS. Calling this method on Android has no effect.
	 * 
	 * @example
	 * Device.NotificationEmitter.setAppBadgeCount(1);
	 * 
	 * @param {Number} count The badge count.
	 * @returns {void}
	 * @since 1.7
	 */
	setAppBadgeCount: function(count) {
		this._setAppBadgeCountSendGen(count);
	},
	
	_notificationOccurredRecv: function( cmd )
	{
		var msg = {};
		if (!this._notificationOccurredRecvGen(cmd, msg))
			return;
		
		var notification = this._adjustFormat(JSON.parse(msg.notification));
		
		if(!this.chain(notification)) {
			//No one handled this event. Cascade the original back out to native for forwarding
			//	to the next interpreter in the chain.
			this._notificationOccurredSendGen(msg.notification);
		}
		
	},
	
	_adjustFormat: function (notification) {
		//only remote requires adjustment
		if (notification.type != Device.NotificationEmitter.Type.Remote) {
			return notification;
		}
		
		if (notification.message) {
			//Android
			return this._adjustC2DM(notification);
		} else if (notification.aps) {
			//iOS
			return this._adjustAPN(notification);
		} else {
			//Don't know, return it as it comes
			return notification;
		}
	},
	
	_adjustC2DM: function (notification) {
		//populate the payload
    	var payload = {};
		for (var key in notification) {
			var opaqueOvalue = notification[key];
			if (key in this._payloadKeys) {
				if (key == "extras" && typeof opaqueOvalue == "string") {
					var value = opaqueOvalue;
					if (value !== "") {
						payload[key] = JSON.parse(decodeURIComponent(value));
					} else {
						payload[key] = null;
					}
				} else {
					payload[key] = opaqueOvalue;
				}
			}
		}
		
		notification.payload = payload;
		return notification;
	},
	
	_adjustAPN: function (notification) {
		var payload = {};
		notification.payload = payload;
		var x = notification.x;
		
		notification.id = x[1];
		notification.senderId = x[2];
		if(typeof x[3] == "string" && x[3] !== "") {
			try {
				payload.extras =  JSON.parse(x[3]);
			} catch(e) {
				NgLogE("Unable to parse payload json: "+e);
				payload.extras = null;
			}
		} else {
			payload.extras = null;
		}
		notification.published = x[4];
		
		//populate the payload
		var aps = notification.aps;
		payload.message = aps.alert;
		payload.badge = aps.badge;
		payload.sound = aps.sound;

		return notification;
	},
	
// {{?Wg Generated Code}}
	
	// Enums.
	Type:
	{ 
		Local: 0,
		Remote: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 366,
	// Method create = -1
	// Method schedule = 2
	// Method scheduleCb = 3
	// Method getAllScheduled = 4
	// Method getAllScheduledCb = 5
	// Method cancelScheduled = 6
	// Method cancelAllScheduled = 7
	// Method getAppBadgeCount = 8
	// Method getAppBadgeCountCb = 9
	// Method setAppBadgeCount = 10
	// Method notificationOccurred = 11
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 3:
					instance._scheduleCbRecv( cmd );
					break;
				case 5:
					instance._getAllScheduledCbRecv( cmd );
					break;
				case 9:
					instance._getAppBadgeCountCbRecv( cmd );
					break;
				case 11:
					instance._notificationOccurredRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in NotificationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in NotificationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[366] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_scheduleCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in NotificationEmitter.scheduleCb from command: " + cmd );
			return false;
		}
		
		obj[ "notification" ] = Core.Proc.parseObject( cmd[ 0 ] );
		if( obj[ "notification" ] === undefined )
		{
			NgLogE("Could not parse notification in NotificationEmitter.scheduleCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in NotificationEmitter.scheduleCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getAllScheduledCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in NotificationEmitter.getAllScheduledCb from command: " + cmd );
			return false;
		}
		
		obj[ "notifications" ] = Core.Proc.parseObject( cmd[ 0 ] );
		if( obj[ "notifications" ] === undefined )
		{
			NgLogE("Could not parse notifications in NotificationEmitter.getAllScheduledCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in NotificationEmitter.getAllScheduledCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getAppBadgeCountCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in NotificationEmitter.getAppBadgeCountCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in NotificationEmitter.getAppBadgeCountCb from command: " + cmd );
			return false;
		}
		
		obj[ "count" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "count" ] === undefined )
		{
			NgLogE("Could not parse count in NotificationEmitter.getAppBadgeCountCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in NotificationEmitter.getAppBadgeCountCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_notificationOccurredRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in NotificationEmitter.notificationOccurred from command: " + cmd );
			return false;
		}
		
		obj[ "notification" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "notification" ] === undefined )
		{
			NgLogE("Could not parse notification in NotificationEmitter.notificationOccurred from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16effff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_scheduleSendGen: function( payload, time, callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e0002, this, [ Core.Proc.encodeObject( payload ), +time, +callbackId ] );
	},
	
	/** @private */
	_getAllScheduledSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e0004, this, [ +callbackId ] );
	},
	
	/** @private */
	_cancelScheduledSendGen: function( id )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e0006, this, [ Core.Proc.encodeString( id ) ] );
	},
	
	/** @private */
	_cancelAllScheduledSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x16e0007, this );
	},
	
	/** @private */
	_getAppBadgeCountSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e0008, this, [ +callbackId ] );
	},
	
	/** @private */
	_setAppBadgeCountSendGen: function( count )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e000a, this, [ +count ] );
	},
	
	/** @private */
	_notificationOccurredSendGen: function( notification )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16e000b, this, [ Core.Proc.encodeString( notification ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// schedule: function( payload, time, callbackId ) {}
	
	// _scheduleCbRecv: function( cmd ) {}
	// getAllScheduled: function( callbackId ) {}
	
	// _getAllScheduledCbRecv: function( cmd ) {}
	// cancelScheduled: function( id ) {}
	
	// cancelAllScheduled: function(  ) {}
	
	// getAppBadgeCount: function( callbackId ) {}
	
	// _getAppBadgeCountCbRecv: function( cmd ) {}
	// setAppBadgeCount: function( count ) {}
	
	// _notificationOccurredRecv: function( cmd ) {}
	// notificationOccurred: function( notification ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
