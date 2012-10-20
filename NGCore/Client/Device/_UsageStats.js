////////////////////////////////////////////////////////////////////////////////
// Class UsageStats
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Class = require('../Core/Class').Class;

////////////////////////////////////////////////////////////////////////////////

exports.UsageStats = Class.singleton(
/** @lends Device.UsageStats.prototype */
{
	classname: 'UsageStats',
	
	/**
	 * Function.
	 * @constructs
	 * @augments Core.Class
	 */
	initialize: function()
	{
		this.requests = {};
		this.cbIdCounter = 1;

		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

	},
	
	getData: function( callback )
	{
		var cbId = this.cbIdCounter++;
		this.requests[cbId] = callback;
		this._getDataSendGen( cbId );
	},
	
	_getDataCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._getDataCbRecvGen( cmd, msg ))
			return;
		
		var cbId = msg.callbackId;
		var data = msg.data;

		if ( !cbId )
		{
			NgLogE ( "UsageStats.getData: No cbId" );
			return;
		}

		var cb = this.requests[ cbId ];

		if ( !cb )
		{
			NgLogE ( "UsageStats.getData:: No registered cb found..cbId is :" + cbId );
			return;
		}

		delete this.requests[ cbId ];
		try
		{
			cb ( JSON.parse(data) );
		}
		catch(e)
		{
			NgLogE( "UsageStats.getData: exception has occured while parsing JSON" );
		}
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 356,
	// Method create = -1
	// Method getData = 2
	// Method getDataCb = 3
	
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
					instance._getDataCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in UsageStats._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in UsageStats._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[356] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_getDataCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in UsageStats.getDataCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in UsageStats.getDataCb from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in UsageStats.getDataCb from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x164ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_getDataSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1640002, this, [ +callbackId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// getData: function( callbackId ) {}
	
	// _getDataCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
