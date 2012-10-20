var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var WindowR = require('./Window');

var gradients = {
	'normal': {
		"gradient": ["FFED 0.000", "FFA4 1.000"],
		"insets": "{4.0,4.0,4.0,4.0}",
		"outerLine": "FF51 2.0",
		"outerShadow": "0000 0.0 {0.0,0.0}",
		"corners": "3.0 3.0 3.0 3.0"
	},
	'pressed': {
		"innerShadow": "FF00 6.0 {0.0,-1.0}",
		"gradient": ["FF80 0.000", "FF80 1.000"],
		"insets": "{4.0,4.0,4.0,4.0}",
		"outerLine": "FF51 2.0",
		"outerShadow": "0000 0.0 {0.0,0.0}",
		"corners": "3.0 3.0 3.0 3.0"
	},
	'checked': {"innerLine":"FF27A227 2.0","corners":"3.0 3.0 3.0 3.0","insets":"{4.0,4.0,4.0,4.0}","gradient":["FF2CFF2B 0.000","FF179117 1.000"],"outerShadow":"0000 0.0 {0.0,0.0}","outerLine":"FF51 3.0","innerShadow":"FF97FE97 1.0 {0.0,0.0}"},
	'checkedpressed': {"innerShadow":"FF0F610F 5.0 {0.0,-1.0}","gradient":["FF179117 0.000","FF179117 1.000"],"insets":"{4.0,4.0,4.0,4.0}","outerLine":"FF2B512B 3.0","outerShadow":"0000 0.0 {0.0,0.0}","corners":"3.0 3.0 3.0 3.0"},
	'disabled': {
		"innerShadow": "0000 0.0 {0.0,0.0}",
		"gradient": ["66B6 0.000", "66CA 1.000"],
		"insets": "{4.0,4.0,4.0,4.0}",
		"outerLine": "7FE0 3.0",
		"outerShadow": "0000 0.0 {0.0,0.0}",
		"corners": "3.0 3.0 3.0 3.0"
	}
};

var CheckBox = exports.CheckBox = AbstractView.subclass(
/** @lends UI.CheckBox.prototype */
{
	'type':'checkbox',

	/**
	 * @class The `UI.CheckBox` class provides checkboxes in a user interface. The methods in this
	 * class control how checkboxes are displayed and positioned, and they provide access to the
	 * checkbox's current state.
	 * 
	 * A `UI.CheckBox` object's appearance can change automatically when the cell's view state 
	 * changes. For example, the border around a checkbox can change automatically when the checkbox
	 * gains focus or is selected. To implement this feature, your application can call a
	 * `UI.CheckBox` setter method more than once, passing a different value in the `flags`
	 * parameter each time. In addition, your application can include properties for multiple view
	 * states in the constructor. See the `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Checkbox#setImageInsets}` to control an
	 * image's insets within the checkbox, the insets you specify will apply in all view states.
	 * @name UI.CheckBox
	 * @constructs Create a checkbox.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.CheckBox object without setting any of its properties.
	 * var checkBox = new UI.CheckBox();
	 * @example
	 * // Create a new UI.CheckBox object, setting its label text.
	 * var checkBox = new UI.CheckBox({
	 *     text: "Expert Mode"
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.CheckBox` object.
	 * @since 1.0
	 */

	/** @ignore */
	initialize: function($super, properties) {
		if (CheckBox._init) CheckBox._init();
        this._checked = false;
        $super();
		this.setGradient(gradients['normal'], Commands.State.Normal);
		this.setGradient(gradients['pressed'], Commands.State.Pressed);
		this.setGradient(gradients['checked'], Commands.State.Checked);
		this.setGradient(gradients['checkedpressed'], Commands.State.Checked | Commands.State.Pressed);
		this.setGradient(gradients['disabled'], Commands.State.Disabled);
		this.setImageInsets([4,4,4,4]);
		this.setAttributes(properties);
    },
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
    performEventCallback: function($super, event) {
		if (event.eventType == 'click') {
        	this._checked = event.checked;
			if (this._checked) {
				this._state = this._state | Commands.State.Checked;
			} else {
				this._state = this._state & ~Commands.State.Checked;
			}
		}
		$super(event);
    }
});

CheckBox._init = function() {
	delete CheckBox._init;
	if (AbstractView._init) AbstractView._init();
	
	/**
	 * Retrieve the value of the `image` property, which links to an image that represents the 
	 * checkbox for a specified view state.
	 * @name UI.CheckBox#getImage
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The path to the checkbox image for the specified view state.
	 * @see UI.CheckBox#setImage
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `image` property, which links to an image that represents the checkbox for a
	 * specified view state.
	 * @name UI.CheckBox#setImage
	 * @example
	 * var checkBox = new UI.CheckBox();        
	 * checkBox.setImage("./Content/checkBox.png");
	 * @see UI.CheckBox#getImage
	 * @param {String} imageURL The path to the new image.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this image. To specify an image for a view that is in multiple states, you can use the 
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 * @function 
	 */
	CheckBox.synthesizePropertyWithState('image', Commands.setImage);
	CheckBox.bindPropertyState('image', 'checked', Commands.State.Checked);
	/**
	 * Retrieve the value of the `imageInsets` property, which contains insets that are used to clip
	 * the edges of the checkbox image.
	 * @name UI.CheckBox#getImageInsets
	 * @function
	 * @returns {Number[]} The current image insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the checkbox.
	 * @see UI.CheckBox#setImageInsets
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `imageInsets` property, which contains insets that are used to clip the edges of the
	 * checkbox image. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the checkbox.
	 * @name UI.CheckBox#setImageInsets
	 * @function
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * // Use a top inset of 10, a right inset of 20, a bottom inset of 15, and
	 * // a left inset of 5.
	 * checkBox.setImageInsets([10, 20, 15, 5]);
	 * @param {Number[]} imageInsets The new image insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the checkbox.
	 * @returns {void}
	 * @see UI.CheckBox#getImageInsets
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizeCompoundProperty('imageInsets', Commands.setImageInsets);

	/**
	 * Set the function to call when an `imageLoaded` event occurs. This event occurs when an image
	 * that is specified for a `UI.CheckBox` finishes loading.
	 * @name UI.CheckBox#setOnImageLoaded
	 * @event
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setOnImageLoaded(function(event) {
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
	 * @cb-param {UI.Commands#ResourceError} [event.error] A code identifying the error, if any.
	 * @cb-param {Number} [event.height] The height of the image that was loaded.
	 * @cb-param {String} [event.message] A message describing the error, if any.
	 * @cb-param {Number} [event.width] The width of the image that was loaded.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.CheckBox#event:getOnImageLoaded
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoaded` event occurs.
	 * @name UI.CheckBox#getOnImageLoaded
	 * @event
	 * @returns {Function} The current function to call when an `imageLoaded` event occurs.
	 * @see UI.CheckBox#event:setOnImageLoaded
	 * @since 1.6
	 */
	CheckBox.registerEventType('imageLoaded');
	
	/**
	 * Set a function to call when an `imageLoadFailed` event occurs. This event occurs when an
	 * image that is specified for a `UI.CheckBox` cannot be loaded.
	 * @name UI.CheckBox#setOnImageLoadFailed
	 * @event
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setOnImageLoadFailed(function(event) {
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
	 * @see UI.CheckBox#event:getOnImageLoadFailed
	 * @since 1.6
	 */
	/**
	 * Retrieve the function to call when an `imageLoadFailed` event occurs.
	 * @name UI.CheckBox#getOnImageLoadFailed
	 * @event
	 * @returns {Function} The current function to call when an `imageLoadFailed` event occurs.
	 * @see UI.CheckBox#event:setOnImageLoadFailed
	 * @since 1.6
	 */
	CheckBox.registerEventType('imageLoadFailed');
	
	
	/**
	 * Retrieve the value of the `text` property, which defines text for the checkbox's label in a 
	 * specified view state.
	 * @name UI.CheckBox#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text for the checkbox's label for the specified view state.
	 * @see UI.CheckBox#setText
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `text` property, which defines text for the checkbox's label in a specified view 
	 * state.
	 * @name UI.CheckBox#setText
	 * @function
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setText("Flip screen");
	 * @param {String} text The new text for the checkbox's label.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @see UI.CheckBox#getText
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizePropertyWithState('text', Commands.setText);
	CheckBox.bindPropertyState('text', 'checked', Commands.State.Checked);
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the 
	 * checkbox's label in a specified view state.
	 * @name UI.CheckBox#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
	 *		format.
	 * @see UI.CheckBox#setTextColor
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textColor` property, which defines the text color for the checkbox's label in a 
	 * specified view state.
	 * @name UI.CheckBox#setTextColor
	 * @function 
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setTextColor("FFFFFF");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CheckBox#getTextColor
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizePropertyWithState('textColor', Commands.setTextColor);
	CheckBox.bindPropertyState('textColor', 'checked', Commands.State.Checked);
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the checkbox's label in a specified view state.
	 * @name UI.CheckBox#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.CheckBox#setTextShadow	
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textShadow` property, which defines the color and size of shadows on the checkbox's 
	 * label in a specified view state. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0, 
	 * -1.0}"`) that contains three values separated by spaces:
	 * 
	 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
	 * 2. The width, in pixels, to blur the edges of the shadow.
	 * 3. Two comma-separated floats enclosed in brackets:
	 *     1. The shadow's X offset from the left, in pixels.
	 *     2. The shadow's Y offset from the top, in pixels.
	 * @name UI.CheckBox#setTextShadow
	 * @function
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel
	 * // along the Y axis.
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified above.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.CheckBox#getTextShadow
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	CheckBox.bindPropertyState('textShadow', 'checked', Commands.State.Checked);
	/**
	 * Retrieve the value of the `textGravity` property, which defines how the checkbox's label is
	 * positioned within the viewable area.
	 * @name UI.CheckBox#getTextGravity
	 * @function
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.CheckBox#setTextGravity
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textGravity` property, which defines how the checkbox label is positioned within the
	 * viewable area. The text gravity is defined as two floats, one for the X (horizontal) axis and
	 * one for the Y (vertical) axis. Each float represents a percentage of the whitespace 
	 * surrounding the text.
	 * 
	 * By default, the image gravity is set to `[0.5, 0.5]`, which centers the text within the
	 * viewable area.
	 * @name UI.CheckBox#setTextGravity
	 * @function
	 * @example
	 * // Position the checkbox label so it is horizontally pushed towards the
	 * // left side of the viewable area and vertically centered.
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setTextGravity([0.1, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @see UI.CheckBox#getTextGravity
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);

	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * checkbox label.
	 * @name UI.CheckBox#getTextSize
	 * @returns {Number} The current size, in pixels, of the checkbox label.
	 * @see UI.CheckBox#setTextSize
	 * @status Javascript, iOS, Android, Flash, Test
	 * @function
	 */
	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the checkbox label.
	 * @name UI.CheckBox#setTextSize
	 * @function
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * var textSize = 12;
	 * checkBox.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the checkbox label.
	 * @see UI.CheckBox#getTextSize
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizeProperty('textSize', Commands.setTextSize);
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * checkbox label in a specified view state.
	 * @name UI.CheckBox#getTextFont
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The name of the current font for the specified view state.
	 * @see UI.CheckBox#setTextFont
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textFont` property, which defines the font that is used for the checkbox label in a
	 * specified view state.
	 * @name UI.CheckBox#setTextFont
	 * @function
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this font. To specify a font for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @see UI.CheckBox#getTextFont
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizePropertyWithState('textFont', Commands.setTextFont);
	CheckBox.bindPropertyState('textFont', 'checked', Commands.State.Checked);
	/**
	 * Retrieve the value of the `textInsets` property, which contains insets that are used to clip
	 * the edges of the checkbox label.
	 * @name UI.CheckBox#getTextInsets
	 * @function
	 * @returns {Number[]} The current text insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the checkbox label.
	 * @see UI.CheckBox#setTextInsets
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textInsets` property, which contains insets that are used to clip the edges of the
	 * checkbox label. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the checkbox label.
	 * @name UI.CheckBox#setTextInsets
	 * @function
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * var insetLeft = 10;
	 * checkBox.setTextInsets([0, 0, 0, insetLeft]);
	 * @param {Number[]} textInsets The new text insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the button.
	 * @see UI.CheckBox#getTextInsets
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	CheckBox.synthesizeCompoundProperty('textInsets', Commands.setTextInsets);
	
	// Corresponding event is onClick
	/**
	 * Retrieve the value of the `checked` property, which indicates whether the checkbox is
	 * currently checked.
	 * @name UI.CheckBox#getChecked
	 * @function
	 * @returns {Boolean} Set to `true` if the checkbox is currently checked.
	 * @see UI.CheckBox#setChecked
	 * @status Javascript, iOS, Android, Flash
	 */
	/**
	 * Set the `checked` property, which indicates whether the checkbox is currently checked.
	 * @name UI.CheckBox#setChecked
	 * @function 
	 * @example
	 * var checkBox = new UI.CheckBox();
	 * checkBox.setChecked(true);
	 * @param {Boolean} checked Set to `true` if the checkbox is currently checked.
	 * @returns {void}
	 * @see UI.CheckBox#getChecked
	 * @status iOS, Android, Flash
	 */
	CheckBox.synthesizeProperty('checked', Commands.setChecked);
};
