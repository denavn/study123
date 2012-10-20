var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var WindowR = require('./Window');

var ProgressBar = exports.ProgressBar = AbstractView.subclass(
/** @lends UI.ProgressBar.prototype */
{
	'type':'progressbar',

    /**
     * @class The `UI.ProgressBar` class creates horizontal progress bars. To update the progress
	 * bar, your application must call the `{@link UI.ProgressBar#setProgress}` method.
	 *
	 * A progress bar has a primary gradient and a secondary gradient. This enables you to create a
	 * progress bar that shows two progress states at once. For example, you could create a progress
	 * bar that shows a user's current position in a game level as well as the position of the next
	 * save point.
	 *
	 * A `UI.ProgressBar` object's appearance can change automatically when its view state changes. 
	 * For example, the progress bar's outline or fill can change automatically when the progress
	 * bar gains focus or is selected. To implement this feature, your application can call a
	 * `UI.ProgressBar` setter method more than once, passing a different value in the `flags`
	 * parameter each time. In addition, your application can include properties for multiple view
	 * states in the constructor. See the `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.ProgressBar#setProgress}` to control the
	 * amount of progress that is shown, this amount of progress will apply in all view states.
	 * @name UI.ProgressBar
     * @constructs Create a progress bar.
     * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.ProgressBar object without setting any of its properties.
	 * var progressBar = new UI.ProgressBar();
	 * @example
	 * // Create a new UI.ProgressBar object, setting its progress amount.
	 * var progressAmount = 0.1;
	 * var progressBar = new UI.ProgressBar({
	 *     progress: progressAmount
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.ProgressBar` object.
     * @since 1.0
     */

	/** @ignore */
    initialize: function($super, properties) {
		if (ProgressBar._init) ProgressBar._init();
        return $super(properties);
    },

	useForUpdateProgress: Commands.useForUpdateProgress
});

ProgressBar._init = function() {
	delete ProgressBar._init;
	if (AbstractView._init) AbstractView._init();

	/**
	 * Retrieve the value of the `progressGradient` property, which defines the outlines, shadows,
	 * rounded corners, and gradient fills that are currently applied to the progress indicator for
	 * the specified view state.
	 * @name UI.ProgressBar#getProgressGradient
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The progress bar's appearance for the specified view state.
	 * @see UI.ProgressBar#setProgressGradient
	 * @status Javascript, Android
	 */
	/**
	 * Set the `progressGradient` property, which defines the outlines, shadows, rounded corners, 
	 * and gradient fills that are applied to the progress indicator for the specified view state. 
	 * See `{@link UI.Style#setGradient}` for information about this property.
	 * @name UI.ProgressBar#setProgressGradient
	 * @function
	 * @example
	 * // Set a gradient that has rounded corners with an eight-pixel radius; a
	 * // black outer border; and a gradient fill that fades from gray to 
	 * // light gray.
	 * var progressBar = new UI.ProgressBar();
	 * progressBar.setProgressGradient({
	 *     corners: "8 8 8 8",
	 *     outerLine: "FF000000 1.5",
	 *     gradient: ["FF888888 0.0", "FFE4E4E4 1.0"]
	 * });
	 * @param {Object} gradient The new appearance for the progress bar.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this appearance. To specify the appearance for a view that is in multiple states, you
	 * 		can use the `|` operator to combine multiple flags.
	 * @see UI.ProgressBar#getProgressGradient
	 * @returns {void}
	 * @status Android
	 */
	ProgressBar.synthesizePropertyWithState('progressGradient', Commands.setProgressGradient);
	/**
	 * Retrieve the value of the `secondaryGradient` property, which defines the outlines, shadows, 
	 * rounded corners, and gradient fills that are currently applied to the secondary progress 
	 * indicator for the specified view state. See `{@link UI.Style#setGradient}` for information
	 * about this property.
	 * @name UI.ProgressBar#getSecondaryGradient
	 * @function
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The specified view state.
	 * @returns {Object} The progress bar's secondary gradient for the specified view state.
	 * @see UI.SecondaryBar#setSecondaryGradient
	 * @status Javascript, Android
	 */
	/**
	 * Set the `secondaryGradient` property, which defines the outlines, shadows, rounded corners,
	 * and gradient fills that are applied to the secondary progress indicator for the specified 
	 * view state. See `{@link UI.Style#setGradient}` for information about this property.
	 * @name UI.ProgressBar#setSecondaryGradient
	 * @function 
	 * @example
	 * // Set a gradient that has rounded corners with an eight-pixel radius; a
	 * // black outer border; and a gradient fill that fades from gray to 
	 * // light gray.
	 * var progressBar = new UI.ProgressBar();
	 * progressBar.setSecondaryGradient({
	 *     corners: "8 8 8 8",
	 *     outerLine: "FF000000 1.5",
	 *     gradient: ["FF888888 0.0", "FFE4E4E4 1.0"]
	 * });
	 * @param {Object} gradient The new secondary gradient for the progress bar.
	 * @param {UI.Commands#State} [flags=UI.Commands.State.Normal] The view state in which to use
	 *		this secondary gradient. To specify the secondary gradient for a view that is in 
	 * 		multiple states, you can use the `|` operator to combine multiple flags.
	 * @returns {void}
	 * @see UI.SecondaryBar#getSecondaryGradient
	 * @see UI.Style#setGradient
	 * @status Android
	 */
	ProgressBar.synthesizePropertyWithState('secondaryGradient', Commands.setSecondaryGradient);
	
	var setProgressGuarded = function(arg0) {
		var args = (arg0 instanceof Array) ? arg0 : Array.prototype.slice.call(arguments);
		while (args.length < 2) args.push(0);
		Commands.setProgress.apply(this, args);
	};
	/**
	 * Retrieve the value of the `progress` and `secondaryProgress` properties, which indicate the
	 * amount of progress that is displayed on the primary and secondary progress bars.
	 * @name UI.ProgressBar#getProgress
	 * @function
	 * @returns {Number[]} The current progress and secondary progress amounts. Specified as an
	 *		array of two floats, where the first represents the progress amount and the second
	 *		represents the secondary progress amount.
	 * @see UI.ProgressBar#setProgress
	 * @status Javascript, Android
	 */
	/**
	 * Set the `progress` and `secondaryProgress` properties, which indicate the amount of progress
	 * that is displayed on the primary and secondary progress bars. Each property is specified as 
	 * a float ranging from 0.0, which represents 0% complete, to 1.0, which represents 100%
	 * complete.
	 * @name UI.ProgressBar#setProgress
	 * @function
	 * @param {Number[]|Number} arg0 An array of two floats, where the first represents the progress
	 *		amount and the second represents the secondary progress amount. Both floats can range
	 *		from 0.0 to 1.0. You can also pass these values in as separate parameters. If you omit
	 *		the secondary progress amount, it will default to 0.
	 * @returns {void}
	 * @see UI.ProgressBar#getProgress
	 * @status Javascript, Android
	 */
	ProgressBar.synthesizeCompoundProperty('progress', setProgressGuarded);
};
