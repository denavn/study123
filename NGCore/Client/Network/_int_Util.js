///////////////////////////////////////////////////////////////////////////////
// Class _int_Util
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Class = require('../Core/Class').Class;
////////////////////////////////////////////////////////////////////////////////

var _int_Util = exports._int_Util = Class.singleton(
/** @lends Network._int_Util.prototype */
{
	classname: '_int_Util',
	
	/**
	 * Function.
	 * @constructs
	 * @augments Core.Class
	 */
	initialize: function()
	{
		this._callbackID = 0;
		this._callbacks = [];

		// Only set this to false if we do not meet this version. Otherwise we have to say true;
		this.valid = !Core.Capabilities.meetsBinaryVersion("1.3.5.10");
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
// {{?Wg Generated Code}}
	
	// Enums.
	ProcID:
	{ 
		Persist: -1,
		Game: -2
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 350,
	// Method create = -1
	// Method destroy = 2
	// Method sign = 3
	// Method signCallback = 4
	// Method adTapjoySendActionComplete = -5
	// Method verified = -6
	
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
				
				case 4:
					instance._signCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in _int_Util._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -6:
					_int_Util._verifiedRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in _int_Util._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[350] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_signCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in _int_Util.signCallback from command: " + cmd );
			return false;
		}
		
		obj[ "signature" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "signature" ] === undefined )
		{
			NgLogE("Could not parse signature in _int_Util.signCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in _int_Util.signCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	$_verifiedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _int_Util.verified from command: " + cmd );
			return false;
		}
		
		obj[ "b" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "b" ] === undefined )
		{
			NgLogE("Could not parse b in _int_Util.verified from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x15effff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x15e0002, this );
	},
	
	/** @private */
	_signSendGen: function( baseString, callbackID, environment )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15e0003, this, [ Core.Proc.encodeString( baseString ), +callbackID, Core.Proc.encodeString( environment ) ] );
	},
	
	/** @private */
	$_adTapjoySendActionCompleteSendGen: function( actionId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15efffb, [ Core.Proc.encodeString( actionId ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// sign: function( baseString, callbackID, environment ) {}
	
	// _signCallbackRecv: function( cmd ) {}
	// $adTapjoySendActionComplete: function( actionId ) {}
	
	// $_verifiedRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,
	$_verifiedRecv: function( cmd )
	{
		this.valid = true;
		if (this._verifiedCallback)
		{
			this._verifiedCallback();
		}
	},

	sign: function( baseString, environment, callback) {
		// Save requests
		if (this.valid)
		{
			this._callbacks[this._callbackID] = callback;
			this._signSendGen(baseString,this._callbackID++, environment);
		}
		else
		{
			callback(false);
		}
	},
	_signCallbackRecv: function( cmd ) {
		var msg = {};
		if (! this._signCallbackRecvGen(cmd, msg)) {
			return;
		}
		var func = this._callbacks[parseInt(msg.callbackID)];
		if (func) {
			func(msg.signature);
		}
	},

	signable: function()
	{
		return this.valid;
	},

	registerVerifiedCB: function(cb)
	{
		if (this.valid)
		{
			cb();
		}
		else
		{
			this._verifiedCallback = cb;
		}
	},

	$adTapjoySendActionComplete: function(actionId) {
		console.log('_int_Util.adTapjoysendActionComplete: ' + actionId);
		this._adTapjoySendActionCompleteSendGen(actionId);
	}

});
