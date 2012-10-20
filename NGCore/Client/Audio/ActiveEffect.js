var Core = require('../Core').Core;

exports.ActiveEffect = Core.Class.subclass(
/** @lends Audio.ActiveEffect.prototype */
{
	/**
	 * @class The <code>ActiveEffect</code> class constructs objects that control 
	 * the reproduction of an audio effect. Audio effects in Mobage applications are captured as 
	 * <code>{@link Audio.Effect}</code> objects, which load data for an audio effect into memory. 
	 * This separation allows applications to manage effect data independently of effect 
	 * reproduction.
	 * <br /><br />
	 * You must specify the <code>{@link Audio.Effect}</code> object to reproduce when you
	 * instantiate the <code>ActiveEffect</code> object. After instantiation, you cannot change
	 * which <code>{@link Audio.Effect}</code> object is associated with the
	 * <code>ActiveEffect</code> object.
	 * <br /><br />
	 * <strong>Important</strong>: See <code>{@link Audio.Effect}</code> for information about the
	 * maximum size of audio resources.
	 * @example
	 * var effect = new Audio.Effect('some_effect.wav');
	 * var activeEffect = new Audio.ActiveEffect(effect);
	 * activeEffect.play();
	 * @constructs The default constructor. 	 
	 * @augments Core.Class
	 * @param {Audio.Effect} effect The <code>{@link Audio.Effect}</code> that this <code>ActiveEffect</code> object plays.
	 * @see Audio.Effect
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	initialize: function(effect)
	{
		this._volume  = 1.0;
		this._loops   = false;
		this._playing = false;
		this._paused  = false;

		this._playCompleteEmitter = new Core.MessageEmitter();

		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._setEffect(effect);
	},
	
	/**
	 * Destroy this instance and releases resources on the backend.
	 * <b>Note:</b> This call does not automatically destroy the associated <code>{@link Audio.Effect}</code>.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		this.stop();
		this._effect = null;
		this._playCompleteEmitter.destroy();
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},
	
	/**
	 * Return the volume level for the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * @returns {Number} The current volume level.
	 * @see Audio.ActiveEffect#setVolume
	 * @status iOS, Android, Flash, Test
	 * @since 1.0
	 */
	getVolume: function()
	{
		return this._volume;
	},
	
	/**
	 * Set the volume level for the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * Calling this changes the volume even if an application is in the middle of reproducing an <code>{@link Audio.Effect}</code> object.
	 * The new volume level applies to any subsequent reproductions of the <code>{@link Audio.Effect}</code> object.
	 * @example Audio.ActiveEffect.setVolume(0.5);
	 * @param {Number} [volume=1] The new volume level. Supported values range between <code>(0-1)</code>. 
	 * @returns {this}
	 * @see Audio.ActiveEffect#getVolume
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setVolume: function(volume)
	{
		if (volume < 0.0) volume = 0.0;
		if (volume > 1.0) volume = 1.0;

		this._volume = volume;
		this._setVolumeSendGen(volume);
		return this;
	},
	
	/**
	 * Return the loop status for the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * @returns {Boolean} Returns <code>true</code> if looping is enabled.
	 * @see Audio.ActiveEffect#setLoops
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLoops: function()
	{
		return this._loops;
	},
	
	/**
	 * Set the loop state for the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * A looped effect wraps seamlessly from begining to end.
	 * @example Audio.ActiveEffect.setLoops(true);
	 * @param {Boolean} loops Set as <code>true</code> to enable looping.
	 * @returns {this}
	 * @see Audio.ActiveEffect#getLoops
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLoops: function(loops)
	{
		this._loops = loops;
		this._setLoopsSendGen(loops);
		return this;
	},
	
	/**
	 * Retrieve the <code>PlayComplete</code> emitter for the <code>{@link Audio.Effect}</code> this
	 * <code>ActiveEffect</code> is reproducing. The <code>PlayComplete</code> emitter notifies
	 * its listeners when reproduction of an <code>{@link Audio.Effect}</code> is complete, passing
	 * the <code>ActiveEffect</code> object to the listener.
	 * <br /><br />
	 * <strong>Note</strong>: An <code>{@link Audio.Effect}</code> that loops will not trigger the
	 * <code>PlayComplete</code> emitter.
	 * @example
	 * var AudioSample = Core.MessageListener.subclass({
	 *     initialize: function() {
	 *         this._effect = new Audio.Effect("path/to/effect");
	 *         this._activeEffect = new Audio.ActiveEffect(this._effect);
	 *     },
	 *     
	 *     addListener: function() {
	 *         this._activeEffect.getPlayCompleteEmitter().
	 *           addListener(this, this.onComplete.bind(this));
	 *     },
	 *
	 *     onComplete: function(activeEffect) {
	 *         activeEffect.getPlayCompleteEmitter().removeListener(this);
	 *         activeEffect.destroy();
	 *         this._activeEffect = null;
	 *         console.log("Play completed");
	 *     }
	 * });
	 * @returns {Core.MessageEmitter} The current state of the <code>PlayComplete</code> emitter.
	 * @status iOS, Flash, Test, FlashTested
	 * @since 1.0
	 */
	getPlayCompleteEmitter: function()
	{
		return this._playCompleteEmitter;
	},
	
	/**
	 * Return the play status of the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * @returns {Boolean} Returns <code>true</code> if this <code>ActiveEffect</code> is reproducing an <code>{@link Audio.Effect}</code>.
	 * @see Audio.ActiveEffect#play
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsPlaying: function()
	{
		return this._playing;
	},
	
	/**
	 * Return the pause status of the <code>{@link Audio.Effect}</code> this <code>ActiveEffect</code> is reproducing.
	 * @returns {Boolean} Returns <code>true</code> if this <code>{@link Audio.Effect}</code> is in a paused state.
	 * @see Audio.ActiveEffect#pause
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsPaused: function()
	{
		return this._paused;
	},
	
	/**
	 * Begin reproducing an <code>{@link Audio.Effect}</code>.
	 * <ul>
	 * <li>If this <code>{@link Audio.Effect}</code> is new or in a stopped state,
	 * reproduction starts at the beginning.</li>
	 * <li>If this <code>{@link Audio.Effect}</code> is in a paused state, reproduction resumes from the previous position.</li>
	 * <li>If this <code>{@link Audio.Effect}</code> is playing, this call does nothing.</li>
	 * </ul>
	 * @see Audio.ActiveEffect#getIsPlaying
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	play: function()
	{
		this._playing = true;
		this._paused  = false;
		this._playSendGen( );
	},
	
	/**
	 * Pause reproduction of an <code>{@link Audio.Effect}</code>.
	 * <ul>
	 * <li>If this <code>ActiveEffect</code> is in the process of reproducing an <code>{@link Audio.Effect}</code>, this call pauses reproduction.</li>
	 * <li>If the <code>{@link Audio.Effect}</code> is in a stopped or paused state, this call does nothing.</li>
	 * </ul>
	 * <b>Note:</b> Calling this does not trigger the <code>Play Complete</code> emitter.
	 * @see Audio.ActiveEffect#getIsPaused
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	pause: function()
	{
		this._playing = false;
		this._paused  = true;
		this._pauseSendGen( );
	},
	
	/**
	 * Stop reprodution of an <code>{@link Audio.Effect}</code> object.
	 * <ul>
	 * <li>If this <code>ActiveEffect</code> is currently reproducing an <code>{@link Audio.Effect}</code> or the <code>{@link Audio.Effect}</code> is in a paused state, this call stops reproduction.</li>
	 * <li>If the <code>{@link Audio.Effect}</code> is in a stopped state, this call does nothing.</li>
	 * </ul>
	 * <b>Note:</b> Calling <code>stop()</code> does not trigger the <code>Play Complete</code> emitter.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	stop: function()
	{
		this._playing = false;
		this._paused  = false;
		this._stopSendGen( );
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 328,
	// Method create = -1
	// Method destroy = 2
	// Method setVolume = 3
	// Method setLoops = 4
	// Method play = 5
	// Method pause = 6
	// Method stop = 7
	// Method setEffect = 8
	// Method playComplete = 9
	
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
				
				case 9:
					instance._playCompleteRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in ActiveEffect._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in ActiveEffect._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[328] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_playCompleteRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in ActiveEffect.playComplete from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x148ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1480002, this );
	},
	
	/** @private */
	_setVolumeSendGen: function( volume )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1480003, this, [ +volume ] );
	},
	
	/** @private */
	_setLoopsSendGen: function( loops )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1480004, this, [ ( loops ? 1 : 0 ) ] );
	},
	
	/** @private */
	_playSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1480005, this );
	},
	
	/** @private */
	_pauseSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1480006, this );
	},
	
	/** @private */
	_stopSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1480007, this );
	},
	
	/** @private */
	_setEffectSendGen: function( effectId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1480008, this, [ +effectId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setVolume: function( volume ) {}
	
	// setLoops: function( loops ) {}
	
	// play: function(  ) {}
	
	// pause: function(  ) {}
	
	// stop: function(  ) {}
	
	// setEffect: function( effectId ) {}
	
	// _playCompleteRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


	,
	_setEffect: function(effect)
	{
		this._effect  = effect;
		this._setEffectSendGen(this._effect.__objectRegistryId);
		return this;
	},

	_playCompleteRecv: function( cmd )
	{
		var msg = {};
		if(!this._playCompleteRecvGen(cmd, msg))
			return;

		this._playing = false;
		this._paused  = false;

		this._playCompleteEmitter.emit(this);
	}
});
