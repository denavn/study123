////////////////////////////////////////////////////////////////////////////////
// Class LocalNotification
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('../Core/Class').Class;
var Core = require ('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.LocalNotification = Core.MessageEmitter.singleton(
/** @lends Device.LocalNotification.prototype */
{
	classname: 'LocalNotification',
	
	/**
	 * @class The Device.LocalNotification object is used to interact with the local notification system of the device.
	 * With this class you can schedule, cancel, listen for notifications, and know if the game was launched from a notification.
	 *  
	 * @constructs The default constructor.
	 * @arguments Core.Class
	 */
	initialize: function()
	{
		this._callbackIndexCounter = 1;
		this._callbacks = [];
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},

	/**
	 * showLocalNotification is called with JSON options.  Currently, these
	 * JSON options are supported: {
	 * openurl : "mobage-ww-mobageBoot://mobageBoot/1/ServiceUI/Catalog",
	 * aps : {
	 *    alert: "Text to show in notification area"
	 *  }
	 * // optional, Android-only, string tag to control how the notifications
	 * // are stacked in the tray
	 * tag : "tray_tag_1"
	 * }
	 *    
	 * The game cannot invoke this function.
	 *
	 * @param options - json options to describe how to show local notification
	 * @private
	 */
	showLocalNotification: function( options ) {
		this._showLocalNotificationSendGen(options);
	},
	
	/**
	 * Schedule a local notification with JSON options. Currently, these JSON options are supported:
	 * var options = {
	 *   aps : {
	 *    alert: "Text to show in notification area"
	 *   },
	 *   //notification will be scheduled for the next delayTime milliseconds
	 *   delayTime : 10000, 
	 *   // optional, Android-only, string tag to control how the notifications are stacked in the tray
	 *   tag : "tray_tag_1",
	 *   // optional, an id that belongs to the game logic. It can be used to identify the notification.
	 *   gameId: my_game_logic_id
	 * }
	 * @example:
	 * //a notification that will be fired in 15 minutes.
	 * 
	 * var options: {
	 *   aps: {
	 *     alert: "Your blue item is ready!"
	 *   },
	 *   delayTime: 1000*60*15,
	 *   tag: "my_game",
	 *   gameId: "blue_item_" + blueItem.id,
	 * }
	 * Device.LocalNotification.schedule(options,function(notifSysId){
	 *    this._notifications[options.gameId] = id;
	 * }.bind(this));
	 * 
	 * @argument options - json options to describe how to show local notification.
	 * @argument {Function} callback called when the notification is scheduled. The system id of the scheduled notification is passed as an argument. A negative value will be given if the notification couldn't be scheduled.
	 * @status iOS, Android
	 */
	schedule: function( options, callback )
	{
		if (!(callback instanceof Function)) {
			throw new Error('LocalNotification.schedule requires a callback function, given: ' + callback);
		}
		if (!options.delayTime) {
			throw new Error('LocalNotification.schedule requires a delayTime given in options');
		}
			
		if (!options.aps.alert) {
			throw new Error('LocalNotification.schedule requires an aps.alert given in options');
		}
			
		var id = 0;
		if (callback) {
			id = this._callbackIndexCounter++;
			this._callbacks[id] = callback;
		}
		
		this._scheduleSendGen(id, options);
	},
	
	_scheduleCommandCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._scheduleCommandCbRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;
		
		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("_scheduleCommandCbRecv command : No registered callback found, id = " + id);
			return;
		}
		
		delete this._callbacks[id];
		cb(msg.id);
	},
	
	/**
	 * Cancel a previously scheduled notification.
	 * 
	 * @example:
	 * Device.LocalNotification.cancel(31);
	 * 
	 * @argument {Number} id - notification system id to be removed.
	 * @status iOS, Android
	 */
	cancel: function( id ) {
		this._cancelSendGen(id);
	},
	
	/**
	 * Cancel all the scheduled local notifications.
	 * @example: Device.LocalNotification.cancelAll();
	 * @status iOS, Android
	 */
	cancelAll: function() {
		this._cancelAllSendGen();
	},
	
	/**
	 * Returns an object with all the scheduled notifications.
	 * @example:
	 * Device.LocalNotification.getAllScheduled(function(notifications){
	 *   for (var notifId in notifications) {
	 *     console.log("notificationId: " + notifId + ", notificationGameId: " + notifications[notifId]);
	 *   }
	 * }.bind(this));
	 * @argument {Function} callback called with the notifications object as only argument. The object structure is: {sysId1: gameId1, sysId2: gameId2}. An empty object will be given if there is no scheduled notifications.
	 * @status iOS, Android
	 */
	getAllScheduled: function(callback) {
		if (!(callback instanceof Function)) {
			throw new Error('LocalNotification.getAllScheduled requires a callback function, given: ' + callback);
		}
		
		var callbackId = 0;
		if (callback) {
			callbackId = this._callbackIndexCounter++;
			this._callbacks[callbackId] = callback;
		}
		
		this._getAllScheduledSendGen(callbackId);
	},
	
	_getAllScheduledCommandCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._getAllScheduledCommandCbRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;
		
		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("LocalNotificaton._getAllScheduledCommandCbRecv command : No registered callback found, id = " + id);
			return;
		}
		
		delete this._callbacks[id];		
		cb(msg.response);
	},
	
	/**
	 * Retrieves the last notification info that was used to launch or bring to front the game.
	 * @example:
	 * Device.LocalNotification.retrieveLauncherInfo(function(notification){
	 *   if (notification) {
	 *     console.log("Game was launched or brought to front with notification: notificationId: " + notification.id + ", notificationGameId: " + notification.gameId);
	 *   }
	 * }.bind(this));
	 * @argument {Function} callback called with the notification object or null. The object structure is: {id: sysId, gameId: gameId}.
	 */
	retrieveLauncherInfo: function( callback )
	{
		if (!(callback instanceof Function)) {
			throw new Error('LocalNotification.retrieveLauncherInfo requires a callback function, given: ' + callback);
		}
		
		var callbackId = 0;
		if (callback) {
			callbackId = this._callbackIndexCounter++;
			this._callbacks[callbackId] = callback;
		}
		
		this._retrieveLauncherInfoSendGen(callbackId);
	},
	
	_retrieveLauncherInfoCommandCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._retrieveLauncherInfoCommandCbRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;

		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("LocalNotificaton._retrieveLauncherInfoCommandCbRecv command : No registered callback found, id = " + id);
			return;
		}

		delete this._callbacks[id];		
		cb(msg.response);
	},

    _onNotificationEventRecv: function( cmd )
    {
        var msg = {};
        if (!this._onNotificationEventRecvGen(cmd, msg)) {
            return;
        }

        this.emit(msg.info);
    },
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 354,
	// Method create = -1
	// Method destroy = 2
	// Method showLocalNotification = 3
	
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
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in LocalNotification._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in LocalNotification._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[354] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x162ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1620002, this );
	},
	
	/** @private */
	_showLocalNotificationSendGen: function( options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1620003, this, [ Core.Proc.encodeObject( options ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// showLocalNotification: function( options ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
