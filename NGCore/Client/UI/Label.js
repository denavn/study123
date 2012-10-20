var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var Label = exports.Label = AbstractView.subclass(
/** @lends UI.Label.prototype */
{
	'type':'label',
	/**
	 * @class The `UI.Label` class creates text labels in a user interface.
	 * 
	 * A `UI.Label` object's appearance can change automatically when its view state changes. For
	 * example, the label's text shadow can change automatically when the label is disabled. To
	 * implement this feature, your application can call a `UI.Label` setter method more than once,
	 * passing a different value in the `flags` parameter each time. In addition, your application
	 * can include properties for multiple view states in the constructor. See the `{@link UI}`
	 * module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Label#setTextGravity}` to control a label's
	 * position within its view, the text gravity you specify will apply in all view states.
	 * @name UI.Label
	 * @constructs Create a new label.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.Label object without setting any of its properties.
	 * var label = new UI.Label();
	 * @example
	 * // Create a new UI.Label object, setting its text and text color.
	 * var labelText = "First Name";
	 * var labelTextColor = "5A7F95";
	 * var label = new UI.Label({
	 *     text: labelText,
	 *     textColor: labelTextColor
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.Label`
	 *		object.
	 * @see UI.Commands#State
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (Label._init) Label._init();
		$super(properties);
	}
});

Label._init = function() {
	delete Label._init;
	if (AbstractView._init) AbstractView._init();
	
	/**
	 * Set the `text` property, which defines text for the label in a specified view state.
	 * @name UI.Label#setText
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * label.setText("First Name");
	 * @param {String} text The new text for the label.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Label#getText
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `text` property, which defines text for the label in a specified
	 * view state.
	 * @name UI.Label#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current label text for the specified view state.
	 * @see UI.Label#setText
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizePropertyWithState('text', Commands.setText);	
	/**
	 * Set the `textFont` property, which defines the font that is used for the label text in a
	 * specified view state.
	 * @name UI.Label#setTextFont
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * label.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this font. To specify a font for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Label#getTextFont
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * label text in a specified view state.
	 * @name UI.Label#getTextFont
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The name of the current font for the specified view state.
	 * @see UI.Label#setTextFont
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizePropertyWithState('textFont', Commands.setTextFont);
	/**
	 * Set the `textColor` property, which defines the text color for the label in a specified view
	 * state.
	 * @name UI.Label#setTextColor
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * label.setTextColor("5A7F95");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Label#getTextColor
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the label in
	 * a specified view state.
	 * @name UI.Label#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
	 *		format.
	 * @see UI.Label#setTextColor
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizePropertyWithState('textColor', Commands.setTextColor);
	/**
	 * Set the `textShadow` property, which defines the color and size of shadows on the label text
	 * in a specified view state. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0, -1.0}"`)
	 * that contains three values separated by spaces:
	 * 
	 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
	 * 2. The width, in pixels, to blur the edges of the shadow.
	 * 3. Two comma-separated floats enclosed in brackets:
	 *     1. The shadow's X offset from the left, in pixels.
	 *     2. The shadow's Y offset from the top, in pixels.
	 * @name UI.Label#setTextShadow
	 * @function
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
	 * var label = new UI.Label();
	 * label.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified above.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @see UI.Label#getTextShadow
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the label text in a specified view state.
	 * @name UI.Label#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.Label#setTextShadow
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	
	/**
	 * Set the `textGravity` property, which defines how the label text is positioned within the
	 * viewable area. The text gravity is defined as two floats, one for the X (horizontal) axis and
	 * one for the Y (vertical) axis. Each float represents a percentage of the whitespace 
	 * surrounding the text.
	 * 
	 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
	 * text, with the remainder placed to the right of the text. For the Y axis, the specified 
	 * percentage of whitespace will be placed above the text, with the remainder placed below the
	 * text.
	 * 
	 * By default, the text gravity is set to `[0.5, 0.5]`, which centers the text within the
	 * label's area.
	 * @name UI.Label#setTextGravity
	 * @function
	 * @example
	 * // Set the text to be near the left side of the label and
	 * // vertically centered
	 * var label = new UI.Label();
	 * label.setTextGravity([0.1, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @see UI.Label#getTextGravity
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textGravity` property, which defines how the label text is
	 * positioned within the viewable area.
	 * @name UI.Label#getTextGravity
	 * @function
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.Label#setTextGravity
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);
	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the label text.
	 * @name UI.Label#setTextSize
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * var textSize = 24;
	 * label.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the label text.
	 * @see UI.Label#getTextSize
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * label text.
	 * @name UI.Label#getTextSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the label text.
	 * @see UI.Label#setTextSize
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizeProperty('textSize', Commands.setTextSize);

	/**
	 * Set the `textInsets` property, which contains insets that are used to clip the edges of the
	 * label text. The inset is specified as an array of floats, starting with the top inset and
	 * going clockwise around the button.
	 * @name UI.Label#setTextInsets
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * var insetLeft = 10;
	 * label.setTextInsets([0, 0, 0, insetLeft]);
	 * @param {Number[]} textInsets The new text insets. Specified as an array of four floats, 
	 *		starting with the top inset and going clockwise around the label.
	 * @returns {void}
	 * @see UI.Label#getTextInsets
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `textInsets` property, which contains insets that are used to clip
	 * the edges of the label text.
	 * @name UI.Label#getTextInsets
	 * @function
	 * @returns {Number[]} The current text insets. Specified as an array of four floats, starting
	 *		with the top inset and going clockwise around the label.
	 * @see UI.Label#setTextInsets
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	Label.synthesizeCompoundProperty('textInsets', Commands.setTextInsets);

	/**
	 * Set the `lineHeight` property, which specifies the line height, in pixels, for the label
	 * text. The line height will affect the label's layout if the text wraps onto multiple lines.
	 * @name UI.Label#setLineHeight
	 * @function
	 * @example
	 * var label = new UI.Label();
	 * label.setLineHeight(24);
	 * @param {Number} lineHeight The new line height, in pixels, for the label.
	 * @returns {void}
	 * @see UI.Label#getLineHeight
	 * @status iOS, Android, Test
	 * @since 1.6
	 */
	/**
	 * Retrieve the value of the `lineHeight` property, which specifies the line height, in pixels, 
	 * for the label text.
	 * @name UI.Label#getLineHeight
	 * @function
	 * @returns {Number} The current line height, in pixels, for the label.
	 * @see UI.Label#setLineHeight
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.6
	 */
	Label.synthesizeProperty('lineHeight', Commands.setLineHeight);

};
