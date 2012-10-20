var Core = require('../Core').Core;

/*
	NOTE: 	THIS IS FOR INTERNAL USE ONLY AND WILL BE DEPRECATED IN THE FUTURE.
			DO NOT USE IT IN ANY OF YOUR CODE.
*/

exports.PushNotificationEmitter = Core.MessageEmitter.singleton(
/** @lends Device.PushNotificationEmitter.prototype */
{
	classname: 'PushNotificationEmitter',
		
	/**
	 * @class Emits when native code recieves a push notification
	 * @constructs The default constructor.
	 * @augments Core.MessageEmitter
	 */
	
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	_onPushNotificationRecv: function( cmd )
	{
		var msg = {};
		if (!this._onPushNotificationRecvGen(cmd, msg))
			return;
			
		this._lastMsgPayload = msg.msgPayload;
		
		if(!this.chain(msg.msgPayload))	{
			//Noone handled this keyEvent. Cascade the original back out to native for forwarding
			//	to the next interpreter in the chain.
			this._onPushNotificationSendGen(msg.msgPayload);
		}
		
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 345,
	// Method create = -1
	// Method onPushNotification = 2
	
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
				
				case 2:
					instance._onPushNotificationRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in PushNotificationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in PushNotificationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[345] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onPushNotificationRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in PushNotificationEmitter.onPushNotification from command: " + cmd );
			return false;
		}
		
		obj[ "msgPayload" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "msgPayload" ] === undefined )
		{
			NgLogE("Could not parse msgPayload in PushNotificationEmitter.onPushNotification from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x159ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_onPushNotificationSendGen: function( msgPayload )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1590002, this, [ Core.Proc.encodeString( msgPayload ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _onPushNotificationRecv: function( cmd ) {}
	// onPushNotification: function( msgPayload ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
