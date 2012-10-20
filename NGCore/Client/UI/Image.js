var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var Image = exports.Image = AbstractView.subclass(
/** @lends UI.Image.prototype */
{
	/**
	 * @class The `UI.Image` class creates images in a user interface. The methods in this class
	 * control how images are displayed and positioned.
	 * 
	 * A `UI.Image` object's appearance can change automatically when its view state changes. For
	 * example, the border around an image can change automatically when the image gains focus or is
	 * selected. To implement this feature, your application can call a `UI.Image` setter method
	 * more than once, passing a different value in the `flags` parameter each time. In addition,
	 * your application can include properties for multiple view states in the constructor. See the
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Image#setImageGravity}` to control an
	 * image's position within its view, the image gravity you specify will apply in all view
	 * states.
	 * @name UI.Image
	 * @constructs Create a new image.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.Image object without setting any of its properties.
	 * var splashGraphic = new UI.Image();
	 * @example
	 * // Create a new UI.Image object, setting its image gravity.
	 * var splashGraphic = new UI.Image({
	 *     imageGravity: [0.25, 0.5]
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.Image` object.
	 * @see UI.Commands#State
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (Image._init) Image._init();
		$super(properties);
	},
	
	'type':'image'
});


// Properties
Image._init = function() {
	delete Image._init;
	if (AbstractView._init) AbstractView._init();

	/**
	 * Set the `image` property, which contains the path to an image that will be displayed for a 
	 * specified view state.
	 * @name UI.Image#setImage
	 * @function 
	 * @example
	 * var splashGraphic = new UI.Image();
	 * splashGraphic.setImage("./Content/splash.png");
	 * @param {String} imageURL The new image URL.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image. To specify an image for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Image#getImage
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve a path to the image for a specified view state.
	 * @name UI.Image#getImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The path to the image for the specified view state.
	 * @see UI.Image#setImage
	 * @status iOS, Android, Flash, Test
	 */
	Image.synthesizePropertyWithState('image', Commands.setImage);
	/**
	 * Set the `imageBorder` property, which defines a border for images in a specified view state.
	 * See `{@link UI.Style#setGradient}` for information about this property.
	 * @name UI.Image#setImageBorder
	 * @function
	 * @example
	 * // Specify a one-pixel dark gray border.
	 * var image = new UI.Image();
	 * image.setImageBorder({
	 *     outerLine: "FF5F5F5F 1.0"
	 * });
	 * @param {Object} imageBorder The new image border.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this border. To specify a border for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Style#setGradient
	 * @see UI.Image#getImageBorder
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the `imageBorder` property, which defines a border for images in a specified view
	 * state.
	 * @name UI.Image#getImageBorder
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current image border.
	 * @see UI.Image#setImageBorder
	 * @status iOS, Android, Flash, Test
	 */
	Image.synthesizePropertyWithState('imageBorder', Commands.setImageBorder);
	/**
	 * Set the `imageGravity` property, which defines how the image is positioned within the
	 * viewable area. The image gravity is defined as two floats, one for the X (horizontal)
	 * axis and one for the Y (vertical) axis. Each float represents a percentage of the
	 * whitespace surrounding the button image.
	 * 
	 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
	 * image, with the remainder placed to the right of the image. For the Y axis, the specified 
	 * percentage of whitespace will be placed above the image, with the remainder placed below the
	 * image.
	 * 
	 * By default, the image gravity is set to `[0.5, 0.5]`, which centers the image within the
	 * viewable area.
	 * @name UI.Image#setImageGravity
	 * @function
	 * @example
	 * // Set the image gravity so that images are vertically centered
	 * // and horizontally placed near the left edge.
	 * var splashGraphic = new UI.Image();
	 * splashGraphic.setImageGravity([0.25, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} imageGravity The new image gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @returns {void}
	 * @see UI.Image#getImageGravity
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageGravity` property, which defines how the image is positioned
	 * within the viewable area.
	 * @name UI.Image#getImageGravity
	 * @function
	 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.Image#setImageGravity
	 * @status iOS, Android, Flash, Test
	 */
	Image.synthesizeCompoundProperty('imageGravity', Commands.setImageGravity);
	 /**
	  * Set the `imageTransform` property, which defines an affine transformation of the image. An
	  * affine transformation makes it possible to move, scale, or skew an image while ensuring that
	  * straight lines remain straight and parallel lines remain parallel. You can also use an
	  * affine transformation to rotate an image.
	  * 
	  * The parameters to this method represent a 2 x 3 matrix that contains the following values:
	  * 
	  *     --      --    a = X scale    tx = X reposition
	  *     | a    b |    b = Y skew     ty = Y reposition
	  *     | c    d |    c = X skew
	  *     | tx  ty |    d = Y scale
	  *     --      --
	  * @name UI.Image#setImageTransform
	  * @function
	  * @example
	  * // Increase an image's size by 20 units along the X axis, and move it
	  * // down 5 units along the Y axis.
	  * var splashGraphic = new UI.Image();
	  * var scaleX = 20;
	  * var moveY = 5;
	  * splashGraphic.setImageTransform([scaleX, 0, 0, 0, 0, moveY]);
	  * @example
	  * // Rotate an image 30 degrees to the left.
	  * function degreesToRadians(degrees) {
	  *     return degrees * (Math.PI / 180);
	  * }
	  *
	  * var splashGraphic = new UI.Image();
	  * var angle = degreesToRadians(30);
	  * splashGraphic.setImageTransform([Math.cos(angle), Math.sin(angle),
	  *     -Math.sin(angle), Math.cos(angle), 0, 0]);
	  * @example
	  * // Skew the bottom of an image to the right by 10 units along the x axis.
	  * var splashGraphic = new UI.Image();
	  * var skewX = 10;
	  * splashGraphic.setImageTransform([0, 0, skewX, 0, 0, 0]);
	  * @param {Number[]} imageTransform The new affine transformation to use. Specified as an array 
	  *		of six floats: `[a, b, c, d, tx, ty]`.
	  * @returns {void}
	  * @see UI.Image#getImageTransform
	  */
	 /**
	  * Retrieve the value of the `imageTransform` property, which defines an affine transformation
	  * of the image.
	  * @name UI.Image#getImageTransform
	  * @function
	  * @returns {Number[]} The current affine transformation. Specified as an array of six floats:
	  *		 `[a, b, c, d, tx, ty]`.
	  * @see UI.Image#setImageTransform
	  */
	 Image.synthesizeCompoundProperty('imageTransform', Commands.setImageTransform);
	/**
	 * Set the `imageFit` property, which defines how images will be scaled relative to the view.
	 * @name UI.Image#setImageFit
	 * @function
	 * @example
	 * var splashGraphic = new UI.Image();
	 * splashGraphic.setImageFit(UI.Commands.FitMode.None);
	 * @param {UI.Commands#FitMode} imageFit The scaling option that will be used to scale images 
	 * 		relative to the button.
	 * @returns {void}
	 * @see UI.Image#getImageFit
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageFit` property, which defines how images will be scaled
	 * relative to the view.
	 * @name UI.Image#getImageFit
	 * @function
	 * @example
	 * var splashGraphic = new UI.Image();
	 * splashGraphic.setImageFit(UI.Commands.FitMode.AspectWidth);
	 * // More code here.
	 * // Later, the application takes an action based on the image's
	 * // fit mode:
	 * var imageFitMode = splashGraphic.getImageFit();
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
	 * @see UI.Image#setImageFit
 	 * @status iOS, Android, Flash, Test
	 */
	Image.synthesizeProperty('imageFit', Commands.setImageFitMode);
	
	/**
	 * Set a function to call when an `imageLoaded` event occurs. This event occurs when the
	 * image specified by the `image` property finishes loading.
	 * @name UI.Image#setOnImageLoaded
	 * @event
	 * @example
	 * var image = new UI.Image();
	 * image.setOnImageLoaded(function(event) {
	 *     if (event.error) {
	 *         console.log("Unable to load image: " + event.error + ": " +
	 *             event.message);
	 *     } else {
	 *         console.log("Loaded an image with width=" + event.width + 
	 *         " and height=" + event.height);
	 *     }
	 * });
	 * @cb {Function} imageLoadedCallback The function to call when an `imageLoaded` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} [event.error] A code identifying the error, if any.
	 * @cb-param {Number} [event.height] The height of the image that was loaded.
	 * @cb-param {String} [event.message] A message describing the error, if any.
	 * @cb-param {Number} [event.width] The width of the image that was loaded.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.Image#event:getOnImageLoaded
	 * @since 1.6
	 * @status Flash
	 */
	/**
	 * Retrieve the function to call when an `imageLoaded` event occurs.
	 * @name UI.Image#getOnImageLoaded
	 * @event
	 * @returns {Function} The current function to call when an `imageLoaded` event occurs.
	 * @see UI.Image#event:setOnImageLoaded
	 * @since 1.6
	 * @status Flash
	 */
	Image.registerEventType('imageLoaded');
	
	/**
	 * Set a function to call when an `imageLoadFailed` event occurs. This event occurs when the
	 * image specified by the `image` property cannot be loaded.
	 * @name UI.Image#setOnImageLoadFailed
	 * @event
	 * @example
	 * var image = new UI.Image();
	 * image.setOnImageLoadFailed(function(event) {
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
	 * @see UI.Image#event:getOnImageLoadFailed
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoadFailed` event occurs.
	 * @name UI.Image#getOnImageLoadFailed
	 * @event
	 * @returns {Function} The current function to call when an `imageLoadFailed` event occurs.
	 * @see UI.Image#event:setOnImageLoadFailed
	 * @since 1.6
	 */
	Image.registerEventType('imageLoadFailed');
};
