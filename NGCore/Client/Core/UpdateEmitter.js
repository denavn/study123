var MessageEmitter = require('./MessageEmitter').MessageEmitter;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var Proc = require('./Proc').Proc;
var Time = require('./Time').Time;

exports.UpdateEmitter = MessageEmitter.singleton(
/** @lends Core.UpdateEmitter.prototype */
{
	classname: 'UpdateEmitter',
		
	/**
	 * @class The <code>UpdateEmitter</code> class constructs a singleton object that emits every
	 * frame and sends its listeners the delta, in milliseconds, since the last frame.<br /><br />
	 * <b>Note:</b> <code>{@link Core.UpdateEmitter#setTickRate}</code> is also used to define the framerate of any animation reproduced by a sprite 
	 * (see <code>{@link GL2.Sprite#setAnimation}</code>).<br /><br />
	 * <strong>Note<strong>: If your app uses the <code>{@link UI.WebView}</code> class to display a
	 * web-based game, avoid adding listeners to <code>UpdateEmitter</code> when possible. Attaching
	 * a listener to <code>UpdateEmitter</code> can limit the performance of web-based games.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		
		this.__clubObject = new NgEngineEntity();
		this.__clubObject.mIsUpdatable = true;
		this.__clubObject.onUpdate = this._emitTime.bind(this);
		this.__clubObject.register();
		
		this._createSendGen(this.__objectRegistryId);
		
		if (!Core.Capabilities.meetsBinaryVersion("1.8")) {
			this._setListenerCountSendGen = function() {};
		}
		this._setListenerCountSendGen(0);
	},
	
	_emitTime: function()
	{
		this.emit(Time.getFrameDelta());
	},
	/**
	 * Set the number of seconds between updates from this <code>UpdateEmitter</code>.<br /><br />
	 * <b>Note</b>: The new value will take effect after the current update completes. The actual
	 * tick rate will be less than or equal to the requested tick rate.
	 * @example
	 * // Send updates every 0.1 seconds, or 100 milliseconds, to any MessageListener objects
	 * // that are listening to this UpdateEmitter
	 * Core.UpdateEmitter.setTickRate(0.1);
	 * @param {Number} r The number of seconds between updates from this <code>UpdateEmitter</code>.
	 * @see GL2.Sprite
	 * @returns {void}
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setTickRate: function( r ) 
	{
		this._setTickRateSendGen(r);
	},
	
	addListener: function($super, listener, func, priority) {
		$super(listener, func, priority);
		this._setListenerCountSendGen(this.getListenerCount());
	},
	
	removeListener: function($super, listener) {
		$super(listener);
		this._setListenerCountSendGen(this.getListenerCount());
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 304,
	// Method create = -1
	// Method setTickRate = 2
	// Method setListenerCount = 3
	
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
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in UpdateEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in UpdateEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[304] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x130ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_setTickRateSendGen: function( rate )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Proc.appendToCommandString( 0x1300002, this, [ +rate ] );
	},
	
	/** @private */
	_setListenerCountSendGen: function( count )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x1300003, this, [ +count ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// setTickRate: function( rate ) {}
	
	// setListenerCount: function( count ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
