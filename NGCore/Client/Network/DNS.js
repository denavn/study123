////////////////////////////////////////////////////////////////////////////////
// Class DNS
// DNS resolver
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('../Core/Class').Class;

////////////////////////////////////////////////////////////////////////////////

exports.DNS = Class.singleton(
/** @lends Network.DNS.prototype */
{
	classname: 'DNS',
	
	/**
	 * @class The `Network.DNS` class enables applications to obtain the IP addresses that are 
	 * associated with a domain name.
	 * @singleton
	 * @constructs
	 * @augments Core.Class
	 * @since 1.6.5
	 */
	initialize: function()
	{
		this._nextCbId = 0;
		this._cb = {};
		this._storeCb = function(cb) {
			var cbId = -1;
			if(cb) {
				cbId = this._nextCbId++;
				this._cb[cbId] = cb?cb:function(){};
			}
			return cbId;
		};
		this._restoreCb = function(cbId) {
			var cb = this._cb[cbId];
			delete this._cb[cbId];
			return cb;
		};

		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	/**
	 * Retrieve a list of IP addresses that are associated with a domain name.
	 * @example
	 * // Obtain the IP addresses that are associated with the domain name mobage.com.
	 * var ip = [];
	 * Network.DNS.resolve("mobage.com", function(err, addrs) {
	 *     if (err) {
	 *         console.log("An error occurred while resolving the domain name: " +
	 *           err.code + ": " + err.description);
	 *     } else {
	 *         ip = addrs;
	 *     }
	 * });
	 * @param {String} host The domain name to resolve.
	 * @cb {Function} cb The function to call after resolving the domain name.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.DNS#Error} [err.code] A code identifying the error.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {String[]} addrs The IP addresses associated with the domain name.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.6.5
	 */
	resolve: function(host, cb)
	{
		var cbId = this._storeCb(cb);
		this._resolveSendGen(host, 0,  cbId);
	},

	_onResolveCbRecv: function( cmd )
	{
		var obj = {};
		if(this._onResolveCbRecvGen(cmd, obj)) {
			if(obj['cbId'] >= 0) {
				var cb = this._restoreCb(obj['cbId']);
				if(obj['errCode']) {
					cb({ code:obj['errCode'], description:obj['errStr'] }, []);
				} else {
					cb(null, obj['addrs']?JSON.parse(obj['addrs']):[]);
				}
			}
		}
	},
	
	/**
	 * Enumeration for types of DNS errors.
	 * @name Error
	 * @fieldOf Network.DNS#
	 */
	
	/**
	 * An unknown error occurred.
	 * @name Error.Unknown
	 * @fieldOf Network.DNS#
	 * @constant
	 */
	
	/**
	 * The domain name is invalid.
	 * @name Error.Invalid
	 * @fieldOf Network.DNS#
	 * @constant
	 */
	
	/**
	 * The requested operation is not supported.
	 * @name Error.NotSupported
	 * @fieldOf Network.DNS#
	 * @constant
	 */
	
	/**
	 * The domain name could not be found.
	 * @name Error.NotFound
	 * @fieldOf Network.DNS#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Error:
	{ 
		Unknown: -100,
		Invalid: -101,
		NotSupported: -102,
		NotFound: -103
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 361,
	// Method create = -1
	// Method resolve = 2
	// Method onResolveCb = 3
	
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
					instance._onResolveCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in DNS._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in DNS._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[361] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onResolveCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in DNS.onResolveCb from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in DNS.onResolveCb from command: " + cmd );
			return false;
		}
		
		obj[ "addrs" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "addrs" ] === undefined )
		{
			NgLogE("Could not parse addrs in DNS.onResolveCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in DNS.onResolveCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in DNS.onResolveCb from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x169ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_resolveSendGen: function( host, flags, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1690002, this, [ Core.Proc.encodeString( host ), +flags, +cbId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// resolve: function( host, flags, cbId ) {}
	
	// _onResolveCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
