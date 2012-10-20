var Core = require('../Core').Core;
var Node = require('./Node').Node;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var RenderTarget = exports.RenderTarget = Core.Class.subclass(
	/** @lends GL2.RenderTarget.prototype */
{
	classname: 'RenderTarget',

	/**
	 * @class The `GL2.RenderTarget` class renders multiple `GL2` objects into a single render
	 * target. This target can be attached to a `{@link GL2.Animation.Frame}` object and displayed
	 * as part of an animation. The render target can also be saved to a file.
	 * @constructs Create a render target.
	 * @example
	 * // Create a square, opaque render target.
	 * var renderTarget = new GL2.RenderTarget(256, 256, true);
	 * @param {Number} width The width of the render target. Must be a power of two.
	 * @param {Number} height The height of the render target. Must be a power of two.
	 * @param {Boolean} [isOpaque=false] Set to `true` to omit the alpha channel from the render
	 *		target.
	 * @since 1.3.1b
	 */
	initialize: function (width, height, isOpaque) {
/*#if TYPECHECK
		var powerOfTwoRoundDown = function (n) {
			var i;
			for (i = 0; i < 32; i++) {
				if (n < (1 << i))
					return (1 << (i-1));
			}
		};
		var verifySize = function (n) {
			var i;
			if (n > 2048)
				return '' + n + ' is too large';
			else if (powerOfTwoRoundDown(n) !== n)
				return '' + n + ' is not a power of two';
		};
		// don't bother checking isOpaque it could be anything.
		T.validateArgs(arguments, [T.Arg('integer', verifySize), T.Arg('integer', verifySize)]);
#endif*/
		Core.ObjectRegistry.register(this);
		this._children = [];
		this._width = width;
		this._height = height;
		this._isOpaque = isOpaque ? true : false;
		this._createSendGen(this.__objectRegistryId, width, height, this._isOpaque);
		this._callbackIndexCounter = 1;
		this._callbacks = [];
	},

	/**
	 * Destroy the render target, and release the resources allocated by the render target.
	 * @returns {void}
	 * @since 1.3.1b
	 */
	destroy: function () {
		var children = this._children;
		while (children.length) {
			this.removeChild(children[0]);
		}
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},

	/**
	 * Add a child node to the render target.
	 *
	 * If the render target is being displayed in an animation, and the application has called
	 * `{@link GL2.RenderTarget#setAutoUpdate}` to enable automatic updates, the child node will be
	 * drawn in the next frame of the animation. In all other cases, the child node will not be
	 * drawn in the render target until the application calls `{@link GL2.RenderTarget#update}`.
	 * @example
	 * var renderTarget = new GL2.RenderTarget(1024, 256);
	 * var childNode = new GL2.Node();
	 * renderTarget.addChild(childNode);
	 * @param {Object} child The child node to add. The object must inherit from `{@link GL2.Node}`.
	 * @returns {this}
	 * @since 1.3.1b
	 */
	addChild: function (child) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		this._children.push(child);
		child._didAddToParent(this);
		this._addChildSendGen(Core.ObjectRegistry.objectToId(child));
		return this;
	},

	/**
	 * Remove a child node from the render target. When the render target is redrawn, the child node
	 * will not be drawn.
	 *
	 * If the render target is being displayed in an animation, and the application has called
	 * `{@link GL2.RenderTarget#setAutoUpdate}` to enable automatic updates, the child node will not
	 * be drawn in the next frame of the animation. In all other cases, the child node will continue
	 * to be shown in the render target until the application calls
	 * `{@link GL2.RenderTarget#update}`.
	 * @example
	 * var renderTarget = new GL2.RenderTarget(256, 512);
	 * var childNode = new GL2.Node();
	 * renderTarget.addChild(childNode);
	 * // When the application no longer needs to include the child node in the
	 * // render target:
	 * renderTarget.removeChild(childNode);
	 * @param {Object} child The child node to remove. The object must inherit from
	 *		`{@link GL2.Node}`.
	 * @returns {this}
	 * @since 1.3.1b
	 */
	removeChild: function (child) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		child._willRemoveFromParent();
		var index = this._children.indexOf(child);
		if (index === -1)
			throw new Error('removeChild called for a node that is not a child');
		this._children.splice(index, 1);
		this._removeChildSendGen(Core.ObjectRegistry.objectToId(child));
		return this;
	},

	/**
	 * Redraw the render target.
	 *
	 * Call this method after you make changes to the render target's child nodes. **Note**: If the
	 * render target is being displayed in an animation, and the application has called
	 * `{@link GL2.RenderTarget#setAutoUpdate}` to enable automatic updates, you do not need to call
	 * this method after changing the render target's child nodes.
	 *
	 * Also, call this method after the application has been suspended and resumed. **Note**: If the
	 * application has called `{@link GL2.RenderTarget#setBackingStoreEnable}` to enable the backing
	 * store, you do not need to call this method after the application resumes.
	 * @returns {this}
	 * @see GL2.RenderTarget#setAutoUpdate
	 * @since 1.3.1b
	 */
	update: function () {
		this._updateSendGen();
		return this;
	},

	/**
	 * Specify whether to automatically redraw the render target during every frame of an animation.
	 * Setting this option to `true` is equivalent to calling `{@link GL2.RenderTarget#update}`
	 * for every frame of an animation. If you set this option to `false`, or if the render target
	 * is not being displayed in an animation, you must call `{@link GL2.RenderTarget#update}` to
	 * redraw the render target.
	 * @param {Boolean} [autoUpdateEnable=true] Set to `true` to redraw the render target during
	 *		every frame of an animation.
	 * @returns {this}
	 * @see GL2.RenderTarget#update
	 * @since 1.3.1b
	 */
	setAutoUpdate: function (autoUpdateEnable) {
		var enable = (autoUpdateEnable || (autoUpdateEnable === undefined)) ? true : false;
		this._setAutoUpdateSendGen(enable);
		return this;
	},

	/**
	 * Specify whether the render target should be cleared before its child nodes are redrawn. By
	 * default, the render target is not cleared.
	 * @param {Boolean} [clearEnabled=true] Set to `true` to clear the render target before its
	 *		child nodes are redrawn.
	 * @returns {this}
	 * @since 1.3.1b
	 */
	setClearEnable : function (clearEnable) {
		var enable = (clearEnable || (clearEnable === undefined)) ? true : false;
		this._setClearEnableSendGen(enable);
		return this;
	},

	/**
	 * Set the render target's background color by using a `{@link Core.Color}` object. By default,
	 * the render target uses a white background. If the render target has an alpha channel, you can
	 * call `{@link GL2.RenderTarget#setClearColorAlpha}` to change the opacity of the background
	 * color.
	 * @example
	 * // Create a render target with a blue background.
	 * var renderTarget = new GL2.RenderTarget(64, 256);
	 * renderTarget.setClearColor(new Core.Color(0.3, 0.4, 0.5));
	 * @param {Core.Color} color The background color for the render target.
	 * @returns {this}
	 * @since 1.3.1b
	 */
	setClearColor : function () {
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Color)], [T.Arg('number'), T.Arg('number'), T.Arg('number')]));
#endif*/
		var r, g, b, color;
		if (arguments.length === 1)
		{
			color = arguments[0];
			r = color.getRed();
			g = color.getGreen();
			b = color.getBlue();
		}
		else
		{
			r = arguments[0];
			g = arguments[1];
			b = arguments[2];
		}
		this._setClearColorSendGen(r, g, b);
		return this;
	},

	/**
	 * Set the render target's background color by specifying red, green, and blue values. By
	 * default, the render target uses a white background. If the render target has an alpha
	 * channel, you can call `{@link GL2.RenderTarget#setClearColorAlpha}` to set the opacity of the
	 * background color.
	 *
	 * Each parameter to this method is a float ranging from 0 to 1. To convert from an RGB color
	 * that is specified with values ranging from 0 to 255, simply divide each component's value by
	 * 255.
	 * @name GL2.RenderTarget#setClearColor^2
	 * @function
	 * @example
	 * // Create a render target with a blue background.
	 * var renderTarget = new GL2.RenderTarget(512, 256);
	 * renderTarget.setClearColor(0.3, 0.4, 0.5);
	 * @param {Number} red The red component of the background color, ranging from 0 to 1.
	 * @param {Number} green The green component of the background color, ranging from 0 to 1.
	 * @param {Number} blue Blue The blue component of the background color, ranging from 0 to 1.
	 * @returns {this}
	 * @since 1.3.1b
	 */

	/**
	 * Set the opacity of the render target's background color. By default, the render target is
	 * completely opaque.
	 * @param {Number} alpha The opacity of the render target's background color, ranging from 0
	 *		(fully transparent) to 1 (fully opaque).
	 * @returns {this}
	 * @since 1.3.1b
	 */
	setClearColorAlpha : function (alpha) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('number')]);
#endif*/
		this._setClearColorAlphaSendGen(alpha);
		return this;
	},

	/**
	 * Save the render target's current visual state to the device's file system.
	 *
	 * To save the file in PNG format, specify a filename with the extension .png. To save the file
	 * in JPEG format, specify a filename with the extension .jpg.
	 * @example
	 * // Save a render target's current visual state to a PNG file. Clip the
	 * // image to a 128-pixel square that is centered on the render target.
	 * var renderTarget = new GL2.RenderTarget(256, 256);
	 * var rect = new Core.Rect(64, 64, 128, 128);
	 * renderTarget.save("render-target.png", rect, function(filename) {
	 *     console.log("Saved the render target as " + filename);
	 * });
	 * @param {String} filename The filename to use for the image. To save the file in PNG format,
	 * 		specify a filename with the extension .png. To save the file in JPEG format, specify a
	 *		filename with the extension .jpg.
	 * @param {Core.Rect} rect The rectangle that will be used to clip the render target. To output
	 *		the entire render target, set this parameter to `null`.
	 * @cb {Function} [callback] The function to call after saving the image.
	 * @cb-param {String} filename The filename that was used for the image.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.3.1b
	 */
	save : function (filename, rect, callback) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string'), T.Arg(Core.Rect), T.OptionalArg('function')]);
#endif*/
		var id = 0;
		if (callback) {
			id = this._callbackIndexCounter++;
			this._callbacks[id] = callback;
		}
		var x = rect ? rect.getOrigin().getX() : -1;
		var y = rect ? rect.getOrigin().getY() : -1;
		var w = rect ? rect.getSize().getWidth() : -1;
		var h = rect ? rect.getSize().getHeight() : -1;
		this._saveSendGen(id, filename, x, y, w, h);
	},

	/**
	 * @private
	 */
	_invokeCallbackRecv: function (cmd)	{
		var msg = {};
		if (!this._invokeCallbackRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;
		var err = msg.error;
		if (!id) {
			NgLogE("invokeCallbackRecv command : bad id = " + id);
			return;
		}
		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("invokeCallbackRecv command : No registered callback found, id = " + id);
			return;
		}
		delete this._callbacks[id];
		cb(err);
	},

	/**
	 * Specify whether to enable the render target's backing store. By default, the backing store is
	 * disabled.
	 *
	 * The backing store ensures that the render target will be drawn correctly after the
	 * application is suspended and resumed. If the backing store is not enabled, your application
	 * must call `{@link GL2.RenderTarget#update}` after the application resumes.
	 * @param {Boolean} [backingStoreEnable=true] Set to `true` to enable the backing store.
	 * @returns {this}
	 * @since 1.3.1b
	 */
	setBackingStoreEnable: function (backingStoreEnable) {
		var enable = (backingStoreEnable || (backingStoreEnable === undefined)) ? true : false;
		this._setBackingStoreEnableSendGen(enable);
		return this;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 353,
	// Method create = -1
	// Method destroy = 2
	// Method addChild = 3
	// Method removeChild = 4
	// Method update = 5
	// Method setAutoUpdate = 6
	// Method setClearEnable = 7
	// Method setClearColor = 8
	// Method setClearColorAlpha = 9
	// Method save = 10
	// Method invokeCallback = 11
	// Method setBackingStoreEnable = 12
	
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
				
				case 11:
					instance._invokeCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in RenderTarget._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in RenderTarget._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[353] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_invokeCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in RenderTarget.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in RenderTarget.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in RenderTarget.invokeCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( objectRegistryId, width, height, isOpaque )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x161ffff, [ +objectRegistryId, +width, +height, ( isOpaque ? 1 : 0 ) ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1610002, this );
	},
	
	/** @private */
	_addChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610003, this, [ +child ] );
	},
	
	/** @private */
	_removeChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610004, this, [ +child ] );
	},
	
	/** @private */
	_updateSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1610005, this );
	},
	
	/** @private */
	_setAutoUpdateSendGen: function( autoUpdateEnable )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610006, this, [ ( autoUpdateEnable ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setClearEnableSendGen: function( clearEnable )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610007, this, [ ( clearEnable ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setClearColorSendGen: function( r, g, b )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610008, this, [ +r, +g, +b ] );
	},
	
	/** @private */
	_setClearColorAlphaSendGen: function( a )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1610009, this, [ +a ] );
	},
	
	/** @private */
	_saveSendGen: function( callbackId, filename, originX, originY, width, height )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x161000a, this, [ +callbackId, Core.Proc.encodeString( filename ), +originX, +originY, +width, +height ] );
	},
	
	/** @private */
	_setBackingStoreEnableSendGen: function( backingStoreEnable )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x161000c, this, [ ( backingStoreEnable ? 1 : 0 ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( objectRegistryId, width, height, isOpaque ) {}
	
	// destroy: function(  ) {}
	
	// addChild: function( child ) {}
	
	// removeChild: function( child ) {}
	
	// update: function(  ) {}
	
	// setAutoUpdate: function( autoUpdateEnable ) {}
	
	// setClearEnable: function( clearEnable ) {}
	
	// setClearColor: function( r, g, b ) {}
	
	// setClearColorAlpha: function( a ) {}
	
	// save: function( callbackId, filename, originX, originY, width, height ) {}
	
	// _invokeCallbackRecv: function( cmd ) {}
	// setBackingStoreEnable: function( backingStoreEnable ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
