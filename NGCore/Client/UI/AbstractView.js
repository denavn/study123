var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;
var Rect = require('./ViewGeometry').Rect;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Style = require('./Style').Style;

var stateMap = {
	'normal': Commands.State.Normal,
	'focused': Commands.State.Focused,
	'pressed': Commands.State.Pressed,
	'disabled': Commands.State.Disabled,
	//** extra-deprecated */
	'selected': Commands.State.Focused,
	'highlighted': Commands.State.Pressed
};

var AbstractView = exports.AbstractView = Element.subclass(
/** @lends UI.AbstractView.prototype */
{
	'type':'<com.ngmoco.view.abstract>',
	/**
	 * @class The `UI.AbstractView` class is a base class for derived classes that manage
	 * application views.
	 * 
	 * **Important**: This base class is not exported in the `UI` module. Do not access it directly
	 * or create subclasses of `UI.AbstractView`.
	 * 
	 * Classes that are derived from `UI.AbstractView` include:
	 * 
	 * + `{@link UI.Button}`
	 * + `{@link UI.CellView}`
	 * + `{@link UI.CheckBox}`
	 * + `{@link UI.EditText}`
	 * + `{@link UI.GLView}`
	 * + `{@link UI.Image}`
	 * + `{@link UI.Label}`
	 * + `{@link UI.Spinner}`
	 * + `{@link UI.View}`
	 * + `{@link UI.WebView}`
	 *
	 * The appearance of an object that is derived from `UI.AbstractView` can change automatically
	 * when the object's view state changes. For example, the view's fill color can change
	 * automatically when the view gains focus or is selected. To implement this feature, your
	 * application can call a `UI.AbstractView` setter method more than once, passing a different
	 * value in the `flags` parameter each time. In addition, your application can include
	 * properties for multiple view states in the constructor. See the `{@link UI}` module overview
	 * for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.AbstractView#setBackgroundColor}` to specify
	 * the view's background color, the color you specify will apply in all view states.
	 * @name UI.AbstractView
	 * @constructs Create a new view.
	 * @augments UI.Element
	 * @example
	 * // Create a new UI.Button object (derived from UI.AbstractView) without
	 * // setting any of its properties.
	 * var button = new UI.Button();
	 * @example
	 * // Create a new UI.Button object (derived from UI.AbstractView), setting
	 * // its text and text size.
	 * var button = new UI.Button({
	 *     text: "Back",
	 *     textSize: 32
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.AbstractView` object.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (AbstractView._init) AbstractView._init();
		
		this._assignedVisible = true;
		$super(properties);
	},
	
	/** @private */
	destroy: function($super){
		this.removeFromParent();
		$super();
	},
	
	/**
	 * Retrieve the view's parent.
	 * @function
	 * @returns {Object} The view's parent, or `undefined` if the view does not have a parent.
	 * @see UI.AbstractView#addToParent
	 * @see UI.AbstractView#removeFromParent
	 * @since 1.0
	 */    
	getParent: function(){
		return this._parent;
	},
    
	/**
	 * Add a node as a child of the specified parent node. If an index is specified, the node will
	 * be added to the parent node at the specified index. Otherwise, the node will be added as the 
	 * last child of the parent node.
	 * @function
	 * @example
	 * var myParent = new UI.View();
	 * var childNode = new UI.View();
	 * childNode.addToParent(myParent); 
	 * @param {Object} parentNode The parent node.
	 * @param {Number} [index] The index at which to add the child node.
	 * @returns {void}
	 * @see UI.AbstractView#getParent
	 * @see UI.AbstractView#removeFromParent
	 * @since 1.0
	 */
	addToParent: function(parentNode, index){
		parentNode.addChild(this, index);
	},
    
	/**
	 * Remove a child node from the parent node.
	 * @function
	 * @example
	 * var myParent = new UI.View();
	 * var childNode = new UI.View();
	 * childNode.addToParent(myParent);
	 * // more code here
	 * childNode.removeFromParent(myParent);
	 * @returns {this}
	 * @see UI.AbstractView#getParent
	 * @see UI.AbstractView#addToParent
	 * @since 1.0
	 */    
	removeFromParent: function(){
		if (this._parent && !this._parent._destroyed) {
			this._parent.removeChild(this);
			this._parent = null;
		}
		return this;
	},
	
	
	/**
	 * Add a view state to the view.
	 * @function
	 * @example
	 * var image = new UI.Image();
	 * image.addState(UI.Commands.State.Focused);
	 * @param {Number} flags The view state for this view.
	 * @returns {void}
	 * @see UI.AbstractView#clearState
	 * @see UI.AbstractView#getState
	 * @see UI.AbstractView#setState
	 * @see UI.Commands#State
	 * @since 1.0
	 */
	addState: function(flags) {
		this.setState(this._state | flags);
	},
	
	/**
	 * Clear the specified state from the view.
	 * @function 
	 * @example
	 * var image.new UI.Image();
	 * image.addState(UI.Commands.State.Focused);
	 * // More code here
	 * image.clearState(UI.Commands.State.Focused);
	 * @param {Number} flags The view state to clear from the view.
	 * @returns {void}
	 * @see UI.AbstractView#addState
	 * @see UI.AbstractView#getState
	 * @see UI.AbstractView#setState
	 * @see UI.Commands#State
	 * @since 1.0
	 */  
	clearState: function(flags) {
		this.setState(this._state & ~flags);
	},
    
	/**
	 * Retrieve the root node for this view.
	 * @function 
	 * @returns {Object} The root node if this is a child node, or `undefined` if it is not a child
	 *		node.
	 * @since 1.0
	 */
	getRoot: function() {
		return this._parent ? this._parent.getRoot() : undefined;
	},

	/**
	 * Retrieve the view's position and size relative to a second view. The second view must share
	 * an ancestor with the view.
	 *
	 * This method returns `undefined` in the following cases:
	 *
	 * + A frame has not been defined for the view.
	 * + The second view is `null` or `undefined`.
	 * + The second view does not share an ancestor with the view.
	 * @example
	 * // 1. Create a 500-pixel by 500-pixel parent view at the screen's 
	 * //    origin, and add it as a child of UI.Window.document.
	 * // 2. Create a 10-pixel by 10-pixel child view, with a 10-pixel X and Y
	 * //    offset from the origin, and add it as a child of the parent view.
	 * // 3. Create a 500-pixel by 500-pixel child view, with a 10-pixel X and Y
	 * //    offset from the origin, and add it as a child of UI.Window.document.
	 * // 4. Retrieve the frame for the second child view relative to the
	 * //    first child view. Because the two views have the same X and Y 
	 * //    offset, the origin is [0, 0]. The width and height are [10, 10],
	 * //    the dimensions of the smaller of the two views.
	 * var myParent = new UI.View();
	 * myParent.setFrame([0, 0, 500, 500]);
	 * UI.Window.document.addChild(myParent);
	 * var childView1 = new UI.View();
	 * childView1.setFrame([10, 10, 10, 10]);
	 * childView1.addToParent(myParent);
	 * var childView2 = new UI.View();
	 * childView2.setFrame([10, 10, 500, 500]);
	 * UI.Window.document.addChild(childView2);
	 * // frameInChildView2 is set to [0, 0, 10, 10]:
	 * var frameInChildView2 = childView1.getFrameIn(childView2);
	 * @param {UI.AbstractView} other The second view that will be used to calculate the view's
	 *		relative position.
	 * @returns {Number[]} An array of four floats identifying the view's width, height, X origin,
	 *		and Y origin relative to the second view, in that order.
	 * @see UI.AbstractView#setFrame
	 * @since 1.7
	 */
	getFrameIn: function(other) {
		if (!other) return undefined;
		if (UI.Window === other) {
			other = UI.Window.document;
		}
		var frame = this.getFrame();
		if (!frame) return undefined;
		frame = [0, 0, frame[2], frame[3]];
		if (this === other) return frame;

		// Create stack for this branch
		var thisBranch = [];
		var visited = {};
		var curView = this;
		do {
			visited[curView] = true;
			thisBranch.push(curView);
			if (curView === other) break;
			curView = curView.getParent();
		} while (curView);

		// Create stack for other branch, stop when common ancestor is found
		var otherBranch = [];
		curView = other;
		while (curView && !visited[curView]) {
			otherBranch.push(curView);
			curView = curView.getParent();
		}
		if (!curView) {
			// If both nodes have roots (WindowLayer as the first layer), then they are comparable since WindowLayers are all the same dimensions
			var thisRoot = this.getRoot();
			if (thisRoot && other.getRoot()) {
				curView = thisRoot;
				otherBranch.pop();
			} else {
				return undefined; // No common ancestor
			}
		}

		// Create array marking path from this to other
		// The common ancestor needs to be excluded since it provides a frame to its parent which isn't included in the path
		var commonAncestorIndex = thisBranch.indexOf(curView);
		for (var endIndex=commonAncestorIndex, l=commonAncestorIndex + otherBranch.length; endIndex<l; ++endIndex) {
			thisBranch[endIndex] = otherBranch.pop();
		}

		// Calculate the frame relative to other by following path
		for (var i=0; i<endIndex; ++i) {
			var curFrame = thisBranch[i].getFrame();
			if (curFrame) {
				if (typeof thisBranch[i].getFrameOffset === 'function') {
					var offset = thisBranch[i].getFrameOffset();
					curFrame[0] += offset[0];
					curFrame[1] += offset[1];
				}
				frame[0] += (i < commonAncestorIndex ? curFrame[0] : -curFrame[0]);
				frame[1] += (i < commonAncestorIndex ? curFrame[1] : -curFrame[1]);
			} else {
				return undefined; // undefined frame for a view between this and other
			}
		}

		return frame;
	},

	/** 
	  * @private
	  */
	_setVisible: function(makeVisible) {
		var willBeVisible = makeVisible && this._assignedVisible && this._parent && this._parent._visible;
		if (this._visible != willBeVisible) {
			this._visible = willBeVisible;
			var fn = (makeVisible ? this.getOnAppear() : this.getOnDisappear());
			if (typeof fn == 'function') fn.call(this);
		}
	},
	
	/**
	 * Cancel any running animations that apply to the object.
	 * @function
	 * @returns {void}
	 */
	clearAnimations: Commands.clearAnimations,
	
	/** 
	  * @private
	  */
	$synthesizePropertyWithState: function(propName, commandsFn) {
		function doSynthesis(caseAdjusted, stateName, stateFlags) {
			var gName = 'get' + caseAdjusted;
			var sName = 'set' + caseAdjusted;
			var getterFn = function() {
				return this[gName].call(this, stateFlags);
			};
			var setterFn = function(val) {
				return this[sName].call(this, val, stateFlags);
			};

			this.registerAccessors( stateName + caseAdjusted, getterFn, setterFn );
		}
		Element.synthesizePropertyWithState.call(this, propName, commandsFn);
		// Synthesize stateful accessors.
		var caseAdjusted = propName.charAt(0).toUpperCase() + propName.substr(1);
		for (var stateName in stateMap) {
			doSynthesis.call(this, caseAdjusted, stateName, stateMap[stateName]);
		}
	}
});

// Properties
AbstractView._init = function() {
	delete AbstractView._init;
	if (Element._init) Element._init();
	
	var getVisible = function() {
		return this._visible;
	};
	var setVisible = function(makeVisible) {
		this._assignedVisible = makeVisible;
		Commands.setIsVisible.call(this, makeVisible);
		this._setVisible(makeVisible);
	};
	/**
	 * Set the `visible` property for this view, which defines whether the view is visible.
	 * @name UI.AbstractView#setVisible
	 * @example
	 * var myView = new UI.View();
	 * myView.setVisible(false);
	 * @function 
	 * @param {boolean} makeVisible Set to `true` to make this view visible.
	 * @returns {void}
	 * @see UI.AbstractView#getVisible
	 */
	/**
	 * Determine whether this view is visible.
	 * @name UI.AbstractView#getVisible
	 * @function
	 * @returns {Boolean} Set to `true` if this object is visible.
	 * @see UI.AbstractView#setVisible
	 */
	AbstractView.registerAccessors('visible', getVisible, setVisible);
	
	/**
	 * Set the `backgroundColor` property, which defines the background color for a view.
	 * @name UI.AbstractView#setBackgroundColor
	 * @function
	 * @example
	 * var myView = new UI.View();
	 * myView.setBackgroundColor("FF000000");
	 * @param {String} backgroundColor The new background color, in hexidecimal ARGB format (the
	 *		alpha value followed by the RGB color).
	 * @returns {void}
	 * @see UI.AbstractView#getBackgroundColor
	 */
	/**
	 * Retrieve the value of the `backgroundColor` property, which defines the background color for
	 * a view.
	 * @name UI.AbstractView#getBackgroundColor
	 * @function
	 * @returns {String} The current background color, in hexidecimal ARGB format (the alpha value
	 *		followed by the RGB color).
	 * @see UI.AbstractView#setBackgroundColor
	 */
	AbstractView.synthesizeProperty('backgroundColor', Commands.setBackgroundColor);
	/**
	 * Set the `enabled` property, which identifies whether the view is enabled or disabled. Calling
	 * this method with `enabled` set to `true` will clear the view state
	 * `UI.Commands.State.Disabled` from the view.
	 * @name UI.AbstractView#setEnabled
	 * @function
	 * @param {Boolean} enabled Set to `true` to enable the view.
	 * @returns {void}
	 * @see UI.AbstractView#getEnabled
	 * @see UI.AbstractView#clearState
	 */
	/**
	 * Retrieve the `enabled` property, which identifies whether the view is enabled or disabled.
	 * @name UI.AbstractView#getEnabled
	 * @function
	 * @returns {Boolean} The current value of the `enabled` property.
	 * @see UI.AbstractView#setEnabled
	 */
	
	AbstractView.synthesizeProperty('enabled', function(enable) {
		this[ (enable ? 'clearState' : 'setState') ](Commands.State.Disabled);
	});
	/**
	 * Set the `state` property, which defines the view states that apply to a view.
	 * @name UI.AbstractView#setState
	 * @function
	 * @description 
	 * @example
	 * var image = new UI.Image();
	 * image.setState(UI.Commands.State.Focused);
	 * @param {UI.Commands#State} state The new view state. To specify that a view is currently in
	 * 		multiple states, you can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.AbstractView#getState
	 */
	/**
	 * Retrieve the value of the `state` property, which defines the view states that apply to a
	 * view.
	 * @name UI.AbstractView#getState
	 * @function
	 * @returns {Number} The current view state. The returned value corresponds to an enumerated 
	 *		value of`{@link UI.Commands#State}`.
	 * @see UI.AbstractView#setState
	 */
	AbstractView.synthesizeProperty('state', Commands.setState);

	
	/**
	 * Retrieve the value of the `frame` property.
	 * @name UI.AbstractView#getFrame
	 * @function
	 * @returns {Number[]} The current size of the view and its position relative to its parent.
	 *		Specified as an array of four floats.
	 * @see UI.AbstractView#setFrame
	 */
	var getFrame = function() {
		return this._frame;
	};
	/**
	 * Set the `frame` property, which defines the view's size and its position relative to its
	 * parent. This method accepts the following values, which can be passed to the method in
	 * several different ways:
	 * 
	 * + `x`: The view's offset along the X axis relative to its parent.
	 * + `y`: The view's offset along the Y axis relative to its parent.
	 * + `w`: The width of the view.
	 * + `h`: The height of the view.
	 * @name UI.AbstractView#setFrame
	 * @function 
	 * @example
	 * // Set a view's frame by passing in an array of values.
	 * var back = new UI.Button();
	 * back.setFrame([10.0, 10.0, 64.0, 64.0]);
	 * @example
	 * // Set a view's frame by passing in a UI.ViewGeometry.Rect object.
	 * var back = new UI.Button();
	 * var rect = new UI.ViewGeometry.Rect([10.0, 10.0, 64.0, 64.0]);
	 * back.setFrame(rect);
	 * @param {Number[]|Number|UI.Geometry.Rect} arg0 Contains one of the following:
	 * 
	 * 1. An array of four floats that specify the following, in this order:
	 *     + `x`: The view's offset along the X axis relative to its parent.
	 *     + `y`: The view's offset along the Y axis relative to its parent.
	 *     + `w`: The width of the view.
	 *     + `h`: The height of the view.
	 * 2. The four values listed above, passed in as individual parameters.
	 * 3. A `{@link UI.ViewGeometry.Rect}` object that defines the view's size and position.
	 * @returns {void}
	 * @see UI.AbstractView#getFrame
	 */
	var setFrame = function(arg0) {
		if (this.sizeChanged) {
			var w0 = this._frame ? this._frame[2] : 0;
			var h0 = this._frame ? this._frame[3] : 0;
		}
		
		if( arg0 instanceof Rect ){
			this._frame = arg0.array();
		}
		else if( arg0 instanceof Array ){
			this._frame = arg0;
		}
		else {
			this._frame = Array.prototype.slice.call(arguments);
		}
		//Don't allow this error to be thrown out of this method, as we are close to release and some code may be relying on the old behavior.  However, it would be worthwile to have a log of the error.
		try {
			if (!this._frame || isNaN(this._frame[0]) || isNaN(this._frame[1]) || isNaN(this._frame[2]) || isNaN(this._frame[3])) {
				throw new Error("Attempt to call setFrame with at least one undefined element: " + this._frame);
			}
		} catch (e) {
			NgLogException(e);
		}
		
		Commands.setFrame.apply(this, this._frame);
		
		if (this.sizeChanged && ((w0 ^ this._frame[2]) | (h0 ^ this._frame[3]))) {
			this.sizeChanged( this._frame[2], this._frame[3], w0, h0 );
		}
	};
	AbstractView.registerAccessors('frame', getFrame, setFrame);

	/**
	 * Set the `gradient` property for a specified view state. You can use this property to add
	 * outlines, shadows, rounded corners, and gradient fills to a view. For detailed information
	 * about this property, see `{@link UI.Style#setGradient}`.
	 * @name UI.AbstractView#setGradient
	 * @function
	 * @example
	 * // Create a button with an opaque white inner shadow that has a 5-pixel
	 * // blur and no offset.
	 * var button = UI.Button();
	 * var gradient = {
	 *     innerShadow: "FFFFFFFF 5.0 {0.0, 0.0}"
	 * };
	 * button.setGradient(gradient, UI.Commands.State.Normal);
	 * @param {Object} gradient The new `gradient` property, using the format described by
	 * `{@link UI.Style#setGradient}`.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {void}
	 * @see UI.AbstractView#getGradient
	 * @see UI.Style#setGradient
	 */
	/**
	 * Retrieve the value of the `gradient` property for a specified view state.
	 * @name UI.AbstractView#getGradient
	 * @function	
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current gradient, in the format described in
	 *		`{@link UI.Style#setGradient}`.
	 * @see UI.AbstractView#setGradient
	 * @see UI.Style#setGradient
	 */
	AbstractView.synthesizePropertyWithState('gradient', Commands.setGradient);	
	/**
	 * Set the `touchable` property, which indicates whether touch events will affect this view. The
	 * default value is `true`.
	 * @name UI.AbstractView#setTouchable
	 * @function
	 * @example
	 * var image = new UI.Image();
	 * image.setTouchable(false);
	 * @param {Boolean} touchable Set to `true` to allow touch events to affect this view.
	 * @returns {void}
	 * @see UI.AbstractView#getTouchable
	 */
	/**
	 * Retrieve the current value of the `touchable` property, which indicates whether touch events
	 * will affect this view.
	 * @name UI.AbstractView#getTouchable
	 * @function
	 * @returns {Boolean} The current value of the `touchable` property.
	 * @see UI.AbstractView#setTouchable
	 */
	AbstractView.synthesizeProperty('touchable', Commands.setTouchable);
	/**
	 * Set the `alpha` property, which defines the view's opacity.
	 * @name UI.AbstractView#setAlpha
	 * @function
	 * @param {Number} alpha A float ranging from `0.0`, for completely transparent, to `1.0`, for
	 *		completely opaque.
	 * @returns {void}
	 * @see UI.AbstractView#getAlpha
	 * @status iOS, Flash
	 */
	/**
	 * Retrieve the current value of the `alpha` property, which defines the view's opacity.
	 * @name UI.AbstractView#getAlpha
	 * @function
	 * @returns {Number} A float ranging from `0.0`, for completely transparent, to `1.0`,
	 *		for completely opaque.
	 * @see UI.AbstractView#setAlpha
	 * @status Flash
	 */
	AbstractView.synthesizeProperty('alpha', Commands.setAlpha);
	/**
	 * Set the `style` property, which identifies a `{@link UI.Style}` object whose style properties
	 * will be applied to the view.
	 * @name UI.AbstractView#setStyle
	 * @function
	 * @example
	 * // Create a new checkbox, and apply a UI.Style object that specifies
	 * // the text for the checkbox's label.
	 * var checkBox = new UI.CheckBox();
	 * var style = new UI.Style({
	 *     text: "Flip screen"
	 * });
	 * checkBox.setStyle(style);
	 * @param {UI.Style} newStyle A new `UI.Style` object whose style properties will be applied to 
	 *		the view.
	 * @returns {void}
	 * @see UI.AbstractView#getStyle
	 * @see UI.Style
	 * @since 1.6
	 */
	/**
	 * Retrieve the value of the `style` property, which identifies a `{@link UI.Style}` object
	 * whose style properties will be applied to the view.
	 * @name UI.AbstractView#getStyle
	 * @function
	 * @returns {UI.Style} The current `UI.Style` object whose style properties will be applied to
	 *		the view.
	 * @see UI.AbstractView#setStyle
	 * @see UI.Style
	 * @since 1.6
	 */
	AbstractView.synthesizeProperty('style', function(newStyle) {
		if (newStyle instanceof Style) {
			Commands.setStyle.call(this, ObjectRegistry.objectToId(newStyle));
		}
	});

	// Event Handlers
	// the appear event is not implemented, per jyopp
	/**
	 * Set a function to call when an `appear` event occurs.
	 * @name UI.AbstractView#setOnAppear
	 * @event
	 * @cb {Function} appearCallback The function to call when an `appear` event occurs.
	 * @cb-returns {void}
	 * @see UI.AbstractView#event:getOnAppear
	 * @returns {void}
	 * @ignore
	 */
	/**
	 * Retrieve the function to call when an `appear` event occurs.
	 * @name UI.AbstractView#getOnAppear
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AbstractView#event:setOnAppear
	 * @ignore
	 */
	AbstractView.registerEventType('appear');
	/**
	 * Set a function to call when a `disappear` event occurs. This event occurs when a view is
	 * hidden.
	 * @name UI.AbstractView#setOnDisappear
	 * @event
	 * @example
	 * var toast = new UI.Toast();
	 * toast.setOnDisappear(function() {
	 *     // We are done with the object after it disappears.
	 *     toast.destroy();
	 * });
	 * @cb {Function} disappearCallback The function to call when a `disappear` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.AbstractView#event:getOnDisappear
	 */
	/**
	 * Retrieve the function to call when a `disappear` event occurs. This event occurs when a view
	 * is hidden.
	 * @name UI.AbstractView#getOnDisappear
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AbstractView#event:setOnDisappear
	 */
	AbstractView.registerEventType('disappear');
	/**
	 * Set a function to call when a `click` event occurs. This event occurs when a view is tapped.
	 * 
	 * **Note**: As of version 1.6, `UI.EditText` objects no longer fire `click` events.
	 * @name UI.AbstractView#setOnClick
	 * @event
	 * @example
	 * var checked;
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setOnClick(function(event) {
	 *     checked = event.checked;
	 * });
	 * @cb {Function} clickCallback The function to call when a `click` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Boolean} event.checked Set to `true` if the view is checked.
	 * @cb-returns {void}
	 * @see UI.AbstractView#event:getOnClick
	 * @returns {void}
	 */
	/**
	 * Retrieve the function to call when a `click` event occurs. This event occurs when a view is
	 * tapped.
	 * @name UI.AbstractView#getOnClick
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AbstractView#event:setOnClick
	 */
	AbstractView.registerEventType('click');
	
	AbstractView.registerEventType('clickDown');
	AbstractView.registerEventType('clickCancel');

	/**
	 * Set a function to call when a `swipe` event occurs. This event occurs when the user swipes a
	 * finger across the view.
	 * @name UI.AbstractView#setOnSwipe
	 * @event
	 * @example
	 * // Move back or forward in a web view's history when a swipe event occurs.
	 * var webView = new UI.WebView();
	 * webView.setOnSwipe(function(event) {
	 *     if (event.direction == UI.Commands.SwipeDirection.Right &&
	 *         webView.canGoBack()) {
	 *         webView.goBack();
	 *     } else if (event.direction == UI.Commands.SwipeDirection.Left &&
	 *         webView.canGoForward()) {
	 *         webView.goForward();
	 *     }
	 * });
	 * @cb {Function} swipeCallback The function to call when a `swipe` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {UI.Commands#SwipeDirection} event.direction The direction of the swipe.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.AbstractView#event:getOnSwipe
	 */
	/**
	 * Retrieve the function to call when a `swipe` event occurs. This event occurs when the user
	 * swipes a finger across the view.
	 * @name UI.AbstractView#getOnSwipe
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AbstractView#event:setOnSwipe
	 */
	AbstractView.registerEventType('swipe');
	/**
	 * Set a function to call when a `longPress` event occurs. This event occurs when the user taps
	 * and holds on a view.
	 * @name UI.AbstractView#setOnLongPress
	 * @event
	 * @example
	 * var image = new UI.Image();
	 * image.setOnLongPress(function() {
	 *     console.log("The user is tapping and holding on an image.");
	 * });
	 * @cb {Function} longPressCallback The function to call when a `longPress` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.AbstractView#event:getOnLongPress
	 */
	/**
	 * Retrieve the function to call when a `longPress` event occurs.
	 * @name UI.AbstractView#getOnLongPress
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AbstractView#event:setOnLongPress
	 */
	AbstractView.registerEventType('longPress');

	/** @private NOT IMPLEMENTED */
	/*
		AbstractView.registerEventType('touchdown');
		AbstractView.registerEventType('touchup');
		AbstractView.registerEventType('touchmove');
		AbstractView.registerEventType('touchcancel');
	*/
};
