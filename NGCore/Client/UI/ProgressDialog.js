var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;

var ProgressDialog = exports.ProgressDialog = Element.subclass(
/** @lends UI.ProgressDialog.prototype */
{
	'type':'progressdialog',

    /**
	 * @name UI.ProgressDialog
     * @class The `UI.ProgressDialog` class displays progress updates from an application. This
	 * class is typically used in combination with `{@link UI.ProgressBar}`.
	 *
 	 * A `UI.ProgressDialog` object's appearance can change automatically when its view state 
	 * changes. For example, the text in the dialog can change when the dialog is disabled. To 
	 * implement this feature, your application can call a `UI.ProgressDialog` setter method more 
	 * than once, passing a different value in the `flags` parameter each time. In addition, your 
	 * application can include properties for multiple view states in the constructor. See the 
	 * `{@link UI}` module overview for more information.
     * @constructs Create a progress dialog.
     * @augments UI.Element
	 * @example
	 * // Create a new UI.ProgressDialog object without setting any of its properties.
	 * var dialog = new UI.ProgressDialog();
	 * @example
	 * // Create a new UI.ProgressDialog object, setting its title and text.
	 * var dialogTitle = "Please Wait";
	 * var dialogText = "Loading images...";
	 * var dialog = new UI.ProgressDialog({
	 *     title: dialogTitle,
	 *     text: dialogText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new 
	 *		`UI.ProgressDialog` object.
     * @since 1.0
     */

	/** @ignore */
    initialize: function($super, properties) {
		if (ProgressDialog._init) ProgressDialog._init();
        return $super(properties);
    },
	/**
	 * Show the progress dialog.
	 * @function
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */    
    show: Commands.show,
	/**
	 * Hide the progress dialog.
	 * @function
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */    
    hide: Commands.hide
});

ProgressDialog._init = function() {
	delete ProgressDialog._init;
	if (Element._init) Element._init();
	
	/**
	 * Set the `title` property, which defines the progress dialog's title for a specified view
	 * state.
	 * @name UI.ProgressDialog#setTitle
	 * @function
	 * @example
	 * var dialog = new UI.ProgressDialog();
	 * dialog.setTitle("Please Wait");
	 * @param {String} title The title for the progress dialog.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this title. To specify a title for a view that is in multiple states, you can use the
	 * 		`|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.ProgressDialog#getTitle
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `title` property, which defines the progress dialog's title for a
	 * specified view state.
	 * @name UI.ProgressDialog#getTitle
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current title.
	 * @see UI.ProgressDialog#setTitle
	 * @status iOS, Android, Flash, Test
	 */
	ProgressDialog.synthesizePropertyWithState('title', Commands.setTitle);
	/**
	 * Set the `text` property, which defines the progress dialog's text for a specified view state.
	 * @name UI.ProgressDialog#setText
	 * @function
	 * @example
	 * var dialog = new UI.ProgressDialog();
	 * var text = "Loading images...";
	 * dialog.setText(text);
	 * @param {String} text The text for the progress dialog.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this text. To specify text for a view that is in multiple states, you can use the `|`
	 * 		operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.ProgressDialog#getText
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `text` property, which defines the progress dialog's text for a
	 * specified view state.
	 * @name UI.ProgressDialog#getText
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {String} The current text for the progress dialog.
	 * @see UI.ProgressDialog#setText
	 * @status iOS, Android, Flash, Test
	 */
	ProgressDialog.synthesizePropertyWithState('text', Commands.setText);
};
