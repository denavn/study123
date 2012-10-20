var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var EditTextArea = exports.EditTextArea = AbstractView.subclass(
/** @lends UI.EditTextArea.prototype */
{
	'type':'edittextarea',
	/**
	 * @class The `UI.EditTextArea` class provides multi-line text areas in a user interface. The 
	 * methods in this class control how text areas are displayed and positioned, and they provide
	 * access to the user's input.
	 * 
	 * A `UI.EditTextArea` object's appearance can change automatically when its view state changes. 
	 * For example, the border around a text area can change automatically when the text area gains 
	 * focus or is selected. To implement this feature, your application can call a
	 * `UI.EditTextArea` setter method more than once, passing a different value in the `flags`
	 * parameter each time. In addition, your application can include properties for multiple view
	 * states in the constructor. See the `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.EditTextArea#setPlaceholder}` to set the
	 * text area's placeholder text, the placeholder text you specify will apply in all view states.
	 * @name UI.EditTextArea
	 * @constructs Create a text area.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.EditTextArea object without setting any of its properties.
	 * var textArea = new UI.EditTextArea();
	 * @example
	 * // Create a new UI.EditTextArea object, setting its placeholder text.
	 * var placeholderText = "Write your message here";
	 * var textArea = new UI.EditTextArea({
	 *     placeholder: placeholderText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.EditTextArea` object.
	 * @since 1.1.1.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (EditTextArea._init) EditTextArea._init();
		$super(properties);
	},
	
	
	performEventCallback: function($super, event) {
		try {
			switch (event.eventType) {
				case 'change':
					this._text = event.text;
					$super(event);
					break;
				case 'focus':
				case 'blur':
					$super(event);
					break;
			}
		} catch(e) {
			NgHandleException(e);
		}
	},
	
	// Adapt API to the single-state model for "text" on editable text.
	/**
	 * Retrieve the value of the `text` property, which contains the user's text input.
	 * @function
	 * @returns {String} The current text input.
	 * @see UI.EditTextArea#setText
	 * @status Javascript, iOS, Flash
	 * @since 1.1.1.2
	 */	
	getText: function() {
		return this._text || "";
	},
	
	/**
	 * Set the `text` property, which contains the user's text input. You can use this method to
	 * fill in a text area when its value is already known. For example, you can call this method
	 * when a user is updating previously entered text.
	 * @function
	 * @example
	 * var previousText = "This game is my favorite!";
	 * var textArea = new UI.EditTextArea();
	 * textArea.setText(previousText);
	 * @param {String} text The text that the user can edit.
	 * @returns {void}
	 * @see UI.EditTextArea#getText
	 * @status Javascript, iOS, Flash
	 * @since 1.1.1.2
	 */
	setText: function(text) {
		this._text = text;
		Commands.setText.call(this, 0, text);
	},

	focus: function() {
		Commands.setFocus.call(this, true);
	},

	blur: function() {
		Commands.setFocus.call(this, false);
	}
});

EditTextArea._init = function() {
	delete EditTextArea._init;
	if (AbstractView._init) AbstractView._init();
	
	// ==== Content
	// API defines state for the text property, but we ONLY support one state for this control.
	
	EditTextArea.registerAccessors('text', EditTextArea.prototype.getText, EditTextArea.prototype.setText);
	
	/**
	 * Retrieve the value of the `placeholder` property, which defines text that will be displayed
	 * as a placeholder before the user types in the text area.
	 * @name UI.EditTextArea#getPlaceholder
	 * @function
	 * @returns {String} The current placeholder text.
	 * @see UI.EditTextArea#setPlaceholder
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `placeholder` property, which defines text that will be displayed as a placeholder
	 * before the user types in the text area.
	 * @name UI.EditTextArea#setPlaceholder
	 * @function
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setPlaceholder("Write your message here");
	 * @param {String} placeholder The new placeholder text.
	 * @see UI.EditTextArea#getPlaceholder
	 * @returns {void}
	 */
	EditTextArea.synthesizeProperty('placeholder', Commands.setPlaceholderText);
	/**
	 * Retrieve the value of the `placeholderColor` property, which defines the text color for the
	 * placeholder text.
	 * @name UI.EditTextArea#getPlaceholderColor
	 * @function
	 * @returns {String} The current placeholder text color, in hexidecimal RGB format.
	 * @see UI.EditTextArea#setPlaceholderColor
	 * @status Javascript, iOS, Android, Flash, Test
	 */	
	/**
	 * Set the `placeholderColor` property, which defines the text color for the placeholder text.
	 * @name UI.EditTextArea#setPlaceholderColor
	 * @function
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setPlaceholderColor("666666");
	 * @param {String} placeholderColor The new placeholder text color, in hexidecimal RGB format.
	 * @see UI.EditTextArea#getPlaceholderColor
	 * @returns {void}
	 */
	EditTextArea.synthesizeProperty('placeholderColor', Commands.setPlaceholderTextColor);
	/**
	 * Retrieve the value of the `placeholderShadow` property, which defines the color and size of
	 * shadows on the placeholder text.
	 * @name UI.EditTextArea#getPlaceholderShadow
	 * @function
	 * @returns {String} The current placeholder text shadow.
	 * @see UI.EditTextArea#setPlaceholderShadow
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `placeholderShadow` property, which defines the color and size of shadows on the
	 * placeholder text. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0, -1.0}"`) that
	 * contains three values separated by spaces:
	 * 
	 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
	 * 2. The width, in pixels, to blur the edges of the shadow.
	 * 3. Two comma-separated floats enclosed in brackets:
	 *     1. The shadow's X offset from the left, in pixels.
	 *     2. The shadow's Y offset from the top, in pixels.
	 * @name UI.EditTextArea#setPlaceholderShadow
	 * @function
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
	 * var textArea = new UI.EditTextArea();
	 * textArea.setPlaceholderShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} placeholderShadow The new placeholder text shadow.
	 * @see UI.EditTextArea#getPlaceholderShadow
	 * @returns {void}
	 */
	 EditTextArea.synthesizeProperty('placeholderShadow', Commands.setPlaceholderTextShadow);
	
	
	// ==== Appearance
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the text
	 * area in a specified view state.
	 * @name UI.EditTextArea#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
	 *		format.
	 * @see UI.EditTextArea#setTextColor
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textColor` property, which defines the text color for the text area in a specified
	 * view state.
	 * @name UI.EditTextArea#setTextColor
	 * @function
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setTextColor("FFFFFF");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.EditTextArea#getTextColor
	 * @status iOS, Flash, Test
	 */
	EditTextArea.synthesizePropertyWithState('textColor', Commands.setTextColor);
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the user's text input in a specified view state.
	 * @name UI.EditTextArea#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.EditTextArea#setTextShadow
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textShadow` property, which defines the color and size of shadows on the user's text
	 * input in a specified view state. Specified as a string (for example, `"FFFFFFFF 2.0 {0.0,
	 * -1.0}"`) that contains three values separated by spaces:
	 * 
	 * 1. A color in hexidecimal ARGB format (the alpha value followed by the RGB color).
	 * 2. The width, in pixels, to blur the edges of the shadow.
	 * 3. Two comma-separated floats enclosed in brackets:
	 *     1. The shadow's X offset from the left, in pixels.
	 *     2. The shadow's Y offset from the top, in pixels.
	 * @name UI.EditTextArea#setTextShadow
	 * @function
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
	 * var textArea = new UI.EditTextArea();
	 * textArea.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified above.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you  
	 * 		can use the `|` operator to combine multiple flags.
	 * @see UI.EditTextArea#getTextShadow
	 * @status iOS, Flash, Test
	 */
	EditTextArea.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	
	/**
	 * Retrieve the value of the `textGravity` property, which defines how text is positioned within
	 * the text area.
	 * @name UI.EditTextArea#getTextGravity
	 * @function
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.EditTextArea#setTextGravity
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textGravity` property, which defines how text is positioned within the text area. 
	 * The text gravity is defined as two floats, one for the X (horizontal) axis and one for the Y
	 * (vertical) axis. Each float represents a percentage of the whitespace surrounding the text.
	 * 
	 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
	 * text, with the remainder placed to the right of the text. For the Y axis, the specified 
	 * percentage of whitespace will be placed above the text, with the remainder placed below the
	 * text.
	 * 
	 * By default, the text gravity is set to `[0.0, 0.0]`, which positions the text at the top
	 * left corner of the text area.
	 * @name UI.EditTextArea#setTextGravity
	 * @function
	 * @example
	 * // Set the text to be centered within the text area.
	 * var textArea = new UI.EditTextArea();
	 * textArea.setTextGravity([0.5, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @see UI.EditTextArea#getTextGravity
	 * @returns {void}
     * @status Flash
	 */
	EditTextArea.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);
	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * text area's text.
	 * @name UI.EditTextArea#getTextSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the text area's text.
	 * @see UI.EditTextArea#setTextSize
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the field's text.
	 * @name UI.EditTextArea#setTextSize
	 * @function
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * var textSize = 12;
	 * textArea.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the text area's text.
	 * @returns {void}
	 * @see UI.EditTextArea#getTextSize
	 * @status iOS, Flash, Test
	 */
	EditTextArea.synthesizeProperty('textSize', Commands.setTextSize);
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * text area's text.
	 * @name UI.EditTextArea#getTextFont
	 * @function
	 * @returns {String} The name of the current font.
	 * @see UI.EditTextArea#setTextFont
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textFont` property, which defines the font that is used for the text area's text.
	 * @name UI.EditTextArea#setTextFont
	 * @function
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @returns {void}
	 * @see UI.EditTextArea#getTextFont
	 * @status iOS, Flash, Test
	 */
	EditTextArea.synthesizePropertyWithState('textFont', Commands.setTextFont);
	
	// ==== Events
	/**
	 * Retrieve the function to call when a `change` event occurs. This event occurs when the user
	 * changes the value of the text area.
	 * @name UI.EditTextArea#getOnChange
	 * @event
	 * @returns {Function} The current function to call when a `change` event occurs.
	 * @see UI.EditTextArea#event:setOnChange
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set a function to call when a `change` event occurs. This event occurs when the user changes
	 * the value of the text area.
	 * @name UI.EditTextArea#setOnChange
	 * @event
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setOnChange(function(event) { 
	 *     console.log(event.text);
	 * });
	 * @cb {Function} changeCallback The function to call when a `change` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.text The new value of the text area.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.EditTextArea#event:getOnChange
	 * @status iOS, Flash
	 */
	EditTextArea.registerEventType('change');
	/**
	 * Retrieve the function to call when a `focus` event occurs. This event occurs when the text
	 * area gains focus.
	 * @name UI.EditTextArea#getOnFocus 
	 * @event	 
	 * @returns {Function} The current function to call when a `focus` event occurs.
	 * @see UI.EditTextArea#event:setOnFocus
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the function to call when a `focus` event occurs. This event occurs when the text
	 * area gains focus.
	 * @name UI.EditTextArea#setOnFocus
	 * @event
	 * @example
	 * var textArea = new UI.EditText();
	 * textArea.setOnFocus(function() {
	 *     textArea.addState(UI.Commands.State.Focused);
	 * });
	 * @cb {Function} focusCallback The function to call when a `focus` event occurs.
	 * @cb-returns {void}
	 * @status Flash
	 * @returns {void}
	 * @see UI.EditTextArea#event:getOnFocus
	 */
	EditTextArea.registerEventType('focus');
	/**
	 * Retrieve the function to call when a `blur` event occurs. This event occurs when the text
	 * area loses focus.
	 * @name UI.EditTextArea#getOnBlur
	 * @event
	 * @returns {Function} The current function to call when a `blur` event occurs.
	 * @see UI.EditTextArea#event:setOnBlur
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the function to call when a `blur` event occurs. This event occurs when the text area
	 * loses focus.
	 * @name UI.EditTextArea#setOnBlur
	 * @event
	 * @example
	 * var textArea = new UI.EditTextArea();
	 * textArea.setOnBlur(function() {
	 *     textArea.clearState(UI.Commands.State.Focused);
	 * });
	 * @cb {Function} blurCallback The current function to call when a `blur` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.EditTextArea#event:getOnBlur
	 */
	EditTextArea.registerEventType('blur');
};
