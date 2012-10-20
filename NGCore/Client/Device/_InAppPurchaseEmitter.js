////////////////////////////////////////////////////////////////////////////////
// Class InAppPurchaseEmitter
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.InAppPurchaseEmitter = Core.MessageEmitter.singleton(
/** @lends Device.InAppPurchaseEmitter.prototype */
{
	classname: 'InAppPurchaseEmitter',
	
	/**
	 * Function.
	 * @constructs
	 * @augments Core.Class
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	_onPurchaseEventRecv: function( cmd ) {
		var msg = {};
		if (!this._onPurchaseEventRecvGen(cmd, msg))
			return;
		if(!this.chain(msg.err, msg.data, msg.verificationToken))	{
			//Noone handled this keyEvent. Cascade the original back out to native for forwarding
			//	to the next interpreter in the chain.
			this._onPurchaseEventSendGen(msg.err, msg.data, msg.verificationToken);
		}
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 347,
	// Method create = -1
	// Method onPurchaseEvent = 2
	
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
					instance._onPurchaseEventRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in InAppPurchaseEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in InAppPurchaseEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[347] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onPurchaseEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in InAppPurchaseEmitter.onPurchaseEvent from command: " + cmd );
			return false;
		}
		
		obj[ "err" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "err" ] === undefined )
		{
			NgLogE("Could not parse err in InAppPurchaseEmitter.onPurchaseEvent from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in InAppPurchaseEmitter.onPurchaseEvent from command: " + cmd );
			return false;
		}
		
		obj[ "verificationToken" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "verificationToken" ] === undefined )
		{
			NgLogE("Could not parse verificationToken in InAppPurchaseEmitter.onPurchaseEvent from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x15bffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_onPurchaseEventSendGen: function( err, data, verificationToken )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15b0002, this, [ Core.Proc.encodeString( err ), Core.Proc.encodeString( data ), Core.Proc.encodeString( verificationToken ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _onPurchaseEventRecv: function( cmd ) {}
	// onPurchaseEvent: function( err, data, verificationToken ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
