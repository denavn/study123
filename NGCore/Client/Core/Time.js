////////////////////////////////////////////////////////////////////////////////
// Class Time
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('./Class').Class;
var Proc = require('./Proc').Proc;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;

var callbacks = {};
var cbKey = 0;
callbacks.add = function(fn) {
	if (typeof fn != 'function') return undefined;
	this[++cbKey] = fn;
	return cbKey;
};

var Time = Class.singleton(
/** @lends Core.Time.prototype */
{
	classname: 'Time',
	mFrameTime: 0,
	mFrameDelta: 0,

	/**
	 * @class the <code>Time</code> class constructs objects that provide access to the system clock and system timings for a device.
	 * @status iOS, Android, Flash
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		
		var MessageListener = require('./MessageListener').MessageListener;
		var LifecycleEmitter = require('../Device/LifecycleEmitter').LifecycleEmitter;
		var ListenerClass =  MessageListener.subclass({
			initialize: function(mainTime)
			{
				LifecycleEmitter.addListener(this, this.onLifecycleUpdate);
				this.mTime = mainTime;
			},
			onLifecycleUpdate: function(event)
			{
				switch (event)
				{
//					case LifecycleEmitter.Event.Suspend: 	// If MOB-3366 is reopened, this may need to be uncommented
					case LifecycleEmitter.Event.Resume:		//MOB-3366 Reset frame time when we pause/resume. Suspend doesn't work, so use Resume
						this.mTime.mFrameTime = 0;
					break;
				}
			}
		});
		this.mLifeListener = new ListenerClass(this);
	},

	/**
	 * Return the timestamp for the current time frame (expressed in milliseconds).
	 * @returns {Number} The timestamp for the current time frame.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFrameTime: function()
	{
		return this.mFrameTime;
	},

	/**
	 * Return the delta time in milliseconds since the last time frame.
	 * @returns {Number} The delta time since the last time frame.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFrameDelta: function()
	{
		return this.mFrameDelta;
	},

	/**
	 * Return the real-time clock in milliseconds. 
	 * <b>Note:</b> This differs from the time frame timestamp, which is constant for the entire time frame.
	 * @returns {Number} The real-time clock.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRealTime: function()
	{
		return (new Date()).getTime();
	},

	$_frameTimeRecv: function( cmd )
	{
		var o = {};
		this._frameTimeRecvGen(cmd, o);

		this.mFrameDelta = this.mFrameTime ? o.time - this.mFrameTime : 1;
		this.mFrameTime = o.time;
	},
	
	setTimeout: function( fn, delta ) {
		var cbId = callbacks.add(fn);
		if (cbId) {
			this._setTimeoutSendGen( cbId, delta );
		}
		return cbId;
	},
	
	setInterval: function( fn, interval ) {
		var cbId = callbacks.add(fn);
		if (cbId) {
			this._setIntervalSendGen( cbId, interval );
		}
		return cbId;
	},
	
	clearTimeout: function( token ) {
		delete callbacks[token];
		this._clearSendGen( token );
	},
	
	clearInterval: function( token ) {
		delete callbacks[token];
		this._clearSendGen( token );
	},
	
	_fireTimerRecv: function( cmd ) {
		var msg = {};
		if(!this._fireTimerRecvGen(cmd, msg))
			return;
		
		var fn = callbacks[msg.cbId];
		if (typeof fn == 'function') {
			fn();
		} else console.log("Could not find closure for " + msg.cbId);
		if (cmd.remove) delete callbacks[cmd.cbId];
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 351,
	// Method frameTime = -1
	// Method create = -2
	// Method setTimeout = 3
	// Method setInterval = 4
	// Method clear = 5
	// Method fireTimer = 6
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Proc.parseInt( cmd.shift(), 10 );
			var instance = ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 6:
					instance._fireTimerRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Time._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -1:
					Time._frameTimeRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in Time._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[351] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	$_frameTimeRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Time.frameTime from command: " + cmd );
			return false;
		}
		
		obj[ "time" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "time" ] === undefined )
		{
			NgLogE("Could not parse time in Time.frameTime from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_fireTimerRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Time.fireTimer from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in Time.fireTimer from command: " + cmd );
			return false;
		}
		
		obj[ "remove" ] = Proc.parseBool( cmd[ 1 ] );
		if( obj[ "remove" ] === undefined )
		{
			NgLogE("Could not parse remove in Time.fireTimer from command: " + cmd );
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
		Proc.appendToCommandString( 0x15ffffe, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_setTimeoutSendGen: function( cbId, delta )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x15f0003, this, [ +cbId, +delta ] );
	},
	
	/** @private */
	_setIntervalSendGen: function( cbId, interval )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x15f0004, this, [ +cbId, +interval ] );
	},
	
	/** @private */
	_clearSendGen: function( cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x15f0005, this, [ +cbId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $_frameTimeRecv: function( cmd ) {}
	// $create: function( __objectRegistryId ) {}
	
	// setTimeout: function( cbId, delta ) {}
	
	// setInterval: function( cbId, interval ) {}
	
	// clear: function( cbId ) {}
	
	// _fireTimerRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});

exports.Time = Time;

/** Timeout Support. Shameface. Intentionally leak to the global scope. */
var env = typeof $_GETENGINEENV !== "undefined" ? $_GETENGINEENV() : undefined;

if ( typeof env == 'object' && env.useCoreTimeout ) {
	
	setTimeout = function( fn, delay ) { return Time.setTimeout(fn, delay); };
	setInterval = function( fn, interval ) { return Time.setInterval(fn, interval); };
	clearTimeout = function( token ) { Time.clearTimeout(token); };
	clearInterval = function( token ) { Time.clearInterval(token); };
	
	exports.NGSetTimeoutRunTimers = function() {};
	
} else {
	exports.NGSetTimeoutRunTimers = require("../UI/NGJSEnvironmentSupport").NGSetTimeoutRunTimers;
	
	Time.setTimeout = setTimeout;
	Time.setInterval = setInterval;
	Time.clearTimeout = clearTimeout;
	Time.clearInterval = clearInterval;
	
}
