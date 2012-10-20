var View = require('./View').View;
var ViewGeometry = require('./ViewGeometry');
var Commands = require('./Commands').Commands;

var ScrollView = exports.ScrollView = View.subclass(
/** @lends UI.ScrollView.prototype */
{
	'type':'scrollview',
	/**
	 * @class The `UI.ScrollView` class constructs objects that handle views in a small scroll area.
	 * A scroll area can be scrolled horizontally, vertically, or in both directions. Android
	 * devices can scroll in only one direction at a time.
	 *
	 * If you need to create a scrolling list that uses a table-like layout, or that contains a
	 * large number of very similar views, consider using the `{@link UI.ListView}` class instead of
	 * `UI.ScrollView`.
	 * @name UI.ScrollView
	 * @constructs Create a scroll area.
	 * @augments UI.View
	 * @example
	 * // Create a new UI.ScrollView object without setting any of its properties.
	 * var scrollArea = new UI.ScrollView();
	 * @example
	 * // Create a new UI.ScrollView object, and hide its scrollbars.
	 * var scrollArea = new UI.ScrollView({
	 *     scrollIndicatorsVisible: false
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.ScrollView` object.
	 * @see UI.ListView
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (ScrollView._init) ScrollView._init();
		this._scrollPosition = [0, 0];
		return $super(properties);
	},
	
	/**
	 * @private
	 */    
	updateScrollPosition: function(newVal) {
		this._scrollPosition = newVal;
	},
	
	/**
	 * @private
	 */    
	performEventCallback: function($super, e) {
		if (e.eventType == 'scroll') this.updateScrollPosition(e.scrollPosition);
		$super(e);
	},

	getFrameOffset: function() {
		var frame = this._frame;
		if (frame) {
			return [-this._scrollPosition[0], -this._scrollPosition[1]];
		} else {
			return undefined;
		}
	}
});

// Properties
ScrollView._init = function() {
	delete ScrollView._init;
	if (View._init) View._init();

	/**
	 * Set the `contentSize` property, which defines the scroll area's width and height in pixels.
	 * @name UI.ScrollView#setContentSize
	 * @function
	 * @example
	 * var width = Device.LayoutEmitter.getWidth();
	 * var scrollArea = new UI.ScrollView();
	 * scrollArea.setContentSize([width / 2, 200]);
	 * @param {Number[]|Number} w An array of two integers, where the first item contains the scroll
	 *		area's width in pixels and the second item contains the scroll area's height in pixels;
	 *		or a number representing the width, in pixels, of the scroll area.
	 * @param {Number} [h] A number representing the height, in pixels, of the scroll area. If
	 *		the `w` parameter contains an array, do not use the `h` parameter.
	 * @returns {void}
 	 * @see UI.ScrollView#getContentSize
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `contentSize` property, which defines the scroll area's width and
	 * height in pixels.
	 * @name UI.ScrollView#getContentSize
	 * @function
	 * @returns {Number[]} An array of two integers, where the first item contains the scroll area's
	 *		width in pixels and the second item contains the scroll area's height in pixels.
	 * @see UI.ScrollView#setContentSize
	 * @status iOS, Android, Flash, Test
	 */
	ScrollView.synthesizeCompoundProperty('contentSize', Commands.setScrollableSize);
	/**
	 * Set the `scrollPosition` property, which indicates where the scrollbar should be positioned
	 * and, as a result, what part of the scroll area should be displayed. This property contains
	 * two integers, which indicate the positions, in pixels, of the horizontal and vertical
	 * scrollbars.
	 * @name UI.ScrollView#setScrollPosition
	 * @function
	 * @example
	 * // Scroll to the origin of the scroll area.
	 * var scrollArea = new UI.ScrollView();
	 * scrollArea.setScrollPosition([0, 0]);
	 * @param {Number[]|Number} x An array of two integers, where the first item contains the 
	 *		position of the horizontal scrollbar, in pixels, and the second item contains the 
	 *		position of the vertical scrollbar, in pixels; or a single integer representing the 
	 *		position of the horizontal scrollbar, in pixels.
	 * @param {Number} [y] An integer representing the position of the vertical scrollbar, in
	 *		pixels. If the `x` parameter contains an array, do not use the `y` parameter.
	 * @see UI.ScrollView#getScrollPosition
	 * @returns {void}
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `scrollPosition` property, which indicates where the scrollbar
	 * should be positioned and, as a result, what part of the scroll area should be displayed.
	 *
	 * **Note**: The `scrollPosition` property is not updated when the user scrolls the view. See
	 * `{@link UI.ScrollView#event:setOnScroll}` for information about how to monitor the current
	 * position of the scroll area. If the application has not called
	 * `{@link UI.ScrollView#setScrollPosition}`, this method will return the value `[0, 0]`,
	 * regardless of whether the view has been scrolled.
	 * @name UI.ScrollView#getScrollPosition
	 * @function
	 * @returns {Number[]} An array of two integers, where the first item contains the position of the
	 *		horizontal scrollbar, in pixels, and the second item contains the position of the
	 *		vertical scrollbar, in pixels.
	 * @see UI.ScrollView#setScrollPosition
	 * @status iOS, Android, Flash, Test
	 */
	ScrollView.synthesizeCompoundProperty('scrollPosition', Commands.setScrollPosition);
	
	/**
	 * Set the `scrollIndicatorsVisible` property, which indicates whether the scroll area's 
	 * scrollbars should be visible.
	 * @name UI.ScrollView#setScrollIndicatorsVisible
	 * @function
	 * @example
	 * // Hide the scroll area's scrollbars.
	 * var scrollArea = new UI.ScrollView();
	 * scrollArea.setScrollIndicatorsVisible(false);
	 * @param {Boolean} enabled Set to `true` if the scroll area's scrollbars should be visible.
	 * @returns {void}
	 * @see UI.ScrollView#getScrollIndicatorsVisible
	 * @status iOS, Android, Test
	 */
	/**
	 * Retrieve the value of the `scrollIndicatorsVisible` property, which indicates whether the
	 * scroll area's scrollbars should be visible.
	 * @name UI.ScrollView#getScrollIndicatorsVisible
	 * @function
	 * @returns {Boolean} Set to `true` if the scroll area's scrollbars should be visible.
	 * @see UI.ScrollView#setScrollIndicatorsVisible
	 * @status iOS, Android, Test
	 */
	ScrollView.synthesizeCompoundProperty('scrollIndicatorsVisible', Commands.setScrollIndicatorsVisible);
	
	View.synthesizeProperty('visibleInOrientations', Commands.setVisibleInOrientations);

	/**
	 * Set a function to call when a `scroll` event occurs. This event occurs when the user scrolls
	 * the scroll area.
	 * @name UI.ScrollView#setOnScroll
	 * @event
	 * @example
	 * var scrollArea = new UI.ScrollView();
	 * scrollArea.setOnScroll(function(event) {
	 *     console.log("X position: " + event.scrollPosition[0] +
	 *         ", Y position:" + event.scrollPosition[1]);
	 * });
	 * @cb {Function} scrollCallback The function to call when a `scroll` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Number[]} event.scrollPosition An array of two integers, where the first item
	 *		represents the number of pixels by which the scroll area has been scrolled along the X
	 *		axis and the second item represents the number of pixels by which the scroll area has
	 *		been scrolled along the Y axis.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.ScrollView#event:getOnScroll
	 * @status iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the function to call when a `scroll` event occurs.
	 * @name UI.ScrollView#getOnScroll
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.ScrollView#event:setOnScroll
	 * @status iOS, Android, Flash, Test
	 */
	ScrollView.registerEventType('scroll');
	
	ScrollView.registerEventType('scrollEnded');
};
