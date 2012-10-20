var MessageEmitter = require('../Core/MessageEmitter').MessageEmitter;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Proc = require('../Core/Proc').Proc;

exports.LifecycleEmitter = MessageEmitter.singleton(
/** @lends Device.LifecycleEmitter.prototype */
{
	classname: 'LifecycleEmitter',
		
	/**
	 * @class The <code>LifecycleEmitter</code> class constructs a singleton object that sends its
	 * listeners a unique value when a lifecycle event occurs (for example, when the application is
	 * being suspended). The value corresponds to an enumerated value of
	 * <code>{@link Device.LifecycleEmitter#Event}</code>. Apps can respond to these events by
	 * notifying external sources, saving their current state, or taking another action. For
	 * example, an app can respond to a <code>Terminate</code> event by sending an analytics message
	 * using <code>{@link Core.Analytics}</code>.
	 * <br /><br />
	 * In addition, an app can exit immediately and shut down its process by calling the static
	 * method <code>{@link Device.LifecycleEmitter.exitProcess}</code>.
	 * @singleton
	 * @constructs The default constructor.
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		/** @private */
		this.identificationCache = {};
		this.numEngineRequests = 0;
	},
	
	_lifecycleEventRecv: function( cmd )
	{
		var msg = {};
		if(!this._lifecycleEventRecvGen(cmd, msg))
			return;
			
		this.emit(msg.event);
		//Cascade the original message back out to native for forwarding
		//	to the next interpreter in the chain.
		this._lifecycleEventSendGen(msg.event);
	},

	/**
	 * Exit the app immediately, and shut down the app's process.
	 * @name Device.LifecycleEmitter.exitProcess
	 * @function
	 * @static
	 * @returns {void}
	 * @since 1.8
	 */
	
	$exitProcess: function()
	{
		// We need to notify analytics in case it wants to start sending events
		var pipe = require('../Core/Analytics').Analytics._getPipe();
		pipe._exitingApp();

		this._exitProcessSendGen();
	},
	
	/** @private */
	$_bgMe: function()
	{
		this.__bgMeSendGen();
	},

	/** @private */
	$pauseGame: function()
	{
		NgLogD("+++++++++++++++++++++++++++++++++++++++++Pausing Game");
		this._pauseGameSendGen();
		var _lgl = require("../Core/_LocalGameList")._LocalGameList;
		_lgl._pausingGame();
	},

	/** @private */
	$resumeGame: function()
	{
		NgLogD("+++++++++++++++++++++++++++++++++++++++++Resuming Game");
		this._resumeGameSendGen();
		var _lgl = require("../Core/_LocalGameList")._LocalGameList;
		_lgl._resumingGame();
	},

	requestEngineKeepAlive: function(obj)
	{
		var key = obj;
		if (obj.identification_key !== undefined)
		{
			key = obj.identification_key;
		}

			//Store identification key and increment request to engine
			this.identificationCache[key] = true;
			++this.numEngineRequests;
			this.incrementEngineAlive();
	},
	
	cancelEngineKeepAlive: function(obj)
	{
		var key = obj;
		if (obj.identification_key !== undefined)
		{
			key = obj.identification_key;
		}

			if (this.identificationCache[key])
			{
				//Store identification key and increment request to engine
				delete this.identificationCache[key];
				--this.numEngineRequests;
				this.decrementEngineAlive();
			}else{
				NgLogW("LifecycleEmitter.cancelEngineKeepAlive() Identification Key not found");
			}
	},

	incrementEngineAlive: function()
	{
		this._incrementEngineAliveSendGen();
	},
	
	decrementEngineAlive: function()
	{
		this._decrementEngineAliveSendGen();
	},
	
	cancelAllEngineRequests: function()
	{
		this._cancelAllEngineRequestsSendGen();
	},

	_killGameProc: function( )
	{
		this.__killGameProcSendGen();
	},
	
	/** 
	 * Enumeration values for lifecycle events.
	 * @name Event
	 * @fieldOf Device.LifecycleEmitter#
	 */

	/**
	 * Application is being suspended.
	 * @name Event.Suspend
	 * @fieldOf Device.LifecycleEmitter#
	 * @constant
	 */

	/**
	 * Application is being resumed.
	 * @name Event.Resume
	 * @fieldOf Device.LifecycleEmitter#
	 * @constant
	 */
	 
	/**
	 * Application is being terminated.
	 * @name Event.Terminate
	 * @fieldOf Device.LifecycleEmitter#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Event:
	{ 
		Suspend: 0,
		Resume: 1,
		Terminate: 2,
		KeepAliveWillTerminate: 3
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 334,
	// Method create = -1
	// Method lifecycleEvent = 2
	// Method exitProcess = -3
	// Method pauseGame = -4
	// Method resumeGame = -5
	// Method incrementEngineAlive = 6
	// Method decrementEngineAlive = 7
	// Method cancelAllEngineRequests = 8
	// Method _killGameProc = -9
	// Method _bgMe = -10
	
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
					instance._lifecycleEventRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in LifecycleEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in LifecycleEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[334] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_lifecycleEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in LifecycleEmitter.lifecycleEvent from command: " + cmd );
			return false;
		}
		
		obj[ "event" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "event" ] === undefined )
		{
			NgLogE("Could not parse event in LifecycleEmitter.lifecycleEvent from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x14effff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_lifecycleEventSendGen: function( event )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14e0002, this, [ +event ] );
	},
	
	/** @private */
	$_exitProcessSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14efffd );
	},
	
	/** @private */
	$_pauseGameSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14efffc );
	},
	
	/** @private */
	$_resumeGameSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14efffb );
	},
	
	/** @private */
	_incrementEngineAliveSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14e0006, this );
	},
	
	/** @private */
	_decrementEngineAliveSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14e0007, this );
	},
	
	/** @private */
	_cancelAllEngineRequestsSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14e0008, this );
	},
	
	/** @private */
	$__killGameProcSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14efff7 );
	},
	
	/** @private */
	$__bgMeSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14efff6 );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _lifecycleEventRecv: function( cmd ) {}
	// lifecycleEvent: function( event ) {}
	
	// $exitProcess: function(  ) {}
	
	// $pauseGame: function(  ) {}
	
	// $resumeGame: function(  ) {}
	
	// incrementEngineAlive: function(  ) {}
	
	// decrementEngineAlive: function(  ) {}
	
	// cancelAllEngineRequests: function(  ) {}
	
	// $_killGameProc: function(  ) {}
	
	// $_bgMe: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
