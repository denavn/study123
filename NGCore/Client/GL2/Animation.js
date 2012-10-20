var Core = require('../Core').Core;
var RenderTarget = require('./RenderTarget').RenderTarget;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var Animation = exports.Animation = Core.Class.subclass(
/** @lends GL2.Animation.prototype */
{
	classname: 'Animation',

	/**
	 * @class The `GL2.Animation` class creates animations that are composed of one or more
	 * `{@link GL2.Animation.Frame}` objects, which define the contents and duration of each
	 * animation frame. To play an animation, attach it to a `{@link GL2.Primitive}` or
	 * `{@link GL2.Sprite}` object.
	 *
	 * Most of the properties that control how an animation frame is displayed, such as the texture
	 * wrap mode and blending mode, are defined by the `GL2.Animation` object. All of the
	 * animation's frames will use the same setting for these properties.
	 * `{@link GL2.Animation.Frame}` objects define the properties that vary between individual
	 * frames in an animation, such as the frame's duration and the image that is displayed in a
	 * frame.
	 *
	 * Use the `{@link GL2.MotionController}` and `{@link GL2.MotionData}` classes for tween-based
	 * animations of a static texture using keyframes.
	 *
	 * **Note**: You can call `{@link GL2.Animation.setTextureColorDepth}` to control the bit depth
	 * of uncompressed, truecolor textures that are used in animations. The value you specify will
     * apply to all animations. You must call this method after the `{@link UI.GLView}` object has
     * been initialized and before any `GL2` textures have been created.
	 * @constructs Create an animation.
	 * @augments Core.Class
	 */
    initialize: function()
    {
		Core.ObjectRegistry.register(this);

        this._wrapMode = this.WrapMode.WrapNone;
        this._blendEnabled = true;
        this._blendMode = this.BlendMode.Alpha;
        this._filteringEnabled = true;
		this._loopingEnabled = true;
		this._totalDuration = 0;
		this._frames = [];

		this._createSendGen(this.__objectRegistryId);
    },

	/**
	 * Destroy the animation, and release the resources allocated by the animation.
	 *
	 * **Important**: Destroying an animation does not destroy the animation's frames.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},

	/**
	 * Retrieve the animation's texture wrap mode.
	 * @returns {GL2.Animation#WrapMode} The current texture wrap mode.
	 * @see GL2.Animation#setWrapMode
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getWrapMode: function()
	{
		return this._wrapMode;
	},

	/**
	 * Determine whether alpha blending is enabled for the animation.
	 * @returns {Boolean} Set to `true` if alpha blending is enabled.
	 * @see GL2.Animation#setBlendEnabled
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getBlendEnabled: function()
	{
		return this._blendEnabled;
	},

	/**
	 * Determine whether filtering is enabled for the animation.
	 * @returns {Boolean} Set to `true` if filtering is enabled.
	 * @see GL2.Animation#setFilteringEnabled
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */
	getFilteringEnabled: function()
	{
		return this._filteringEnabled;
	},

	/**
	 * Determine whether looping is enabled for the animation.
	 * @returns {Boolean} Set to `true` if looping is enabled.
	 * @see GL2.Animation#setLoopingEnabled
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLoopingEnabled: function()
	{
		return this._loopingEnabled;
	},

	/**
	 * Retrieve the animation's total duration, in milliseconds.
	 * @returns {Number} The animation's total duration, in milliseconds.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTotalDuration: function()
	{
		return this._totalDuration;
	},

	/**
	 * Retrieve the total number of frames in the animation.
	 * @returns {Number} The total number of frames.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFrameCount: function()
	{
		return this._frames.length;
	},

	/**
	 * Retrieve the animation frame at the specified index.
	 * @param {Number} index The index of the frame to retrieve.
	 * @returns {GL2.Animation.Frame} The animation frame at the specified index.
	 * @see GL2.Animation#setFrame
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFrame: function(index)
	{
		return this._frames[index];
	},

    /**
	 * Set the animation's texture wrap mode. The texture wrap mode controls whether textures will
	 * be wrapped on the U and V dimensions of each animation frame. By default, the texture wrap
	 * mode is set to `{@link GL2.Animation#WrapMode.WrapNone}`, which clamps the texture on the U
	 * and V dimensions.
	 * @example
	 * var animation = new GL2.Animation();
	 * animation.setWrapMode(GL2.Animation.WrapMode.WrapUV);
	 * @param {GL2.Animation#WrapMode} wrapMode The new texture wrap mode for the animation.
	 * @returns {this}
	 * @see GL2.Animation#getWrapMode
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setWrapMode: function(wrapMode)
	{
/*#if TYPECHECK
		var verifyWrapMode = function (i) {
			if (i !== Animation.WrapMode.WrapNone &&
				i !== Animation.WrapMode.WrapU &&
				i !== Animation.WrapMode.WrapV &&
				i !== Animation.WrapMode.WrapUV) {
				return 'not a valid WrapMode enum';
			}
		};
		T.validateArgs(arguments, [T.Arg('integer', verifyWrapMode)]);
#endif*/
		this._wrapMode = wrapMode;

		this._setWrapModeSendGen(wrapMode);

		return this;
	},

    /**
	 * Set whether alpha blending is enabled for the animation. Alpha blending is enabled by
	 * default.
	 *
	 * **Note**: If all of an animation's frames are opaque, disabling alpha blending can improve
	 * performance.
	 * @example
	 * var animation = new GL2.Animation();
	 * animation.setBlendEnabled(false);
	 * @param {Boolean} blendEnabled Set to `true` to enable alpha blending.
	 * @returns {this}
	 * @see GL2.Animation#getBlendEnabled
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setBlendEnabled: function(blendEnabled)
	{
		this._blendEnabled = blendEnabled;

		this._setBlendEnabledSendGen(blendEnabled);

		return this;
	},

	/**
	 * Set the animation's alpha blend mode. By default, the alpha blend mode is set to
	 * `{@link GL2.Animation#BlendMode.Alpha}`, which renders blended images differently based on
	 * the order in which they are drawn.
	 * @example
	 * var animation = new GL2.Animation();
	 * animation.setBlendMode(GL2.Animation.BlendMode.Add);
	 * @param {GL2.Animation#BlendMode} blendMode The new alpha blend mode for the animation.
	 * @see GL2.Animation#setBlendEnabled
	 * @returns {this}
	 * @status Android, Flash, AndroidTested
	 * @since 1.3.1b
	 */
	setBlendMode: function(blendMode)
	{
/*#if TYPECHECK
		var verifyBlendMode = function (i) {
			if (i !== Animation.BlendMode.Alpha &&
				i !== Animation.BlendMode.Add &&
				i !== Animation.BlendMode.Subtract) {
				return 'not a valid BlendMode enum';
			}
		};
		T.validateArgs(arguments, [T.Arg('integer', verifyBlendMode)]);
#endif*/
		this._blendMode = blendMode;

		this._setBlendModeSendGen(blendMode);

		return this;
	},

	getBlendMode: function()
	{
		return this._blendMode;
	},

    /**
	 * Set whether bilinear filtering is enabled for the animation, which improves the quality of
	 * each frame in the animation as the frame's image is scaled up or down. Bilinear filtering is
	 * enabled by default.
	 * @param {Boolean} filteringEnabled Set to `true` to enable bilinear filtering.
	 * @returns {this}
	 * @see GL2.Animation#getFilteringEnabled
	 * @status Flash
	 * @since 1.0
	 */
    setFilteringEnabled: function(filteringEnabled)
	{
		this._filteringEnabled = filteringEnabled;

		this._setFilteringEnabledSendGen(filteringEnabled);

		return this;
	},

    /**
	 * Set whether the animation will play in a loop. Looping is enabled by default.
	 * @param {Boolean} loopingEnabled Set as `true` to enable animation looping.
	 * @returns {this}
	 * @see GL2.Animation#getLoopingEnabled
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setLoopingEnabled: function(loopingEnabled)
	{
		this._loopingEnabled = loopingEnabled;

		this._setLoopingEnabledSendGen(loopingEnabled);

		return this;
	},

    /**
	 * Add a frame to the end of the animation. Calling this method is equivalent to calling
	 * `{@link GL2.Animation#spliceFrames}` in the following way:
	 *
	 *     animation.spliceFrames(animation.getFrameCount(), 0, frame);
	 * @example
	 * var animation = new GL2.Animation();
	 * var frame = new GL2.Animation.Frame("./Content/unicorn.png", 50,
	 *   new Core.Size(64, 64), new Core.Point(0.5, 0.5), new Core.Rect(0, 0, 0.5, 0.5));
	 * animation.pushFrame(frame);
	 * @param {GL2.Animation.Frame} frame The frame to add.
	 * @returns {this}
	 * @see GL2.Animation#setFrame
	 * @see GL2.Animation#spliceFrames
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    pushFrame: function(frame)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Animation.Frame)]);
#endif*/
		return this.spliceFrames(this._frames.length, 0, frame);
	},

    /**
	 * Replace the animation frame at a specified index. Calling this method is equivalent to
	 * calling `{@link GL2.Animation#spliceFrames}` in the following way:
	 *
	 *     animation.spliceFrames(i, 1, frame);
	 * @param {Number} i The index of the frame to replace.
	 * @param {GL2.Animation.Frame} frame The frame to insert.
	 * @returns {this}
	 * @see GL2.Animation#getFrame
	 * @see GL2.Animation#spliceFrames
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setFrame: function(i, frame)
	{
/*#if TYPECHECK
		var self = this;
		var verifyIndex = function (i) {
			if (i < 0 || i >= self._frames.length) {
				return 'index out of range';
			}
		};
		T.validateArgs(arguments, [T.Arg('integer', verifyIndex), T.Arg(Animation.Frame)]);
#endif*/
		return this.spliceFrames(i, 1, frame);
	},

    /**
	 * Remove a specified number of animation frames, and replace them with zero or more animation
	 * frames or render targets. You can pass any number of new frames and render targets to this
	 * method.
	 * @example
	 * // Create a new animation with four frames, then replace the third frame
	 * // with two new frames.
	 * var animation = new GL2.Animation();
	 *
	 * // The original images for the animation are contained in a sprite sheet
	 * // with four different sprites, arranged in a 2 x 2 grid.
	 * var frameSize = new Core.Size(64, 64);
	 * var anchor = new Core.Point(0.5, 0.5);
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/unicorn.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0, 0, 0.5, 0.5));
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/unicorn.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0.5, 0, 0.5, 0.5));
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/unicorn.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0, 0.5, 0.5, 0.5));
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/unicorn.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0.5, 0.5, 0.5, 0.5));
	 *
	 * // The new images are contained in a sprite sheet with two different sprites,
	 * // arranged horizontally.
	 * var newFrame1 = new GL2.Animation.Frame("./Content/shiny_unicorn.png", 50,
	 *   frameSize, anchor, new Core.Rect(0, 0, 0.5, 1));
	 * var newFrame2 = new GL2.Animation.Frame("./Content/shiny_unicorn.png", 50,
	 *   frameSize, anchor, new Core.Rect(0.5, 0, 0.5, 1));
	 *
	 * // Replace the third frame with the two new frames.
	 * animation.spliceFrames(2, 1, newFrame1, newFrame2);
	 * @example
	 * // Create a new animation with three frames, then remove the second frame.
	 * var animation = new GL2.Animation();
	 *
	 * // The images for the animation are contained in a sprite sheet with three
	 * // different sprites, arranged horizontally.
	 * var frameSize = new Core.Size(64, 64);
	 * var anchor = new Core.Point(0.5, 0.5);
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/monster.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0, 0, 0.333, 1));
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/monster.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0.333, 0, 0.333, 1));
	 * animation.pushFrame(new GL2.Animation.Frame("./Content/monster.png"), 50,
	 *   frameSize, anchor, new Core.Rect(0.666, 0, 0.333, 1));
	 *
	 * // Remove the second frame.
	 * animation.spliceFrames(1, 1);
	 * @param {Number} start The index of the first frame or render target to remove.
	 * @param {Number} len The total number of frames or render targets to remove.
	 * @param {GL2.Animation.Frame} [frames] The frame to insert.
	 *		To insert more than one frame, pass additional arguments to the method.
	 * @returns {this}
	 * @see GL2.Animation#pushFrame
	 * @see GL2.Animation#setFrame
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    spliceFrames: function(start, len, frames)
	{
/*#if TYPECHECK
		var self = this;
		var verifyArgs = function (args) {
			var index = args[0];
			var len = args[1];
			var frames = args.slice(2);
			var i;
			// i === length is ok. i.e. append at the end
			// negative indices are not supported
			if (index < 0 || index > self._frames.length) {
				return 'index out of range';
			}
			if (index + len > self._frames.length) {
				return 'index + len is larger then frames array';
			}
			for (i = 0; i < frames.length; i++) {
				if (!(frames[i] instanceof Animation.Frame)) {
					return 'frame ' + i + ' is not a valid Frame or RenderTarget';
				}
			}
		};
		T.validateArgs(arguments, [T.Arg('integer'), T.Arg('integer'), verifyArgs]);
#endif*/
		var i;
		var frameCount = arguments.length-2;
		var frame;

		// Determine if we should use the v2 version of the messsage, which supports renderTargets.
		// This is so that new javaScript that doesn't use renderTargets will still work with an old binary.
		var useV2 = false;
		for (i = 0; i < frameCount; ++i) {
			frame = arguments[i+2];
			if (frame && frame.getImage) {
				if (frame.getImage().classname === 'RenderTarget') {
					useV2 = true;
				}
			} else {
				return this;  // bad frame
			}
		}

		// Decrement from total duration.
		for (i=start; i < start + len; ++i) {
			this._totalDuration -= this._frames[i].getDuration();
		}

		this._frames.splice.apply(this._frames, arguments);

		if (useV2) {
			this._spliceFrames2SendGen(start, len, frameCount);
		} else {
			this._spliceFramesSendGen(start, len, frameCount);
		}

		for (i = 0; i < frameCount; ++i)
		{
			frame = arguments[i+2];
			var duration = frame.getDuration();
			var size = frame.getSize();
			var anchor = frame.getAnchor();
			var uvs = frame.getUVs();
			var uvOrigin = uvs.getOrigin();
			var uvSize = uvs.getSize();
			var image = frame.getImage();

			// if image is a renderTarget
			var renderTargetID = 0;
			if (image.classname === 'RenderTarget') {
				renderTargetID = image.__objectRegistryId;
				image = '';
			}

			if (useV2) {
				this._frame2SendGen(image,
									renderTargetID,
									duration,
									size.getWidth(),
									size.getHeight(),
									anchor.getX(),
									anchor.getY(),
									uvOrigin.getX(),
									uvOrigin.getY(),
									uvSize.getWidth(),
									uvSize.getHeight());
			} else {
				this._frameSendGen(image,
								   duration,
								   size.getWidth(),
								   size.getHeight(),
								   anchor.getX(),
								   anchor.getY(),
								   uvOrigin.getX(),
								   uvOrigin.getY(),
								   uvSize.getWidth(),
								   uvSize.getHeight());
			}
			this._totalDuration += duration;
		}

		return this;
	},

	/**
	 * Set the bit depth to use, in bits per pixel, for uncompressed, truecolor textures that are
	 * used in an animation. By default, each texture is drawn at its original bit depth.
	 *
	 * **Important**: You must call this static method after the `{@link UI.GLView}` object has been
	 * initialized and before any `GL2` textures have been created.
	 * @name GL2.Animation.setTextureColorDepth
	 * @function
	 * @static
	 * @example
	 * GL2.Animation.setTextureColorDepth(16);
	 * @param {Number} depth The bit depth to use, in bits per pixel, for uncompressed, truecolor
	 *		textures that are used in an animation. Use `16` to select 16bpp. Use `0` to draw the
	 *		texture at its original bit depth.
	 * @returns {void}
	 * @since 1.6
	 */

	$setTextureColorDepth: function(depth)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/
		this._setTextureColorDepthSendGen(depth);
	},

	$Frame: Core.Class.subclass(
	/** @lends GL2.Animation.Frame.prototype */
	{
		classname: 'Frame',

		/**
		 * @class `GL2.Animation.Frame` objects define the properties of an individual frame in an
		 * animation, including the frame's source image, duration, size, and anchor point. You can
		 * also use sprite sheets by specifying that the animation frame should display only a
		 * portion of the source image.
		 * @constructs Create an animation frame.
		 * @example
		 * // Create an animation frame that contains the bottom right image in a
		 * // 3 x 3 sprite sheet.
		 * var frame = new GL2.Animation.Frame("./Content/unicorn.png"), 50,
		 *   new Core.Size(64, 64), new Core.Point(0.5, 0.5),
		 *   new Core.Rect(0.666, 0.666, 0.333, 0.333));
		 * @param {String|GL2.RenderTarget} image The directory path to an image, or an instance of
		 *		`{@link GL2.RenderTarget}`. If this parameter contains the path to an image, the
		 *		image must be in PNG (.png) or JPEG (.jpg) format; its dimensions must be a power of
		 *		two; it must be square; and it must be referenced in the `textures` or
		 *		`textures_encrypted` section of your application's manifest.
		 * @param {Number} duration The duration of the frame, in milliseconds.
		 * @param {Core.Size} size The size of the frame, in pixels. The frame will be scaled based
		 *		on its parent nodes' transformations.
		 * @param {Core.Point} [anchor=[0.5, 0.5]] The offset within the frame that defines the
		 *		anchor point for scaling and rotation. See `{@link GL2.Animation.Frame#getAnchor}`
		 *		for details. If you omit this parameter, you must also omit the `uvs` parameter.
		 * @param {Core.Rect} [uvs=[0, 0, 1, 1]] The image region to use for the frame. Specified in
		 *		UV coordinates ranging from 0 to 1, which represent a percentage of the original
		 *		image's width and height. The four coordinates represent the U origin, the V origin,
		 *		the U width, and the V height, in that order.
		 * @see GL2.Animation
		 * @augments Core.Class
		 * @since 1.0
		 */
		initialize: function(image, duration, size, anchor, uvs)
		{
/*#if TYPECHECK
			T.validateArgs(arguments, [T.Or(T.Arg('string'), T.Arg(RenderTarget)),  // image
									   T.OptionalArg('number'), // duration
									   T.Or(T.OptionalArg(Core.Size), [T.Arg('number'), T.Arg('number')]),  // size
									   T.Or(T.OptionalArg(Core.Point), [T.Arg('number'), T.Arg('number')]),  // anchor
									   T.Or(T.OptionalArg(Core.Rect), [T.Arg('number'), T.Arg('number'), T.Arg('number'), T.Arg('number')])]);  // uvs
#endif*/
			this._image     = image;
			this._duration  = duration || 0;
			this._size   = new Core.Size(size);

			if(anchor)
				this._anchor = new Core.Point(anchor);
			else
				this._anchor = new Core.Point(0.5, 0.5);

			if(uvs)
				this._uvs = new Core.Rect(uvs);
			else
				this._uvs = new Core.Rect(0, 0, 1, 1);
		},

		/**
		 * Retrieve the image contained in the animation frame. The returned value will be either
		 * the path to an image or a `{@link GL2.RenderTarget}` object.
		 * @returns {String|GL2.RenderTarget} The path to the animation frame's image, or a
		 *		`{@link GL2.RenderTarget}` object.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getImage:    function()
		{
			return this._image;
		},

		/**
		 * Retrieve the duration of the animation frame, in milliseconds.
		 * @returns {Number} The duration of the frame, in milliseconds.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getDuration:  function()
		{
			return this._duration;
		},

		/**
		 * Retrieve the size of the animation frame, in pixels.
		 * @returns {Core.Size} The size of the frame, in pixels.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getSize:    function()
		{
			return this._size;
		},

		/**
		 * Retrieve the offset of the animation frame's anchor point. The anchor point defines the
		 * origin of any scaling or rotation that is applied to the frame. Its offset is defined as
		 * a multiple of the frame's width and height. For example, the default anchor offset,
		 * `[0.5, 0.5]`, represents a point that is centered on the U and V axes.
		 *
		 * **Note**: The anchor point is calculated before transformations are applied to the
		 * animation frame.
		 * @returns {Core.Point} The offset of the frame's anchor point.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getAnchor:  function()
		{
			return this._anchor;
		},

		/**
		 * Retrieve the image region, in UV coordinates, to use for the animation frame.
		 * @returns {Core.Rect} The image region for the frame.
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getUVs:    function()
		{
			return this._uvs;
		}
	}),

	/**
	 * Enumeration for UV wrapping modes.
	 * @name WrapMode
	 * @fieldOf GL2.Animation#
	 */

	/**
	 * Clamp in both U and V.
	 * @name WrapMode.WrapNone
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

	/**
	 * Wrap in U, clamp in V.
	 * @name WrapMode.WrapU
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

	/**
	 * Wrap in V, clamp in U.
	 * @name WrapMode.WrapV
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

	/**
	 * Wrap in both U and V.
	 * @name WrapMode.WrapUV
	 * @fieldOf GL2.Animation#
	 * @constant
	 */


	/**
	 * Enumeration for alpha blend modes.
	 * @name BlendMode
	 * @fieldOf GL2.Animation#
	 */

	/**
	 * Use the blending function `(SourceColor * SourceAlpha) + (DestinationColor * (1 -
	 * SourceAlpha))`. For example, if the source color has an alpha of 0.6, it will contribute 60%
	 * of the blended color, and the destination color will contribute 40% of the blended color.
	 * Blended images will be rendered differently based on the order in which they are drawn.
	 * @name BlendMode.Alpha
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

	/**
	 * Use the blending function `(SourceColor * SourceAlpha) + (DestinationColor * 1)`. The source
	 * color's red, green, and blue values are adjusted based on their alpha values, then added to
	 * the destination color's red, green, and blue values. Blended images will be rendered the same
	 * way regardless of the order in which they are drawn.
	 * @name BlendMode.Add
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

	/**
	 * Use the blending function `(DestinationColor * 1) - (SourceColor * SourceAlpha)`. The source
	 * color's red, green, and blue values are adjusted based on their alpha values, then subtracted
	 * from the destination color's red, green, and blue values. Blended images will be rendered
	 * differently based on the order in which they are drawn.
	 * @name BlendMode.Subtract
	 * @fieldOf GL2.Animation#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	WrapMode:
	{ 
		WrapNone: 0,
		WrapU: 1,
		WrapV: 2,
		WrapUV: 3
	},
	
	BlendMode:
	{ 
		Alpha: 1,
		Add: 2,
		Subtract: 3
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 306,
	// Method create = -1
	// Method destroy = 2
	// Method setWrapMode = 3
	// Method setBlendEnabled = 4
	// Method setLoopingEnabled = 5
	// Method spliceFrames = 6
	// Method frame = 7
	// Method setFilteringEnabled = 8
	// Method spliceFrames2 = 9
	// Method frame2 = 10
	// Method setBlendMode = 11
	// Method setTextureColorDepth = -12
	
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
					NgLogE("Unknown instance method id " + cmdId + " in Animation._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Animation._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[306] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x132ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1320002, this );
	},
	
	/** @private */
	_setWrapModeSendGen: function( wrapMode )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320003, this, [ +wrapMode ] );
	},
	
	/** @private */
	_setBlendEnabledSendGen: function( blendEnabled )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320004, this, [ ( blendEnabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setLoopingEnabledSendGen: function( loopingEnabled )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320005, this, [ ( loopingEnabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	_spliceFramesSendGen: function( start, len, frameCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320006, this, [ +start, +len, +frameCount ] );
	},
	
	/** @private */
	_frameSendGen: function( image, duration, width, height, anchorX, anchorY, startU, startV, sizeU, sizeV )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ Core.Proc.encodeString( image ), +duration, +width, +height, +anchorX, +anchorY, +startU, +startV, +sizeU, +sizeV ] );
	},
	
	/** @private */
	_setFilteringEnabledSendGen: function( filteringEnabled )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320008, this, [ ( filteringEnabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	_spliceFrames2SendGen: function( start, len, frameCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1320009, this, [ +start, +len, +frameCount ] );
	},
	
	/** @private */
	_frame2SendGen: function( image, renderTargetID, duration, width, height, anchorX, anchorY, startU, startV, sizeU, sizeV )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ Core.Proc.encodeString( image ), +renderTargetID, +duration, +width, +height, +anchorX, +anchorY, +startU, +startV, +sizeU, +sizeV ] );
	},
	
	/** @private */
	_setBlendModeSendGen: function( blendMode )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x132000b, this, [ +blendMode ] );
	},
	
	/** @private */
	$_setTextureColorDepthSendGen: function( depth )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x132fff4, [ +depth ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setWrapMode: function( wrapMode ) {}
	
	// setBlendEnabled: function( blendEnabled ) {}
	
	// setLoopingEnabled: function( loopingEnabled ) {}
	
	// spliceFrames: function( start, len, frameCount ) {}
	
	// frame: function( image, duration, width, height, anchorX, anchorY, startU, startV, sizeU, sizeV ) {}
	
	// setFilteringEnabled: function( filteringEnabled ) {}
	
	// spliceFrames2: function( start, len, frameCount ) {}
	
	// frame2: function( image, renderTargetID, duration, width, height, anchorX, anchorY, startU, startV, sizeU, sizeV ) {}
	
	// setBlendMode: function( blendMode ) {}
	
	// $setTextureColorDepth: function( depth ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
