var Node = require('./Node').Node;
var Sprite = require('./Sprite').Sprite;
var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var TouchTarget = exports.TouchTarget = Node.subclass(
/** @lends GL2.TouchTarget.prototype */
{
	classname: 'TouchTarget',

	/**
	 * @class The `GL2.TouchTarget` class provides applications with access to touch events.
	 *
	 * **Note**: Do not use `GL2.TouchTarget` to monitor touch events for `{@link UI}` objects.
	 * Instead, use the events that are provided by each class in the `{@link UI}` module.
	 *
	 * A touch target is a rectangular area that is defined based on its size and its offset from
	 * the X and Y origin. If the user touches an area of the screen that is covered by the touch
	 * target, the touch target fires a `touch` event, which your application can receive by
	 * attaching a message listener to the touch emitter. To attach a listener, call
	 * `{@link GL2.TouchTarget#getTouchEmitter}`.
	 *
	 * A touch target will activate even if its parent or ancestor nodes are not visible. You can
	 * call the `setTouchable()` method, inherited from `{@link GL2.Node}`, to disable a touch
	 * target.
	 *
	 * **Note**: If a clipping rectangle is active, and the touch target is outside of the clipping
	 * rectangle, the touch target will not be touchable. See `{@link GL2.Node#setClipRect}` and
	 * `{@link GL2.Node#setClipRectEnabled}` for additional details about clipping rectangles.
	 *
	 * When you instantiate a touch target, it is created with a size of `0` and an anchor point of
	 * `[0, 0]`. Call `{@link GL2.TouchTarget#setSize}` and `{@link GL2.TouchTarget#setAnchor}` to
	 * change these properties so they define an area that can receive touch events. In most cases,
	 * you will set these properties so they are identical to the corresponding properties of a
	 * `{@link GL2.Primitive}`, `{@link GL2.Sprite}`, or `{@link GL2.Text}` object. You can then add
	 * the touch target as a child of the visible node and call the `setPosition()` method,
	 * inherited from `{@link GL2.Node}`, to indicate that the touch target has an offset of 0 from
	 * its parent node. The touch target will inherit transformations from its parent node.
	 * @constructs Create a touch target.
	 * @augments GL2.Node
	 * @since 1.0
	 */
    initialize: function()
    {
		this._size = new Core.Size();
		this._anchor = new Core.Point(0, 0);
		this._touchEmitter = new Core.MessageEmitter();
    },

	/**
	 * Destroy the touch target, and release the resources allocated by the touch target.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},

	/**
	 * Retrieve the size of the touch target. The size is relative to the scale that has been
	 * applied to the parent node.
	 * @example
	 * // Create a parent node that scales up its child nodes.
	 * var node = new GL2.Node();
	 * node.setScale(50, 25);
	 * // Add a touch target to the parent node.
	 * var touchTarget = new GL2.TouchTarget();
	 * node.addChild(touchTarget);
	 * // Because the touch target's parent node has been scaled, the following call
	 * // to setSize() will result in a touch target that covers a 50 pixel by 25 pixel
	 * // rectangle on the device's screen.
	 * touchTarget.setSize(new Core.Size(1, 1));
	 * // The value returned by getSize() does not reflect any scaling that has been
	 * // applied to the parent node.
	 * var targetSize = touchTarget.getSize();
	 * console.log(targetSize.getWidth());  // prints "1"
	 * console.log(targetSize.getHeight()); // prints "1"
	 * @returns {Core.Size} The current size of the touch target.
	 * @see GL2.TouchTarget#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSize: function()
	{
		return this._size;
	},

	/**
	 * Retrieve the offset of the touch target's anchor point. The anchor point defines the
	 * origin of any scaling or rotation that is applied to the touch target.
	 * @returns {Core.Point} The current offset of the touch target's anchor point.
	 * @see GL2.TouchTarget#setAnchor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAnchor: function()
	{
		return this._anchor;
	},

	/**
	 * Retrieve the touch emitter for the touch target. By adding a listener to the touch emitter,
	 * you can monitor touch events as the user touches the target, moves a finger across the
	 * screen, and stops touching the screen. The touch emitter calls the listener's callback
	 * function, passing in a `{@link GL2.Touch}` object.
	 *
	 * The emitter fires its first event when the user touches the touch target. If the handler for
	 * this initial event returns the value `true`, the emitter captures the touch event and
	 * continues to fire as long as the user continues to touch the screen, regardless of whether
	 * the user's finger is within the touch target. The emitter stops firing when the user's finger
	 * is no longer touching the screen.
	 *
	 * If the handler for the initial touch event does not return `true`, the touch event will
	 * continue to propagate to touch targets that have a lower depth.
	 * @example
	 * // Create a subclass of Core.MessageListener that covers the entire screen
	 * // with a touch target and handles touch events.
	 * var Target = Core.MessageListener.subclass({
	 *     initialize: function() {
	 *         this.node = new GL2.Node();
	 *         this.target = new GL2.TouchTarget();
	 *
	 *         var anchor = new Core.Point(0.5, 0.5);
	 *         var size = new Core.Size(Device.LayoutEmitter.getWidth(),
	 *           Device.LayoutEmitter.getHeight());
	 *         this.target.setAnchor(anchor);
	 *         this.target.setSize(size);
	 *
	 *         this.target.getTouchEmitter().addListener(this, this.onTouch.
	 *           bind(this));
	 *
	 *         node.addChild(this.target);
	 *         GL2.Root.addChild(this.node);
	 *     },
	 *
	 *     onTouch: function(touch) {
	 *         switch(touch.getAction()) {
	 *             case touch.Action.Start:
	 *                 // Start tracking the touch event.
	 *                 this.trackingId = touch.getId();
	 *                 this.trackingPosition = touch.getPosition();
	 *
	 *                 // Identify the touch event's offset from the global
	 *                 // scene coordinates.
	 *                 var local = this.screenToLocal(this.trackingPosition);
	 *                 var current = this.getPosition();
	 *                 this.trackingOffset = new Core.Vector(current.getX() - local.getX(),
	 *                   current.getY() - local.getY());
	 *
	 *                 // Return true so that we continue to get touch events.
	 *                 return true;
	 *
	 *             case touch.Action.Move:
	 *                 // Make sure this is the same touch that we are
	 *                 // currently tracking.
	 *                 if (this.trackingId != touch.getId()) {
	 *                     return;
	 *                 }
	 *                 // Update the touch position.
	 *                 this.trackingPosition = touch.getPosition();
	 *                 break;
	 *
	 *             case touch.Action.End:
	 *                 // Make sure this is the same touch that we are
	 *                 // currently tracking.
	 *                 if (this.trackingId != touch.getId()) {
	 *                     return;
	 *                 }
	 *                 // Clear the ID and position.
	 *                 this.trackingId = this.trackingPosition = null;
	 *                 break;
	 *         }
	 *     }
	 * });
	 *
	 * // Instantiate the object.
	 * var myTouchTarget = new Target();
	 * @returns {Core.MessageEmitter} The touch emitter for this touch area.
	 * @see Core.MessageEmitter
	 * @see Core.MessageListener
	 * @see GL2.Touch#getAction
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTouchEmitter: function()
	{
		return this._touchEmitter;
	},

    /**
	 * Set the touch target's width and height. The size is relative to the scale that has been
	 * applied to the parent node.
	 * @example
	 * // Create a parent node that scales up its child nodes.
	 * var node = new GL2.Node();
	 * node.setScale(50, 25);
	 * // Add a touch target to the parent node.
	 * var touchTarget = new GL2.TouchTarget();
	 * node.addChild(touchTarget);
	 * // Because the touch target's parent node has been scaled, the following call
	 * // to setSize() will result in a touch target that covers a 50 pixel by 25 pixel
	 * // rectangle on the device's screen.
	 * touchTarget.setSize(new Core.Size(1, 1));
	 * @param {Core.Size} size The touch target's new width and height.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setSize: function(size)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Size)],    // a single Core.Size
									   [T.Arg('number'), T.Arg('number')],  // two numbers
									   [[T.Arg('number'), T.Arg('number')]]));  // an array of two numbers.
#endif*/
		var s = this._size;
		s.setAll.apply(s, arguments);

		this._setSizeSendGen(s.getWidth(),s.getHeight());

		return this;
	},

	/**
	 * Set the offset of the touch target's anchor point. The anchor point defines the origin of
	 * any scaling or rotation that is applied to the touch target. Its offset is defined as a
	 * multiple of the touch target's width and height. For example, the anchor point offset
	 * `[0.5, 0.5]` represents a point that is centered on the X and Y axes.
	 *
	 * **Note**: The anchor point is calculated before transformations are applied to the touch
	 * target.
 	 * @example
	 * var touchTarget = new GL2.TouchTarget();
	 * touchTarget.setAnchor(new Core.Point(0.25, 0.25));
	 * @param {Core.Point} anchor The new offset of the touch target's anchor point.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAnchor: function(anchor)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Point)],    // a single Core.Point
									   [T.Arg('number'), T.Arg('number')],  // two numbers
									   [[T.Arg('number'), T.Arg('number')]]));  // an array of two numbers.
#endif*/
		var a = this._anchor;
		a.setAll.apply(a, arguments);

		this._setAnchorSendGen(a.getX(),a.getY());

		return this;
	},

	/**
	 * Translate a location in the global scene's coordinate space to the touch target's local
	 * coordinate space. Use this method to determine a touch event's offset from the touch target.
	 *
	 * For an example of how to use this method, see the example for
	 * `{@link GL2.TouchTarget#getTouchEmitter}`.
	 * @name GL2.TouchTarget#screenToLocal
	 * @function
	 * @param {Core.Point} location The location to transform.
	 * @returns {Core.Point} The location's coordinates within the touch target's local coordinate
	 *		space.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */

	screenToLocal: function($super, location)
	{
/*#if TYPECHECK
		var realArgs = Array.prototype.slice.call(arguments, 1);  // strip off $super
		T.validateArgs(realArgs, [T.Arg(Core.Point)]);
#endif*/
		location = $super(location);
		if(!location)
			return undefined;

		var a = this._anchor;
		var s = this._size;

		location.setX(location.getX() + a.getX() * s.getWidth());
		location.setY(location.getY() + a.getY() * s.getHeight());
		return location;
	},

	/**
	 * Translate a location in the touch target's local coordinate space to the global scene's
	 * coordinate space. Use this method to translate between two local coordinate spaces.
	 * @name GL2.TouchTarget#localToScreen
	 * @function
	 * @param {Core.Point} location The location in the touch target's local coordinate space to
	 *		transform.
	 * @returns {Core.Point} The location's coordinate within the global scene's coordinate space.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */

	localToScreen: function($super, location)
	{
/*#if TYPECHECK
		var realArgs = Array.prototype.slice.call(arguments, 1);  // strip off $super
		T.validateArgs(realArgs, [T.Arg(Core.Point)]);
#endif*/
		var a = this._anchor;
		var s = this._size;

		location.setX(location.getX() - a.getX() * s.getWidth());
		location.setY(location.getY() - a.getY() * s.getHeight());

		location = $super(location);
		if(!location)
			return undefined;
		return location;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 313,
	// Method create = -1
	// Method setSize = 2
	// Method setAnchor = 3
	
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
					NgLogE("Unknown instance method id " + cmdId + " in TouchTarget._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in TouchTarget._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[313] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x139ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_setSizeSendGen: function( width, height )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1390002, this, [ +width, +height ] );
	},
	
	/** @private */
	_setAnchorSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1390003, this, [ +x, +y ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// setSize: function( width, height ) {}
	
	// setAnchor: function( x, y ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
