var Core = require('../Core').Core;
var Device = require('./Device').Device;

exports.Effect = Core.Class.subclass(
/** @lends Audio.Effect.prototype */
{
	/**
	 * @class The <code>Effect</code> class constructs objects for handling audio resources that comprise an audio effect.
	 * Instantiating these objects allocates resources on the backend.
	 * After creating an <code>Effect</code> object, applications can control reproduction through an <code>{@link Audio.ActiveEffect}</code> object.
	 * <br /><br />
	 * No more than 255 <code>Effect</code> objects can be played simultaneously. Additional <code>Effect</code> objects can be created, but they will not be played.
	 * <br /><br />
	 * <strong>Important</strong>: The audio resource for the <code>Effect</code> object must be
	 * no larger than 1 MB. If your application attempts to play a larger file, it will result in an
	 * error during playback. Take the following steps to minimize the size of your application's
	 * audio resources:
	 * <ul>
	 * <li>Limit the bit rate of your audio resources.</li>
	 * <li>Where possible, use mono audio resources rather than stereo.</li>
	 * <li>Where possible, limit the duration of your audio resources.</li>
	 * </ul>
	 * @example
	 * var effect = new Audio.Effect('Content/explosion.wav');
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @param {String} path A directory path that points to the audio file to load.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	initialize: function(path)
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._setPath(path);

		Device.effectCreated(path);
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);

		Device.effectDestroyed();
	},
	
	/**
	 * Set a directory path to the audio file resource for this <code>Effect</code> object.
	 * @param {String} path The new directory path.
	 * @returns {this}
	 * @since 1.0
	 */
	_setPath: function(path)
	{
		this._path = path;
		this._setPathSendGen(path);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 326,
	// Method create = -1
	// Method destroy = 2
	// Method setPath = 3
	
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
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Effect._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Effect._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[326] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x146ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1460002, this );
	},
	
	/** @private */
	_setPathSendGen: function( path )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1460003, this, [ Core.Proc.encodeString( path ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setPath: function( path ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}



});
