var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck
#endif*/

var Node = exports.Node = Core.Class.subclass(
/** @lends GL2.Node.prototype */
{
	classname: 'Node',

	/**
	 * @class The `GL2.Node` class creates objects that can be used as containers to group,
	 * organize, and transform other components of a `GL2` scene. It also serves as a base class for
	 * the following classes:
	 *
	 * + `{@link GL2.Primitive}`
	 * + `{@link GL2.Sprite}`
	 * + `{@link GL2.Text}`
	 *
	 * The components of a `GL2` scene are organized into a tree of nodes, or a scene graph. The
	 * scene graph's organization affects how the scene's components are displayed. For example, if
	 * a sprite is assigned to a node that has been rotated, the sprite will also be rotated. The
	 * absolute position of a node is determined by the following properties of the node and its
	 * ancestors, which are applied in this order:
	 *
	 * 1. Scaling factors for width and height (see `{@link GL2.Node#setScale}`)
	 * 2. Rotation (see `{@link GL2.Node#setRotation}`)
	 * 3. Position (see `{@link GL2.Node#setPosition}`)
	 *
	 * To determine the final transform for a node, `GL2` takes the node's properties, then combines
	 * them with the properties of all of the node's ancestors. Although `GL2.Node` objects do not
	 * have a visual representation, all of their properties contribute to the combined transform.
	 *
	 * As a result, when you set or retrieve a node's properties, keep in mind that the properties
	 * are being defined relative to the node's ancestors. For example, if a parent node has its
	 * origin at the coordinate `(50, 50)` within the global scene, and you create a child node
	 * whose origin is set to `(25, 25)`, the child node will be drawn at the coordinate `(75, 75)`
	 * within the global scene; its position is relative to its ancestors' positions.
	 *
	 * Each node also has a depth property, which controls the order of drawing and touch events.
	 * When nodes are drawn, nodes with a lower depth are obscured by nodes with a higher depth. In
	 * contrast, touch events give priority to the top node in the stack; they propagate downward
	 * from the node with the highest depth to the node with the lowest depth. At any point, a touch
	 * target can capture the touch event and prevent it from propagating further. See
	 * `{@link GL2.TouchTarget#getTouchEmitter}` for more information about capturing touch events.
	 *
	 * **Note**: If a clipping rectangle has been applied to the node, it will affect both drawing
	 * and touch events. See `{@link GL2.Node#setClipRect}` for details.
	 *
	 * By default, nodes are grouped with their siblings, and they are sorted relative to their
	 * parent node as though the parent node had a depth of `0`. You can call
	 * `{@link GL2.Node#setChildrenDepthGrouped}` to modify this behavior.
	 *
	 * Nodes can exist independent of the scene graph. However, a node will not be displayed and
	 * cannot receive touch events unless it is attached to the root of the scene graph, either
	 * directly or through a parent node. See `{@link GL2.Root}` for details about the root of the
	 * scene graph.
	 *
	 * All nodes have a corresponding native object in ngCore's native layer. As a result, creating
	 * and destroying large numbers of nodes can affect an application's performance. If you are
	 * removing a node from the scene graph, but you will need to display the node again, you should
	 * normally avoid calling `{@link GL2.Node#destroy}` and then recreating the node. Instead,
	 * remove the node from the scene graph, or specify that the node is not visible or touchable,
	 * then display the node again later.
	 * @constructs Create a node.
	 * @augments Core.Class
	 * @since 1.0
	 */
    initialize: function()
    {
		Core.ObjectRegistry.register(this);
        this._parent = null;
        this._position = new Core.Point();
        this._scale = new Core.Vector(1, 1);
        this._color = new Core.Color(1, 1, 1);
        this._alpha = 1;
        this._rotation = 0;
        this._depth = 0;
        this._visible = true;
        this._touchable = true;

        this._childrenDepthGrouped = true;
        this._children = [];

		this._clipRect = new Core.Rect(0, 0, -1, -1);
        this._clipRectEnabled = false;

		this._createSendGen(this.__objectRegistryId);

    },

	/**
	 * Remove the node's children (if any), detach the node from its parent (if any), and destroy
	 * the node, releasing the resources allocated by the node.
	 *
	 * **Important**: Destroying a node does not destroy the node's children.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		var children = this._children;
		while(children.length)
		{
			this.removeChild(children[0]);
		}

		if(this._parent)
		{
			this._parent.removeChild(this);
		}

		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},

	/**
	 * Retrieve the node's position, measured at its upper left corner.
	 * @returns {Core.Point} The node's current position, measured at its upper left corner.
	 * @see GL2.Node#setPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPosition: function()
	{
		return this._position;
	},

	/**
	 * Retrieve the node's scaling factor, represented as a multiple of the node's width and height.
	 * @returns {Core.Vector} The current scaling factor for the node's width and height.
	 * @see GL2.Node#setScale
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getScale: function()
	{
		return this._scale;
	},

	/**
	 * Retrieve the node's RGB color. Although `GL2.Node` objects are not rendered to the screen,
	 * the color is used to transform the color of child nodes.
	 * @returns {Core.Color} The node's current RGB color.
	 * @see GL2.Node#setColor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getColor: function()
	{
		return this._color;
	},

	/**
	 * Retrieve the node's opacity.
	 * @returns {Number} The node's current opacity, expressed as a float ranging from `0.0`, or
	 *		completely transparent, to `1.0`, or completely opaque.
	 * @see GL2.Node#setAlpha
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAlpha: function()
	{
		return this._alpha;
	},

	/**
	 * Retrieve the node's rotation, measured in degrees about the Z axis.
	 * @returns {Number} The node's current rotation, expressed as a float representing degrees.
	 * @see GL2.Node#setRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRotation: function()
	{
		return this._rotation;
	},

	/**
	 * Retrieve the node's depth.
	 * @returns {Number} The node's current depth, expressed as a float.
	 * @see GL2.Node#setDepth
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getDepth: function()
	{
		return this._depth;
	},

	/**
	 * Determine whether the node is visible.
	 * @returns {Boolean} Set to `true` if the node is visible.
	 * @see GL2.Node#setVisible
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVisible: function()
	{
		return this._visible;
	},

	/**
	 * Determine whether the node will receive touch events.
	 * @returns {Boolean} Set to `true` if the node will receive touch events.
	 * @see GL2.Node#setTouchable
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTouchable: function()
	{
		return this._touchable;
	},

	/**
	 * Determine whether node trees and their children will be displayed based on the depth of their
	 * top-level nodes.
	 * @returns {Boolean} Set to `true` if node trees and their children will be displayed based on
	 *		the depth of their top-level nodes. Set to `false` if node trees that share the same
	 *		parent will be interleaved.
	 * @see GL2.Node#setChildrenDepthGrouped
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getChildrenDepthGrouped: function()
	{
		return this._childrenDepthGrouped;
	},

	/**
	 * Retrieve the node's clipping rectangle, which is defined based on the global scene's
	 * coordinate system.
	 * @returns {Core.Rect} The current clipping rectangle, defined based on the global scene's
	 *		coordinate system.
	 * @see GL2.Node#setClipRect
	 * @status iOS, Android
	 * @since 1.4.1
	 */
	getClipRect: function()
	{
		return this._clipRect;
	},

	/**
	 * Determine whether the node's clipping rectangle is enabled.
	 * @returns {Boolean} Set to `true` if the node's clipping rectangle is enabled.
	 * @see GL2.Node#setClipRectEnabled
	 * @status iOS, Android
	 * @since 1.4.1
	 */
	getClipRectEnabled: function()
	{
		return this._clipRectEnabled;
	},

	/**
	 * Retrieve the node's parent node.
	 * @returns {GL2.Node} The current parent node, or `null` if the node does not have a parent
	 *		node.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getParent: function()
	{
		return this._parent;
	},

	/**
	 * Retrieve the node's children.
	 * @returns {Object[]} The node's current children.
	 * @status Flash, Test, FlashTested
	 * @since 1.1.6
	 */
	getChildren: function()
	{
		return this._children.slice();
	},


    /**
	 * Set the node's position, measured at its upper left corner. By default, the node's
	 * position is set to `(0, 0)`.
	 * @example
	 * var node = new GL2.Node();
	 * // Set the node's position using a Core.Point object.
	 * node.setPosition(new Core.Point(50, 100));
	 * // Set the node's position using two numbers.
	 * node.setPosition(25, 25);
	 * @param {Core.Point|Number} position The node's new position, measured at its upper left
	 *		corner. Specified as a `{@link Core.Point}` object or as two separate floats that
	 *		represent the X and Y coordinates of the origin, in that order.
	 * @returns {this}
	 * @see GL2.Node#getPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setPosition: function(x, y)
	{
/*#if TYPECHECK
  		T.validateArgs(arguments, T.Or([T.Arg(Core.Point)], [T.Arg('number'), T.Arg('number')]));
#endif*/
		var p = this._position;
		switch (arguments.length) {
		case 1:
			p.setAll(x);
			break;
		case 2:
			p.setAll(x, y);
			break;
		default:
			p.setAll.apply(p, arguments);
			break;
		}
		this._setPositionSendGen(p.getX(),p.getY());
		return this;
	},

    /**
	 * Set the node's scaling factor, represented as a multiple of the node's width and height. The
	 * node is scaled from its anchor point. By default, the node's scaling factor is set to
	 * `[1, 1]`, meaning that it is not scaled.
	 * @example
	 * var node = new GL2.Node();
	 * // Set the node's scale using a Core.Vector object.
	 * node.setScale(new Core.Vector(2, 0.5));
	 * // Set the node's scale using two numbers.
	 * node.setScale(3, 2);
	 * @param {Core.Vector|Number} scale The new scaling factor for the node's width and height.
	 *		Specified as a `{@link Core.Vector}` object or as two separate floats that represent
	 *		the X and Y scaling factors, or a single float which represents both X and Y scaling factors.
	 * @returns {this}
	 * @see GL2.Node#getScale
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setScale: function(scale)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Vector)], [T.Arg('number'), T.OptionalArg('number')]));
#endif*/
		var s = this._scale;
		if (typeof scale === 'number' && arguments.length === 1) {
			s.setAll(scale, scale);
		} else {
			s.setAll.apply(s, arguments);
		}
		this._setScaleSendGen(s.getX(), s.getY());
		return this;
	},
	/**
	 * Set the node's RGB color. The RGB values of each pixel in a child node are multiplied by the
	 * RGB values for the parent node. By default, the color is set to `[1, 1, 1]`, which does not
	 * affect the color of child nodes.
	 * @example
	 * // Draw an orange node using a Core.Color object.
	 * var node = new GL2.Node();
	 * node.setColor(new Core.Color(1.0, 0.5, 0));
	 * // Draw a purple text area by specifying the text area's RGB values
	 * // individually. GL2.Text objects inherit the setColor() method from
	 * // GL2.Node.
	 * var text = new GL2.Text();
	 * text.setColor(0.5, 0. 1.0);
	 * // Add the purple text area as a child of the orange node. The nodes' RGB
	 * // colors are multiplied by one another, and the resulting color is dark red:
	 * // ((1.0 * 0.5), (0.5 * 0), (0 * 1.0)) = (0.5, 0, 0). The text is displayed
	 * // in dark red.
	 * node.addChild(text);
	 * @param {Core.Color|Number} color The node's new RGB color. Specified as a
	 *		`{@link Core.Color}` object or as three separate floats that represent the red, green,
	 *		and blue values of the color, in that order; each float can range from `0` to `1`.
	 * @returns {this}
	 * @see GL2.Node#getColor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setColor: function(color)
	{
/*#if TYPECHECK
		var rangeCheck = function (n) {
			if (n < -0.001 || n > 1.001) {
				return 'color component should be between 0 and 1, not ' + n;
			}
		}
		var colorCheck = function (c) {
			return rangeCheck(c.getRed()) || rangeCheck(c.getGreen()) || rangeCheck(c.getBlue());
		}
		T.validateArgs(arguments, T.Or([T.Arg(Core.Color, colorCheck)], [T.Arg('number', rangeCheck), T.Arg('number', rangeCheck), T.Arg('number', rangeCheck)]));
#endif*/
		var c = this._color;
		c.setAll.apply(c, arguments);
		this._setColorSendGen(c.getRed(),c.getGreen(),c.getBlue());
		return this;
	},
    /**
	 * Set the node's opacity. The pixels in a parent node are individually blended with the pixels
	 * in a child node based on their opacity. By default, the node's opacity is `1`, or fully
	 * opaque.
	 * @example
	 * // Draw red text below a white node that has an opacity of 0.5, resulting in
	 * // pink text. Note that the GL2.Text object inherits the setColor() method
	 * // from GL2.Node.
	 * var node = new GL2.Node();  // defaults to a fully opaque white background
	 * node.setAlpha(0.5);
	 * var text = new GL2.Text();
	 * text.setColor(1.0, 0, 0);
	 * node.addChild(text);
	 * @param {Number} alpha The node's new opacity, expressed as a float ranging from `0.0`, or
	 *		completely transparent, to `1.0`, or completely opaque.
	 * @returns {this}
	 * @see GL2.Node#getAlpha
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setAlpha: function(alpha)
	{
/*#if TYPECHECK
  		var rangeCheck = function (n) {
			if (n < -0.001 || n > 1.001) {
				return 'alpha should be between 0 and 1';
			}
		}
		T.validateArgs(arguments, [T.Arg('number', rangeCheck)]);
#endif*/
		this._alpha = alpha;
		this._setAlphaSendGen(alpha);
		return this;
	},

    /**
	 * Set the node's rotation, measured in degrees about the Z axis. By default, the node's
	 * rotation is `0`.
	 * @example
	 * // Rotate a node by 45 degrees.
	 * var node = new GL2.Node();
	 * node.setRotation(45);
	 * @example
	 * // Rotate a node by 0.5 radians (approximately 28.65 degrees).
	 * function radiansToDegrees(radians) {
	 *     return radians * (180 / Math.PI);
	 * }
	 *
	 * var node = new GL2.Node();
	 * node.setRotation(radiansToDegrees(0.5));
	 * @param {Number} rotation The node's new rotation, expressed as a float representing degrees.
	 * @returns {this}
	 * @see GL2.Node#getRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setRotation: function(rotation)
	{
/*#if TYPECHECK
 		T.validateArgs(arguments, [T.Arg('number')]);
#endif*/
		this._rotation = rotation;
		this._setRotationSendGen(rotation);
		return this;
	},

    /**
	 * Set the node's depth. If two nodes have the same depth, nodes will be sorted based on
	 * their indexes; nodes with lower indexes will be treated as if they had a lower depth. By
	 * default, the node's depth is `0`.
	 *
	 * Nodes with lower depths will be drawn under nodes with higher depths. If a touch event falls
	 * within two nodes, the node with the higher depth will receive the touch event first; if that
	 * node does not capture the touch event, it propagates to the node with the lower depth.
	 *
	 * **Note**: To control how child nodes are interleaved, call
	 * `{@link GL2.Node#setChildrenDepthGrouped}`.
	 * @example
	 * // Create a parent node with two child nodes, each of which has a
	 * // different depth.
	 * var parentNode = new GL2.Node(),
	 *     childNodeLow = new GL2.Node(),
	 *     childNodeHigh = new GL2.Node();
	 * parentNode.addChild(childNodeLow).addChild(childNodeHigh);
	 * childNodeLow.setDepth(10);  // drawn below childNodeHigh; receives touch
	 *                             // events second
	 * childNodeHigh.setDepth(20); // drawn above childNodeLow; receives touch
	 *                             // events first
	 * @param {Number} depth The node's new depth, expressed as a float.
	 * @returns {this}
	 * @see GL2.Node#getChildrenDepthGrouped
	 * @see GL2.Node#getDepth
	 * @see GL2.Node#setChildrenDepthGrouped
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setDepth: function(depth)
	{
/*#if TYPECHECK
  		T.validateArgs(arguments, [T.Arg('number')]);
#endif*/		
		if(this._depth != depth)
		{
			this._depth = depth;
			this._setDepthSendGen(depth);
		}
		return this;
	},

    /**
	 * Set whether the node is visible. By default, the node is visible.
	 * @param {Boolean} visible Set to `true` to make the node visible.
	 * @returns {this}
	 * @see GL2.Node#getVisible
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setVisible: function(visible)
	{
		if(this._visible != visible)
		{
			this._visible = visible;
			this._setVisibleSendGen(visible);
		}
		return this;
	},

    /**
	 * Set whether the node will receive touch events. By default, the node receives touch
	 * events.
	 *
	 * **Important**: Nodes that do not receive touch events have better performance than nodes
	 * that receive touch events. If a node and its children do not need to support touch input,
	 * call this method and set the value of `touchable` to `false`.
	 * @param {Boolean} touchable Set to `true` to enable touch events for the node.
	 * @returns {this}
	 * @see GL2.Node#getTouchable
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setTouchable: function(touchable)
	{
		this._touchable = touchable;
		this._setTouchableSendGen(touchable);
		return this;
	},

	/**
	 * Set whether to display node trees and their children based on the depth of their top-level
	 * nodes. By default, this option is set to `true`.
	 *
	 * When `childrenDepthGrouped` is set to `true`, children are always grouped based on the depth
	 * of their parent node. For example, suppose that a scene graph includes two node trees, Y and
	 * Z, that share node X as their parent and have the same depth. However, node tree Z has a
	 * higher index:
	 *
	 *     Node X
	 *     +-- Node Y (depth = 0, index = 0)
	 *     |   +-- shadow sprite (depth = 10)
	 *     |   +-- character sprite (depth = 20)
	 *     |
	 *     +-- Node Z (depth = 0, index = 1)
	 *         +-- shadow sprite (depth = 10)
	 *         +-- character sprite (depth = 20)
	 *
	 * If `childrenDepthGrouped` is set to `true`, Z and its children will all be displayed on top 
	 * of Y and its children, regardless of the depth of Y and Z's child nodes. The drawing order
	 * for the entire scene graph will be as follows:
	 *
	 * 1. Node Z character sprite
	 * 2. Node Z shadow sprite
	 * 3. Node Z
	 * 4. Node Y character sprite
	 * 5. Node Y shadow sprite
	 * 6. Node Y
	 * 7. Node X
	 *
	 * When this option is set to `false`, two node trees that share the same parent will be
	 * interleaved with one another when they are drawn. With the scene graph shown above, nodes Y
	 * and Z, as well as their children, will be interleaved with one another based on their depth
	 * and indexes. Because the character sprites have a depth of `20`, they will be drawn on top of
	 * the shadow sprites, which have a depth of `10`. The drawing order for the entire scene graph
	 * will be as follows:
	 *
	 * 1. Node Z character sprite
	 * 2. Node Y character sprite
	 * 3. Node Z shadow sprite
	 * 4. Node Y shadow sprite
	 * 5. Node Z
	 * 6. Node Y
	 * 7. Node X
	 * @param {Boolean} childrenDepthGrouped Set to `true` to display node trees and their children
	 *		based on the depth of their top-level nodes. Set to `false` to interleave node trees
	 *		that share the same parent.
	 * @returns {this}
	 * @see GL2.Node#getChildrenDepthGrouped
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setChildrenDepthGrouped: function(childrenDepthGrouped)
	{
		if(this._childrenDepthGrouped != childrenDepthGrouped)
		{
			this._childrenDepthGrouped = childrenDepthGrouped;
			this._setChildrenDepthGroupedSendGen(childrenDepthGrouped);
		}
		return this;
	},

	/**
	 * Add a child node.
	 * @example
	 * var parentNode = new GL2.Node(),
	 *     childNode = new GL2.Node();
	 * parentNode.addChild(childNode);
	 * @param {Object} child The child node to add. This parameter must contain an object instance
	 *		that inherits from `GL2.Node`.
	 * @returns {this}
	 * @see GL2.Node#removeChild
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	addChild: function(child)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		// Add to children list.
		this._children.push(child);

		// Tell child.
		child._didAddToParent(this);

		this._addChildSendGen(Core.ObjectRegistry.objectToId(child));

		return this;
	},

	/**
	 * Remove a child node and its descendants from the node.
	 * @example
	 * var parentNode = new GL2.Node(),
	 *     childNode = new GL2.Node();
	 * parentNode.addChild(childNode);
	 * // To remove childNode from parentNode:
	 * parentNode.removeChild(childNode);
	 * @param {Object} child The child node to remove from the node. This parameter must contain an
	 *		object instance that is a child of the node and that inherits from `GL2.Node`.
	 * @throws {Error} The specified node is not a child node.
	 * @returns {this}
	 * @see GL2.Node#addChild
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeChild: function(child)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		// Tell child.
		child._willRemoveFromParent();

		// Remove from children list.
		var index = this._children.indexOf(child);
		if(index == -1)
			throw new Error('removeChild called for a node that is not a child');
		this._children.splice(index, 1);

		this._removeChildSendGen(Core.ObjectRegistry.objectToId(child));

		return this;
	},

	/**
	 * Translate a location in the global scene's coordinate space to the node's local coordinate
	 * space.
	 * @param {Core.Point} location The location in the global scene to transform.
	 * @returns {Core.Point} The location's coordinate within the node's local coordinate space.
	 * @see GL2.Node#localToScreen
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	screenToLocal: function(location)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Core.Point)]);
#endif*/
		var parent = this._parent;
		if(!parent)
			return undefined;

		location = parent.screenToLocal(location);
		if(!location)
			return undefined;

		var x = location.getX();
		var y = location.getY();

		// Undo translation.
		var p = this._position;
		x -= p.getX();
		y -= p.getY();

		// Undo rotation.
		var r = this._rotation * Math.PI / 180;
		var cosr = Math.cos(r);
		var sinr = Math.sin(r);
		var tx = cosr*x + sinr*y;
		var ty = -sinr*x + cosr*y;
		x = tx;
		y = ty;

		// Undo scale.
		var s = this._scale;
		x /= s.getX();
		y /= s.getY();

		return new Core.Point(x, y);
	},

	/**
	 * Translate a location in the node's local coordinate space to the global scene's coordinate
	 * coordinate space. Use this method to translate between two local coordinate spaces.
	 * @param {Core.Point} location The location in the node's local coordinate space to transform.
	 * @returns {Core.Point} The location's coordinate within the global scene's coordinate space.
	 * @see GL2.Node#screenToLocal
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	localToScreen: function(location)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Core.Point)]);
#endif*/
		var x = location.getX();
		var y = location.getY();

		// Undo scale.
		var s = this._scale;
		x *= s.getX();
		y *= s.getY();

		// Undo rotation.
		var r = -this._rotation * Math.PI / 180;
		var cosr = Math.cos(r);
		var sinr = Math.sin(r);
		var tx = cosr*x + sinr*y;
		var ty = -sinr*x + cosr*y;
		x = tx;
		y = ty;

		// Undo translation.
		var p = this._position;
		x += p.getX();
		y += p.getY();

		var parent = this._parent;
		if(!parent)
			return undefined;

		location = parent.localToScreen(new Core.Point(x, y));
		if(!location)
			return undefined;
		return location;
	},

    /**
	 * Set the node's clipping rectangle, which is defined based on the global scene's coordinate
	 * system. The clipping rectangle does not inherit scaling and rotation from its ancestor nodes.
	 * By default, the clipping rectangle is set to `(0, 0, -1, -1)`, which does not clip any
	 * portion of the node.
	 *
	 * When an application specifies a clipping rectangle, then enables it by calling
	 * `{@link GL2.Node#setClipRectEnabled}`, content outside of the clipping rectangle is not
	 * drawn, and touch targets outside of the clipping rectangle do not respond to touch inputs.
	 *
	 * If one or more ancestor nodes have a clipping rectangle enabled, the clipping rectangle used
	 * for rendering and touch input will be the intersection of the node's clipping rectangle and
	 * the ancestor nodes' clipping rectangles.
	 * @example
	 * var node = new GL2.Node();
	 * node.setClipRect(new Core.Rect(0, 28, 100, 32));
	 * @param {Core.Rect} rect The new clipping rectangle, defined based on the global scene's
	 *		coordinate system.
	 * @returns {this}
	 * @see GL2.Node#getClipRect
	 * @see GL2.Node#setClipRectEnabled
	 * @status iOS, Android
	 * @since 1.4.1
	 */
	setClipRect: function(rect)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Core.Rect)]);
#endif*/
		var cr = this._clipRect;
		cr.setAll.apply(cr, arguments);

		var o = cr.getOrigin();
		var s = cr.getSize();
		this._setClipRectSendGen(o.getX(), o.getY(), s.getWidth(), s.getHeight());

		return this;
	},

    /**
	 * Set whether the node's clipping rectangle is enabled. By default, the clipping rectangle is
	 * not enabled.
	 * @param {Boolean} clipRectEnabled Set to `true` to enable the node's clipping rectangle.
	 * @returns {this}
	 * @see GL2.Node#getClipRectEnabled
	 * @see GL2.Node#setClipRect
	 * @status iOS, Android
	 * @since 1.4.1
	 */
	setClipRectEnabled: function(clipRectEnabled)
	{
		if(this._clipRectEnabled != clipRectEnabled)
		{
			this._clipRectEnabled = clipRectEnabled;
			this._setClipRectEnabledSendGen(clipRectEnabled);
		}
		return this;
	},

	_didAddToParent: function(parent)
	{
		if(this._parent)
			this._parent.removeChild(this);

		this._parent = parent;
	},

	_willRemoveFromParent: function()
	{
		this._parent = null;
	},

	_synchronizeNodeRecv: function( cmd )
	{
		var msg = {};
		if(!this._synchronizeNodeRecvGen(cmd, msg))
			return;
		this._position.setAll(msg.x, msg.y);
		this._rotation = msg.rotation;
	},

	_synchronizeNodePosRecv: function( cmd )
	{
		var msg = {};
		if(!this._synchronizeNodePosRecvGen(cmd, msg))
			return;
		this._position.setAll(msg.x, msg.y);
	},

	_synchronizeNodeRotRecv: function( cmd )
	{
		var msg = {};
		if(!this._synchronizeNodeRotRecvGen(cmd, msg))
			return;
		this._rotation = msg.rotation;
	},

	_synchronizeNodeScaleRecv: function( cmd )
	{
		var msg = {};
		if(!this._synchronizeNodeScaleRecvGen(cmd, msg))
			return;
		this._scale.setAll(msg.sx, msg.sy);
	},

	_synchronizeNodeAlphaRecv: function( cmd )
	{
		var msg = {};
		if(!this._synchronizeNodeAlphaRecvGen(cmd, msg))
			return;
		this._alpha = msg.alpha;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 307,
	// Method create = -1
	// Method destroy = 2
	// Method setPosition = 3
	// Method setScale = 4
	// Method setColor = 5
	// Method setAlpha = 6
	// Method setRotation = 7
	// Method setDepth = 8
	// Method setVisible = 9
	// Method setTouchable = 10
	// Method setChildrenDepthGrouped = 11
	// Method addChild = 12
	// Method removeChild = 13
	// Method synchronizeNode = 14
	// Method setClipRect = 15
	// Method setClipRectEnabled = 16
	// Method synchronizeNodePos = 17
	// Method synchronizeNodeRot = 18
	// Method synchronizeNodeScale = 19
	// Method synchronizeNodeAlpha = 20
	
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
				
				case 14:
					instance._synchronizeNodeRecv( cmd );
					break;
				case 17:
					instance._synchronizeNodePosRecv( cmd );
					break;
				case 18:
					instance._synchronizeNodeRotRecv( cmd );
					break;
				case 19:
					instance._synchronizeNodeScaleRecv( cmd );
					break;
				case 20:
					instance._synchronizeNodeAlphaRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Node._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Node._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[307] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_synchronizeNodeRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Node.synchronizeNode from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in Node.synchronizeNode from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in Node.synchronizeNode from command: " + cmd );
			return false;
		}
		
		obj[ "rotation" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "rotation" ] === undefined )
		{
			NgLogE("Could not parse rotation in Node.synchronizeNode from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_synchronizeNodePosRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Node.synchronizeNodePos from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in Node.synchronizeNodePos from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in Node.synchronizeNodePos from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_synchronizeNodeRotRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Node.synchronizeNodeRot from command: " + cmd );
			return false;
		}
		
		obj[ "rotation" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "rotation" ] === undefined )
		{
			NgLogE("Could not parse rotation in Node.synchronizeNodeRot from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_synchronizeNodeScaleRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Node.synchronizeNodeScale from command: " + cmd );
			return false;
		}
		
		obj[ "sx" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "sx" ] === undefined )
		{
			NgLogE("Could not parse sx in Node.synchronizeNodeScale from command: " + cmd );
			return false;
		}
		
		obj[ "sy" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "sy" ] === undefined )
		{
			NgLogE("Could not parse sy in Node.synchronizeNodeScale from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_synchronizeNodeAlphaRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Node.synchronizeNodeAlpha from command: " + cmd );
			return false;
		}
		
		obj[ "alpha" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "alpha" ] === undefined )
		{
			NgLogE("Could not parse alpha in Node.synchronizeNodeAlpha from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x133ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1330002, this );
	},
	
	/** @private */
	_setPositionSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setScaleSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setColorSendGen: function( red, green, blue )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330005, this, [ +red, +green, +blue ] );
	},
	
	/** @private */
	_setAlphaSendGen: function( alpha )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330006, this, [ +alpha ] );
	},
	
	/** @private */
	_setRotationSendGen: function( rotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330007, this, [ +rotation ] );
	},
	
	/** @private */
	_setDepthSendGen: function( depth )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330008, this, [ +depth ] );
	},
	
	/** @private */
	_setVisibleSendGen: function( visible )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330009, this, [ ( visible ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setTouchableSendGen: function( touchable )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x133000a, this, [ ( touchable ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setChildrenDepthGroupedSendGen: function( childrenDepthGrouped )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x133000b, this, [ ( childrenDepthGrouped ? 1 : 0 ) ] );
	},
	
	/** @private */
	_addChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x133000c, this, [ +child ] );
	},
	
	/** @private */
	_removeChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x133000d, this, [ +child ] );
	},
	
	/** @private */
	_setClipRectSendGen: function( x, y, w, h )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x133000f, this, [ +x, +y, +w, +h ] );
	},
	
	/** @private */
	_setClipRectEnabledSendGen: function( clipRectEnabled )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1330010, this, [ ( clipRectEnabled ? 1 : 0 ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setPosition: function( x, y ) {}
	
	// setScale: function( x, y ) {}
	
	// setColor: function( red, green, blue ) {}
	
	// setAlpha: function( alpha ) {}
	
	// setRotation: function( rotation ) {}
	
	// setDepth: function( depth ) {}
	
	// setVisible: function( visible ) {}
	
	// setTouchable: function( touchable ) {}
	
	// setChildrenDepthGrouped: function( childrenDepthGrouped ) {}
	
	// addChild: function( child ) {}
	
	// removeChild: function( child ) {}
	
	// _synchronizeNodeRecv: function( cmd ) {}
	// setClipRect: function( x, y, w, h ) {}
	
	// setClipRectEnabled: function( clipRectEnabled ) {}
	
	// _synchronizeNodePosRecv: function( cmd ) {}
	// _synchronizeNodeRotRecv: function( cmd ) {}
	// _synchronizeNodeScaleRecv: function( cmd ) {}
	// _synchronizeNodeAlphaRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
