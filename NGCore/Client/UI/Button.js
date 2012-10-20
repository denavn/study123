var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var Button = exports.Button = AbstractView.subclass(
/** @lends UI.Button.prototype */
{
	/**
	 * @class The `UI.Button` class provides buttons in a user interface. The methods in this class
	 * control how buttons are displayed and positioned.
	 * 
	 * A `UI.Button` object's appearance can change automatically when the button's view state 
	 * changes. For example, the button's fill color can change automatically when the button gains 
	 * focus or is selected. To implement this feature, your application can call a `UI.Button`
	 * setter method more than once, passing a different value in the `flags` parameter each time.
	 * In addition, your application can include properties for multiple view states in the
	 * constructor. See the `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Button#setImageGravity}` to control an
	 * image's position within the button, the image gravity you specify will apply in all view
	 * states.
	 * @name UI.Button
	 * @constructs Create a button.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.Button object without setting any of its properties.
	 * var button = new UI.Button();
	 * @example
	 * // Create a new UI.Button object, setting its text gravity.
	 * var button = new UI.Button({
	 *     textGravity: [0.25, 0.5]
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.Button`
	 *		object.
	 */
	'type':'button',

	'Layout':Commands.ButtonLayout,
	
	/** @ignore */
	initialize: function($super, properties) {
		if (Button._init) Button._init();
		$super(properties);
	}
});

// Properties
Button._init = function() {
	delete Button._init;
	if (AbstractView._init) AbstractView._init();
	
	/**
	 * Set the `image` property, which links to an image that represents the button for a
	 * specified view state.
	 * @name UI.Button#setImage
	 * @function 
	 * @example
	 * var backButton = new UI.Button();        
	 * backButton.setImage("./Content/backButton.png", UI.Commands.State.Normal |
	 *     UI.Commands.State.Focused);
	 * @param {String} image The path to the new image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image. To specify an image for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Button#getImage
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `image` property, which defines a path to the button image for a
	 * specified view state.
	 * @name UI.Button#getImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The path to the button image for the specified view state.
	 * @see UI.Button#setImage
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('image', Commands.setImage);
	
	/**
	 * Set a function to call when an `imageLoaded` event occurs. This event occurs when an image
	 * finishes loading.
	 * @name UI.Button#setOnImageLoaded
	 * @event
	 * @example
	 * // Create an array of objects representing images to load, and update an
	 * // image's state when it has been loaded.
	 * var infoButton = new UI.Button();
	 * var images = [
	 *     {
	 *         url: "http://www.example.com/image1.png",
	 *         loaded: false,
	 *         width: 0,
	 *         height: 0
	 *     },
	 *     {
	 *         url: "http://www.example.com/image2.png",
	 *         loaded: false,
	 *         width: 0,
	 *         height: 0
	 *     }
	 * ];
	 * infoButton.setOnImageLoaded(function(event) {
	 *     if (event.error) {
	 *         console.log("An error occurred when loading " + event.imageURL + 
	 *             ": " + event.error + ": " + event.message);
	 *     } else {
	 *         for (var i = 0, l = images.length; i < l; i++) {
	 *             if (images[i].url == event.imageUrl) {
	 *                 images[i].loaded = true;
	 *                 images[i].height = event.height;
	 *                 images[i].width = event.width;
	 *             }
	 *         }
	 *     }
	 * });
	 * @cb {Function} imageLoadedCallback The function to call when an `imageLoaded` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {UI.Commands#ResourceError} [event.error] A code identifying the error, if any.
	 * @cb-param {Number} [event.height] The height of the image, in pixels.
	 * @cb-param {String} event.imageUrl The URL for the image.
	 * @cb-param {String} [event.message] A message describing the error, if any.
	 * @cb-param {Number} [event.width] The width of the image, in pixels.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.Button#event:getOnImageLoaded
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoaded` event occurs.
	 * @name UI.Button#getOnImageLoaded
	 * @event
	 * @returns {Function} The function to call when an `imageLoaded` event occurs.
	 * @see UI.Button#event:setOnImageLoaded
	 * @since 1.6
	 */
	Button.registerEventType('imageLoaded');
	
	/**
	 * Set a function to call when an `imageLoadFailed` event occurs. This event occurs when an
	 * image cannot be loaded.
	 * @name UI.Button#setOnImageLoadFailed
	 * @event
	 * @example
	 * var infoButton = new UI.Button();
	 * infoButton.setOnImageLoadFailed(function(event) {
	 *     console.log("An error occurred when loading " + event.url + 
	 *         ": " + event.error + ": " + event.message);
	 * });
	 * @cb {Function} imageLoadFailedCallback The function to call when an `imageLoadFailed` event
	 *		occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {UI.Commands#ResourceError} event.error A code identifying the error.
	 * @cb-param {String} event.url The URL for the image.
	 * @cb-param {String} event.message A message describing the error.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.Button#event:getOnImageLoadFailed
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoadFailed` event occurs.
	 * @name UI.Button#getOnImageLoadFailed
	 * @event
	 * @returns {Function} The function to call when an `imageLoadFailed` event occurs.
	 * @see UI.Button#event:setOnImageLoadFailed
	 * @since 1.6
	 */
	Button.registerEventType('imageLoadFailed');
		
	/**
	 * Set the `imageInsets` property, which contains insets that are used to clip the edges of the
	 * button image. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the button.
	 * @name UI.Button#setImageInsets
	 * @function
	 * @example
	 * var backButton = new UI.Button();
	 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
	 * // a left inset of 5.
	 * backButton.setImageInsets([10, 20, 15, 5]);
	 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the button.
	 * @returns {void}
	 * @see UI.Button#getImageInsets
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `imageInsets` property, which contains insets that are used to clip
	 * the edges of the button image.
	 * @name UI.Button#getImageInsets
	 * @function
	 * @returns {Number[]} The current image insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the button.
	 * @see UI.Button#setImageInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeCompoundProperty('imageInsets', Commands.setImageInsets);
	/**
	 * Set the `imageFit` property, which defines how images will be scaled relative to the button.
	 * @name UI.Button#setImageFit
	 * @function
	 * @example
	 * var backButton = new UI.Button();
	 * backButton.setImageFit(UI.Commands.FitMode.None);
	 * @param {UI.Commands#FitMode} imageFit The scaling option that will be used to scale images 
	 * 		relative to the button.
	 * @returns {void}
	 * @see UI.Button#getImageFit
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `imageFit` property, which defines how images will be scaled
	 * relative to the button.
	 * @name UI.Button#getImageFit
	 * @function
	 * @example
	 * var backButton = new UI.Button();
	 * backButton.setImageFit(UI.Commands.FitMode.AspectWidth);
	 * // More code here.
	 * // Later, the application takes different actions based on the
	 * // image's fit mode:
	 * var imageFitMode = backButton.getImageFit();
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
	 * 		the button. The returned value corresponds to an enumerated value of
	 *		`{@link UI.Commands#FitMode}`.
	 * @see UI.Button#setImageFit
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeProperty('imageFit', Commands.setImageFitMode);
	/**
	 * Set the `imageGravity` property, which defines how the button image is positioned within the
	 * viewable area. By default, the image gravity is set to `[0.5, 0.5]`, which centers the image
	 * within the viewable area.
	 * 
	 * See `{@link UI.Image#setImageGravity}` for more information about this property.
	 * @name UI.Button#setImageGravity
	 * @function
	 * @example
	 * // Position the image horizontally towards the left edge of the button and
	 * // vertically centered.
	 * var backButton = new UI.Button();
	 * backButton.setImageGravity([0.25, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} imageGravity The new image gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @returns {void}
	 * @see UI.Button#getImageGravity
	 * @see UI.Image#setImageGravity
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `imageGravity` property, which defines how the button image is
	 * positioned within the viewable area.
	 * @name UI.Button#getImageGravity
	 * @function
	 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.Button#setImageGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeCompoundProperty('imageGravity', Commands.setImageGravity);
	/**
	 * Set the `imageTransform` property, which defines an affine transformation of the button
	 * image. See `{@link UI.Image#setImageTransform}` for more information about affine
	 * transformations.
	 * @name UI.Button#setImageTransform
	 * @function
	 * @example
	 * // Increase an image's size by 20 units along the X axis, and move it
	 * // down 5 units along the Y axis.
	 * var button = new UI.Button();
	 * var scaleX = 20;
	 * var moveY = 5;
	 * button.setImageTransform([scaleX, 0, 0, 0, 0, moveY]);
	 * @example
	 * // Rotate an image 30 degrees to the left.
	 * function degreesToRadians(degrees) {
	 *     return degrees * (Math.PI / 180);
	 * }
	 *
	 * var button = new UI.Button();
	 * var angle = degreesToRadians(30);
	 * button.setImageTransform([Math.cos(angle), Math.sin(angle),
	 *     -Math.sin(angle), Math.cos(angle), 0, 0]);
	 * @example
	 * // Skew the bottom of an image to the right by 10 units along the x axis.
	 * var button = new UI.Button();
	 * var skewX = 10;
	 * button.setImageTransform([0, 0, skewX, 0, 0, 0]);
	 * @param {Number[]} imageTransform The new affine transformation. Specified as an array
	 *		of six floats: `[a, b, c, d, tx, ty]`.
	 * @returns {void}
	 * @see UI.Button#getImageTransform
	 * @see UI.Image#setImageTransform
 	 * @status iOS, Android
	 */
	/**
	 * Retrieve the value of the `imageTransform` property, which defines an affine transformation
	 * of the button image.
	 * @name UI.Button#getImageTransform
	 * @function
	 * @returns {Number[]} The current affine transformation. Specified as an array of six floats:
	 *		 `[a, b, c, d, tx, ty]`.
	 * @see UI.Button#setImageTransform
 	 * @status Javascript, iOS, Android, Flash
	 */
	Button.synthesizeCompoundProperty('imageTransform', Commands.setImageTransform);
	/**
	 * Set the `imageBorder` property, which defines a border for images in a specified view state.
	 * See `{@link UI.Style#setGradient}` for information about this property.
	 * @name UI.Button#setImageBorder
	 * @function
	 * @example
	 * // Use a dark gray border for the image.
	 * var infoButton = new UI.Button();
	 * var border = {
	 *     outerLine: "FF5F5F5F 1.0"
	 * }; 
	 * infoButton.setImageBorder(border);
	 * @param {Object} imageBorder The new image border.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this border. To specify a border for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Style#setGradient
	 * @see UI.Button#getImageBorder
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageBorder` property, which defines a border for images in a
	 * specified view state.
	 * @name UI.Button#getImageBorder
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current image border for the specified view state.
	 * @see UI.Button#setImageBorder
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('imageBorder', Commands.setImageBorder);
	
	/**
	 * Set the `text` property, which defines text for the button in a specified view state.
	 * @name UI.Button#setText
	 * @function
	 * @example
	 * var infoButton = new UI.Button();
	 * infoButton.setText("More information");
	 * @param {String} text The new text for the button.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Button#getText
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `text` property, which defines text for the button in a specified
	 * view state.
	 * @name UI.Button#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current button text for the specified view state.
	 * @see UI.Button#setText
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('text', Commands.setText);
	/**
	 * Set the `textColor` property, which defines the text color for the button in a specified view
	 * state.
	 * @name UI.Button#setTextColor
	 * @function 
	 * @example
	 * var infoButton = new UI.Button();
	 * infoButton.setTextColor("FFFFFF");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Button#getTextColor
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the button
	 * in a specified view state.
	 * @name UI.Button#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
	 *		format.
	 * @see UI.Button#setTextColor
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('textColor', Commands.setTextColor);
	/**
	 * Set the `textFont` property, which defines the font that is used for the button text in a
	 * specified view state.
	 * @name UI.Button#setTextFont
	 * @function
	 * @example
	 * var infoButton = new UI.Button();
	 * infoButton.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this font. To specify a font for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Button#getTextFont
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * button text in a specified view state.
	 * @name UI.Button#getTextFont
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The name of the current font for the specified view state.
	 * @see UI.Button#setTextFont
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('textFont', Commands.setTextFont);
	/**
	 * Set the `textShadow` property, which defines the color and size of shadows on the button text
	 * in a specified view state. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0, -1.0}"`)
	 * that contains three values separated by spaces:
	 * 
	 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
	 * 2. The width, in pixels, to blur the edges of the shadow.
	 * 3. Two comma-separated floats enclosed in brackets:
	 *     1. The shadow's X offset from the left, in pixels.
	 *     2. The shadow's Y offset from the top, in pixels.
	 * @name UI.Button#setTextShadow
	 * @function
	 * @example
	 * // Specify a white text shadow with a two-pixel blur, shifted up one pixel
	 * // along the Y axis.
	 * var infoButton = new UI.Button();
	 * infoButton.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified above.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Button#getTextShadow
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the button text in a specified view state.
	 * @name UI.Button#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.Button#setTextShadow
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	/**
	 * Set the `textGravity` property, which defines how the button text is positioned within the
	 * viewable area. The text gravity is defined as two floats, one for the X (horizontal) axis and
	 * one for the Y (vertical) axis. Each float represents a percentage of the whitespace 
	 * surrounding the text.
	 * 
	 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
	 * text, with the remainder placed to the right of the text. For the Y axis, the specified 
	 * percentage of whitespace will be placed above the text, with the remainder placed below the
	 * text.
	 * 
	 * By default, the text gravity is set to `[0.5, 0.5]`, which centers the text horizontally and
	 * vertically within the viewable area.
	 * @name UI.Button#setTextGravity
	 * @function
	 * @example
	 * // Position the text horizontally towards the left side of the button and
	 * // vertically centered.
	 * var infoButton = new UI.Button();
	 * infoButton.setTextGravity([0.1, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @returns {void}
	 * @see UI.Button#getTextGravity
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `textGravity` property, which defines how the button text is
	 * positioned within the viewable area.
	 * @name UI.Button#getTextGravity
	 * @function
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.Button#setTextGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);

	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the button text.
	 * @name UI.Button#setTextSize
	 * @function
	 * @example
	 * var infoButton = new UI.Button();
	 * var textSize = 24;
	 * infoButton.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the button text.
	 * @returns {void}
	 * @see UI.Button#getTextSize
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * button text.
	 * @name UI.Button#getTextSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the button text.
	 * @see UI.Button#setTextSize
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeProperty('textSize', Commands.setTextSize);
	/**
	 * Set the `textInsets` property, which contains insets that are used to clip the edges of the
	 * button text. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the button.
	 * @name UI.Button#setTextInsets
	 * @function
	 * @example
	 * var infoButton = new UI.Button();
	 * var insetLeft = 10;
	 * infoButton.setTextInsets([0, 0, 0, insetLeft]);
	 * @param {Number[]} textInsets The new text insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the button.
	 * @returns {void}
	 * @see UI.Button#getTextInsets
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `textInsets` property, which contains insets that are used to clip
	 * the edges of the button text.
	 * @name UI.Button#getTextInsets
	 * @function
	 * @returns {Number[]} The current text insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the button.
	 * @see UI.Button#setTextInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Button.synthesizeCompoundProperty('textInsets', Commands.setTextInsets);
};
