var Core = require('../Core').Core;
var Node = require('./Node').Node;
var Animation = require('./Animation').Animation;
var Texture = require('./Texture').Texture;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var Sprite = exports.Sprite = Node.subclass(
/** @lends GL2.Sprite.prototype */
{
	classname: 'Sprite',

	/**
	 * @class The `GL2.Sprite` class is used to display a sprite that contains a single image or an
	 * animation. Its APIs are similar to the `{@link GL2.Primitive}` class, which is used to draw
	 * vertex-based polygons.
	 *
	 * Sprites cannot warp or skew their images and animations. Use the `{@link GL2.Primitive}`
	 * class if you need to warp or skew an image or animation.
	 *
	 * **Note**: Call `{@link Core.UpdateEmitter#setTickRate}` to set the frame rate for all
	 * animations that are attached to sprites.
	 * @constructs Create a sprite.
	 * @augments GL2.Node
	 * @since 1.0
	 */
    initialize: function()
    {
		this._clubObject = null;
        this._animation = null;
		this._ownsAnimation = false;

		this._animationCompleteEmitter = new Core.MessageEmitter();
    },

	/**
	 * Destroy the sprite, and release the resources allocated by the sprite.
	 *
	 * If the sprite is displaying a single image that was set by calling
	 * `{@link GL2.Sprite#setImage}`, calling `destroy()` will also destroy the reference to the
	 * image. If the sprite is displaying an animation that was set by calling
	 * `{@link GL2.Sprite#setAnimation}`, you must also call `{@link GL2.Animation#destroy}` to
	 * destroy the animation.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		var ownedAnim = this._unhookOwnedAnimation();
		if (ownedAnim)
			ownedAnim.destroy();
		this._animationCompleteEmitter.destroy();
	},

	/**
	 * Retrieve the sprite's current animation. If the sprite is displaying a single image that was
	 * set by calling `{@link GL2.Sprite#setImage}`, or if no animation has been assigned to the
	 * sprite, this method will return `null`.
	 * @returns {GL2.Animation} The sprite's current animation, or `null` if no animation is
	 *		assigned to the sprite.
	 * @see GL2.Sprite#setAnimation
	 * @see GL2.Sprite#setImage
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAnimation: function()
	{
		if(this._ownsAnimation) return null;

		return this._animation;
	},

    /**
	 * Retrieve the sprite's "animation complete" emitter. This emitter fires when the sprite
	 * has finished playing the last frame of a non-looping animation. If a listener is attached to
	 * the emitter, the sprite will be passed to the listener's callback function.
	 *
	 * **Note**: If the animation is interrupted before it finishes playing, the "animation
	 * complete" emitter will not fire.
	 * @example
	 * var Listener = Core.MessageListener.subclass({
	 *     initialize: function() {
	 *         this.animation = new GL2.Animation();
	 *         this.sprite = new GL2.Sprite();
	 *         this.sprite.setAnimation(animation);
	 *         this.sprite.getAnimationCompleteEmitter().
	 *           addListener(this, this.onComplete.bind(this));
	 *     },
	 *
	 *     onComplete: function(sprite) {
	 *         console.log("Animation complete.");
	 *     }
	 * });
	 *
	 * // Instantiate the object.
	 * var listener = new Listener();
	 * @returns {Core.MessageEmitter} The "animation complete" emitter.
	 * @see Core.MessageEmitter
	 * @see Core.MessageListener
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAnimationCompleteEmitter: function()
	{
		return this._animationCompleteEmitter;
	},

    /**
	 * Set the animation to display in the sprite. The animation will start playing immediately,
	 * replacing any image or animation that was previously assigned to the sprite.
	 * @example
	 * var animation = new GL2.Animation();
	 * var sprite = new GL2.Sprite();
	 * sprite.setAnimation(animation);
	 * @param {GL2.Animation} animation The animation to display.
	 * @param {Number} [startTime=0] The time offset, in milliseconds, at which to start playing the
	 *		animation. For example, if an animation has ten frames, each of which is displayed for
	 *		50 milliseconds, and you specify the value `250`, playback will begin halfway through
	 *		the animation.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setAnimation: function(animation, startTime)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Animation), T.OptionalArg('number')]);
#endif*/
		var ownedAnim = this._unhookOwnedAnimation();
		this._animation = animation;
		this._setAnimationSendGen(Core.ObjectRegistry.objectToId(animation), startTime || 0);
		if (ownedAnim)
			ownedAnim.destroy();
		return this;
	},

    /**
	 * Set a single image to display in the sprite. The image will be displayed immediately,
	 * replacing any image or animation that was previously assigned to the sprite. If the image is
	 * not square, or if its width and height are not a power of two, the image will be stretched
	 * into a square with power-of-two dimensions.
	 * @example
	 * // Create a sprite that displays a single image, which is taken from the
	 * // top right corner of a 4 x 4 sprite sheet.
	 * var sprite = new GL2.Sprite();
	 * sprite.setImage("./Content/unicorn.png"), new Core.Size(64, 64),
	 *   new Core.Point(0.5, 0.5), new Core.Rect(0, 0, 0.5, 0.5));
	 * @param {String|GL2.Texture} image The directory path to an image or a `GL2.Texture` object.
	 * @param {Core.Size} size The size, in pixels, of the image to display,
	 * @param {Core.Point} [anchor=[0.5, 0.5]] 	The offset within the node that defines the
	 *		anchor point for scaling and rotation. 	The anchor point defines the origin of any
	 *		scaling or rotation that is applied to the node. Its offset is defined as a multiple of
	 *		the node's width and height. For example, the default anchor offset, `[0.5, 0.5]`,
	 *		represents a point that is centered on the U and V axes. If you omit this parameter, you
	 *		must also omit the `uvs` parameter.
	 * @param {Core.Rect} [uvs=[0, 0, 1, 1]] The region within the image to display. Specified in UV
	 *		coordinates ranging from 0 to 1, which represent a percentage of the original image's
	 *		width and height. The four coordinates represent the U origin, the V origin, the U
	 *		width, and the V height, in that order. By default, the entire image is displayed.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setImage: function(image, size, anchor, uvs)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Or(T.Arg('string'), T.Arg(Texture)),  // image
								   T.Or(T.OptionalArg(Core.Size), [T.Arg('number'), T.Arg('number')]),  // size
								   T.Or(T.OptionalArg(Core.Point), [T.Arg('number'), T.Arg('number')]),  // anchor
								   T.Or(T.OptionalArg(Core.Rect), [T.Arg('number'), T.Arg('number'), T.Arg('number'), T.Arg('number')])]);  // uvs
#endif*/
		var prevOwnedAnim = this._unhookOwnedAnimation();

		// Create a single frame animation.
		var args = Array.prototype.slice.call(arguments, 0);
        // replace Texture with filename
        if (image.classname === "Texture")
        {
            args[0] = image.getFilename();
        }
		args.splice(1, 0, 0); // Insert a duration of zero into our arguments.
		var frame = new Animation.Frame(args[0], args[1], args[2], args[3], args[4]);
		var animation = new Animation();
		animation.pushFrame(frame);

		this._animation = animation;
		this._ownsAnimation = true;

		this._setAnimationSendGen(Core.ObjectRegistry.objectToId(animation),0);

		if (prevOwnedAnim)
			prevOwnedAnim.destroy();

		return this;
	},

	_unhookOwnedAnimation: function()
	{
		var retVal = undefined;
		if(this._ownsAnimation)
		{
			// Set our animation to NULL to unlink ourselves from the animation on the backend
			// or else trying to destroy the animation will fail because we are still using it.
			this._setAnimationSendGen(0,0);
			retVal = this._animation;
			this._animation = null;
			this._ownsAnimation = false;
		}
		this._animation = null;
		return retVal;
	},

	_animationCompleteRecv: function(cmd)
	{
		var msg = {};
		if(!this._animationCompleteRecvGen(cmd, msg))
			return;

		this._animationCompleteEmitter.emit(this);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 310,
	// Method create = -1
	// Method setAnimation = 2
	// Method animationComplete = 3
	
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
					instance._animationCompleteRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Sprite._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Sprite._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[310] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_animationCompleteRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in Sprite.animationComplete from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x136ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_setAnimationSendGen: function( animation, startTime )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1360002, this, [ +animation, +startTime ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// setAnimation: function( animation, startTime ) {}
	
	// _animationCompleteRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
