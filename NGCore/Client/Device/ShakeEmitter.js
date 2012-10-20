var Core = require('../Core').Core;
var MotionEmitter = require('./MotionEmitter').MotionEmitter;

var ProxyListener = Core.MessageListener.subclass(
{
	onUpdate: function() {}
});

exports.ShakeEmitter = Core.MessageEmitter.singleton(
/** @lends Device.ShakeEmitter.prototype */
{
	classname: 'ShakeEmitter',
		
	/**
	 * @class The <code>ShakeEmitter</code> class constructs a singleton object that sends a message
	 * to its listeners when a user shakes the device.
	 * <br /><br />
	 * In addition, this class provides the method <code>{@link Device.ShakeEmitter#vibrate}</code>,
	 * which causes the device to vibrate briefly.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @status iOS, Android
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._proxyListener = new ProxyListener();
		
	},
	
	/**
	 * Add a <code>MessageListener</code> to this emitter. When an application calls <code>emit()</code> 
	 * or <code>chain()</code> 
	 * on this emitter, a callback function passed as a parameter is called on the specified listener.
	 * <br /><br />
	 * <b>Note:</b> Each listener can only listen to an emitter one time.<br /><br />
	 * The following code examples illustrate different call styles for <code>addListener()</code>.
	 * @example
	 * emitter.addListener(myListener, myListener.onCallback);
	 * @example
	 * emitter.addListener(myListener, myListener.onEvent, 200);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to add.
	 * @cb {Function} func The function to call when the device is shaken.
	 * @cb-returns {void}
	 * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
	 * @throws {Error} The specified listener is already listening to the emitter.
	 * @throws {Error} The specified listener is not an instance of <code>Core.MessageListener</code>.
	 * @see Device.ShakeEmitter#removeListener
	 * @see Core.MessageEmitter#emit
	 * @see Core.MessageEmitter#chain
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	addListener: function($super, listener, func, priority)
	{
		if (this.getListenerCount() === 0) {
			MotionEmitter.addListener(this._proxyListener, function(){});
		}

		$super(listener, func, priority);
	},
	
	/**
	 * Remove a <code>MessageListener</code> from this emitter.
	 * @example
	 * emitter.removeListener(myListener);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to remove.
	 * @returns {Boolean} Returns <code>true</code> if the registered listener was removed. Returns <code>false</code> if the registered listener is not found 
	 * or is not registered with this emitter.
	 * @see Device.ShakeEmitter#addListener
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	removeListener: function($super, listener)
	{
		$super(listener);

		if (this.getListenerCount() === 0) {
			MotionEmitter.removeListener(this._proxyListener);
		}
	},
	
	/**
	 * Turn on the device's vibrator briefly.
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.6
	 */
	vibrate: function ()
	{
		this._vibrateSendGen();
	},
    
	_shakeRecv: function( cmd )
	{
		this.emit();
		
		//Cascade the original message back out to native for forwarding
		this._shakeSendGen();
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 332,
	// Method create = -1
	// Method shake = 2
	// Method vibrate = -3
	
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
					instance._shakeRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in ShakeEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in ShakeEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[332] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_shakeRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in ShakeEmitter.shake from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x14cffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_shakeSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14c0002, this );
	},
	
	/** @private */
	$_vibrateSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14cfffd );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _shakeRecv: function( cmd ) {}
	// shake: function(  ) {}
	
	// $vibrate: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
