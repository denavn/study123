var Element = require('./Element').Element;
var ViewGeometry = require('./ViewGeometry');
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Core = require('../Core').Core;
var Commands = require('./Commands').Commands;
var ListViewItem = require('./ListViewItem').ListViewItem;

var _padTopRows = 5;
var _padBottomRows = 5;

if ( Core.Capabilities.getPlatformOS() === "iPhone OS" ) {
	// iOS's UI refresh mechanisms are much more tightly coupled. Save some memory...
	_padTopRows = 1;
	_padBottomRows = 2;
}

/* This class does not have a physical view representation.
	We still fully map and register it so that sections can be persisted independently of tables. */

var ListViewSection = exports.ListViewSection = Element.subclass(
/** @lends UI.ListViewSection.prototype */
{
	'type':'listview-section',
	/**
	 * @class The `UI.ListViewSection` class creates sections of a scrolling list. Each section 
	 * contains one or more `{@link UI.ListViewItem}` objects, which represent the list's individual
	 * items.
	 *
	 * A `UI.ListViewSection` object's appearance can change automatically when its view state 
	 * changes. For example, the section's title can change automatically when the section gains 
	 * focus or is selected. To implement this feature, your application can call a
	 * `UI.ListViewSection` setter method more than once, passing a different value in the `flags`
	 * parameter each time. In addition, your application can include properties for multiple view
	 * states in the constructor. See the `{@link UI}` module overview for more information.
	 * 
	 * **Note**: Some of this class' methods do not allow you to set different properties for each
	 * view state. For example, when you use `{@link UI.ListViewSection#setRowHeight}` to control
	 * the fheight of the section's rows, the height you specify will apply in all view states.
	 * @name UI.ListViewSection
	 * @constructs Create a list section.
	 * @augments UI.Element
	 * @augments UI.AbstractView
	 * @example
	 * // Create a new UI.ListViewSection object without setting any of its properties.
	 * var listSection = new UI.ListViewSection();
	 * @example
	 * // Create a new UI.ListViewSection object, setting its title.
	 * var sectionTitle = "Latest Updates";
	 * var listSection = new UI.ListViewSection({
	 *     titleView: sectionTitle
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.ListViewSection` object.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize:function($super, properties) {
		if (ListViewSection._init) ListViewSection._init();
		
		this._visibleRange = [0,0];
		this._headerHeight = 0;
		this._titleHeight = 0;
		
		delete this._measuredHeight;
		this._needsLayout = false;
		
		$super(properties);
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	addItemToVisible: function(lvItem, index) {
		if (!(lvItem instanceof ListViewItem)) return;
		if (lvItem._currentView instanceof Element) return;
		
		var useView = this._listView._viewForItem(lvItem);
		var w = this._listView.getFrame()[2];
		
		if (this._rowHeight > 0) {
			useView.setFrame(0, this._yPosition + this._titleHeight + index * this._rowHeight, w, this._rowHeight);
		} else {
			useView.setFrame(0, this._yPosition + this._cellPositions[index], w, lvItem._height);
		}
		
		lvItem._setCurrentView(useView);
		if (!useView.getParent()) this._listView.addChild(useView, "cell");
	},
	
	_setFrame: function(l, t, w, h) {
		Commands.setFrame.call(this, l, t, w, h);
		if (this._titleView) {
			var f = this._titleView.getFrame();
			this._titleView.setFrame(l, t, w, f[3]);
		}
	},
	
	/**
	 * Reset the indices of the first and last visible list items within the section. Call this
	 * method when you change the list items in a way that the `{@link UI.ListView}` object cannot
	 * automatically detect. For example, if you pass an array to
	 * `{@link UI.ListViewSection#setItems}`, then modify the array, calling `flush()` will redraw
	 * the list based on the current items in the array.
	 * @function
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	flush: function() {
		for (var i = this._visibleRange[0], l = this._visibleRange[1]; i < l && i < this._items.length; i++) {
            this._listView._queueViewForItem(this._items[i]);
		}
		this._visibleRange = [0,0];
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	updateVisibleRange: function(topY, bottomY) {
		var totalH = this._getMeasuredHeight();
		
		// Expand the view window. This is really only necessary for Android...
		var l = this._items.length;
		var rowH = this._rowHeight > 0 ? this._rowHeight : totalH / l;
		topY -= rowH * _padTopRows;
		bottomY += rowH * _padBottomRows;
		
		var oldStartIndex = this._visibleRange[0];
		var oldEndIndex = this._visibleRange[1];
		var startIndex = l > 0 ? Math.max(0, Math.floor(topY / rowH)) : 0;
		var endIndex = l > 0 ? Math.min(l, startIndex + Math.floor((bottomY - topY) / rowH)) : 0;
		
		if (this._cellPositions) {
			// We should have a good guess into the array from the above code,
			// so now it just needs to be adjusted until accurate.
			while (startIndex < l && this._cellPositions[startIndex] < topY) startIndex++;
			while (startIndex > 0 && this._cellPositions[startIndex] > topY) startIndex--;
			if (startIndex >= l) startIndex = Math.max(0, l - 1);
			
			while (endIndex < l && this._cellPositions[endIndex] < bottomY) endIndex++;
			while (endIndex > startIndex && this._cellPositions[endIndex] > bottomY) endIndex--;
		
			topY = this._cellPositions[startIndex];
			// EndIndex is one past the last element...
			bottomY = endIndex === 0 ? topY : (this._cellPositions[endIndex-1] + this._items[endIndex-1]._height );
		}
		if (bottomY < 0 || topY > totalH) {
			for (var i = this._visibleRange[0]; i < this._visibleRange[1] && i < this._items.length; i++) {
				this._listView._queueViewForItem(this._items[i]);
			}
			this._visibleRange = [0,0];
			return;
		}
		
		if (oldStartIndex == startIndex && oldEndIndex == endIndex) return;
		
//		NgLogD("(" + oldStartIndex + "," + oldEndIndex + ") -> (" + startIndex + "," + endIndex + ")");
		
		if (oldStartIndex == oldEndIndex) {
			for (i = startIndex; i < endIndex; i++) {
				this.addItemToVisible(this._items[i], i);
			}
		} else {
			// Dequeue and requeue from both ends.
			if (oldStartIndex < startIndex) {
				do {
					this._listView._queueViewForItem(this._items[oldStartIndex]);
				} while (++oldStartIndex < startIndex);
			}
			if (oldEndIndex > endIndex) {
				while (oldEndIndex-- > endIndex) {
					this._listView._queueViewForItem(this._items[oldEndIndex]);
				}
				oldEndIndex = endIndex;	// Keep later codepath from triggering
			}
		
			if (oldStartIndex > startIndex) {
				while (oldStartIndex-- > startIndex) {
					this.addItemToVisible(this._items[oldStartIndex], oldStartIndex);
				}
				oldStartIndex = startIndex;
			} 
			if (oldEndIndex < endIndex) {
				do {
					this.addItemToVisible(this._items[oldEndIndex], oldEndIndex);
				} while (++oldEndIndex < endIndex);
			}
		
		}
		this._visibleRange = [startIndex, endIndex];
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	setListView : function(listView) {
		this._listView = listView;
		delete this._measuredHeight;
		return this;
	},
	
	_getMeasuredHeight : function() {
		return this._measuredHeight || this._measureHeight();
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	_measureHeight : function() {
		// Sum the heights of the rows.  No variable-heights yet!!!
		if (this._rowHeight < 0) {
			// Variable Height Trigger
			var totalHeight = this._titleHeight + this._headerHeight;
			var runningHeights = [];
			var l = this._items.length;
			for (var i = 0; i < l; i++) {
				runningHeights.push(totalHeight);
				totalHeight += this._items[i]._height;
			}
			this._cellPositions = runningHeights;
			return this._measuredHeight = totalHeight;
		}
		
		delete this._cellPositions;
		return this._measuredHeight = this._titleHeight + this._headerHeight + this._rowHeight * this._items.length;
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	calculateItemPositions: function() {
		// Not used?.
	}
});

ListViewSection._init = function() {
	delete ListViewSection._init;
	if (Element._init) Element._init();

	// We don't have a set pattern for sending the id of a view we want to assign by reference...
	var boundTitleFunction = function() {
		if (this.listViewMonitor) this.listViewMonitor.setTitleView(this);
		boundTitleFunction._superfunc.apply(this, Array.prototype.slice.call(arguments));
	};
	var setTitleView = function(titleView) {
		if (this._titleView && this._titleView.listViewMonitor == this) {
			delete this._titleView.listViewMonitor;
		}
		this._titleView = titleView;
		
		if (titleView.listViewMonitor != this) {
			titleView.listViewMonitor = this;
			if (!boundTitleFunction._superfunc) {
				boundTitleFunction._superfunc = titleView.setFrame;
			}
			if (titleView.setFrame != boundTitleFunction) {
				titleView.registerAccessors('frame', null, boundTitleFunction);
			}
		}
		
		this._titleHeight = titleView.getFrame()[3];
		delete this._measuredHeight;
		Commands.setTitleView.call(this, ObjectRegistry.objectToId(titleView));
		return this;
	};
	var getTitleView = function() {
		return this._titleView;
	};
	/**
	 * Set the `titleView` property, which contains the list section's title.
	 * @name UI.ListViewSection#setTitleView
	 * @function
	 * @example
	 * var listSection = new UI.ListViewSection();
	 * listSection.setTitleView("Latest Updates");
	 * @param {String} title The new section title.
	 * @returns {void}
	 * @see UI.ListViewSection#getTitleView
	 */
	/**
	 * Retrieve the value of the `titleView` property, which contains the list section's title.
	 * @name UI.ListViewSection#getTitleView
	 * @function
	 * @returns {String} The current section title.
	 * @see UI.ListViewSection#setTitleView
	 */
	ListViewSection.registerAccessors('titleView', getTitleView, setTitleView);
	
	// Other properties
	/**
	 * Set the `rowHeight` property, which contains the height, in pixels, of each row in the list
	 * section. If the section's rows will have variable heights, set the value of `rowHeight` to
	 * `-1`, and call the `{@link UI.ListViewItem#setHeight}` method to set the height of each list
	 * item in the section.
	 * @name UI.ListViewSection#setRowHeight
	 * @function
	 * @example
	 * // Set a fixed row height.
	 * var listSection = new UI.ListViewSection();
	 * listSection.setRowHeight(80);
	 * @param {Number} rowHeight The height, in pixels, of each row in the list section. To use
	 *		variable row heights, set the value to `-1`.
	 * @returns {void}
	 * @see UI.ListViewItem#setHeight
	 * @see UI.ListViewSection#getRowHeight
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `rowHeight` property, which contains the height, in pixels, of each
	 * row in the list section.
	 * @name UI.ListViewSection#getRowHeight
	 * @function
	 * @returns {Number} The height, in pixels, of each row in the list section. Set to `-1` if the
	 *		row uses variable heights.
	 * @see UI.ListViewSection#setRowHeight
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	ListViewSection.synthesizeProperty('rowHeight');
	/**
	 * Set the `items` property, which specifies a list of the `{@link UI.ListViewItem}` objects
	 * that the section contains. The new list of items will completely replace the existing list of
	 * items. If the section is visible, it will be redrawn to show the new items.
	 * @name UI.ListViewSection#setItems
	 * @function
	 * @example
	 * var listItem1 = new UI.ListViewItem(),
	 *     listItem2 = new UI.ListViewItem(),
	 *     listItem3 = new UI.ListViewItem();
	 * var listSection = new UI.ListViewSection();
	 * listSection.setItems[listItem1, listItem2, listItem3];
	 * @param {UI.ListViewItem|UI.ListViewItem[]} newItems A single `{@link UI.ListViewItem}`
	 *		object, or an array of objects, that the list section will contain.
	 * @returns {void}
	 * @see UI.ListViewSection#getItems
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	var setItems = function(newItems) {
		newItems = (newItems instanceof Array) ? newItems : Array.prototype.slice.call(arguments);
		
		this.flush();
		this._items = newItems;
		
		delete this._measuredHeight;
		if (!this._listView) return;
		this._listView.reloadData();
	};
	/**
	 * Retrieve the value of the `items` property, which specifies a list of the
	 * `{@link UI.ListViewItem}` objects that the section contains.
	 * @name UI.ListViewSection#getItems
	 * @function
	 * @returns {UI.ListViewItem[]} An array of objects that the list section currently contains.
	 * @see UI.ListViewSection#setItems
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	var getItems = function() {
		return this._items;
	};
	ListViewSection.registerAccessors('items', getItems, setItems);

	// private
	ListViewSection.synthesizeProperty('yPosition');
};
