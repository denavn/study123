var View = require('./View').View;
var Commands = require('./Commands').Commands;

var CellView = exports.CellView = View.subclass(
/** @lends UI.CellView.prototype */
{
	'type':'cell',
	/**
	 * @class The `UI.CellView` class provides cell views in an application, such as cells in a
	 * scrolling list. A `UI.CellView` object can display an image, such as an arrow, on the right
	 * side. The object also provides two vertically stacked areas that can contain a title and
	 * other text.
	 * 
	 * A `UI.CellView` object's appearance can change automatically when the cell's view state 
	 * changes. For example, the cell's fill color can change automatically when the cell is
	 * selected. To implement this feature, your application can call a `UI.CellView` setter method 
	 * more than once, passing a different value in the `flags` parameter each time. In addition, 
	 * your application can include properties for multiple view states in the constructor. See the
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.CellView#setImageGravity}` to control an
	 * image's position within the cell, the image gravity you specify will apply in all view
	 * states.
	 * @name UI.CellView
	 * @constructs Create a cell view.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.CellView object without setting any of its properties.
	 * var cell = new UI.CellView();
	 * @example
	 * // Create a new UI.CellView object, setting its title and text.
	 * var cellTitle = "Options";
	 * var cellText = "Configure the application."
	 * var cell = new UI.CellView({
	 *     title: cellTitle,
	 *     text: cellText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.CellView` object.
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (CellView._init) CellView._init();
		$super(properties);
	}
});

// Properties
CellView._init = function() {
	delete CellView._init;
	if (View._init) View._init();
	
	/**
	 * Set the `image` property, which links to an image that is displayed in the cell for a
	 * specified view state.
	 * @name UI.CellView#setImage
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setImage("./Content/cell-bg.png", UI.Commands.State.Normal |
	 *     UI.Commands.State.Focused);
	 * @param {String} image The path to the new image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image. To specify an image for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getImage
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `image` property for a specified view state.
	 * @name UI.CellView#getImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The path to the image for the specified view state.
	 * @see UI.CellView#setImage
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('image', Commands.setImage);
	/**
	 * Set the value of the `imageBorder` property, which defines a border for images in a
	 * specified view state. See `{@link UI.Style#setGradient}` for information about this
	 * property.
	 * @name UI.CellView#setImageBorder
	 * @function
	 * @example
	 * // Use a dark gray border for the image.
	 * var cell = new UI.CellView();
	 * var border = {
	 *     outerLine: "FF5F5F5F 1.0"
	 * };
	 * cell.setImageBorder(border);
	 * @param {Object} imageBorder The new image border.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this border. To specify a border for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getImageBorder
	 * @see UI.Style#setGradient
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageBorder` property, which defines a border for images in a
	 * specified view state.
	 * @name UI.CellView#getImageBorder
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current image border.
	 * @see UI.CellView#setImageBorder
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('imageBorder', Commands.setImageBorder);
	/**
	 * Set the `imageInsets` property, which contains insets that are used to clip the edges of the
	 * image.
	 * @name UI.CellView#setImageInsets
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
	 * // a left inset of 5.
	 * cell.setImageInsets([10, 20, 15, 5]);
	 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the button.
	 * @returns {void}
	 * @see UI.CellView#getImageInsets
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageInsets` property, which contains insets that are used to clip
	 * the edges of the image.
	 * @name UI.CellView#getImageInsets
	 * @function
	 * @returns {Number[]} The current image insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the button.
	 * @see UI.CellView#setImageInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('imageInsets', Commands.setImageInsets);
	/**
	 * Set the `imageFit` property, which defines how images will be scaled relative to the cell.
	 * @name UI.CellView#setImageFit
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setImageFit(UI.Commands.FitMode.None);
	 * @param {UI.Commands#FitMode} imageFit The method that will be used to scale images relative
	 * 		to the cell.
	 * @returns {void}
	 * @see UI.CellView#getImageFit
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `imageFit` property, which defines how images will be scaled
	 * relative to the cell.
	 * @name UI.CellView#getImageFit
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setImageFit(UI.Commands.FitMode.AspectWidth);
	 * // More code here.
	 * // Later, the application takes different actions based on the
	 * // image's fit mode:
	 * var imageFitMode = cell.getImageFit();
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
	 * 		the cell. The returned value corresponds to an enumerated value of
	 *		`{@link UI.Commands#FitMode}`.
	 * @see UI.CellView#setImageFit
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	CellView.synthesizeProperty('imageFit', Commands.setImageFitMode);
	/**
	 * Set the `imageGravity` property, which defines how the image is positioned within the
	 * viewable area. By default, the image gravity is set to `[0.5, 0.5]`, which centers the image
	 * within the viewable area.
	 * 
	 * See `{@link UI.Image#setImageGravity}` for more information about this property.
	 * @name UI.CellView#setImageGravity
	 * @function
	 * @example
	 * // Position the image towards the left side of the cell and vertically centered.
	 * var cell = new UI.CellView();
	 * cell.setImageGravity([0.25, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} imageGravity The new image gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @returns {void}
	 * @see UI.CellView#getImageGravity
	 * @see UI.Image#setImageGravity
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * @name UI.CellView#getImageGravity
	 * @function
	 * @description Retrieve the value of the `imageGravity` property.
	 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.CellView#setImageGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('imageGravity', Commands.setImageGravity);
	 /**
	 * Set the `imageTransform` property, which defines an affine transformation of the image. See
	 * `{@link UI.Image#setImageTransform}` for more information about affine transformations.
	 * @name UI.CellView#setImageTransform
	 * @function
	 * @example
	 * // Increase an image's size by 20 units along the X axis, and move it
	 * // down 5 units along the Y axis.
	 * var cell = new UI.CellView();
	 * var scaleX = 20;
	 * var moveY = 5;
	 * cell.setImageTransform([scaleX, 0, 0, 0, 0, moveY]);
	 * @example
	 * // Rotate an image 30 degrees to the left.
	 * function degreesToRadians(degrees) {
	 *     return degrees * (Math.PI / 180);
	 * }
	 *
	 * var cell = new UI.CellView();
	 * var angle = degreesToRadians(30);
	 * cell.setImageTransform([Math.cos(angle), Math.sin(angle),
	 *     -Math.sin(angle), Math.cos(angle), 0, 0]);
	 * @example
	 * // Skew the bottom of an image to the right by 10 units along the x axis.
	 * var cell = new UI.CellView();
	 * var skewX = 10;
	 * cell.setImageTransform([0, 0, skewX, 0, 0, 0]);
	 * @param {Number[]} imageTransform The new affine transformation. Specified as an array of
	 *		four floats: `[a, b, c, d, tx, ty]`.
	 * @returns {void}
	 * @see UI.CellView#getImageTransform
	 * @see UI.Image#setImageTransform
 	 * @status iOS, Android, Test
	 */
	/**
	 * Retrieve the value of the `imageTransform` property, which defines an affine transformation
	 * of the image.
	 * @name UI.CellView#getImageTransform
	 * @function
	 * @returns {Number[]} The current affine transformation. Specified as an array of six floats:
	 *		 `[a, b, c, d, tx, ty]`.
	 * @see UI.CellView#setImageTransform
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	 CellView.synthesizeCompoundProperty('imageTransform', Commands.setImageTransform);
	/**
	 * Retrieve the value of the `rightImage` property, which defines a path to an image to display
	 * on the right side of the cell for a specified view state.
	 * @name UI.CellView#getRightImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current path to the image that will be displayed on the right side of
	 *		the cell.
	 * @see UI.CellView#setRightImage
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImage` property, which defines a path to an image to display on the right side
	 * of the cell for a specified view state. For example, your application could display a right
	 * arrow, indicating that the user will proceed to a new view by touching the cell.
	 * @name UI.CellView#setRightImage
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setRightImage("./Content/right-arrow.png",
	 *     UI.Commands.State.Focused);
	 * @param {String} rightImage The path to the new image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this right image. To specify a right image for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getRightImage
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('rightImage', Commands.setRightImage);
	/**
	 * Retrieve the value of the `rightImageBorder` property, which defines a border for the image
	 * that is specified by the `rightImage` property for a specified view state.
	 * @name UI.CellView#getRightImageBorder
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The current image border for the right image.
	 * @see UI.CellView#setRightImage
	 * @see UI.CellView#setRightImageBorder
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImageBorder` property, which defines a border for the image that is specified 
	 * by the `rightImage` property for a specified view state. See `{@link UI.Style#setGradient}`
	 * for information about the `rightImageBorder` property.
	 * @name UI.CellView#setRightImageBorder
	 * @function
	 * @example
	 * // Use a dark gray border for the right image.
	 * var cell = new UI.CellView();
	 * var border = {
	 *     outerLine: "FF5F5F5F 1.0"
	 * };
	 * cell.setRightImageBorder(border);
	 * @param {Object} rightImageBorder The new image border for the right image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this right image border. To specify a right image for a view that is in multiple states,
	 * 		you can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#setRightImage
	 * @see UI.CellView#getRightImageBorder
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('rightImageBorder', Commands.setRightImageBorder);
	/**
	 * Retrieve the value of the `rightImageInsets` property, which contains insets that are used to
	 * clip the edges of the right image.
	 * @name UI.CellView#getRightImageInsets
	 * @function
	 * @returns {Number[]} The current image insets. Specified as an array of four floats, starting 
	 *		with the top inset and going clockwise around the cell.
	 * @see UI.CellView#setRightImageInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImageInsets` property, which contains insets that are used to clip the edges of
	 * the right image. The inset is specified as an array of floats, starting with the top inset
	 * and going clockwise around the cell.
	 * @name UI.CellView#setRightImageInsets
	 * @function
	 * @example
	 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
	 * // a left inset of 5.
	 * var cell = new UI.CellView();
	 * cell.setRightImageInsets([10, 20, 15, 5]);
	 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the cell.
	 * @returns {void}
	 * @see UI.CellView#getRightImageInsets
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('rightImageInsets', Commands.setRightImageInsets);
	/**
	 * Retrieve the value of the `rightImageFit` property, which defines how the right image will be
	 * scaled relative to the view.
	 * @name UI.CellView#getRightImageFit
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setRightImageFit(UI.Commands.FitMode.AspectWidth);
	 * // More code here.
	 * // Later, the application takes an action based on the image's
	 * // fit mode:
	 * var imageFitMode = cell.getImageFit();
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
	 * @see UI.CellView#setRightImageFit
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImageFit` property, which defines how the right image will be scaled relative
	 * to the view.
	 * @name UI.CellView#setRightImageFit
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setRightImageFit(UI.Commands.FitMode.None);
	 * @param {UI.Commands#FitMode} rightImageFit The scaling option that will be used to scale 
	 * 		the right image relative to the cell.
	 * @returns {void}
	 * @see UI.CellView#getRightImageFit
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeProperty('rightImageFit', Commands.setRightImageFitMode);
	/**
	 * Retrieve the value of the `rightImageGravity` property, which defines how the right image is
	 * positioned within the viewable area.
	 * @name UI.CellView#getRightImageGravity
	 * @function
	 * @returns {Number[]} The current image gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.CellView#setRightImageGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImageGravity` property, which defines how the right image is positioned within 
	 * the viewable area. See `{@link UI.Image#setImageGravity}` for information about this
	 * property.
	 * @name UI.CellView#setRightImageGravity
	 * @function
	 * @example
	 * // Position the right image so that it is horizontally centered and vertically
	 * // adjacent to the top edge of the cell.
	 * var cell = new UI.CellView();
	 * cell.setRightImageGravity([0.5, 0.0]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} rightImageGravity The new image gravity. Specified
	 *		as an array of two floats, where the first represents the X axis and the second
	 *		represents the Y axis. You can also specify an enumerated value of
	 *		`{@link UI.ViewGeometry#Gravity}` in place of the array.
	 * @returns {void}
	 * @see UI.CellView#getRightImageGravity
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('rightImageGravity', Commands.setRightImageGravity);
	/**
	 * Retrieve the current value of the `rightImageTransform` property, which defines an affine
	 * transformation of the right image.
	 * @name UI.CellView#getRightImageTransform
	 * @function
	 * @returns {Number[]} The current affine transformation. Specified as an array of six floats:
	 *		`[a, b, c, d, tx, ty]`.
	 * @see UI.CellView#setRightImageTransform
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `rightImageTransform` property, which defines an affine transformation of the right 
	 * image. See `{@link UI.Image#setImageTransform}` for information about this property.
	 * @name UI.CellView#setRightImageTransform
	 * @function
	 * @example 
	 * // Increase the right image's size by 20 units along the X axis, and 
	 * // move it down 5 units along the Y axis.
	 * var cell = new UI.CellView();
	 * var scaleX = 20;
	 * var moveY = 5;
	 * cell.setRightImageTransform([scaleX, 0, 0, 0, 0, moveY]);
	 * @param {Number[]} imageTransform The new affine transformation. Specified as an array of six
	 *		floats: `[a, b, c, d, tx, ty]`.
	 * @returns {void}
	 * @see UI.CellView#getRightImageTransform
	 * @see UI.Image#setImageTransform
 	 * @status iOS, Android, Test
	 */
	CellView.synthesizeCompoundProperty('rightImageTransform', Commands.setRightImageTransform);
	
	/**
	 * Set the function to call when an `imageLoaded` event occurs. This event occurs when an image
	 * that is specified for a `UI.CellView` finishes loading.
	 * @name UI.CellView#setOnImageLoaded
	 * @event
	 * @example
	 * var cellView = new UI.CellView();
	 * cellView.setOnImageLoaded(function(event) {
	 *     if (event.error) {
	 *         console.log("Unable to load image: " + e.error + " " + e.message);
	 *     } else {
	 *         console.log("Loaded the image " + event.imageUrl);
	 *         console.log("Width: " + event.width + ", height: " + event.height);
	 *     }
	 * });
	 * @cb {Function} imageLoadedCallback The function to call when an `imageLoaded` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {UI.Commands#ResourceError} [event.error] A code identifying the error, if any.
	 * @cb-param {Number} [event.height] The height of the image that was loaded.
	 * @cb-param {String} event.imageUrl The URL of the image that was loaded, or that failed to
	 *		load.
	 * @cb-param {String} [event.message] A description of the error, if any.
	 * @cb-param {Number} [event.width] The width of the image that was loaded.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.CellView#event:getOnImageLoaded
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoaded` event occurs.
	 * @name UI.CellView#getOnImageLoaded
	 * @event
	 * @returns {Function} The function to call when an `imageLoad` event occurs.
	 * @see UI.CellView#event:setOnImageLoaded
	 * @since 1.6
	 */
	 CellView.registerEventType('imageLoaded'); 
		
	/**
	 * Set a function to call when an `imageLoadFailed` event occurs. This event occurs when an
	 * image that is specified for a `UI.CellView` cannot be loaded.
	 * @name UI.CellView#setOnImageLoadFailed
	 * @event
	 * @example
	 * var cellView = new UI.CellView();
	 * cellView.setOnImageLoadFailed(function(event) {
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
	 * @see UI.CellView#event:getOnImageLoadFailed
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoadFailed` event occurs.
	 * @name UI.CellView#getOnImageLoadFailed
	 * @event
	 * @returns {Function} The current function to call when an `imageLoadFailed` event occurs.
	 * @see UI.CellView#event:setOnImageLoadFailed
	 * @since 1.6
	 */
	CellView.registerEventType('imageLoadFailed');
	
	/**
	 * Retrieve the current value of the `title` property, which defines a title for the cell in a
	 * specified view state.
	 * @name UI.CellView#getTitle
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current cell title.
	 * @see UI.CellView#setTitle
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `title` property, which defines a title for the cell in a specified view state.
	 * @name UI.CellView#setTitle
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * var cellTitle = "Configure Application";
	 * cell.setTitle(cellTitle);
	 * @param {String} title The new cell title.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this title. To specify a title for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTitle
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('title', Commands.setTitle);
	/**
	 * Retrieve the value of the `titleColor` property, which defines the text color for the title
	 * in a specified view state.
	 * @name UI.CellView#getTitleColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current title text color, in hexidecimal RGB format.
	 * @see UI.CellView#setTitleColor
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleColor` property, which defines the text color for the title in a specified view
	 * state.
	 * @name UI.CellView#setTitleColor
	 * @function 
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setTitleColor("FFFFFF");
	 * @param {String} titleColor The new title text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTitleColor
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('titleColor', Commands.setTitleColor);
	/**
	 * Retrieve the value of the `titleFont` property, which defines the font that is used for the 
	 * title text in a specified view state.
	 * @name UI.CellView#getTitleFont	 
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current title text font.
	 * @see UI.CellView#setTitleFont
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleFont` property, which defines the font that is used for the title text in a
	 * specified view state.
	 * @name UI.CellView#setTitleFont
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setTitleFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this font. To specify a font for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTitleFont
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('titleFont', Commands.setTitleFont);
	/**
	 * Retrieve the value of the `titleShadow` property, which defines the color and size of shadows
	 * on the title text in a specified view state.
	 * @name UI.CellView#getTitleShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current title text shadow.
	 * @see UI.CellView#setTitleShadow
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleShadow` property, which defines the color and size of shadows on the title text
	 * in a specified view state. See `{@link UI.Style#setTextShadow}` for information about this
	 * property.
	 * @name UI.CellView#setTitleShadow
	 * @function
	 * @example
	 * // Set a light gray text shadow with a two-pixel blur, shifted up by one
	 * // pixel along the Y axis.
	 * var cell = new UI.CellView();
	 * cell.setTitleShadow("FFCCCCFF 2.0 {0.0, -1.0}");
	 * @param {String} titleShadow The new title text shadow, in the format specified by 
	 *		`{@link UI.Button#setTextShadow}`.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you 
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTitleShadow
	 * @see UI.Style#setTextShadow
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('titleShadow', Commands.setTitleShadow);

	/**
	 * Retrieve the value of the `titleGravity` property, which defines how the title text is
	 * positioned within the viewable area.
	 * @name UI.CellView#getTitleGravity
	 * @function
	 * @returns {Number[]} The current title text gravity. Specified as an array of two floats,
	 *		where the first represents the X axis and the second represents the Y axis.
	 * @see UI.CellView#setTitleGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleGravity` property, which defines how the title text is positioned within the
	 * viewable area. See `{@link UI.Style#setTextGravity}` for information about this property.
	 * @name UI.CellView#setTitleGravity
	 * @function
	 * @example
	 * // Position the title text so that it is horizontally centered and vertically
	 * // adjacent to the top of the cell.
	 * var cell = new UI.CellView();
	 * cell.setTitleGravity([0.5, 0.0]);	 
	 * @param {Number[]|UI.ViewGeometry#Gravity} titleGravity The new title text gravity. Specified
	 *		as an array of two floats, where the first represents the X axis and the second
	 *		represents the Y axis. You can also specify an enumerated value of
	 *		`{@link UI.ViewGeometry#Gravity}` in place of the array.
	 * @returns {void}
	 * @see UI.CellView#getTitleGravity
	 * @see UI.Style#setTextGravity
	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('titleGravity', Commands.setTitleGravity);

	/**
	 * Retrieve the value of the `titleSize` property, which specifies the size, in pixels, of the
	 * title text.
	 * @name UI.CellView#getTitleSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the title text.
	 * @see UI.CellView#setTitleSize
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleSize` property, which specifies the size, in pixels, of the title text.
	 * @name UI.CellView#setTitleSize
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * var textSize = 24;
	 * cell.setTitleSize(textSize);
	 * @param {Number} titleSize The new size, in pixels, of the title text.
	 * @returns {void}
	 * @see UI.CellView#getTitleSize
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeProperty('titleSize', Commands.setTitleSize);
	/**
	 * Retrieve the value of the `titleInsets` property, which contains insets that are used to clip
	 * the edges of the title text.
	 * @name UI.CellView#getTitleInsets
	 * @function
	 * @returns {Number[]} The current title text insets. Specified as an array of four floats, 
	 *		representing pixels, starting with the top inset and going clockwise around the text.
	 * @see UI.CellView#setTitleInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `titleInsets` property, which contains insets that are used to clip the edges of the
	 * title text. The inset is specified as an array of floats, representing pixels, starting with 
	 * the top inset and going clockwise around the text.
	 * @name UI.CellView#setTitleInsets
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * var insetLeft = 10;
	 * cell.setTitleInsets([0, 0, 0, insetLeft]);
	 * @param {Number[]} titleInsets The new title text insets. Specified as an array of four 
	 *		floats, representing pixels, starting with the top inset and going clockwise around the 
	 *		text.
	 * @returns {void}
	 * @see UI.CellView#getTitleInsets
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('titleInsets', Commands.setTitleInsets);
	
	/**
	 * Retrieve the value of the `text` property, which defines text for the cell in a specified
	 * view state.
	 * @name UI.CellView#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text for the cell.
	 * @see UI.CellView#setText
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `text` property, which defines text for the cell in a specified view state.
	 * @name UI.CellView#setText
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * var cellText = "Change your configuration settings.";
	 * cell.setText(cellText);
	 * @param {String} text The new text for the cell.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getText
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	CellView.synthesizePropertyWithState('text', Commands.setText);
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the cell in
	 * a specified view state.
	 * @name UI.CellView#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color, in hexidecimal RGB format.
	 * @see UI.CellView#setTextColor
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textColor` property, which defines the text color for the cell in a specified view
	 * state.
	 * @name UI.CellView#setTextColor
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setTextColor("FFFFFF");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTextColor
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('textColor', Commands.setTextColor);
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the button text in a specified view state.
	 * @name UI.CellView#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.CellView#setTextShadow	
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textShadow` property, which defines the color and size of shadows on the cell text
	 * in a specified view state. See `{@link UI.Style#setTextShadow}` for information about this
	 * property.
	 * @name UI.CellView#setTextShadow
	 * @function
	 * @example
	 * // Set a white text shadow with a two-pixel blur, shifted up one pixel
	 * // along the Y axis.
	 * var cell = new UI.CellView();
	 * cell.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified by
	 *		`{@link UI.Button#setTextShadow}`.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you 
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTextShadow
	 * @see UI.Style#setTextShadow
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * cell text in a specified view state.
	 * @name UI.CellView#getTextFont
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The name of the current font.
	 * @see UI.CellView#setTextFont
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textFont` property, which defines the font that is used for the cell text in a
	 * specified view state.
	 * @name UI.CellView#setTextFont
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * cell.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this font. To specify a font for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CellView#getTextFont
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizePropertyWithState('textFont', Commands.setTextFont);
	
	/**
	 * Retrieve the value of the `textGravity` property, which defines how the cell text is
	 * positioned within the viewable area.
	 * @name UI.CellView#getTextGravity
	 * @function
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.CellView#setTextGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textGravity` property, which defines how the cell text is positioned within the
	 * viewable area. See `{@link UI.Style#setTextGravity}` for information about this property.
	 * @name UI.CellView#setTextGravity	 
	 * @function
	 * @example
	 * // Position the cell text so it is horizontally pushed towards the left edge
	 * // of the cell and vertically centered.
	 * var cell = new UI.CellView();
	 * cell.setTextGravity([0.1, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @returns {void}
	 * @see UI.CellView#getTextGravity
	 * @see UI.Style#setTextGravity
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);

	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * cell text.
	 * @name UI.CellView#getTextSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the cell text.
	 * @see UI.CellView#setTextSize
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the cell text.
	 * @name UI.CellView#setTextSize
	 * @function
	 * @example
	 * var cell = new UI.CellView();
	 * var textSize = 24;
	 * cell.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the cell text.
	 * @returns {void}
	 * @see UI.CellView#getTextSize
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeProperty('textSize', Commands.setTextSize);
	/**
	 * Retrieve the value of the `textInsets` property, which contains insets that are used to clip
	 * the edges of the cell text.
	 * @name UI.CellView#getTextInsets
	 * @function
	 * @returns {Number[]} The current text insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the button.
	 * @see UI.CellView#setTextInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textInsets` property, which contains insets that are used to clip the edges of the
	 * cell text. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the text.
	 * @name UI.CellView#setTextInsets
	 * @function
	 * @example
	 * // Add a two-pixel inset to the left and right sides of the text.
	 * var cell = new UI.CellView();
	 * cell.setTextInsets([0.0, 2.0, 0.0, 2.0]);
	 * @param {Number[]} textInsets The new text insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the button.
	 * @returns {void}
	 * @see UI.CellView#getTextInsets
 	 * @status iOS, Android, Flash, Test
	 */
	CellView.synthesizeCompoundProperty('textInsets', Commands.setTextInsets);
};
