var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;

var stateMap = {
	'normal': Commands.State.Normal,
	'focused': Commands.State.Focused,
	'selected': Commands.State.Selected,
	'pressed': Commands.State.Pressed,
	'disabled': Commands.State.Disabled
};

var Style = exports.Style = Element.subclass({
/** @lends UI.Style.prototype */
	"type":"style",
	"classname":"UI_Style",
	
	/**
	 * @class The `UI.Style` class creates objects that contain style properties for UI components,
	 * such as the component's fill color and outline; the component's text color; and the text to
	 * display in the component. Use this class wherever your application will display multiple UI
	 * components that use the same style.
	 * 
	 * By creating a single `UI.Style` object and applying it to multiple UI components, you reduce
	 * the amount of communication between ngCore's JavaScript API and the device's native code. As
	 * a result, using `UI.Style` objects can significantly improve your application's performance.
	 *
	 * `UI.Style` objects can be applied to any UI component that extends `{@link UI.AbstractView}`.
	 * To apply a `UI.Style` object to a UI component, call the component's `setStyle()` method,
	 * which is inherited from `{@link UI.AbstractView}`.
	 *
	 * **Note**: If you assign a `UI.Style` object to a UI component, then set one of the
	 * component's style properties, the style property you set will override the value that is
	 * provided by the `UI.Style` object. Keep in mind that many style properties are tied to 
	 * specific view states; for example, if a `UI.Style` object provides a style property for the
	 * `disabled` view state, you must also specify the `disabled` view state when you override the
	 * property. See below for more information about style properties and view states.
	 *
	 * ### Supported Properties ###
	 * A `UI.Style` object can contain any of the style properties that are available through the
	 * class' getter and setter methods, which are described below. Most UI components use only a
	 * subset of these properties. For example, because `{@link UI.Image}` objects cannot contain
	 * text, they do not use the `text` property. See the documentation for each class in the
	 * `{@link UI}` module to determine which properties are used by each UI component.
	 * 
	 * If a UI component does not use a property that is specified in a `UI.Style` object, that 
	 * property will be ignored.
	 *
	 * ### Style Properties and View States ###
	 * A `UI.Style` object can use different properties for different view states. For example, it
	 * can specify that a UI component's text should use a different color when the component is
	 * disabled. To implement this feature, your application can call a `UI.Style` setter method
	 * more than once, passing a different view state in the `flags` parameter for each method call.
	 *
	 * When you pass style properties in the class' constructor method, the properties will apply in
	 * the `normal`, or default, view state. To specify a style property for a different view state, 
	 * add the name of the view state to the beginning of the property name, and capitalize the
	 * property name. For example, to specify an image border for a UI component that has focus,
	 * pass the `focusedImageBorder` property in the constructor. This approach is supported only
	 * for the `normal`, `focused`, `selected`, `pressed`, and `disabled` view states. To specify a
	 * style property for a custom view state, or for a component that is in multiple states, you
	 * must use `UI.Style`'s setter methods.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Style#setImageGravity}` to control an
	 * image's position within its view, the image gravity you specify will apply in all view
	 * states.
	 * @name UI.Style
	 * @constructs Create a new set of style properties.
	 * @augments UI.Element
	 * @example
	 * // Create a new UI.Style object without setting any of its properties.
	 * var style = new UI.Style();
	 * @example
	 * // Create a UI.Style object, setting several of its style properties, 
	 * // and apply the style properties to three buttons.
	 * var style = new UI.Style({
	 *     gradient: {
	 *         corners: "5.0 5.0 5.0 5.0",
	 *         gradient: ["FF9999FF 0.0", "FF5665FF 0.4", "FF0000FF 1.0"],
	 *         innerShadow: "FFFFFFFF 15.0 {0.0, 0.0}",
	 *         outerLine: "FF5F5F5F 1.0",
	 *         outerShadow: "00000000 0.0 {0.0, 0.0}"
	 *     },
	 *     textColor: "FFFFFF",
	 *     textShadow: "FF666666 2.0 {0.0, -1.0}"
	 * });
	 * var button1 = new UI.Button(),
	 *     button2 = new UI.Button(),
	 *     button3 = new UI.Button();
	 * button1.setStyle(style);
	 * button2.setStyle(style);
	 * button3.setStyle(style);
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.Style`
	 *		object.
	 * @see UI.Commands#State
	 * @since 1.6
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (Style._init) Style._init();
		$super(properties);
	},
	
	/** @private */
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

Style._init = function() {
	delete Style._init;
	if (Element._init) Element._init();

		/**
		 * Set the `gradient` property for a specified view state. You can use this property to add
		 * outlines, shadows, rounded corners, and gradient fills to a view. The `gradient` property
		 * can contain any or all of the following properties:
		 * 
		 * + **`corners`**: The radius, in pixels, for the view's corners. Specified as a string that
		 * contains a list of four floats separated by spaces. The floats start with the top left 
		 * corner of the view and go clockwise around the view. For example, to specify a radius of 
		 * 6 pixels for the top right and bottom left corners: `"0.0 6.0 0.0 6.0"`
		 * + **`gradient`**: The gradient fill for the view, drawn from top to bottom. Specified as 
		 * an array of strings (for example, `["FF0028FF 0.00", "FF6A84FF 0.25"]`). Each string 
		 * contains two values separated by spaces:
		 *     1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
		 *     2. A float, ranging from `0.0` (the top of the button) to `1.0` (the bottom of the
		 *     button), indicating a point at which the color should begin to fade into the prior
		 *     color.
		 * + **`innerLine`**: The line drawn inside the view's edges. Specified as a string (for 
		 * example, `"FFC0EA82 2.0"`) that contains two values separated by a space:
		 *     1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
		 *     2. A float indicating the width, in pixels, of the line.
		 * + **`innerShadow`**: The shadow drawn inside the view's edges, which can be used to 
		 * create a "glowing" effect. Specified as a string (for example, `"FFFFFFFF 5.0 {0.0, 
		 * 0.0}"`) that contains three values separated by spaces:
		 *     1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
		 *     2. The width, in pixels, to blur the edges of the shadow.
		 *     3. Two comma-separated floats enclosed in brackets:
		 *         1. The shadow's X offset from the left, in pixels.
		 *         2. The shadow's Y offset from the top, in pixels.
		 * + **`insets`**: The view's insets, in pixels, from its edges. Specified as a string 
		 * containing four comma-separated floats enclosed in brackets. The floats start at the top 
		 * of the view and go counter-clockwise around the view. For example, to specify a top inset 
		 * of 5 pixels and a right inset of 10 pixels: `{0, 5, 0, 10}`
		 * + **`outerLine`**: The line drawn outside the view's edges. Uses the same format as the
		 * `innerLine` property.
		 * + **`outerShadow`**: The shadow drawn outside the view's edges, which can be used to 
		 * create a "drop shadow" effect. Uses the same format as the `innerShadow` property.
		 * **Note**: The outer shadow is drawn within the view's bounds. This means you must specify
		 * insets in order for the drop shadow to be visible.
		 * @name UI.Style#setGradient
		 * @function
		 * @example
		 * // Create a style for an opaque white inner shadow that has a 
		 * // 10-pixel blur and no offset.
		 * var style = UI.Style();
		 * var gradient = {
		 *     innerShadow: "FFFFFFFF 5.0 {0.0, 0.0}"
		 * };
		 * style.setGradient(gradient);
		 * @example
		 * // Create an opaque gradient that is light blue in the middle and
		 * // dark blue on the top and bottom edges.
		 * var style = UI.Style();
		 * var gradient = {
		 *     gradient: ["FF0028FF 0.00", "FF6A84FF 0.25", "FF6A84FF 0.75",
		 *         "FF0028FF 1.00"]
		 * };
		 * style.setGradient(gradient);
		 * @example
		 * // Create an opaque gradient that is dark blue at the top, bottom,
		 * // and middle and light blue in between.
		 * var style = UI.Style();
		 * var gradient = {
		 *     gradient: ["FF0028FF 0.000", "FF6A84FF 0.250", "FF0028FF 0.500",
		 *         "FF6A84FF 0.750", "FF0028FF 1.000"]
		 * };
		 * style.setGradient(gradient);
		 * @example
		 * // Create a style for a gradient that fades from light blue to dark
		 * // blue, with a white inner shadow and a dark gray border.
		 * var style = UI.Style();
		 * var gradient = {
		 *     corners: "5.0 5.0 5.0 5.0",
		 *     gradient: ["FF9999FF 0.0", "FF5665FF 0.4", "FF0000FF 1.0"],
		 *     innerShadow: "FFFFFFFF 15.0 {0.0, 0.0}",
		 *     outerLine: "FF5F5F5F 1.0",
		 *     outerShadow: "00000000 0.0 {0.0, 0.0}"
		 * };
		 * style.setGradient(gradient);
		 * @param {Object} gradient The new `gradient` property, using the format described above.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this gradient. To specify a gradient for a view that is in multiple states, you 
		 * 		can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getGradient
		 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `gradient` property for a specified view state.
		 * @name UI.Style#getGradient
		 * @function	
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {Object} The current gradient, in the format described in
		 *		`{@link UI.Style#setGradient}`.
		 * @see UI.Style#setGradient
		 * @since 1.6
		 */
		Style.synthesizePropertyWithState('gradient', Commands.setGradient);
		
		/**
		 * Set the `image` property, which contains the path to an image that will be displayed for 
		 * a specified view state.
		 * @name UI.Style#setImage
		 * @function 
		 * @example
		 * var style = new UI.Style();
		 * style.setImage("./Content/splash.png", UI.Commands.State.Selected |
		 *     UI.Commands.State.Focused);
		 * @param {String} imageURL The new image URL.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this image. To specify an image for a view that is in multiple states, you can 
		 * 		use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getImage
		 * @since 1.6
		 */
		/**
		 * Retrieve a path to the image for a specified view state.
		 * @name UI.Style#getImage
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The path to the image for the specified view state.
		 * @see UI.Style#setImage
		 * @since 1.6
		 */
		Style.synthesizePropertyWithState('image', Commands.setImage);
		/**
		 * Set the `imageBorder` property, which defines a border for images in a specified view 
		 * state. See `{@link UI.Style#setGradient}` for information about the format of this
		 * property.
		 * @name UI.Style#setImageBorder
		 * @function
		 * @example
		 * // Create a style for a dark gray image border.
		 * var style = new UI.Style();
		 * var border = {
		 *     outerLine: "FF5F5F5F 1.0"
		 * }; 
		 * style.setImageBorder(border);
		 * @param {Object} imageBorder The new image border.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this border. To specify a border for a view that is in multiple states, you can
		 * 		use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getImageBorder
		 * @see UI.Style#setGradient
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the `imageBorder` property, which defines a border for images in a specified
		 * view state.
		 * @name UI.Style#getImageBorder
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {Object} The current image border.
		 * @see UI.Style#setImageBorder
		 * @since 1.6
		 */
		Style.synthesizePropertyWithState('imageBorder', Commands.setImageBorder);
		/**
		 * Set the `imageFit` property, which defines how images will be scaled relative to the
		 * view.
		 * @name UI.Style#setImageFit
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setImageFit(UI.Commands.FitMode.None);
		 * @param {UI.Commands#FitMode} imageFit The scaling option that will be used to scale 
		 * 		images relative to the button.
		 * @returns {void}
		 * @see UI.Commands#FitMode
		 * @see UI.Style#getImageFit
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `imageFit` property, which defines how images will be scaled
		 * relative to the view.
		 * @name UI.Style#getImageFit
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setImageFit(UI.Commands.FitMode.AspectWidth);
		 * var image = new UI.Image();
		 * image.setStyle(style);
		 * // More code here.
		 * // Later, the application takes an action based on the image's
		 * // fit mode:
		 * var imageStyle = image.getStyle();
		 * var imageFitMode = imageStyle.getImageFit();
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
		 * @returns {Number} The current scaling option that will be used to scale images relative
		 * 		to the view. The returned value corresponds to an enumerated value of
		 *		`{@link UI.Commands#FitMode}`.
		 * @see UI.Commands#FitMode
		 * @see UI.Style#setImageFit
	 	 * @since 1.6
		 */
		Style.synthesizeProperty('imageFit', Commands.setImageFitMode);
		/**
		 * Set the `imageInsets` property, which contains insets that are used to clip the edges of
		 * an image. The inset is specified as an array of floats, starting with the top inset and
		 * going clockwise around the image.
		 * @name UI.Style#setImageInsets
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
		 * // a left inset of 5.
		 * style.setImageInsets([10, 20, 15, 5]);
		 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
		 *		starting with the top inset and going clockwise around the image.
		 * @returns {void}
		 * @see UI.Style#getImageInsets
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `imageInsets` property, which contains insets that are used to
		 * clip the edges of an image.
		 * @name UI.Style#getImageInsets
		 * @function
		 * @returns {Number[]} The current image insets. Specified as an array of four floats, 
		 *		starting with the top inset and going clockwise around the image.
		 * @see UI.Style#setImageInsets
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('imageInsets', Commands.setImageInsets);
		/**
		 * Set the `imageGravity` property, which defines how an image is positioned within the
		 * viewable area. The image gravity is defined as two floats, one for the X (horizontal)
		 * axis and one for the Y (vertical) axis. Each float represents a percentage of the
		 * whitespace surrounding the image.
		 * 
		 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
		 * image, with the remainder placed to the right of the image. For the Y axis, the specified 
		 * percentage of whitespace will be placed above the image, with the remainder placed below
		 * the image.
		 * 
		 * Each UI component uses a different default value for its image gravity. See the UI
		 * component's documentation for details.
		 * @name UI.Style#setImageGravity
		 * @function
		 * @example
		 * // Set the image gravity so that images are vertically centered
		 * // and horizontally placed near the left edge.
		 * var style = new UI.Style();
		 * style.setImageGravity([0.25, 0.5]);
		 * @param {Number[]|UI.ViewGeometry#Gravity} imageGravity The new image gravity. Specified
		 *		as an array of two floats, where the first represents the X axis and the second
		 *		represents the Y axis. You can also specify an enumerated value of
		 *		`{@link UI.ViewGeometry#Gravity}` in place of the array.
		 * @returns {void}
		 * @see UI.Style#getImageGravity
		 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `imageGravity` property, which defines how an image is
		 * positioned within the viewable area.
		 * @name UI.Style#getImageGravity
		 * @function
		 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where
		 *		the first represents the X axis and the second represents the Y axis.
		 * @see UI.Style#setImageGravity
		 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('imageGravity', Commands.setImageGravity);
		/**
		 * Set the `imageTransform` property, which defines an affine transformation of an image. An
		 * affine transformation makes it possible to move, scale, or skew an image while ensuring 
		 * that straight lines remain straight and parallel lines remain parallel. You can also use 
		 * an affine transformation to rotate an image.
		 * 
		 * The parameters to this method represent a 2 x 3 matrix that contains the following
		 * values:
		 * 
		 *     --      --    a = X scale    tx = X reposition
		 *     | a    b |    b = Y skew     ty = Y reposition
		 *     | c    d |    c = X skew
		 *     | tx  ty |    d = Y scale
		 *     --      --
		 * @name UI.Style#setImageTransform
		 * @function
		 * @example
		 * // Increase an image's size by 20 units along the X axis, and move it
		 * // down 5 units along the Y axis.
		 * var style = new UI.Style();
		 * var scaleX = 20;
		 * var moveY = 5;
		 * style.setImageTransform([scaleX, 0, 0, 0, 0, moveY]);
		 * @example
		 * // Rotate an image 30 degrees to the left.
		 * function degreesToRadians(degrees) {
		 *     return degrees * (Math.PI / 180);
		 * }
		 *
		 * var style = new UI.Style();
		 * var angle = degreesToRadians(30);
		 * style.setImageTransform([Math.cos(angle), Math.sin(angle),
		 *     -Math.sin(angle), Math.cos(angle), 0, 0]);
		 * @example
		 * // Skew the bottom of an image to the right by 10 units along the
		 * // X axis.
		 * var style = new UI.Style();
		 * var skewX = 10;
		 * style.setImageTransform([0, 0, skewX, 0, 0, 0]);
		 * @param {Number[]} imageTransform The new affine transformation to use. Specified as an
		 *		array of six floats: `[a, b, c, d, tx, ty]`.
		 * @returns {void}
		 * @see UI.Style#getImageTransform
		 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `imageTransform` property, which defines an affine transformation
		 * of the image.
		 * @name UI.Style#getImageTransform
		 * @function
		 * @returns {Number[]} The current affine transformation. Specified as an array of six 
		 *		 floats: `[a, b, c, d, tx, ty]`.
		 * @see UI.Style#setImageTransform
		 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('imageTransform', Commands.setImageTransform);
		
		/**
		 * Set the `text` property, which defines text for the view in a specified view state.
		 * @name UI.Style#setText
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setText("More information");
		 * @param {String} text The new text for the view.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this text. To specify text for a view that is in multiple states, you can use 
		 * 		the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getText
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `text` property, which defines text for the view in a specified
		 * view state.
		 * @name UI.Style#getText
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current text for the specified view state.
		 * @see UI.Style#setText
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('text', Commands.setText);
		/**
		 * Set the `textColor` property, which defines the text color for the view in a specified 
		 * view state.
		 * @name UI.Style#setTextColor
		 * @function 
		 * @example
		 * var style = new UI.Style();
		 * style.setTextColor("FFFFFF");
		 * @param {String} textColor The new text color, in hexidecimal RGB format.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this text color. To specify a text color for a view that is in multiple states, 
		 * 		you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTextColor
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textColor` property, which defines the text color for the view
		 * in a specified view state.
		 * @name UI.Style#getTextColor
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
		 *		format.
		 * @see UI.Style#setTextColor
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('textColor', Commands.setTextColor);
		/**
		 * Set the `textFont` property, which defines the font that is used for the view's text in a
		 * specified view state.
		 * @name UI.Style#setTextFont
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setTextFont("DroidSans");
		 * @param {String} textFont The name of the new font.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this font. To specify a font for a view that is in multiple states, you can use 
		 * 		the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTextFont
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textFont` property, which defines the font that is used for 
		 * the view's text in a specified view state.
		 * @name UI.Style#getTextFont
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The name of the current font for the specified view state.
		 * @see UI.Style#setTextFont
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('textFont', Commands.setTextFont);
		/**
		 * Set the `textShadow` property, which defines the color and size of shadows on the view's 
		 * text in a specified view state. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0,
		 * -1.0}"`) that contains three values separated by spaces:
		 * 
		 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
		 * 2. The width, in pixels, to blur the edges of the shadow.
		 * 3. Two comma-separated floats enclosed in brackets:
		 *     1. The shadow's X offset from the left, in pixels.
		 *     2. The shadow's Y offset from the top, in pixels.
		 * @name UI.Style#setTextShadow
		 * @function
		 * @example
		 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
		 * var style = new UI.Style();
		 * style.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
		 * @param {String} textShadow The new text shadow, in the format specified above.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this text shadow. To specify a text shadow for a view that is in multiple 
		 * 		states, you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTextShadow
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textShadow` property, which defines the color and size of 
		 * shadows on the view's text in a specified view state.
		 * @name UI.Style#getTextShadow
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current text shadow.
		 * @see UI.Style#setTextShadow
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
		/**
		 * Set the `textGravity` property, which defines how a view's text is positioned within the
		 * viewable area. The text gravity is defined as two floats, one for the X (horizontal) 
		 * axis and one for the Y (vertical) axis. Each float represents a percentage of the 
		 * whitespace surrounding the text.
		 * 
		 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
		 * text, with the remainder placed to the right of the text. For the Y axis, the specified 
		 * percentage of whitespace will be placed above the text, with the remainder placed below 
		 * the text.
		 * 
		 * Each UI component uses a different default value for its text gravity. See the UI
		 * component's documentation for details.
		 * @name UI.Style#setTextGravity
		 * @function
		 * @example
		 * // Set the text gravity so that text is vertically centered and
		 * // horizontally placed near the left edge.
		 * var style = new UI.Style();
		 * style.setTextGravity([0.1, 0.5]);
		 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as
		 *		an array of two floats, where the first represents the X axis and the second
		 *		represents the Y axis. You can also specify an enumerated value of
		 *		`{@link UI.ViewGeometry#Gravity}` in place of the array.
		 * @returns {void}
		 * @see UI.Style#getTextGravity
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textGravity` property, which defines how a view's text is
		 * positioned within the viewable area.
		 * @name UI.Style#getTextGravity
		 * @function
		 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where 
		 *		the first represents the X axis and the second represents the Y axis.
		 * @see UI.Style#setTextGravity
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);
		/**
		 * Set the `textSize` property, which specifies the size, in pixels, of a view's text.
		 * @name UI.Style#setTextSize
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * var textSize = 24;
		 * style.setTextSize(textSize);
		 * @param {Number} textSize The new size, in pixels, of a view's text.
		 * @returns {void}
		 * @see UI.Style#getTextSize
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of a
		 * view's text.
		 * @name UI.Style#getTextSize
		 * @function
		 * @returns {Number} The current size, in pixels, of a view's text.
		 * @see UI.Style#setTextSize
	 	 * @since 1.6
		 */
		Style.synthesizeProperty('textSize', Commands.setTextSize);
		/**
		 * Set the `textInsets` property, which contains insets that are used to clip the edges of
		 * text. The inset is specified as an array of floats, starting with the top inset and going
		 * clockwise around the text.
		 * @name UI.Style#setTextInsets
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * var insetLeft = 10;
		 * style.setTextInsets([0, 0, 0, insetLeft]);
		 * @param {Number[]} textInsets The new text insets. Specified as an array of four floats, 
		 *		starting with the top inset and going clockwise around the text.
		 * @returns {void}
		 * @see UI.Style#getTextInsets
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `textInsets` property, which contains insets that are used to 
		 * clip the edges of text.
		 * @name UI.Style#getTextInsets
		 * @function
		 * @returns {Number[]} The current text insets. Specified as an array of four floats, 
		 *		starting with the top inset and going clockwise around the text.
		 * @see UI.Style#setTextInsets
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('textInsets', Commands.setTextInsets);
		Style.synthesizeProperty('lineHeight', Commands.setLineHeight);

		/**
		 * Set the `rightImage` property, which defines a path to an image to display on the right 
		 * side of a view for a specified view state.
		 * @name UI.Style#setRightImage
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setRightImage("./Content/right-arrow.png",
		 *     UI.Commands.State.Focused);
		 * @param {String} rightImage The path to the new image.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this right image. To specify a right image for a view that is in multiple 
		 * 		states, you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getRightImage
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `rightImage` property, which defines a path to an image to 
		 * display on the right side of a view for a specified view state.
		 * @name UI.Style#getRightImage
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current path to the image that will be displayed on the right side 
		 *		of the view.
		 * @see UI.Style#setRightImage
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('rightImage', Commands.setRightImage);
		/**
		 * Set the `rightImageBorder` property, which defines a border for the image that is
		 * specified by the `rightImage` property for a specified view state. See 
		 * `{@link UI.Style#setGradient}` for information about the format of the `rightImageBorder`
		 * property.
		 * @name UI.Style#setRightImageBorder
		 * @function
		 * @example
		 * // Specify a one-pixel dark gray border.
		 * var style = new UI.Style();
		 * style.setRightImageBorder({
		 *     outerLine: "FF5F5F5F 1.0"
		 * });
		 * @param {Object} rightImageBorder The new image border for the right image.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this right image border. To specify a right image border for a view that is in 
		 * 		multiple states, you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getRightImageBorder
		 * @see UI.Style#setGradient
		 * @see UI.Style#setRightImage
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `rightImageBorder` property, which defines a border for the 
		 * image that is specified by the `rightImage` property for a specified view state.
		 * @name UI.Style#getRightImageBorder
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {Object} The current image border for the right image.
		 * @see UI.Style#setRightImage
		 * @see UI.Style#setRightImageBorder
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('rightImageBorder', Commands.setRightImageBorder);
		/**
		 * Set the `rightImageFit` property, which defines how the right image will be scaled 
		 * relative to a view.
		 * @name UI.Style#setRightImageFit
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setRightImageFit(UI.Commands.FitMode.None);
		 * @param {UI.Commands#FitMode} rightImageFit The scaling option that will be used to scale 
		 * 		the right image relative to a view.
		 * @returns {void}
		 * @see UI.Style#getRightImageFit
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `rightImageFit` property, which defines how the right image 
		 * will be scaled relative to a  view.
		 * @name UI.Style#getRightImageFit
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setImageFit(UI.Commands.FitMode.AspectWidth);
		 * var cell = new UI.CellView();
		 * cell.setStyle(style);
		 * // More code here.
		 * // Later, the application takes an action based on the image's fit mode:
		 * var imageStyle = cell.getStyle();
		 * var imageFitMode = imageStyle.getImageFit();
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
		 * @returns {Number} The current scaling option that will be used to scale the right image 
		 * 		relative to the view. The returned value corresponds to an enumerated value of
		 *		`{@link UI.Commands#FitMode}`.
		 * @see UI.Style#setRightImageFit
	 	 * @since 1.6
		 */
		Style.synthesizeProperty('rightImageFit', Commands.setRightImageFitMode);
		/**
		 * Set the `rightImageInsets` property, which contains insets that are used to clip the 
		 * edges of the right image. The inset is specified as an array of floats, starting with the
		 * top inset and going clockwise around the image.
		 * @name UI.Style#setRightImageInsets
		 * @function
		 * @example
		 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
		 * // a left inset of 5.
		 * var style = new UI.Style();
		 * style.setRightImageInsets([10, 20, 15, 5]);
		 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
		 *		starting with the top inset and going clockwise around the image.
		 * @returns {void}
		 * @see UI.Style#getRightImageInsets
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `rightImageInsets` property, which contains insets that are 
		 * used to clip the edges of the right image.
		 * @name UI.Style#getRightImageInsets
		 * @function
		 * @returns {Number[]} imageInsets The current image insets. Specified as an array of four 
		 *		floats, starting with the top inset and going clockwise around the image.
		 * @see UI.Style#setRightImageInsets
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('rightImageInsets', Commands.setRightImageInsets);
		/**
		 * Set the `rightImageGravity` property, which defines how the right image is positioned 
		 * within a viewable area. See `{@link UI.Style#setImageGravity}` for information about this
		 * property.
		 * @name UI.Style#setRightImageGravity
		 * @function
		 * @example
		 * // Set the image gravity so that the right image is horizontally
		 * // centered and vertically adjacent to the top side of the view.
		 * var style = new UI.Style();
		 * style.setRightImageGravity([0.5, 0.0]);
		 * @param {Number[]} rightImageGravity The image gravity to use. Specified as an array of 
		 *		two floats, where the first represents the X axis and the second represents the Y
		 *		axis.
		 * @returns {void}
		 * @see UI.Style#getRightImageGravity
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `rightImageGravity` property, which defines how the right image
		 * is positioned within a viewable area.
		 * @name UI.Style#getRightImageGravity
		 * @function
		 * @returns {Number[]} rightImageGravity The current image gravity. Specified as an array of
		 *		two floats, where the first represents the X axis and the second represents the Y
		 *		axis.
		 * @see UI.Style#setRightImageGravity
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('rightImageGravity', Commands.setRightImageGravity);
		/**
		 * Set the `rightImageTransform` property, which defines an affine transformation of the
		 * right image. See `{@link UI.Style#setImageTransform}` for information about this
		 * property.
		 * @name UI.Style#setRightImageTransform
		 * @function
		 * @example 
		 * // Increase an image's size by 20 units along the X axis, and move it
		 * // down 5 units along the Y axis.
		 * var style = new UI.Style();
		 * var scaleX = 20;
		 * var moveY = 5;
		 * style.setRightImageTransform([scaleX, 0, 0, 0, 0, moveY]);
		 * @param {Number[]} rightImageTransform The new affine transformation. Specified as an 
		 *		array of six floats: `[a, b, c, d, tx, ty]`.
		 * @returns {void}
		 * @see UI.Style#getRightImageTransform
		 * @see UI.Style#setImageTransform
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the current value of the `rightImageTransform` property, which defines an affine
		 * transformation of the right image.
		 * @name UI.Style#getRightImageTransform
		 * @function
		 * @returns {Number[]} rightImageTransform The current affine transformation. Specified as
		 *		an array of six floats: `[a, b, c, d, tx, ty]`.
		 * @see UI.Style#setRightImageTransform
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('rightImageTransform', Commands.setRightImageTransform);
		
		/**
		 * Set the `title` property, which defines a title for a view in a specified view state.
		 * @name UI.Style#setTitle
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * var title = "Configure Application";
		 * style.setTitle(title);
		 * @param {String} title The new view title.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this title. To specify a title for a view that is in multiple states, you can 
		 * 		use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTitle
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the current value of the `title` property, which defines a title for a view in a
		 * specified view state.
		 * @name UI.Style#getTitle
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current view title.
		 * @see UI.Style#setTitle
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('title', Commands.setTitle);
		/**
		 * Set the `titleColor` property, which defines the text color for a view's title in a 
		 * specified view state.
		 * @name UI.Style#setTitleColor
		 * @function 
		 * @example
		 * var style = new UI.Style();
		 * style.setTitleColor("FFFFFF");
		 * @param {String} titleColor The new title text color, in hexidecimal RGB format.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this text color. To specify a text color for a view that is in multiple states, 
		 * 		you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTitleColor
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleColor` property, which defines the text color for a
		 * view's title in a specified view state.
		 * @name UI.Style#getTitleColor
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current title text color, in hexidecimal RGB format.
		 * @see UI.Style#setTitleColor
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('titleColor', Commands.setTitleColor);
		/**
		 * Set the `titleFont` property, which defines the font that is used for a view's title text
		 * in a specified view state.
		 * @name UI.Style#setTitleFont
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setTitleFont("DroidSans");
		 * @param {String} textFont The name of the new font.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this font. To specify a font for a view that is in multiple states, you can use 
		 * 		the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#getTitleFont
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleFont` property, which defines the font that is used for 
		 * a view's title text in a specified view state.
		 * @name UI.Style#getTitleFont	 
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current title text font.
		 * @see UI.Style#setTitleFont
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('titleFont', Commands.setTitleFont);
		/**
		 * Set the `titleShadow` property, which defines the color and size of shadows on a view's 
		 * title text in a specified view state. See `{@link UI.Style#setTextShadow}` for 
		 * information about this property.
		 * @name UI.Style#setTitleShadow
		 * @function
		 * @example
		 * // Use a white title text shadow with a two-pixel blur, shifted up
		 * // one pixel.
		 * var style = new UI.Style();
		 * style.setTitleShadow("FFCCCCFF 2.0 {0.0, -1.0}");
		 * @param {String} titleShadow The new title text shadow, in the format specified by 
		 *		`{@link UI.Style#setTextShadow}`.
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to 
		 *		use this title text shadow. To specify a text shadow for a view that is in multiple 
		 * 		states, you can use the `|` operator to combine multiple flags.
		 * @returns {void}
		 * @see UI.Style#setTextShadow
		 * @see UI.Style#getTitleShadow
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleShadow` property, which defines the color and size of 
		 * shadows on a view's title text in a specified view state.
		 * @name UI.Style#getTitleShadow
		 * @function
		 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
		 * @returns {String} The current title text shadow.
		 * @see UI.Style#setTitleShadow
	 	 * @since 1.6
		 */
		Style.synthesizePropertyWithState('titleShadow', Commands.setTitleShadow);
		/**
		 * Set the `titleGravity` property, which defines how a view's title text is positioned 
		 * within the viewable area. See `{@link UI.Style#setTextGravity}` for information about 
		 * this property.
		 * @name UI.Style#setTitleGravity
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * style.setTitleGravity([0.5, 0.0]);	 
		 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new title text gravity. 
		 *		Specified as an array of two floats, where the first represents the X axis and the 
		 *		second represents the Y axis. You can also specify an enumerated value of
		 *		`{@link UI.ViewGeometry#Gravity}` in place of the array.
		 * @returns {void}
		 * @see UI.Style#getTitleGravity
		 * @see UI.Style#setTextGravity
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleGravity` property, which defines how a view's title text
		 * is positioned within the viewable area.
		 * @name UI.Style#getTitleGravity
		 * @function
		 * @returns {Number[]} The current title text gravity. Specified as an array of two floats,
		 *		where the first represents the X axis and the second represents the Y axis.
		 * @see UI.Style#setTitleGravity
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('titleGravity', Commands.setTitleGravity);
		/**
		 * Set the `titleSize` property, which specifies the size, in pixels, of a view's title
		 * text.
		 * @name UI.Style#setTitleSize
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * var textSize = 24;
		 * style.setTitleSize(textSize);
		 * @param {Number} titleSize The new size, in pixels, of the title text.
		 * @returns {void}
		 * @see UI.Style#getTitleSize
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleSize` property, which specifies the size, in pixels, of
		 * a view's title text.
		 * @name UI.Style#getTitleSize
		 * @function
		 * @returns {Number} The current size, in pixels, of the title text.
		 * @see UI.Style#setTitleSize
	 	 * @since 1.6
		 */
		Style.synthesizeProperty('titleSize', Commands.setTitleSize);
		/**
		 * Set the `titleInsets` property, which contains insets that are used to clip the edges of 
		 * a view's title text. The inset is specified as an array of floats, starting with the top 
		 * inset and going clockwise around the text.
		 * @name UI.Style#setTitleInsets
		 * @function
		 * @example
		 * var style = new UI.Style();
		 * var insetLeft = 10;
		 * style.setTitleInsets([0, 0, 0, insetLeft]);
		 * @param {Number[]} titleInsets The new title text insets. Specified as an array of four 
		 *		floats, starting with the top inset and going clockwise around the text.
		 * @returns {void}
		 * @see UI.Style#getTitleInsets
	 	 * @since 1.6
		 */
		/**
		 * Retrieve the value of the `titleInsets` property, which contains insets that are used to 
		 * clip the edges of a view's title text.
		 * @name UI.Style#getTitleInsets
		 * @function
		 * @returns {Number[]} titleInsets The current title text insets. Specified as an array of 
		 *		four floats, starting with the top inset and going clockwise around the text.
		 * @see UI.Style#setTitleInsets
	 	 * @since 1.6
		 */
		Style.synthesizeCompoundProperty('titleInsets', Commands.setTitleInsets);
};
