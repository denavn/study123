var Core = require ('../Core').Core;
var Node = require('./Node').Node;
var MotionData = require('./MotionData').MotionData;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var MotionController = exports.MotionController = Core.Class.subclass(
/** @lends GL2.MotionController.prototype */
{
    classname: 'MotionController',

    /**
     * @class
     * The `MotionController` class animates the motion of several `{@link GL2.Node}` objects using keyframe data that is stored in a `{@link GL2.MotionData}` object. You can use
     * the methods in this class in parallel with `{@link GL2.Animation}` or independently. The `{@link GL2.Animation}` class provides functionality to support flip-book style animation
     * for sprite sheets, while `MotionController` enables apps to animate a static texture around the screen.
     * Multiple `MotionController` objects can share a single `{@link GL2.MotionData}` object. Sharing a `{@link GL2.MotionData}` object
     * reduces total memory footprint for your app.
     * A single `MotionController` object can animate multiple nodes at once. This capability enables your app to animate multi-sprite characters as
     * single unit.
     *
     * **Note**: The `position` and `rotation` fields of an animated `{@link GL2.Node}` object do not reflect to the
     * underlying JavaScript by default. Synchronizing these fields has a high performance cost. Use the `MotionController.syncContinuous` or `MotionController.syncFrames`
     * methods when you need to update these fields.
     *
     * @constructs Create a `MotionController` object to manage animations.
     * @param {GL2.MotionData} MotionData A `{@link GL2.MotionData}` object that holds keyframe animation data.
     * @augments Core.Class
     * @since 1.7
     */
	initialize: function (motionData)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(MotionData)]);
#endif*/
		Core.ObjectRegistry.register(this);
		this._motionData = motionData;
		this._syncCallbacks = {};
		this._timeScale = 1.0;

		this._createSendGen(this.__objectRegistryId, motionData.__objectRegistryId);
	},

    /**
     * Destroy this `MotionController` object.
     * Any `{@link GL2.Node}` objects bound to this controller become unbound and stop animating.
     * @since 1.7
     */
	destroy: function ()
	{
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},

    /**
     * @function
     *
     * Bind a named animation to a `{@link GL2.Node}` object.
     * This function looks up the named animation in the `{@link GL2.MotionData}` object that is associated with this `MotionController` object.
     * This function animates the bound `{@link GL2.Node}` instance when this `MotionController` plays.
     * A specific named animation can be bound to a maximum of one `{@link GL2.Node}` object. You can call this method multiple times to
     * bind a single `{@link GL2.MotionController}` object to multiple named animations.
     * You can use a single `MotionController` object to animate a set of multiple `{@link GL2.Node}` objects.
     * You can use the optional `syncFlags` parameter to specify a set of fields to animate, such as `Position` and `Rotation` but not `Scale`. See the enums documentation for more
     * information about these fields.
     * The `syncFlags` parameter can be in two formats:
     *
     * + The result of a bitwise OR operation on several `syncFlags` values.
     * + An array of `syncFlags` values.
     *
     * This method has no effect when the animation is not found.
     * @example
     * md = new GL2.MotionData();
     * md.initFromJSONFile('Content/animations.json', GL2.MotionData.DataFormat.FlashClassicTween, function (error, md) {
     *  var mc, sprite, syncFlags;
     *  if (error) {
     *      console.log('error');
     *  } else {
     *      mc = new GL2.MotionController(md);
     *      sprite = new GL2.Sprite().setImage('Content/sprite.png', [100, 100], [0.5, 0.5]);
     *      // animate sprite position and scale ONLY.
     *      syncFlags = GL2.MotionController.SyncFlags.Position | GL2.MotionController.SyncFlags.Scale;
     *      mc.bind('sprite_anim_name', sprite, syncFlags);
     *      mc.play();
     *  }
     * });
     * @param {String} name The name of the animation to look up and bind.
     * @param {GL2.Node} node The <code>{@link GL2.Node}</code> object to bind to the named animation.
     * @param {Number | Array} [syncFlags=GL2.MotionController.SyncFlags.All] An array of <code>GL2.MotionController.syncFlags</code> values or the result of a
     * bitwise OR operation across several <code>GL2.MotionController.syncFlags</code> values.
     * @returns {this}
     * @since 1.7
     */
	bind: function (name, node, syncFlags)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string'), T.Arg(Node), T.Or(T.OptionalArg('integer'), T.OptionalArgArray('integer'))]);
#endif*/
		var flags, i;
		if (syncFlags instanceof Array) {
			flags = 0;
			for (i = 0; i < syncFlags.length; i++) {
				flags = flags | syncFlags[i];
			}
		} else if (typeof syncFlags === 'number') {
			flags = syncFlags;
		} else {
			flags = MotionController.SyncFlags.All;
		}
		delete this._syncCallbacks[name];
		this._bindSendGen(name, node.__objectRegistryId, flags);
		return this;
	},

    /**
     * @function
     *
     * Unbind a named animation from a `{@link GL2.Node}` object. The `{@link GL2.Node}` object stops receiving updates.
     * The animation continues to play and any other `{@link GL2.Node}` objects that are bound to the named animation
     * continue to receive updates.
     * @param {String} name The name of the animation to unbind from the <code>{@link GL2.Node}</code> object.
     * @returns {this}
     * @since 1.7
     */
	unbind: function (name)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string')]);
#endif*/
		delete this._syncCallbacks[name];
		this._unbindSendGen(name);
		return this;
	},

    /**
     * @function
     *
     * Play all animations currently bound to any `{@link GL2.Node}` object.
     * Animations begin playing from frame 0. Each bound `{@link GL2.Node}` object updates to follow the animations bound to that object.
     * @example
     * md = new GL2.MotionData();
     * md.initFromJSONFile('Content/animations.json', GL2.MotionData.DataFormat.FlashClassicTween, function (error, md) {
     *  var mc, sprite, syncFlags;
     *  if (error) {
     *      console.log('error');
     *  } else {
     *      mc = new GL2.MotionController(md);
     *      sprite = new GL2.Sprite().setImage('Content/sprite.png', [100, 100], [0.5, 0.5]);
     *      // animate sprite position and scale ONLY.
     *      syncFlags = GL2.MotionController.SyncFlags.Position | GL2.MotionController.SyncFlags.Scale;
     *      mc.bind('sprite_anim_name', sprite, syncFlags);
     *      mc.play(GL2.MotionController.PlayMode.Loop);
     *  }
     * });
     * @param {GL2.MotionController.PlayMode} [playMode=GL2.MotionController.PlayMode.Normal] The play mode for the animations.
     * @returns {this}
     * @since 1.7
     */
	play: function (playMode)
	{
/*#if TYPECHECK
		var verifyPlayMode = function (i) {
			if (i !== undefined && i !== MotionController.PlayMode.Normal &&
			    i !== MotionController.PlayMode.Loop) {
				return '' + i + ' is not a valid PlayMode';
			}
		};
		T.validateArgs(arguments, [T.OptionalArg('integer', verifyPlayMode)]);
#endif*/
		var mode = playMode || MotionController.PlayMode.Normal;
		this._playSendGen(mode);
		return this;
	},

    /**
     * @function
     *
     * Stop updating all currently bound animations.
     * @returns {this}
     * @since 1.7
     */
	stop: function ()
	{
		this._stopSendGen();
		return this;
	},

    /**
     * @function
     *
     * Updates the `{@link GL2.Node}` object bound to the named animation when the animation plays.
     * This method updates the fields requested by the `syncFlags` parameter for every animation frame that this `MotionController` object plays.
     * To minimize the performance effect of these updates, minimize the number of animations and the number of fields to update.
     * Use `syncFrames` to synchronize on specific animation frames.
     * The optional `syncFlags` parameter can be used to specify a set of fields to animate, such as `Position` and `Rotation` but not `Scale`.
     * The `syncFlags` parameter can be in two formats:
     *
     * + The result of a bitwise OR operation on several `syncFlags` values.
     * + An array of `syncFlag` values.
     *
     * @example
     * mc.syncContinuous('sprite_anim_name', GL2.MotionController.SyncFlags.Position);
     * @param {String} name The name of the animation bound to the Node that you wish to update.
     * @param {Number | Array} [syncFlags=GL2.MotionController.syncFlags.All] An array of <code>syncFlags</code> values, or the result of a bitwise OR operation across several <code>syncFlags</code> values.
     * @returns {this}
     * @since 1.7
     */
	syncContinuous: function (name, syncFlags)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string'), T.Or(T.OptionalArg('integer'), T.OptionalArgArray('integer'))]);
#endif*/
		var flags, i;
		if (syncFlags instanceof Array) {
			flags = 0;
			for (i = 0; i < syncFlags.length; i++) {
				flags = flags | syncFlags[i];
			}
		} else if (typeof syncFlags === 'number') {
			flags = syncFlags;
		} else {
			flags = MotionController.SyncFlags.All;
		}
		delete this._syncCallbacks[name];
		this._syncContinuousSendGen(name, flags);
		return this;
	},

    /**
     * @function
     *
     * Updates the `{@link GL2.Node}` object bound to the named animation when the animation plays.
     * This method updates the fields requested by the `syncFlags` parameter for each frame number passed in the `frameArray` parameter.
     * To minimize the performance effect of these updates, minimize the number of animations and the number of fields to update.
     * @param {String} name The name of the animation bound to the <code>{@link GL2.Node}</code> object to update.
     * @param {Array} frameArray Array of frame numbers. Negative frame numbers are relative to last keyframe. The last keyframe's number is -1.
     * @param {Number | Array} [syncFlags=GL2.MotionController.syncFlags.All] An array of <code>syncFlags values</code>, or the result of a bitwise OR operation across several <code>syncFlags</code> values.
     * @cb {Function} callback The function to call after creating the transaction.
     * @cb-param {GL2.MotionController} object This <code>MotionController</code> object.
     * @cb-param {Number} frame The frame this callback function is associated with.
     * @cb-returns {void}
     * @example
     * var sprite = new GL2.Sprite().setImage('Content/sprite.png', [100, 100], [0.5, 0.5]);
     * mc.bind('sprite_anim_name', sprite);
     * mc.syncFrames('sprite_anim_name', [0, -1], GL2.MotionController.SyncFlags.Position, function (mc, frame) {
     *  var x = sprite.getPosition().getX();
     *  var y = sprite.getPosition().getY();
     *  if (frame === 0) {
     *      console.log('On first frame, pos = (' + x + ', ' + y + ')');
     *  } if (frame === -1) {
     *      console.log('On last frame, pos = (' + x + ', ' + y + ')');
     *  }
     * });
     * @returns {this}
     * @since 1.7
     */
	syncFrames: function (name, frameArray, syncFlags, callback)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string'), T.NonEmptyArgArray('number'), T.Or(T.OptionalArg('integer'), T.OptionalArgArray('integer')), T.OptionalArg('function')]);
#endif*/
		if (!(frameArray instanceof Array)) {
			throw new Error("TypeError: Expected frameArray to be an Array");
		}

		var flags, i, hasCallback;
		if (syncFlags instanceof Array) {
			flags = 0;
			for (i = 0; i < syncFlags.length; i++) {
				flags = flags | syncFlags[i];
			}
		} else if (typeof syncFlags === 'number') {
			flags = syncFlags;
		} else {
			flags = MotionController.SyncFlags.All;
		}

		if (callback && typeof callback === 'function') {
			// register callback
			this._syncCallbacks[name] = callback;
			hasCallback = true;
		} else {
			delete this._syncCallbacks[name];
			hasCallback = false;
		}

		this._syncFramesSendGen(name, flags, hasCallback, frameArray.length);
		for (i = 0; i < frameArray.length; i++) {
			this._frameSendGen(frameArray[i]);
		}
		return this;
	},

    /**
     * @function
     *
     * Set the animation playback speed. If you call this method while an animation is playing, the speed of that animation changes.
     * @example
     * md = new GL2.MotionData();
     * md.initFromJSONFile('Content/animations.json', GL2.MotionData.DataFormat.FlashClassicTween, function (error, md) {
     *  var mc, sprite, syncFlags;
     *  if (error) {
     *      console.log('error');
     *  } else {
     *      mc = new GL2.MotionController(md);
     *      sprite = new GL2.Sprite().setImage('Content/sprite.png', [100, 100], [0.5, 0.5]);
     *      // animate sprite position and scale ONLY.
     *      syncFlags = GL2.MotionController.SyncFlags.Position | GL2.MotionController.SyncFlags.Scale;
     *      mc.bind('sprite_anim_name', sprite, syncFlags);
     *      mc.setTimeScale(0.5);
     *      mc.play(GL2.MotionController.PlayMode.Loop);
     *  }
     * });
     * @param {Number} timeScale The animation speed. Use a value of 1.0 to play the animation at normal speed. A value of 2.0 indicates double speed.
     * @returns {this}
     * @since 1.7
     */
	setTimeScale: function (timeScale)
	{
/*#if TYPECHECK
		var verifyTimeScale = function (n) {
			if (n <= 0) {
				return 'timeScale must be positive';
			}
		};
		T.validateArgs(arguments, [T.Arg('number', verifyTimeScale)]);
#endif*/
		this._setTimeScaleSendGen(timeScale);
		this._timeScale = timeScale;
		return this;
	},

    /**
     * @function
     *
     * Retrieve the current animation playback speed.
     * @returns {Number} timeScale The animation speed for the current animation.
     * @since 1.7
     */
	getTimeScale: function ()
	{
		return this._timeScale;
	},

	/**
	 * @private
	 */
	_invokeCallbackRecv: function(cmd)
	{
		var msg = {};
		if (!this._invokeCallbackRecvGen(cmd, msg)) {
			return;
		}

		var name = msg.name;
		if (!name) {
			NgLogE("GL2.MotionController._invokeCallbackRecv command : bad name = " + name);
			return;
		}
		var cb = this._syncCallbacks[name];
		if (!cb) {
			NgLogE("GL2.MotionController._invokeCallbackRecv command : No registered callback found, name = " + name);
			return;
		}
		cb(this, msg.frame);
	},

    /**
     * Enumerated values for `MotionController` objects.
     * @name SyncFlags
     * @fieldOf GL2.MotionController#
     */

    /**
     * No fields.
     * @name SyncFlags.None
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Position field.
     * @name SyncFlags.Position
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Rotation field.
     * @name SyncFlags.Rotation
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Scale field.
     * @name SyncFlags.Scale
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Alpha channel field.
     * @name SyncFlags.Alpha
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * All fields.
     * @name SyncFlags.All
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Enumerated values for `MotionController` objects.
     * @name PlayMode
     * @fieldOf GL2.MotionController#
     */

    /**
     * Stop the animation at the end.
     * @name PlayMode.Normal
     * @fieldOf GL2.MotionController#
     * @constant
     */

    /**
     * Repeat the animation at the end.
     * @name PlayMode.Loop
     * @fieldOf GL2.MotionController#
     * @constant
     */

// {{?Wg Generated Code}}
	
	// Enums.
	SyncFlags:
	{ 
		None: 0,
		Position: 1,
		Rotation: 2,
		Scale: 4,
		Alpha: 8,
		All: 15
	},
	
	PlayMode:
	{ 
		Normal: 0,
		Loop: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 363,
	// Method create = -1
	// Method destroy = 2
	// Method bind = 3
	// Method unbind = 4
	// Method syncContinuous = 5
	// Method syncFrames = 6
	// Method frame = 7
	// Method play = 8
	// Method stop = 9
	// Method invokeCallback = 10
	// Method setTimeScale = 11
	
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
				
				case 10:
					instance._invokeCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in MotionController._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in MotionController._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[363] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_invokeCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in MotionController.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "name" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "name" ] === undefined )
		{
			NgLogE("Could not parse name in MotionController.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "frame" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "frame" ] === undefined )
		{
			NgLogE("Could not parse frame in MotionController.invokeCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( id, motionDataId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16bffff, [ +id, +motionDataId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0002, this );
	},
	
	/** @private */
	_bindSendGen: function( name, nodeId, syncFlags )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0003, this, [ Core.Proc.encodeString( name ), +nodeId, +syncFlags ] );
	},
	
	/** @private */
	_unbindSendGen: function( name )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0004, this, [ Core.Proc.encodeString( name ) ] );
	},
	
	/** @private */
	_syncContinuousSendGen: function( name, syncFlags )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0005, this, [ Core.Proc.encodeString( name ), +syncFlags ] );
	},
	
	/** @private */
	_syncFramesSendGen: function( name, syncFlags, hasCallback, frameCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('any'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0006, this, [ Core.Proc.encodeString( name ), +syncFlags, ( hasCallback ? 1 : 0 ), +frameCount ] );
	},
	
	/** @private */
	_frameSendGen: function( frame )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ +frame ] );
	},
	
	/** @private */
	_playSendGen: function( playMode )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0008, this, [ +playMode ] );
	},
	
	/** @private */
	_stopSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x16b0009, this );
	},
	
	/** @private */
	_setTimeScaleSendGen: function( timeScale )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16b000b, this, [ +timeScale ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( id, motionDataId ) {}
	
	// destroy: function(  ) {}
	
	// bind: function( name, nodeId, syncFlags ) {}
	
	// unbind: function( name ) {}
	
	// syncContinuous: function( name, syncFlags ) {}
	
	// syncFrames: function( name, syncFlags, hasCallback, frameCount ) {}
	
	// frame: function( frame ) {}
	
	// play: function( playMode ) {}
	
	// stop: function(  ) {}
	
	// _invokeCallbackRecv: function( cmd ) {}
	// setTimeScale: function( timeScale ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
