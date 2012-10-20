var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var Spinner = exports.Spinner = AbstractView.subclass(
/** @lends UI.Spinner.prototype */
{
	'type':'spinner',
	
	/**
	 * @class The `UI.Spinner` class creates spinning activity indicators in a user interface.
	 * @name UI.Spinner
	 * @constructs Create a spinning activity indicator.
	 * @augments UI.AbstractView
	 * @since 1.0.6
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (Spinner._init) Spinner._init();
		return $super(properties);
	}
});

Spinner._init = function() {
	delete Spinner._init;
	if (AbstractView._init) AbstractView._init();
	
	Spinner.synthesizeProperty('darkStyle', Commands.setDarkStyle);
};
