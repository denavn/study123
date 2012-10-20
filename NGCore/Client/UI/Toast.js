var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;

var Toast = exports.Toast = Element.subclass(
/** @lends UI.Toast.prototype */
{	
    'type': 'toast',
    /**
	 * @class The `UI.Toast` class creates temporary messages on the device's screen. On Android
	 * devices, these messages slide up from the bottom of the screen. On iOS devices, these 
	 * messages slide down from the top of the screen.
	 *
	 * A `UI.Toast` object's appearance can change automatically when its view state changes. For
	 * example, the toast's text can change automatically when the temporary message gains focus or
	 * is selected. To implement this feature, your application can call a single `UI.Toast` method
	 * more than once, passing a different value in the `flags` parameter each time. In addition,
	 * your application can include properties for multiple view states in the constructor. See the
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.Toast#event:setOnDisappear}` to provide a 
	 * callback function for the `disappear` event, the callback function you specify will apply in 
	 * all view states.
	 * @name UI.Toast
	 * @constructs Create a temporary message.
	 * @augments UI.View
	 * @example
	 * // Create a temporary message without specifying any properties.
	 * var toast = new UI.Toast();
	 * @example
	 * // Create a temporary message, setting the text that will appear in the
	 * // message.
	 * var toast = new UI.Toast({
	 *     text: "Update complete";
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.Toast`
	 *		object.
	 * @since 1.0.2
	 */

	/** @ignore */
	initialize: function($super, properties) {
		if (Toast._init) Toast._init();
		$super(properties);
	},
	
	/** 
	 * Show the temporary message.
	 * @function
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
    show: Commands.show
});

Toast._init = function() {
	delete Toast._init;
	if (Element._init) Element._init();

	/**
	 * Set the `text` property, which defines the temporary message's text for a specified view
	 * state.
	 * @name UI.Toast#setText
	 * @function
	 * @example
	 * var toast = new UI.Toast();
	 * toast.setText("Update complete");
	 * @param {String} text The new text for the temporary message.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.Toast#getText
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `text` property, which defines the temporary message's text for a
	 * specified view state.
	 * @name UI.Toast#getText
	 * @function	 
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text for the temporary message.
	 * @see UI.Toast#setText
	 * @status iOS, Android, Flash, Test
	 */
	Toast.synthesizePropertyWithState('text', Commands.setText);
	/**
	 * Set a function to call when a `disappear` event occurs. This event occurs when a temporary
	 * message is removed from the screen.
	 * @name UI.Toast#setOnDisappear
	 * @event
	 * @example
	 * // Destroy the temporary message after it disappears.
	 * var toast = new UI.Toast();
	 * toast.setOnDisappear(function() {
	 *     toast.destroy();
	 * });
	 * @cb {Function} disappearCallback The function to call when a `disappear` event occurs.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.Toast#event:getOnDisappear
	 */
	/**
	 * Retrieve the function to call when a `disappear` event occurs.
	 * @name UI.Toast#getOnDisappear
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.Toast#event:setOnDisappear
	 * @status Flash, Test, FlashTested
	 */
	Toast.registerEventType('disappear');
};
