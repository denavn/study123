var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var DocumentView = exports.DocumentView = AbstractView.subclass(
/** @lends UI.DocumentView.prototype */
{
	'type':'documentview',
	/**
	 * @class The `UI.DocumentView` class is used to display local HTML files.
	 * @name UI.DocumentView
	 * @constructs Create a document view.
	 * @augments UI.AbstractView
	 * @deprecated As of version 1.6, this class is no longer supported. It will be removed in a
	 *		future version.
     * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.DocumentView` object.
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (DocumentView._init) DocumentView._init();
		$super(properties);
	}
});

// Properties
DocumentView._init = function() {
	delete DocumentView._init;
	if (AbstractView._init) AbstractView._init();
	
	/**
	 * Set the `documentURL` property, which specifies the URL to load.
	 * @name UI.DocumentView#setDocumentURL
	 * @function
	 * @deprecated Since version 1.6. The UI.DocumentView class will be removed in a future
	 *		version.
	 * @param {String} documentURL The new document URL.
	 * @returns {void}
	 * @see UI.DocumentView#getDocumentURL
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `documentURL` property, which specifies the URL to load.
	 * @name UI.DocumentView#getDocumentURL
	 * @function
	 * @deprecated Since version 1.6. The UI.DocumentView class will be removed in a future
	 *		version.
	 * @returns {String} The current document URL.
	 * @see UI.DocumentView#setDocumentURL
	 * @status iOS, Android, Flash, Test
	 */
	DocumentView.synthesizeProperty('documentURL', Commands.setSourceDocument);
};
