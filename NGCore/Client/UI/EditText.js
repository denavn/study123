var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var EditText = exports.EditText = AbstractView.subclass(
/** @lends UI.EditText.prototype */
{
	'type':'edittext',
	/**
	 * @class The `UI.EditText` class creates single-line text fields in a user interface. The 
	 * methods in this class control how text fields are displayed and positioned, and they provide
	 * access to the user's input.
	 *
	 * A `UI.EditText` object's appearance can change automatically when its view state changes. For
	 * example, the field's text color can change automatically when the field gains focus or is
	 * selected. To implement this feature, your application can call a `UI.EditText` setter method 
	 * more than once, passing a different value in the `flags` parameter each time. In addition, 
	 * your application can include properties for multiple view states in the constructor. See the
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.EditText#setPlaceholder}` to control a
	 * field's placeholder text, the placeholder text you specify will apply in all view states.
	 *
	 * **Note**: As of version 1.6, `UI.EditText` objects no longer fire `click` events, and calling
	 * `UI.EditText.setOnClick()` will have no effect.
	 * @name UI.EditText
	 * @constructs Create a text field.
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.EditText object without setting any of its properties.
	 * var textField = new UI.EditText();
	 * @example
	 * // Create a new UI.EditText object, setting its placeholder text.
	 * var placeholderText = "Email address";
	 * var textField = new UI.EditText({
	 *     placeholder: placeholderText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.EditText` object.
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (EditText._init) EditText._init();
		$super(properties);
		this.setOnClick = this.setOnClickCancel = function() {
			NgLogE("WARNING: Click and ClickCancel events do not work on EditText objects.");
		};
	},
	
	
	'InputTypes': Commands.InputType,
	'EnterKeyTypes': Commands.EnterKeyType,
	
	
	performEventCallback: function($super, event) {
		try {
			switch (event.eventType) {
				case 'change':
					this._text = event.text;
					/* falls through */
				default: $super(event);
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
	 * @see UI.EditText#setText
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */	
	getText: function() {
		return this._text || "";
	},
	
	/**
	 * Set the `text` property, which contains the user's text input. You can use this method to
	 * fill in fields whose value is already known, such as a user's name.
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * var firstName = "John";
	 * textField.setText(firstName);
	 * @param {String} text The text that the user can edit.
	 * @returns {void}
	 * @see UI.EditText#getText
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
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
	},
	
	setFocus: function(focus) {
		try {
			throw new Error("EditText.setFocus is deprecated and should not be used. Please use .focus() and .blur().");
		} catch (e) {
			NgHandleException(e);
		}
		Commands.setFocus.call(this, focus);
	}
});

EditText._init = function() {
	delete EditText._init;
	if (AbstractView._init) AbstractView._init();
	
	// ==== Content
	// API defines state for the text property, but we ONLY support one state for this control.
	
	EditText.registerAccessors('text', EditText.prototype.getText, EditText.prototype.setText);
	
	/**
	 * Retrieve the value of the `placeholder` property, which defines text that will be displayed
	 * as a placeholder before the user types in the text field.
	 * @name UI.EditText#getPlaceholder
	 * @function
	 * @returns {String} The current placeholder text.
	 * @see UI.EditText#setPlaceholder
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `placeholder` property, which defines text that will be displayed as a placeholder
	 * before the user types in the text field.
	 * @name UI.EditText#setPlaceholder
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * var placeholderText = "Email address";
	 * textField.setPlaceholder(placeholderText);
	 * @param {String} placeholder The new placeholder text.
	 * @returns {void}
	 * @see UI.EditText#getPlaceholder
	 */
	EditText.synthesizeProperty('placeholder', Commands.setPlaceholderText);
	/**
	 * Retrieve the value of the `placeholderColor` property, which defines the text color for the
	 * placeholder text.
	 * @name UI.EditText#getPlaceholderColor
	 * @function
	 * @returns {String} The current placeholder text color, in hexidecimal RGB format.
	 * @see UI.EditText#setPlaceholderColor
	 * @status Javascript, iOS, Android, Flash, Test
	 */	
	/**
	 * Set the `placeholderColor` property, which defines the text color for the placeholder text.
	 * @name UI.EditText#setPlaceholderColor
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setPlaceholderColor("666666");
	 * @param {String} placeholderColor The new placeholder text color, in hexidecimal RGB format.
	 * @see UI.EditText#getPlaceholderColor
	 * @returns {void}
	 */
	EditText.synthesizeProperty('placeholderColor', Commands.setPlaceholderTextColor);
	/**
	 * Retrieve the value of the `placeholderShadow` property, which defines the color and size of
	 * shadows on the placeholder text.
	 * @name UI.EditText#getPlaceholderShadow
	 * @function
	 * @returns {String} The current placeholder text shadow.
	 * @see UI.EditText#setPlaceholderShadow
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
	 * @name UI.EditText#setPlaceholderShadow
	 * @function
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
	 * var textField = new UI.EditText();
	 * textField.setPlaceholderShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} placeholderShadow The new placeholder text shadow.
	 * @see UI.EditText#getPlaceholderShadow
	 * @returns {void}
	 */
	 EditText.synthesizeProperty('placeholderShadow', Commands.setPlaceholderTextShadow);
	
	// ==== Behavior
	/**
	 * Retrieve the value of the `inputType` property, which defines the type of text input that
	 * the field will contain.
	 * @name UI.EditText#getInputType
	 * @function
	 * @returns {UI.Commands#InputType} The current input type.
	 * @see UI.EditText#setInputType
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `inputType` property, which defines the type of text input that the field will
	 * contain. For devices that have soft keyboards, the device uses this value and the value of
	 * the `enterKeyType` property to control which keyboard is displayed to the user.
	 * @name UI.EditText#setInputType
	 * @param {UI.Commands#InputType} inputType The new input type.
	 * @see UI.Commands#InputType
	 * @see UI.EditText#getInputType
	 * @function
	 * @returns {void}
	 */	
	 EditText.synthesizeProperty('inputType', Commands.setInputType);
	/**
	 * Retrieve the value of the `enterKeyType` property, which defines the Enter key's behavior for
	 * the field.
	 * @name UI.EditText#getEnterKeyType
	 * @function
	 * @returns {UI.Commands#EnterKeyType} The current behavior of the Enter key.
	 * @see UI.EditText#setEnterKeyType
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `enterKeyType` property, which defines the Enter key's behavior for the field. For 
	 * devices that have soft keyboards, the device uses this value and the value of the 
	 * `inputType` property to control which keyboard is displayed to the user.
	 * @name UI.EditText#setEnterKeyType
	 * @function
	 * @param {UI.Commands#EnterKeyType} enterKeyType The new behavior of the Enter key.
	 * @see UI.Commands#EnterKeyType
	 * @see UI.EditText#getEnterKeyType
	 * @returns {void}
	 */
	EditText.synthesizeProperty('enterKeyType', Commands.setEnterKeyType);
	
	// ==== Appearance
	/**
	 * Retrieve the value of the `textColor` property, which defines the text color for the field
	 * in a specified view state.
	 * @name UI.EditText#getTextColor
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text color for the specified view state, in hexidecimal RGB
	 *		format.
	 * @see UI.EditText#setTextColor
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textColor` property, which defines the text color for the button in a specified view
	 * state.
	 * @name UI.EditText#setTextColor
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setTextColor("FFFFFF");
	 * @param {String} textColor The new text color, in hexidecimal RGB format.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text color. To specify a text color for a view that is in multiple states, you can 
	 * 		use the `|` operator to combine multiple flags.
	 * @see UI.EditText#getTextColor
	 * @returns {void}
	 * @status iOS, Flash, Test
	 */
	EditText.synthesizePropertyWithState('textColor', Commands.setTextColor);
	/**
	 * Retrieve the value of the `textShadow` property, which defines the color and size of shadows
	 * on the user's text input in a specified view state.
	 * @name UI.EditText#getTextShadow
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text shadow.
	 * @see UI.EditText#setTextShadow
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
	 * @name UI.EditText#setTextShadow
	 * @example
	 * // Use a white text shadow with a two-pixel blur, shifted up one pixel.
	 * var textField = new UI.EditText();
	 * textField.setTextShadow("FFFFFFFF 2.0 {0.0, -1.0}");
	 * @param {String} textShadow The new text shadow, in the format specified above.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text shadow. To specify a text shadow for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @see UI.EditText#getTextShadow
	 * @returns {void}
	 * @status iOS, Flash, Test
	 * @function
	 */
	EditText.synthesizePropertyWithState('textShadow', Commands.setTextShadow);
	
	/**
	 * Retrieve the value of the `textGravity` property, which defines how text is positioned within
	 * the field.
	 * @name UI.EditText#getTextGravity
	 * @returns {Number[]} The current text gravity. Specified as an array of two floats, where the
	 *		first represents the X axis and the second represents the Y axis.
	 * @see UI.EditText#setTextGravity
	 * @status Javascript, iOS, Android, Flash, Test
	 * @function
	 */
	/**
	 * Set the `textGravity` property, which defines how text is positioned within the field. The
	 * text gravity is defined as two floats, one for the X (horizontal) axis and one for the Y
	 * (vertical) axis. Each float represents a percentage of the whitespace surrounding the text.
	 * 
	 * For the X axis, the specified percentage of whitespace will be placed to the left of the 
	 * text, with the remainder placed to the right of the text. For the Y axis, the specified 
	 * percentage of whitespace will be placed above the text, with the remainder placed below the
	 * text.
	 * 
	 * By default, the text gravity is set to `[0.0, 0.5]`, which positions the text adjacent to
	 * the left side of the field and vertically centers the text.
	 * @name UI.EditText#setTextGravity
	 * @example
	 * // Set the text to be horizontally and vertically centered
	 * var textField = new UI.EditText();
	 * textField.setTextGravity([0.5, 0.5]);
	 * @param {Number[]|UI.ViewGeometry#Gravity} textGravity The new text gravity. Specified as an 
	 *		array of two floats, where the first represents the X axis and the second represents the
	 *		Y axis. You can also specify an enumerated value of `{@link UI.ViewGeometry#Gravity}` in
	 *		place of the array.
	 * @see UI.EditText#getTextGravity
     * @status Flash
	 * @function
	 * @returns {void}
	 */
	EditText.synthesizeCompoundProperty('textGravity', Commands.setTextGravity);
	/**
	 * Retrieve the value of the `textSize` property, which specifies the size, in pixels, of the
	 * field's text.
	 * @name UI.EditText#getTextSize
	 * @function
	 * @returns {Number} The current size, in pixels, of the field's text.
	 * @see UI.EditText#setTextSize
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textSize` property, which specifies the size, in pixels, of the field's text.
	 * @name UI.EditText#setTextSize
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * var textSize = 12;
	 * textField.setTextSize(textSize);
	 * @param {Number} textSize The new size, in pixels, of the field's text.
	 * @returns {void}
	 * @see UI.EditText#getTextSize
	 * @status iOS, Flash, Test
	 */
	EditText.synthesizeProperty('textSize', Commands.setTextSize);
	/**
	 * Retrieve the value of the `textFont` property, which defines the font that is used for the
	 * field's text.
	 * @name UI.EditText#getTextFont
	 * @function
	 * @returns {String} The name of the current font.
	 * @see UI.EditText#setTextFont
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the `textFont` property, which defines the font that is used for the field's text.
	 * @name UI.EditText#setTextFont
	 * @function
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setTextFont("DroidSans");
	 * @param {String} textFont The name of the new font.
	 * @see UI.EditText#getTextFont
	 * @returns {void}
	 * @status iOS, Flash, Test
	 */
	EditText.synthesizePropertyWithState('textFont', Commands.setTextFont);
	
	// ==== Events
	/**
	 * Retrieve the function to call when a `change` event occurs. This event occurs when the user
	 * changes the value of the text field.
	 * @name UI.EditText#getOnChange
	 * @event
	 * @returns {Function} The current function to call when a `change` event occurs.
	 * @see UI.EditText#event:setOnChange
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set a function to call when a `change` event occurs. This event occurs when the user changes
	 * the value of the text field.
	 * @name UI.EditText#setOnChange
	 * @event
	 * @example
	 * var textField = new UI.EditText();
	 * var text = "";
	 * textField.setOnChange(function(event) { 
	 *     text = event.text;
	 * });
	 * @cb {Function} changeCallback The function to call when a `change` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.text The new value of the text field.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.EditText#event:getOnChange
	 * @status iOS, Flash
	 */
	EditText.registerEventType('change');
	/**
	 * Retrieve the function to call when a `focus` event occurs. This event occurs when the text
	 * field gains focus.
	 * @name UI.EditText#getOnFocus 
	 * @event	 
	 * @returns {Function} The current function to call when a `focus` event occurs.
	 * @see UI.EditText#event:setOnFocus
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the function to call when a `focus` event occurs. This event occurs when the text
	 * field gains focus.
	 * @name UI.EditText#setOnFocus
	 * @event
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setOnFocus(function() {
	 *     textField.addState(UI.Commands.State.Focused);
	 * });
	 * @cb {Function} focusCallback The function to call when a `focus` event occurs.
	 * @cb-returns {void}
	 * @see UI.EditText#event:getOnFocus
	 * @status Flash
	 * @returns {void}
	 */
	EditText.registerEventType('focus');
	/**
	 * Retrieve the function to call when a `blur` event occurs. This event occurs when the text
	 * field loses focus.
	 *
	 * **Note**: This event is not guaranteed to occur on Android devices.
	 * @name UI.EditText#getOnBlur
	 * @event
	 * @returns {Function} The current function to call when a `blur` event occurs.
	 * @see UI.EditText#event:setOnBlur
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the function to call when a `blur` event occurs. This event occurs when the text field
	 * loses focus.
	 *
	 * **Note**: This event is not guaranteed to occur on Android devices.
	 * @name UI.EditText#setOnBlur
	 * @event
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setOnBlur(function() {
	 *     textField.clearState(UI.Commands.State.Focused);
	 * });
	 * @cb {Function} blurCallback The current function to call when a `blur` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.EditText#event:getOnBlur
	 */
	EditText.registerEventType('blur');

	/**
	 * Retrieve the function to call when an `action` event occurs. This event occurs when the user
	 * presses the Return or Enter key.
	 * 
	 * **Note**: This event is not guaranteed to occur on Android devices.
	 * @name UI.EditText#getOnAction
	 * @event
	 * @returns {Function} The current function to call when an `action` event occurs.
	 * @see UI.EditText#event:setOnAction
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Set the function to call when an `action` event occurs. This event occurs when the user
	 * presses the Return or Enter key.
	 * 
	 * **Note**: This event is not guaranteed to occur on Android devices.
	 * @name UI.EditText#setOnAction
	 * @event
	 * @example
	 * var textField = new UI.EditText();
	 * textField.setOnAction(function() {
	 *     console.log("The user pressed the Return key.");
	 * });
	 * @cb {Function} actionCallback The function to call when an `action` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.EditText#event:getOnAction
	 * @since 1.1.6
	 */
	EditText.registerEventType('action');
	
	

};
