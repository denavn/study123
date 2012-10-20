var Core = require('../Core').Core;
var Diagnostics = require('./Diagnostics').Diagnostics;

exports.Device = Core.Class.singleton(
/** @lends Audio.Device.prototype */
{
	classname: 'Device',

	/**
	 * @class The <code>Device</code> class constructs a singleton object that contains audio device properties.
	 * Applications can use <code>Device</code> objects to control global audio effects volume 
	 * and reproduce detached audio effects.
	 * @singleton
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @since 1.0
	 */
	 
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._volume = (Core.Capabilities.getPlatformOS().toLowerCase() == 'flash') ? 1.0 : undefined; // default value

		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		var initialValues = KeyValueCache.global("Audio.Device.InitialValues");

		var self = this;
		initialValues.getItem("effectsVolume", {}, function(error, value) {
			if (error) {
				NgLogW('Audio.Device: failed in getting device volume: ' + error);
				self._volume = 1.0; // fallback to 1.0
			} else
				self._volume = parseFloat(value);
		});

		/** @private */
		this.resetEffectsRequests = {};
		/** @private */
		this.cbIdCounter = 1;

		/** @private */
		this.effectCount = 0;
		this.effectList = [];
		Diagnostics.pushCollector(this.collectDeviceInfo.bind(this));
	},
	
	/**
	 * Return the global sound effects volume for this <code>Device</code> object.
	 * @returns {Number} The current global sound effects volume.
	 * @see Audio.Device#setEffectsVolume	 
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getEffectsVolume: function()
	{
		return this._volume;
	},
	
	/**
	 * Set the global sound effects volume for this <code>Device</code> object.
	 * Volume for each active effect multiplies
	 * by this value to produce a new volume level. 
	 * For example, if the global sound effects volume is set to 0.5, each active effect will play at half the volume set on the effect.
	 * @param {Number} [effectsVolume=1] The new volume for global sound effects. 
	 * Supported values range between <code>(0-1)</code>. 
	 * @example Audio.Device.setEffectsVolume(0.5);
	 * @returns {this}
	 * @see Audio.Device#getEffectsVolume
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setEffectsVolume: function(effectsVolume)
	{
		if (effectsVolume < 0.0) effectsVolume = 0.0;
		if (effectsVolume > 1.0) effectsVolume = 1.0;

		this._volume = effectsVolume;
		this._setEffectsVolumeSendGen(effectsVolume);
		return this;
	},
	
	/**
	 * Play an audio effect in a way that is completely detached from upstream or downstream processing.
	 * Using this call is a simple, high-level way to reproduce an audio effect.<br /><br />
	 * The specified audio effect is only reproduced once.
	 * There is no control over the effect volume or effect playback.
	 * Resource allocation automatically occurs on the backend when playback begins. Resources are automatically released when playback ends.	 
	 * The following code is an example of a <code>playDetached()</code> call.
	 * @example
	 * Audio.Device.playDetached('Content/explosion.wav');
	 * @param {String} path A relative directory path to the audio file.
	 * @returns {this}
	 * @deprecated Since version 1.7. This method will be removed in a future version of ngCore.
	 *		Calling this method can lead to poor performance on some Android devices.  Use the
	 *		{@link Audio.ActiveEffect} and {@link Audio.Effect} classes rather than this method.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	playDetached: function(path)
	{
		this._playDetachedSendGen( path );
		return this;
	},

	/**
	 * Reset all audio effects on a device running Android 2.3 or earlier. These versions of
	 * Android can load only 255 simultaneous effects. You must recreate all of the application's
	 * <code>ActiveEffect</code> objects after calling this method.
	 * <br /><br />
	 * On iOS, and on devices running later versions of Android, this method has no effect.
	 * <br /><br />
	 * <strong>Important</strong>: This method is synchronous, and calling this method can result in
	 * a noticeable delay in your application. Be sure to call the method at a time when the user
	 * will not notice the delay (for example, during a transition between levels).
	 * @name Audio.Device#resetEffects
	 * @function
	 * @returns {void}
	 * @status Android, Test, AndroidTested
	 * @since 1.7
	 */
	
	resetEffects: function( cb )
	{
		var cbId = 0;

		if (Core.Capabilities.getPlatformOS().toLowerCase() == 'android')
		{
			if (cb)
			{
				cbId = this.cbIdCounter++;
				this.resetEffectsRequests[ cbId ] = cb;
			}

			this._resetEffectsSendGen(cbId);
		}
		else if(typeof(cb) == 'function')
		{
			cb();
		}
		return this;
	},
	
	/**
	 * @private
	 */
	_resetEffectsCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._resetEffectsCbRecvGen(cmd, msg))
			return;

		var cbId = msg[ "callbackId" ];

		if ( !cbId )
		{
			//NgLogE ( "Audio Device command : No cbId" );
			return;
		}

		var cb = this.resetEffectsRequests[ cbId ];

		if ( !cb )
		{
			NgLogE ( "Audio Device command : No registered cb found..cbId is :" + cbId );
			return;
		}

		delete this.resetEffectsRequests[ cbId ];

		cb ( );
	},

	effectCreated: function(path)
	{
		this.effectCount++;
		this.effectList.push( path  );
	},

	effectDestroyed: function()
	{
		var index = this.effectList.indexOf(this._path);
		if(index >=0)
		{
			this.effectList.splice(index, 1);
		}
		this.effectCount--;
	},

	//Diagnostics collector
	collectDeviceInfo: function(type, interval)
	{
		var collectedInfo = { volume: this._volume };
		if(Diagnostics.includeDetails())
		{
			collectedInfo['effects'] = { count: this.effectCount, effectPaths: this.effectList };
		}
		else
		{
			collectedInfo['effects'] = { count: this.effectCount };
		}

		return collectedInfo;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 327,
	// Method create = -1
	// Method setEffectsVolume = 2
	// Method playDetached = 3
	// Method resetEffects = 4
	// Method resetEffectsCb = 5
	
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
				
				case 5:
					instance._resetEffectsCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Device._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Device._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[327] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_resetEffectsCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Device.resetEffectsCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Device.resetEffectsCb from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x147ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_setEffectsVolumeSendGen: function( effectsVolume )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1470002, this, [ +effectsVolume ] );
	},
	
	/** @private */
	_playDetachedSendGen: function( path )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1470003, this, [ Core.Proc.encodeString( path ) ] );
	},
	
	/** @private */
	_resetEffectsSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1470004, this, [ +callbackId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// setEffectsVolume: function( effectsVolume ) {}
	
	// playDetached: function( path ) {}
	
	// resetEffects: function( callbackId ) {}
	
	// _resetEffectsCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
