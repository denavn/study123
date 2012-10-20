/* This class does not have a physical view representation, and is just a holder for closures / a bag for data...
	We still fully map and register it so that sections can be persisted independently of tables. */
var Class = require("./../Core/Class").Class;

var ListViewItem = exports.ListViewItem = Class.subclass(
/** @lends UI.ListViewItem.prototype */
{	
	/**
	 * @class The `UI.ListViewItem` class creates individual items in a scrolling list. When a list
	 * item is about to be displayed, it is assigned a view, such as a `{@link UI.CellView}` object,
	 * that represents the list item's contents. The view is taken from a pool of reusable views,
	 * which are managed by the `UI.ListView` object. When a list item scrolls off the top or bottom
	 * of the screen, its view is added to the view pool.
	 *
	 * **Note**: Your application can also create more than one view pool, which is useful if your 
	 * list items will use different types of views. For example, some of your list's items might 
	 * use a cell view created by `{@link UI.CellView}`, while others might use a text label created 
	 * by `{@link UI.Label}`. To specify the view pool for a list item, include a name for the view
	 * pool in the constructor's `reuseId` parameter. You can use this view pool for any list item
	 * that uses the same type of view.
	 *
	 * When an application creates a `UI.ListViewItem` object, the application does not immediately
	 * populate the object with a view. Instead, the application assigns callback functions to the
	 * object, which are triggered as follows:
	 *
	 * +   **When the list's view pool is not full**: The `createView` event fires, telling the 
	 * application that it must create a new view for the view pool. This event triggers the 
	 * callback function specified by `{@link UI.ListViewItem#event:setOnCreateView}`. The callback 
	 * function returns a new view, such as a `{@link UI.CellView}` object, which is added to the 
	 * list's view pool. The callback function also sets the view's default appearance. For example,
	 * the function could call the view's `setGradient()` method to specify the fill color.
	 *
	 * +   **When a view is assigned to a list item**: The `setView` event fires, telling the 
	 * application that it needs to set up the view's unique attributes, such as the text and images
	 * that it displays. This event triggers the callback function specified by
	 * `{@link UI.ListViewItem#event:setOnSetView}`. The callback function assigns text and images
	 * to the view and changes its default appearance as necessary.
	 *
	 *     In some cases, the callback function will _always_ set a certain attribute, such as the
	 * view's text. The application does not need to clean up these attributes when the view is
	 * released.
	 *
	 *     In other cases, the callback function will _only sometimes_ set a certain attribute. For
	 * example, the callback function might use a unique fill color for certain views based on the
	 * views' content. **When the view is released, the application must restore these attributes to
	 * their default settings.**
	 *
	 * +   **When a view is released from a list item**: The `releaseView` event fires, telling the
	 * application that it needs to clean up the view's unique attributes as necessary. This event
	 * triggers the callback function specified by `{@link UI.ListViewItem#event:setOnReleaseView}`. 
	 * 
	 *     As described above, the callback function does not need to clean up attributes that are 
	 * _always_ set when the `setView` event fires. For attributes that are _only sometimes_ set, 
	 * **the callback function must restore these attributes to their default settings**. If the 
	 * callback function does not do this, the unique attributes will persist when the view is
	 * reused, and the view will not have the appropriate appearance.
	 * @name UI.ListViewItem
	 * @constructs Create a new list item.
	 * @augments Core.Class
	 * @example
	 * var listItem = new UI.ListViewItem();
	 * var defaultGradient = ["FFCBCBCB 1.0"];
	 *
	 * listItem.setOnCreateView(function() {
	 *     // Return a UI.CellView object that can be added to the view pool.
	 *     // Set the view to have a light gray background.
	 *     var cell = new UI.CellView({
	 *         gradient: {
	 *             gradient: defaultGradient
	 *         }
	 *     });
	 *
	 *     return cell;
	 * });
	 *
	 * listItem.setOnSetView(function(newView) {
	 *     // Set the text for the UI.CellView object to display. In this
	 *     // example, the text is chosen at random from an array.
	 *     var textOptions = ["Choose an Item", "Update Settings", "View High
	 *         Scores"];
	 *     newView.setText(textOptions[Math.floor(Math.random() * 
	 *         textOptions.length)];
	 *
	 *     // If the text contains a specific string, change the view's
	 *     // background color. Because the callback function only updates
	 *     // the background color in some cases, the application must restore
	 *     // the default background color when the releaseView event fires.
	 *     var cellText = newView.getText();
	 *     if (cellText.match(/Settings/)) {
	 *         newView.setGradient({
	 *             gradient: ["FF91CBC6 1.0"]
	 *         });
	 *     }
	 * });
	 * 
	 * listItem.setOnReleaseView(function(oldView) {
	 *     // Restore the view's background color to the default. The view's
	 *     // text does not need to be restored to a default setting, because
	 *     // the setView event's callback function will always set the correct
	 *     // text for the view.
	 *     oldView.setGradient({
	 *         gradient: defaultGradient
	 *     });
	 * });
	 * @param {String} [reuseId] The name of the view pool that this list item should use. Use this
	 *		parameter if your list items do not all display the same type of view. If you do not
	 *		include this parameter, the list item will use the default view pool. See the [overview 
	 *		of this class](#) for additional details.
	 * @see UI.ListView
	 * @see UI.ListViewSection
	 */
	
	'type':'listview-item',
	
	_reuseId: "__default__",
	/** @protected */
	_currentView: null,
	
	/**
	 * @function
	 * @protected
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	_onCreateView: function() {},
	/**
	 * @function
	 * @protected
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	_onReleaseView: function(oldView) {},
	/**
	 * @function
	 * @protected
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	_onSetView: function(newView) {},
	
	/**
	 * Set a function to call when a `createView` event occurs. This event occurs when the
	 * `{@link UI.ListView}` object needs an additional view that can be assigned to list items
	 * when they are displayed. The callback function returns a new view, such as a
	 * `{@link UI.CellView}` object, which will be added to the view pool. The callback function
	 * also sets the view's default appearance.
	 *
	 * For additional details, see the [overview of this class](#).
	 * @event
	 * @cb {Function} newFn The function to call when a `createView` event occurs.
	 * @cb-returns {Object} A view that can be assigned to a list item.
	 * @returns {void}
	 * @since 1.0
	 */
	setOnCreateView: function(newFn)	{this._onCreateView = newFn},
	/**
	 * Set a function to call when a `releaseView` event occurs. This event occurs when a view is
	 * released from a list item.
	 * 
	 * **Important**: The function must clean up any unique attributes of the view, such as a unique
	 * background color, that are not automatically reset by the `setView` event's callback
	 * function. If the function does not do this, the unique attributes will persist when the view
	 * is reused, and the view will not have the appropriate appearance.
	 *
	 * For additional details, see the [overview of this class](#).
	 * @event
	 * @cb {Function} newFn The function to call when a `releaseView` event occurs.
	 * @cb-param {Object} oldView The view that is being released from the list item.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.0
	 */
	setOnReleaseView: function(newFn)	{this._onReleaseView = newFn},
	/**
	 * Set a function to call when a `setView` event occurs. This event occurs when a view is being
	 * added to a list item. The function assigns text and images to the view and changes its
	 * default appearance as necessary. In some cases, it is necessary to clean up the view after it
	 * is released from the list item, so that the view has the correct appearance when it is
	 * reused.
	 *
	 * For additional details, see the [overview of this class](#).
	 * @event
	 * @cb {Function} newFn The function to call when a `setView` event occurs.
	 * @cb-param {Object} newView The view that is being added to a list item.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.0
	 */
	setOnSetView: function(newFn)		{this._onSetView = newFn},
	
	/**
	 * Set the height, in pixels, of the list item. This value is used only when the list item is in
	 * a list section that uses variable row heights. Call this method before the list item is
	 * visible to the user (for example, when a `setView` event occurs).
	 * @param {Number} h The height, in pixels, of the list item.
	 * @returns {void}
	 * @see UI.ListViewSection#setRowHeight
	 * @since 1.1.1.2
	 */
	setHeight: function(h) {
		this._height = h;
	},
	
	/**
	 * Get the height, in pixels, of the list item.
	 * @returns {Number} The height, in pixels, of the list item.
	 * @since 1.1.1.2
	 */
	getHeight: function() {
		return this._height;
	},
	
	/**
	 * @function
	 * @protected
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	_setCurrentView: function(newView) {
		if (newView instanceof Class) {
			this._onSetView(newView);
		} else {
			this._onReleaseView(this._currentView);
		}
		this._currentView = newView;
		return this;
	},
	
	/**
 	 * Retrieve the view that is currently attached to the list item.
	 * @returns {Object} The list item's current view, or `null` if no view is assigned.
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
 	 */
	getCurrentView: function(){
		return this._currentView;
	},
		
	initialize: function(reuseId) {
		if (reuseId) this._reuseId = reuseId;
		return this;
	}
});
