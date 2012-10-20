var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var Window = require('./Window').Window;

var ViewParent = require('./ViewParent').ViewParent;

var View = exports.View = AbstractView.subclass(
/** @lends UI.View.prototype */
{
	'type':'view',

	/**	 
	 * @class The `UI.View` class constructs objects that represent a view in a user interface.
	 * A view can encompass an entire screen in the user interface or a smaller component of a
	 * screen. This enables you to organize UI components into groups, then show and hide them as
	 * needed.
	 * 
	 * This class also serves as a base class for the following derived classes:
	 *
	 * + `{@link UI.ScrollView}`
	 * + `{@link UI.Toast}`
	 *
	 * A `UI.View` object's appearance can change automatically when its view state changes. For
	 * example, the view's image border can change automatically when the view gains focus or is
	 * selected. To implement this feature, your application can call a `UI.View` setter method more
	 * than once, passing a different value in the `flags` parameter each time. In addition, your 
	 * application can include properties for multiple view states in the constructor. See the 
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.View#setImageFit}` to specify how images
	 * will be resized to fit within the view, the fit mode you specify will apply in all view
	 * states.
	 * @name UI.View
	 * @constructs Create a view.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a UI.View object without setting any of its properties.
	 * var view = new UI.View();
	 * @example
	 * // Create a UI.View object, and set images that are specified in the
	 * // "image" property to use a dark gray border.
	 * var border = {
	 *     outerLine: "FF5F5F5F 1.0"
	 * };
	 * var View = new UI.View({
	 *     imageBorder: border
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.View`
	 *		object.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (View._init) View._init();
		ViewParent.initialize.call(this);
		return $super(properties);
	},
	/**
	 * Add a child node to the view at the specified index. The child node must be an object
	 * created by a class that is derived from `{@link UI.AbstractView}`. Objects with a higher
	 * index are drawn on top of objects with a lower index.
	 * 
	 * If a child node already exists at the specified index, the existing child node is not
	 * removed. Instead, the index is incremented for all existing child nodes that have a higher
	 * index than the new child node.
	 * @function
	 * @example
	 * // Create a new view, then add a button to the view.
	 * var mainView = new UI.View();
	 * var button = new UI.Button();
	 * mainView.addChild(button);
	 * @param {Object} childNode The child node to add.
	 * @param {Number} [index] The index at which to add the child node. If the index is not
	 *		provided, the child node will be added as the last child node in the view.
	 * @returns {this}
	 * @see UI.View#removeChild
	 * @status iOS, Android, Flash, Test
	 */
	addChild: ViewParent.addChild,
	
	/**
	 * Remove the specified child node from the view.
	 *
	 * **Note**: Removing a child node from a view does not destroy the child node. You must 
	 * explicitly call `destroy()` when you no longer need to use the child node.
	 * @function
	 * @example
	 * // Create a new view, then add a button to the view.
	 * var mainView = new UI.View();
	 * var button = new UI.Button();
	 * mainView.addChild(button);
	 * // Remove the button when necessary.
	 * mainView.removeChild(button);
	 * @param {Object} childNode The child node to remove.
	 * @returns {Object} The child node that was removed.
	 * @see UI.View#addChild
	 * @status iOS, Android, Flash, Test
 	 */    
	removeChild: ViewParent.removeChild,


	/**
	 * Retrieve the number of child nodes attached to the view.
	 * @function
	 * @returns {Number} The current number of child nodes.
	 * @status Javascript, iOS, Android, Flash
	 */
	getChildCount: ViewParent.getChildCount,

	/**
	 * Retrieve the child nodes that are attached to the view.
	 * @function
	 * @returns {Object[]} An array of child nodes that are attached to the view.
	 * @status Javascript, iOS, Android, Flash
	 */
	getChildren: ViewParent.getChildren,

	/**
	 * Provide custom layout code that runs before the view is displayed. For example, an
	 * application could programmatically adjust the positioning of the view's child nodes based on
	 * the dimensions of the view's frame.
	 *
	 * To use this method, create a custom subclass of `UI.View` that overrides this method, then
	 * specify your own layout code in the subclass' version of the method. 
	 * @function
	 * @returns {void}
	 * @since 1.0
	 */
	layoutSubviews: function() {
		//Override this for custom view subclass layout code
	},
	
	/**
	 * @protected
	 * @function
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	_setVisible: function($super, makeVisible) {
		var wasVisible = this._visible;
		$super(makeVisible);
		if (this._visible != wasVisible) {
			var l = this._children.length;
			for (var i = 0; i < l; i++) {
				this._children[i]._setVisible(makeVisible);
			}
		}
	}
});

// Properties
View._init = function() {
	delete View._init;
	if (AbstractView._init) AbstractView._init();

	/**
	 * Set the `image` property, which links to an image that the view will display in a specified
	 * view state.
	 * @name UI.View#setImage
	 * @function 
	 * @example
	 * var view = new UI.View();
	 * view.setImage("./Content/background.png");
	 * @param {String} image The path to the new image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image. To specify an image for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
 	 * @see UI.View#getImage
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `image` property, which links to an image that the view will
	 * display in a specified view state.
	 * @name UI.View#getImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The path to the current image for the specified view state.
	 * @see UI.View#setImage
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	View.synthesizePropertyWithState('image', Commands.setImage);
	/**
	 * Set the `imageBorder` property, which defines a border for the image in a specified view 
	 * state. See `{@link UI.Style#setGradient}` for information about this property.
	 * @name UI.View#setImageBorder
	 * @function
	 * @example
	 * var view = new UI.View();
	 * var border = {
	 *     outerLine: "FF5F5F5F 1.0"
	 * };
	 * view.setImageBorder(border);
	 * @param {Object} imageBorder The new image border.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image border. To specify an image border for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.View#getImageBorder
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageBorder` property, which defines a border for the image in a
	 * specified view state.
	 * @name UI.View#getImageBorder
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current image border.
	 * @see UI.View#setImageBorder
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	View.synthesizePropertyWithState('imageBorder', Commands.setImageBorder);
	/**
	 * Set the `imageGravity` property, which defines how the image is positioned within the
	 * viewable area. The default image gravity is `[0.5, 0.5]`, which horizontally and vertically
	 * centers the image within the view.
	 * 
	 * See `{@link UI.Style#setImageGravity}` for more information about this property.
	 * @name UI.View#setImageGravity
	 * @function
	 * @example
	 * // Set the image gravity so that the image is horizontally centered and
	 * // vertically adjacent to the view's top edge.
	 * var view = new UI.View();
	 * view.setImageGravity([0.5, 0.0]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} imageGravity The new image gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
 	 * @returns {void}
	 * @see UI.View#getImageGravity
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageGravity` property, which defines how the image is positioned
	 * within the viewable area.
	 * @name UI.View#getImageGravity
	 * @function
	 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.View#setImageGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	View.synthesizeCompoundProperty('imageGravity', Commands.setImageGravity);
	/**
	 * Set the `imageFit` property, which defines how images will be scaled relative to the view.
	 * @name UI.View#setImageFit
	 * @function
	 * @example
	 * var view = new UI.View();
	 * view.setImageFit(UI.Commands.FitMode.None);
	 * @param {UI.Commands#FitMode} imageFit The scaling option that will be used to scale images 
	 * 		relative to the view.
	 * @status Flash
	 * @returns {void}
	 * @see UI.View#getImageFit
	 */
	/**
	 * Retrieve the value of the `imageFit` property, which defines how images will be scaled
	 * relative to the view.
	 * @name UI.View#getImageFit
	 * @function
	 * @example
	 * var view = new UI.View();
	 * view.setImageFit(UI.Commands.FitMode.AspectWidth);
	 * // More code here.
	 * // Later, the application takes different actions based on the
	 * // image's fit mode:
	 * var imageFitMode = view.getImageFit();
	 * switch (imageFitMode) {
	 *     case UI.Commands.FitMode.AspectHeight:
	 *         // Your code here
	 *         break;
	 *     case UI.Commands.FitMode.AspectWidth:
	 *         // Your code here
	 *         break;
	 *     // Continue through each enumerated value that you want to test
	 *     default:
	 *         // Your code here
	 *         break;
	 * }
	 * @returns {Number} The current scaling option that will be used to scale images relative to 
	 * 		the view. The returned value corresponds to an enumerated value of
	 *		`{@link UI.Commands#FitMode}`.
	 * @see UI.View#setImageFit
 	 * @status Flash
	 */
	View.synthesizeProperty('imageFit', Commands.setImageFitMode);

	View.synthesizeProperty('visibleInOrientations', Commands.setVisibleInOrientations);
};
