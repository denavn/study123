var Core = require('../Core').Core;

exports.Music = Core.Class.singleton(
/** @lends Audio.Music.prototype */
{
	classname: 'Music',

	/**
	 * @class The <code>Music</code> class constructs a singleton object that provides control over reproduction
	 * of application background music.
	 * This object is constructed independently of <code>Device</code> objects because many devices
	 * already provide hardware-accelerated streaming and decode
	 * for a single background music track. Some
	 * devices gracefully mute a background music track
	 * if the user is playing a music track from their own library.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._path    = null;
		this._playing = false;
		this._paused  = false;
		this._volume  = 1.0;
		this._currentTimeCode = 0;
		this._stateChangeEmitter = new Core.MessageEmitter();
		this._timeCodeEmitter    = new this._TimeCodeEmitter();
		this._updateListener     = new this._TimeCodeListener(this._timeCodeEmitter);
		Core.UpdateEmitter.addListener(this._updateListener, this._updateListener.onUpdate);
	},

	destroy: function()
	{
		Core.UpdateEmitter.removeListener(this._updateListener);
		this._stateChangeEmitter.destroy();
		this._timeCodeEmitter.destroy();
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},

	/**
	 * Return the directory path to the background music track that the application is using.
	 * @returns {String} The directory path to a music track.
	 * @see Audio.Music#setPath
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPath: function()
	{
		return this._path;
	},
	
	/**
	 * Set the directory path for the background music track that the application is using.<br /><br />
	 * <b>Note:</b> If the application is reproducing music when this is called, reproduction will stop.
	 * The application must call <code>play()</code> again to start reproduction of the new resource.<br /><br />
	 * The code in the following example sets a directory path to a music resource and plays that resource.
	 * @example
	 * Audio.Music.setPath('Content/music.mp3');
	 * Audio.Music.play();
	 * @param {string} path The new directory path to a music track.
	 * @see Audio.Music#getPath
	 * @see Audio.Music#play
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setPath: function(path)
	{
		if(path == null)
		{
			throw new Error('Audio.Music setPath(): no path was provided');
		}

		this._path = path;
		this._setPathSendGen(path);
	},
	
	/**
	 * Return the volume level used for reproduction of the application's background music track.
	 * @returns {Number} The current volume level.
	 * @see Audio.Music#setVolume
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVolume: function()
	{
		return this._volume;
	},
	
	/**
	 * Set the volume level used for reproduction of the application's background music track.
	 * This call instantly modifies the background music volume level.
	 * Any subsequent reproductions of background music will play at the specified volume.
	 * @example Audio.Music.setVolume(0.5);
	 * @param {Number} [volume=1] The new volume. Supported values range between <code>(0-1)</code>.
	 * @returns {this}
	 * @see Audio.Music#getVolume
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
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
	 * Return the playback state of the background music track.
	 * @returns {Boolean} Returns <code>true</code> if an application is reproducing background music.
	 * @see Audio.Music#play
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsPlaying: function()
	{
		return this._playing;
	},
	
	/**
	 * Return the pause state of the background music track.
	 * @returns {Boolean} Returns <code>true</code> if an application is reproducing background music.
	 * @see Audio.Music#pause
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsPaused: function()
	{
		return this._paused;
	},
	
	/**
	 * Begin playback of the background music track.
	 * <ul>	
	 * <li>If the background music track has not yet been played, or the application has stopped the background music track, 
	 * this call begins reproduction from the beginning.</li>
	 * <li>If the background music track is in a paused state, this call resumes reproduction from the previous position.</li>
	 * <li>If the background music track is currently playing, this call does nothing.</li>
	 * </ul>
	 * @see Audio.Music#getIsPlaying
	 * @see Audio.Music#pause
	 * @see Audio.Music#stop
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
	 * Pause playback of the background music track.
	 * <ul>
	 * <li>If an application is currently playing the background music track, this call pauses playback.</li>
	 * <li>If the background music track is in a paused or stopped state, this call does nothing.</li>
	 * </ul>
	 * @see Audio.Music#getIsPaused
	 * @see Audio.Music#play
	 * @see Audio.Music#stop
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
	 * Stop playback of the background music track.
	 * <ul>
	 * <li>If the background music track is playing or in a paused state, this call stops playback.</li>
	 * <li>If the background music track is in a stopped state, this call does nothing.</li>
	 * </ul>
	 * @see Audio.Music#play
	 * @see Audio.Music#pause
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
	
	/**
	 * Indicate whether the background music track should be reproduced in a loop. By default,
	 * the background music track will loop until the application calls
	 * <code>{@link Audio.Music#pause}</code> or <code>{@link Audio.Music#stop}</code>.
	 * @param {Boolean} toLoop Set to <code>false</code> if the background music track should not be reproduced in a
	 *		loop.
	 * @returns {void}
	 * @see Audio.Music#pause
	 * @see Audio.Music#stop
	 * @since 1.6
	 */
	setLoop: function( toLoop )
	{
		this._setLoopSendGen(toLoop);
	},
	
	/**
	 * Retrieve the state change emitter for the background music track. The emitter's listeners
	 * will receive an enumerated value of <code>{@link Audio.Music#PlayState}</code> when the
	 * playback state changes.
	 * @returns {Core.MessageEmitter} The state change emitter for the background music track.
	 * @since 1.6
	 */
	getStateChangeEmitter: function()
	{
		return this._stateChangeEmitter;
	},

	/**
	 * Retrieve the time code emitter for the background music track. The emitter's listeners will
	 * receive the time code, in milliseconds, of the background music track.
	 * @returns {Core.MessageEmitter} The time code emitter for the background music track.
	 * @since 1.6
	 */
	getTimeCodeEmitter: function()
	{
		return this._timeCodeEmitter;
	},

	/**
	 * Retrieve the current time code (playback position) of the background music track.
	 * @returns {Number} The background music track's current time code, in milliseconds.
	 * @since 1.6
	 */
	getCurrentTimeCode: function()
	{
		return this._currentTimeCode;
	},
	
	
	/**
	 * Enumeration for the background music track's current playback state.
	 * @name PlayState
	 * @fieldOf Audio.Music#
	 * @since 1.6
	 */
	
	/**
	 * The music track is stopped.
	 * @name PlayState.Stop
	 * @fieldOf Audio.Music#
	 * @constant
	 * @since 1.6
	 */
	
	/**
	 * The music track is playing.
	 * @name PlayState.Play
	 * @fieldOf Audio.Music#
	 * @constant
	 * @since 1.6
	 */
	
	/**
	 * The music track is paused.
	 * @name PlayState.Pause
	 * @fieldOf Audio.Music#
	 * @constant
	 * @since 1.6
	 */
	

// {{?Wg Generated Code}}
	
	// Enums.
	PlayState:
	{ 
		Stop: 0,
		Play: 1,
		Pause: 2
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 329,
	// Method create = -1
	// Method destroy = 2
	// Method setPath = 3
	// Method setVolume = 4
	// Method play = 5
	// Method pause = 6
	// Method stop = 7
	// Method playComplete = 8
	// Method updatePlayState = 9
	// Method updateTimeCode = 10
	// Method setLoop = 11
	// Method _startTimeCodeUpdating = 12
	// Method _stopTimeCodeUpdating = 13
	
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
				
				case 8:
					instance._playCompleteRecv( cmd );
					break;
				case 9:
					instance._updatePlayStateRecv( cmd );
					break;
				case 10:
					instance._updateTimeCodeRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Music._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Music._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[329] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_playCompleteRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in Music.playComplete from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_updatePlayStateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Music.updatePlayState from command: " + cmd );
			return false;
		}
		
		obj[ "state" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "state" ] === undefined )
		{
			NgLogE("Could not parse state in Music.updatePlayState from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_updateTimeCodeRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Music.updateTimeCode from command: " + cmd );
			return false;
		}
		
		obj[ "elapsedMilliSecond" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "elapsedMilliSecond" ] === undefined )
		{
			NgLogE("Could not parse elapsedMilliSecond in Music.updateTimeCode from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x149ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1490002, this );
	},
	
	/** @private */
	_setPathSendGen: function( path )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1490003, this, [ Core.Proc.encodeString( path ) ] );
	},
	
	/** @private */
	_setVolumeSendGen: function( volume )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1490004, this, [ +volume ] );
	},
	
	/** @private */
	_playSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1490005, this );
	},
	
	/** @private */
	_pauseSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1490006, this );
	},
	
	/** @private */
	_stopSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1490007, this );
	},
	
	/** @private */
	_setLoopSendGen: function( toLoop )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x149000b, this, [ ( toLoop ? 1 : 0 ) ] );
	},
	
	/** @private */
	__startTimeCodeUpdatingSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x149000c, this );
	},
	
	/** @private */
	__stopTimeCodeUpdatingSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x149000d, this );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setPath: function( path ) {}
	
	// setVolume: function( volume ) {}
	
	// play: function(  ) {}
	
	// pause: function(  ) {}
	
	// stop: function(  ) {}
	
	// _playCompleteRecv: function( cmd ) {}
	// _updatePlayStateRecv: function( cmd ) {}
	// _updateTimeCodeRecv: function( cmd ) {}
	// setLoop: function( toLoop ) {}
	
	// _startTimeCodeUpdating: function(  ) {}
	
	// _stopTimeCodeUpdating: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


	,
	_playCompleteRecv: function( cmd )
	{
		var msg = {};
		if(!this._playCompleteRecvGen(cmd, msg))
			return;

		this._playing = false;
		this._paused  = false;
	},

	_updatePlayStateRecv: function( cmd )
	{
		if (this._stateChangeEmitter.getListenerCount() === 0)
			return;

		var msg = {};
		if(!this._updatePlayStateRecvGen(cmd, msg))
			return;

		this._stateChangeEmitter.emit(msg.state);
	},

	_updateTimeCodeRecv: function( cmd )
	{
		var msg = {};
		if(!this._updateTimeCodeRecvGen(cmd, msg))
			return;

		this._currentTimeCode = msg.elapsedMilliSecond;
	},

	_TimeCodeListener: Core.MessageListener.subclass({
		classname: '_TimeCodeListener',

        /**
         * @this _TimeCodeListener
         * @private
         */
		initialize: function(emitter)
		{
			this._emitter = emitter;
		},

        /**
         * @this _TimeCodeListener
         * @private
         */
		onUpdate: function()
		{
			var timeCode = exports.Music.getCurrentTimeCode();
			this._emitter.emit(timeCode);
		}
	}),

	_TimeCodeEmitter: Core.MessageEmitter.subclass({
		classname: '_timeCodeEmitter',

        /**
         * @this _timeCodeEmitter
         * @private
         */
		addListener: function($super, listener, func, priority) {
			if (this.getListenerCount() === 0)
				exports.Music.__startTimeCodeUpdatingSendGen();
			$super(listener, func, priority);
		},
        /**
         * @this _timeCodeEmitter
         * @private
         */
		removeListener: function($super, listener) {
			$super(listener);
			if (this.getListenerCount() === 0)
				exports.Music.__stopTimeCodeUpdatingSendGen();
		}
	})
});
