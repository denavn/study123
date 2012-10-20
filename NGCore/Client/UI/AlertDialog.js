var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;

var AlertDialog = exports.AlertDialog = Element.subclass(
/** @lends UI.AlertDialog.prototype */
{
	'type':'alertdialog',
	/**
	 * @name UI.AlertDialog
	 * @class The `UI.AlertDialog` class provides alert dialogs in an application. When the user
	 * chooses an option in the dialog, `UI.AlertDialog` fires a `choice` event that identifies the
	 * user's choice. Specify a callback function to handle this event by calling
	 * `{@link UI.AlertDialog#event:setOnChoice}`.
	 * 
	 * A `UI.AlertDialog` object's appearance can change automatically when its view state changes. 
	 * For example, the alert dialog's title can change automatically when the view gains focus. To
	 * implement this feature, your application can call a `UI.AlertDialog` setter method more than
	 * once, passing a different value in the `flags` parameter each time. In addition, your
	 * application can include properties for multiple view states in the constructor. See the
	 * `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.AlertDialog#setChoices}` to control the
	 * choices that are displayed to the user, the choices you specify will apply in all view
	 * states.
	 * @constructs Create an alert dialog.
	 * @augments UI.Element
	 * @example
	 * // Create a new UI.AlertDialog object without setting any of its properties.
	 * var dialog = new UI.AlertDialog();
	 * @example
	 * // Create a new UI.AlertDialog object, setting its title and text.
	 * var dialogTitle = "Really?";
	 * var dialogText = "Are you sure you want to quit the application?";
	 * var dialog = new UI.AlertDialog({
	 *     title: dialogTitle,
	 *     text: dialogText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.AlertDialog` object.
	 * @see UI.Commands#State
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (AlertDialog._init) AlertDialog._init();
		$super(properties);
	},
	
	/** 
	 * Show the alert dialog.
	 * @function
	 * @status Flash, Test, FlashTested
	 * @returns {void}
	 */
	show: Commands.show,
	/** 
	 * Hide the alert dialog.
	 * @function
	 * @status Flash, Test, FlashTested
	 * @returns {void}
	 */
	hide: Commands.hide
});

// Properties
AlertDialog._init = function() {
	delete AlertDialog._init;
	if (Element._init) Element._init();

	/**
	 * Set the `title` property, which defines the alert dialog's title for a specified view state.
	 * @name UI.AlertDialog#setTitle
	 * @example
	 * var dialog = new UI.AlertDialog();
	 * dialog.setTitle("Settings Saved");
	 * @see UI.AlertDialog#getTitle
	 * @param {String} title The title for the alert dialog.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this title. To specify a title for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
 	 * @status iOS, Android, Flash, Test, FlashTested
	 * @function
	 * @returns {void}
	 */
	/**
	 * Retrieve the value of the `title` property, which defines the alert dialog's title for a
	 * specified view state.
	 * @name UI.AlertDialog#getTitle
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current title.
	 * @see UI.AlertDialog#setTitle
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	AlertDialog.synthesizePropertyWithState('title', Commands.setTitle);
	/**
	 * Set the `text` property, which defines the alert dialog's text for a specified view state.
	 * @name UI.AlertDialog#setText
	 * @function
	 * @example
	 * var dialog = new UI.AlertDialog();
	 * var text = "Your settings have been saved.";
	 * dialog.setText(text);
	 * @param {String} text The text for the alert dialog.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.AlertDialog#getText
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `text` property, which defines the alert dialog's text for a
	 * specified view state.
	 * @name UI.AlertDialog#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text for the alert dialog.
	 * @see UI.AlertDialog#setText
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	AlertDialog.synthesizePropertyWithState('text', Commands.setText);
	// Not a compound property; AlertDialog.getChoices() should return the array of strings.
	/**
	 * Set the `choices` property, which defines the options that are presented to the user.
	 * @name UI.AlertDialog#setChoices
	 * @function
	 * @example
	 * var dialog = new UI.AlertDialog();
	 * dialog.setChoices(["Cancel", "Save Changes"], 1, 0);
	 * @param {String[]} choices The options that will be presented to the user.
	 * @param {Number} [defaultChoice] The index of the default choice.
	 * @param {Number} [cancelChoice] The index of the choice that cancels the action.
	 * @returns {void}
	 * @see UI.AlertDialog#getChoices
 	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the value of the `choices` property, which defines the options that are presented to
	 * the user.
	 * @name UI.AlertDialog#getChoices
	 * @function
	 * @returns {String[]} The current options that will be presented to the user.
	 * @see UI.AlertDialog#setChoices
 	 * @status Javascript, iOS, Android, Flash, Test
	 */
	AlertDialog.synthesizeProperty('choices', Commands.setChoices);
	
	// Event will contain .choice, which is the index of the option chosen.
	/**
	 * Set a function to call when a `choice` event occurs. This event occurs when the user selects
	 * an option in an alert dialog.
	 * @name UI.AlertDialog#setOnChoice
	 * @event
	 * @example
	 * // Create an alert dialog, and specify a function to handle choice events.
	 * var dialog = new UI.AlertDialog({
	 *     title: "Unsaved Changes",
	 *     text: "Do you want to save your changes?",
	 *     choices: ["Save", "Don't Save"];
	 * });
	 * dialog.setOnChoice(function(event) {
	 *     if (event.choice == 0) {
	 *         // The user chose "Save"
	 *         // Add code to save
	 *         dialog.hide();
	 *     } else {
	 *         // The user chose "Don't Save"
	 *         dialog.hide();
	 *     }
	 * });
	 * @cb {Function} choiceCallback The function to call when a `choice` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Number} event.choice The index of the option that the user chose.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.AlertDialog#event:getOnChoice
 	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the function to call when a `choice` event occurs.
	 * @name UI.AlertDialog#getOnChoice
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.AlertDialog#event:setOnChoice
 	 * @status iOS, Android, Flash, Test
	 */
	 AlertDialog.registerEventType('choice');
};
