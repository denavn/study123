var Node = require('./Node').Node;
var Animation = require('./Animation').Animation;
var Texture = require('./Texture').Texture;
var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var Primitive = exports.Primitive = Node.subclass(
/** @lends GL2.Primitive.prototype */
{
	classname: 'Primitive',

	/**
	 * @class The `GL2.Primitive` class provides the ability to draw arbitrary vertex-based polygons
	 * in two dimensions. Its APIs are similar to the `{@link GL2.Sprite}` class, which is used to
	 * display images and animations that are not warped or skewed.
	 *
	 * A primitive's vertexes are specified with `{@link GL2.Primitive.Vertex}` objects. Primitives
	 * can display solid colors, static images, or animations. Images and animations can be pinned
	 * to the primitive's vertexes. You can warp or skew an image by creating a primitive that
	 * represents the desired shape of the image, then pinning the image to the primitive's
	 * vertexes.
	 *
	 * By default, the primitive uses its vertexes to draw individual triangles; every group of
	 * three vertexes in the primitive represents a triangle. You can change this behavior by
	 * calling `{@link GL2.Primitive#setType}`.
	 *
	 * **Note**: Call `{@link Core.UpdateEmitter#setTickRate}` to set the frame rate for all
	 * animations that are attached to primitives.
	 * @constructs Create a primitive.
	 * @augments GL2.Node
	 */
    initialize: function()
    {
        this._animation = null;
		this._ownsAnimation = false;

		this._animationCompleteEmitter = new Core.MessageEmitter();
        this._type = this.Type.Triangles;
        this._vertexes = [];
    },

	/**
	 * Destroy the primitive, and release the resources allocated by the primitive.
	 *
	 * If the primitive is displaying a single image that was set by calling
	 * `{@link GL2.Primitive#setImage}`, calling `destroy()` will also destroy the reference to the
	 * image. If the primitive is displaying an animation that was set by calling
	 * `{@link GL2.Primitive#setAnimation}`, you must also call `{@link GL2.Animation#destroy}` to
	 * destroy the animation.
	 *
	 * **Important**: Destroying a primitive does not destroy the primitive's vertexes.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, FlashTested
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
	 * Retrieve the number of vertexes in the primitive.
	 * @returns {Number} The current number of vertexes.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVertexCount: function()
	{
		return this._vertexes.length;
	},

	/**
	 * Retrieve a single vertex from the primitive's vertexes.
	 * @param {Number} index The index of the vertex to retrieve.
	 * @returns {GL2.Primitive.Vertex} The current vertex at the specified index.
	 * @see GL2.Primitive#setVertex
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVertex: function(index)
	{
		return this._vertexes[index];
	},

	/**
	 * Determine the type of geometry that the primitive will render.
	 * @returns {GL2.Primitive#Type} The type of geometry that the primitive will render.
	 * @see GL2.Primitive#setType
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getType: function()
	{
		return this._type;
	},

	/**
	 * Retrieve the primitive's current animation. If the primitive is displaying a single image
	 * that was set by calling `{@link GL2.Primitive#setImage}`, or if no animation has been
	 * assigned to the primitive, this method will return `null`.
	 * @returns {GL2.Animation} The primitive's current animation, or `null` if no animation is
	 *		assigned to the primitive.
	 * @see GL2.Primitive#setAnimation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAnimation: function()
	{
		if(this._ownsAnimation) return null;

		return this._animation;
	},

	/**
	 * Retrieve the primitive's "animation complete" emitter. This emitter fires when the primitive
	 * has finished playing the last frame of a non-looping animation. If a listener is attached to
	 * the emitter, the primitive will be passed to the listener's callback function.
	 *
	 * **Note**: If the animation is interrupted before it finishes playing, the "animation
	 * complete" emitter will not fire.
	 * @example
	 * var Listener = Core.MessageListener.subclass({
	 *     initialize: function() {
	 *         this.animation = new GL2.Animation();
	 *         this.primitive = new GL2.Primitive();
	 *         this.primitive.setAnimation(animation);
	 *         this.primitive.getAnimationCompleteEmitter().
	 *           addListener(this, this.onComplete.bind(this));
	 *     },
	 *
	 *     onComplete: function(primitive) {
	 *         console.log("Animation complete.");
	 *     }
	 * });
	 *
	 * // Instantiate the object.
	 * var listener = new Listener();
	 * @returns {Core.MessageEmitter} The "animation complete" emitter.
	 * @see Core.MessageEmitter
	 * @see Core.MessageListener
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getAnimationCompleteEmitter: function()
	{
		return this._animationCompleteEmitter;
	},

	/**
	 * Set the animation to display in the primitive. The animation will start playing immediately,
	 * replacing any image or animation that was previously assigned to the primitive.
	 * @example
	 * var animation = new GL2.Animation();
	 * var primitive = new GL2.Primitive();
	 * primitive.setAnimation(animation);
	 * @param {GL2.Animation} animation The animation to display.
	 * @param {Number} [startTime=0] The time offset, in milliseconds, at which to start playing the
	 *		animation. For example, if an animation has ten frames, each of which is displayed for
	 *		50 milliseconds, and you specify the value `250`, playback will begin halfway through
	 *		the animation.
	 * @returns {void}
	 * @see GL2.Primitive#getAnimation
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
		this._setAnimationSendGen( Core.ObjectRegistry.objectToId(animation), startTime || 0 );
		if (ownedAnim)
			ownedAnim.destroy();
	},

    /**
	 * Set a single image to display in the primitive. The image will be displayed immediately,
	 * replacing any image or animation that was previously assigned to the primitive. If the image
	 * is not square, or if its width and height are not a power of two, the image will be stretched
	 * into a square with power-of-two dimensions.
	 * // Create a primitive that displays a single image, which is taken from the
	 * // top right corner of a 4 x 4 sprite sheet.
	 * var primitive = new GL2.Primitive();
	 * primitive.setImage("./Content/unicorn.png"), new Core.Size(64, 64),
	 *   new Core.Point(0.5, 0.5), new Core.Rect(0, 0, 0.5, 0.5));
	 * @param {String|GL2.Texture} image The directory path to an image or a `GL2.Texture` object.
	 * @param {Core.Size} size The size, in pixels, of the image to display,
	 * @param {Core.Point} [anchor=[0.5, 0.5]] The offset within the node that defines the
	 *		anchor point for scaling and rotation. The anchor point defines the origin of any
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

    /**
	 * Set the type of geometry that the primitive will render. See `{@link GL2.Primitive#Type}`
	 * for information about the types of geometry that are supported.
	 * @example
	 * var primitive = new GL2.Primitive();
	 * primitive.setType(GL2.Primitive.Type.TriangleFan);
	 * @param {GL2.Primitive#Type} type The type of geometry that the primitive will render.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setType: function(type)
	{
/*#if TYPECHECK
		var typeIsValid = function (i) {
			switch (i) {
			case Primitive.Type.Triangles:
			case Primitive.Type.TriangleStrip:
			case Primitive.Type.TriangleFan:
			case Primitive.Type.LineList:
				return;
			default:
				return '' + i + ' is not a valid GL2.Primitive.Type';
			}
		}
		T.validateArgs(arguments, [T.Arg('integer', typeIsValid)]);
#endif*/
		this._type = type;

		this._setTypeSendGen(type);

		return this;
	},

    /**
	 * Add a vertex to the end of the primitive's list of vertexes. Calling this method is
	 * equivalent to calling `{@link GL2.Primitive#spliceVertexes}` in the following way:
	 *
	 *     primitive.spliceVertexes(primitive.getVertexCount(), 0, vertex);
	 * @example
	 * var primitive = new GL2.Primitive();
	 * primitive.pushVertex(new GL2.Primitive.Vertex([0, 0], [0, 0], [0.3, 0.4, 0.5]));
     * @param {GL2.Primitive.Vertex} vertex The vertex to add.
     * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
     */
    pushVertex: function(vertex)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Primitive.Vertex)]);
#endif*/
		return this.spliceVertexes(this._vertexes.length, 0, vertex);
	},

    /**
	 * Replace the vertex at a specified index. Calling this method is equivalent to
	 * calling `{@link GL2.Primitive#spliceVertexes}` in the following way:
	 *
	 *     primitive.spliceVertexes(i, 1, vertex);
	 * @param {Number} i The index of the vertex to replace.
	 * @param {GL2.Primitive.Vertex} vertex The vertex to insert.
	 * @returns {this}
	 * @see GL2.Primitive#getVertex
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setVertex: function(i, vertex)
	{
/*#if TYPECHECK
		var self = this;
		var verifyIndex = function (index) {
			if (index < 0) {
				return 'index must be positive';
			} else if (index >= self._vertexes.length) {
				return 'index out of range';
			}
		};
		T.validateArgs(arguments, [T.Arg('integer', verifyIndex), T.Arg(Primitive.Vertex)]);
#endif*/
		return this.spliceVertexes(i, 1, vertex);
	},

    /**
	 * Remove a specified number of vertexes, and replace them with zero or more vertexes. You can
	 * pass any number of new vertexes to this method.
	 * @example
	 * // Create a square primitive with four vertexes, then turn the square into
	 * // an irregularly shaped polygon by replacing the third vertex.
	 * var widthHeight = 100;
	 * var color = [0.3, 0.4, 0.5];
	 * var primitive = new GL2.Primitive();
	 * primitive.setType(GL2.Primitive.Type.TriangleFan);
	 * primitive.pushVertex(new GL2.Primitive.Vertex([0, 0], [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([widthHeight, 0], [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([widthHeight, widthHeight],
	 *   [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([0, widthHeight], [0, 0], color));
	 *
	 * // Replace the third vertex.
	 * primitive.spliceVertexes(2, 1, new GL2.Primitive.Vertex([widthHeight + 10, -10],
	 *   [0, 0], color));
	 * @example
	 * // Create a square primitive with four vertexes, then turn the square into
	 * // a triangle by removing the second vertex.
	 * var widthHeight = 100;
	 * var color = [0.3, 0.4, 0.5];
	 * var primitive = new GL2.Primitive();
	 * primitive.setType(GL2.Primitive.Type.TriangleFan);
	 * primitive.pushVertex(new GL2.Primitive.Vertex([0, 0], [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([widthHeight, 0], [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([widthHeight, widthHeight],
	 *   [0, 0], color));
	 * primitive.pushVertex(new GL2.Primitive.Vertex([0, widthHeight], [0, 0], color));
	 *
	 * // Remove the second vertex.
	 * primitive.spliceVertexes(1, 1);
	 * @param {Number} start The index of the first vertex to remove.
	 * @param {Number} len The total number of vertexes to remove.
	 * @param {GL2.Primitive.Vertex} [vertex] The vertex to insert. To insert more than one vertex,
	 *		pass additional arguments to the method.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    spliceVertexes: function(start, len, vertexes)
	{
/*#if TYPECHECK
		var self = this;
		var verify = function (args) {
			var start = args[0];
			var len = args[1];
			if (start < 0) {
				return 'start must be positive';
			} else if (start > self._vertexes.length) {
				return 'start is past end of vertex array';
			}
			if (len < 0) {
				return 'len is negative';
			} else if ((start + len) > self._vertexes.length) {
				return 'start + len is past end of vertex array';
			}
			var v = args.slice(2);
			T.validate(v, T.ArgArray(Primitive.Vertex));
		};
		T.validateArgs(arguments, [T.Arg('integer'), T.Arg('integer'), verify]);
#endif*/

		this._vertexes.splice.apply(this._vertexes, arguments);

		var vertexCount = arguments.length-2;
		this._spliceVertexesSendGen(start,len,vertexCount);

		for(var i=0; i < vertexCount; ++i)
		{
			var vertex = arguments[i+2];
			var position = vertex.getPosition();
			var uv = vertex.getUV();
			var color = vertex.getColor();
			this._vertexSendGen(
				position.getX(),
				position.getY(),
				uv.getX(),
				uv.getY(),
				color.getRed(),
				color.getGreen(),
				color.getBlue()
			);
		}

		return this;
	},

	$Vertex: Core.Class.subclass(
	/** @lends GL2.Primitive.Vertex.prototype */
	{
		classname: 'Vertex',

		/**
		 * @class `GL2.Primitive.Vertex` objects specify the location, texture coordinates, and
		 * color of a vertex in a primitive.
		 *
		 * + The vertex's location is in pixel coordinates and is relative to its ancestors'
		 * position, scale, and rotation.
		 * + The texture coordinate indicates the UV coordinate in the primitive's image or
		 * animation that will be pinned to the vertex.
		 * + The color represents a fill color that will radiate out from the vertex into the
		 * primitive. If two vertexes have different colors, the fill colors will be faded into one
		 * another.
		 * @constructs Create a vertex for a primitive.
		 * @augments Core.Class
		 * @example
		 * // Create a vertex that contributes an orange fill to the primitive and
		 * // pins images and animations at their top left corner.
		 * var vertex = new GL2.Primitive.Vertex([200, 100], [0, 0], [1.0, 0.5, 0]);
		 * @param {Core.Point|Number[]} position The vertex's location, in pixel coordinates
		 *		relative to its ancestors' position, scale, and totation. Specified as a
		 *		`{@link Core.Point}` object or as two separate floats that represent the U and V
		 *		coordinates, in that order.
		 * @param {Core.Point|Number[]} uv The UV coordinates in the primitive's image or animation
		 *		that will be pinned to the vertex. Specified as a `{@link Core.Point}` object or as
		 *		two separate floats that represent the U and V coordinates, in that order; each
		 *		float can range from `0` to `1`.
		 * @param {Core.Color|Number[]} color The vertex's RGB color. Specified as a
		 *		`{@link Core.Color}` object or as three separate floats that represent the red,
		 *		green, and blue values of the color, in that order; each float can range from `0` to
		 *		`1`.
		 * @see GL2.Primitive
		 * @since 1.0
		 */
		initialize: function(position, uv, color)
		{
/*#if TYPECHECK
			T.validateArgs(arguments, [T.Or(T.OptionalArg(Core.Point), [T.Arg('number'), T.Arg('number')]),  // position
									   T.Or(T.OptionalArg(Core.Point), [T.Arg('number'), T.Arg('number')]),  // uv
									   T.Or(T.OptionalArg(Core.Color), [T.Arg('number'), T.Arg('number'), T.Arg('number')])]);  // color
#endif*/
			this._position = new Core.Point(position);
			this._uv = new Core.Point(uv);
			this._color = new Core.Color(color);
		},

		/**
		 * Retrieve the vertex's current location, measured in pixel coordinates that are relative
		 * to its ancestors' position, scale, and rotation.
		 * @returns {Core.Point} The vertex's current location, in pixel coordinates relative to its
		 *		ancestors' position, scale, and totation.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getPosition: function()
		{
			return this._position;
		},

		/**
		 * Retrieve the UV coordinates in the primitive's image or animation that will be pinned to
		 * the vertex.
		 * @returns {Core.Point} The current UV coordinates in the primitive's image or animation
		 *		that will be pinned to the vertex.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getUV: function()
		{
			return this._uv;
		},

		/**
		 * Retrieve the fill color that will radiate out from the vertex into the primitive.
		 * @returns {Core.Color} The current RGB color.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getColor: function()
		{
			return this._color;
		}
	}),

	_unhookOwnedAnimation: function()
	{
		var retVal = undefined;
		if(this._ownsAnimation)
		{
			// Set our animation to NULL to unlink ourselves from the animation on the backend
			// or else trying to destory the animation will fail because we are still using it.
			this._setAnimationSendGen(0,0);
			retVal = this._animation;
			this._animation = null;
			this._ownsAnimation = false;
		}
		this._animation = null;
		this._image = null;
		return retVal;
	},

	/**
	 * Enumeration for the types of geometry that a primitive can render.
	 * @name Type
	 * @fieldOf GL2.Primitive#
	 */

	/**
	 * Every group of three vertexes defines a separate triangle. The number of vertexes must be
	 * divisible by three.
	 *
	 * For example, if a primitive includes vertexes `[A, B, C, D, E, F]`, the following triangles
	 * will be drawn:
	 *
	 * + `ABC`
	 * + `DEF`
	 * @name Type.Triangles
	 * @fieldOf GL2.Primitive#
	 * @constant
	 */

	/**
	 * Every vertex defines a triangle that includes the previous two vertexes. Use this option to
	 * create a series of connected triangles. The primitive must have at least three vertexes.
	 *
	 * For example, if a primitive includes vertexes `[A, B, C, D, E, F]`, the following triangles
	 * will be drawn:
	 *
	 * + `ABC`
	 * + `BCD`
	 * + `CDE`
	 * + `DEF`
	 * @name Type.TriangleStrip
	 * @fieldOf GL2.Primitive#
	 * @constant
	 */

	/**
	 * Every vertex defines a triangle that includes the first vertex and the previous vertex. Use
	 * this option to create several triangles that form a polygon. The primitive must have at least
	 * three vertexes.
	 *
	 * For example, if a primitive includes vertexes `[A, B, C, D, E, F]`, the following triangles
	 * will be drawn:
	 *
	 * + `ABC`
	 * + `ACD`
	 * + `ADE`
	 * + `AEF`
	 * @name Type.TriangleFan
	 * @fieldOf GL2.Primitive#
	 * @constant
	 */

	/**
	 * Every pair of two vertexes defines a line segment. Each line segment is drawn with a width of
	 * one pixel. The number of vertexes must be divisible by two.
	 *
	 * For example, if a primitive includes vertexes `[A, B, C, D, E, F]`, the following line
	 * segments will be drawn:
	 *
	 * + `AB`
	 * + `CD`
	 * + `EF`
	 * @name Type.LineList
	 * @fieldOf GL2.Primitive#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Type:
	{ 
		Triangles: 0,
		TriangleStrip: 1,
		TriangleFan: 2,
		LineList: 3
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 308,
	// Method create = -1
	// Method spliceVertexes = 2
	// Method vertex = 3
	// Method setType = 4
	// Method setAnimation = 5
	// Method animationComplete = 6
	
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
				
				case 6:
					instance._animationCompleteRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Primitive._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Primitive._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[308] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_animationCompleteRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in Primitive.animationComplete from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x134ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_spliceVertexesSendGen: function( start, len, vertexCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1340002, this, [ +start, +len, +vertexCount ] );
	},
	
	/** @private */
	_vertexSendGen: function( x, y, u, v, red, green, blue )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ +x, +y, +u, +v, +red, +green, +blue ] );
	},
	
	/** @private */
	_setTypeSendGen: function( type )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1340004, this, [ +type ] );
	},
	
	/** @private */
	_setAnimationSendGen: function( animation, startTime )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1340005, this, [ +animation, +startTime ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// spliceVertexes: function( start, len, vertexCount ) {}
	
	// vertex: function( x, y, u, v, red, green, blue ) {}
	
	// setType: function( type ) {}
	
	// setAnimation: function( animation, startTime ) {}
	
	// _animationCompleteRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
