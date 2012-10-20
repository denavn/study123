var AbstractView = require('./AbstractView').AbstractView;
var ScrollView = require('./ScrollView').ScrollView;
var ViewGeometry = require('./ViewGeometry');
var Commands = require('./Commands').Commands;

var ListView = exports.ListView = ScrollView.subclass(
/** @lends UI.ListView.prototype */
{
	'type':'listview',
	/**
	 * @class The `UI.ListView` class creates scrolling lists in an application. A `UI.ListView`
	 * object can contain one or more sections, which are represented by `UI.ListViewSection` 
	 * objects. In turn, each section can contain one or more items, which are represented by
	 * `UI.ListViewItem` objects.
	 *
	 * To improve performance for long lists, `UI.ListView` objects use a pool of reusable views.
	 * When a list item scrolls off the top or bottom of the screen, its view is added to the view
	 * pool. See `{@link UI.ListViewItem}` for more information about managing view pools.
	 *
	 * In a typical list, most or all of the list items' views are displayed with the same general 
	 * appearance. When a list item's view is given a unique appearance--for example, if it is
	 * highlighted with a unique background color--its appearance must be reset when it scrolls off
	 * screen. If the appearance is not reset, the view's unique appearance will persist when the
	 * view is recycled. See `{@link UI.ListViewItem}` for more information.
	 * 
	 * Use this class for scrolling lists that use a table-like layout, or that contain a large
	 * number of very similar views.  For other types of scrolling lists, use the
	 * `{@link UI.ScrollView}` class instead.
	 *
	 * **Note**: Destroying a `UI.ListView` object also destroys all of the
	 * `{@link UI.ListViewItem}` objects that are associated with the scrolling list.
	 * @name UI.ListView
	 * @constructs Create a list view.
	 * @augments UI.ScrollView
	 * @example
	 * // Create a new UI.ListView object without setting any of its properties.
	 * var listView = new UI.ListView();
	 * @example
	 * // Create a new UI.ListView object, setting its header.
	 * var listHeader = "Latest News";
	 * var listView = new UI.ListView({
	 *     header: listHeader
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.ListView` object.
	 * @see UI.ListViewItem
	 * @see UI.ListViewSection
	 * @see UI.ScrollView
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize:function($super, properties) {
		if (ListView._init) ListView._init();
		$super(properties);
		
		this._sections = [];
		this._scrollPosition = [0,0];
		this.enableEvent('scroll', true);
		
		this._ownedViews = [];
		this._queuedViews = {};
		
		this._cellDivider = 0;
		
		return this;
	},
	
	destroy: function($super) {
		var l = this._ownedViews.length;
		for (var i = 0; i < l; i++) {
			this._ownedViews[i].release();
		}
		this._ownedViews = null;
		$super();
	},
	
	addChild: function($super, child, index) {
		if (index == "cell") {
			index = this._cellDivider++;
		} else if ((index || -1) >= 0) {
			index += this._cellDivider;
		}
		$super(child, index);
	},
	
	_viewForItem: function(lvItem) {
		if (lvItem._currentView instanceof AbstractView) return lvItem._currentView;
		
		var rID = lvItem._reuseId;
		var queue = this._queuedViews[rID];
		
		var view = null;
		while (queue && queue.length > 0) {
			if ((view = queue.pop()) instanceof AbstractView) break;
		}
		
		if (!(view instanceof AbstractView)) {
			view = lvItem._onCreateView(lvItem);
			if (view instanceof AbstractView) {
				this._ownedViews.push(view.retain());
				this.addChild(view, "cell");
			} else {
				console.log("Error creating view for list item with reuse id " + rID);
			}
		}
	//	console.log("_viewForItem: " + lvItem + " = " + view);
		return view;
	},
	
	_queueViewForItem: function(lvItem) {
		if(!lvItem){
			NgLogE("ListView::_queueViewForItem called with undefined item");
			return;
		}
		var viewToQueue = lvItem._currentView;
		if (viewToQueue instanceof AbstractView) {
			var rId = lvItem._reuseId;
			var queue = this._queuedViews[rId] || (this._queuedViews[rId] = []);
			queue.push(viewToQueue);
		}
		lvItem._setCurrentView();
	},
	
	_removeQueuedViews: function() {
		for (var q in this._queuedViews) {
			if (!this._queuedViews.hasOwnProperty(q)) continue;
			
			q = this._queuedViews[q];
			for (var i = 0, l = q.length; i < l; i++) {
				q[i].removeFromParent();
			}
		}
		this._cellDivider = 0;
	},
	
	/**
	 * @private
 	 * @status Javascript, iOS, Android, Flash
	 */
	flushSections: function() {
		for (var i in this._sections) {
			if(!this._sections.hasOwnProperty(i)) { continue; }
				
			var section = this._sections[i];
			// Cause every section to completely queue out its item views.
			section.flush();
			section.calculateItemPositions();
		}
		this._removeQueuedViews();
	},
	
	/**
	 * Reload all of the list's sections, and update the layout of each list item's view. Calling
	 * this method ensures that the list reflects any changes to its list items.
	 * 
	 * You do not normally need to call this method. In most cases, the list is automatically 
	 * redrawn as necessary when its list items change.
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	reloadData: function() {
		this.flushSections();
		this.calculateSectionPositions();
		this.updateScrollPosition(this._scrollPosition);
	},
	
	/**
	 * Retrieve the sections that the list contains.
	 * @returns {UI.ListViewSection[]} An array of sections that the list contains.
	 * @see UI.ListView#setSections
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	getSections: function() {
		return this._sections;
	},
	
	/**
	 * Remove all sections from the list, and set a new list of sections that the list contains.
	 * @example
	 * var sections = [];
	 * var sectionHeaders = ["News", "Updates", "Announcements"];
	 * for (var i = 0, l = sectionHeaders.length; i < l; i++) {
	 *     var section = new UI.ListViewSection({
	 *         titleView: sectionHeaders[i]
	 *     });
	 *     // Additional code to populate the section with items.
	 *     // Then add the section to the list:
	 *     sections.push(section);
	 * }
	 * var listView = new UI.ListView();
	 * listView.setFrame([0, 0, Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight()]);
	 * listView.setSections(sections);
	 * @param {UI.ListViewSection[]} newSections An array of sections to add to the list.
	 * @see UI.ListView#getSections
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	setSections: function(newSections) {
		this.flushSections();
	        var i;
		for (i in this._sections) {
			if(this._sections.hasOwnProperty(i)) {
				this._sections[i].setListView(null);
			}
		}
		this._sections = newSections;
		var idArray = [];
		for (i in newSections) {
			if(newSections.hasOwnProperty(i)) {
				idArray.push(0+(newSections[i].__objectRegistryId || 0));
			}
		}
		Commands.setSections.call(this, idArray);
		this.reloadData();
	},
	
	/**
	 * @private
 	 * @status Javascript, iOS, Android, Flash
	 */
	calculateSectionPositions: function() {
		if(!this.getFrame()){
			console.log("UI.ListView Warning: You probably called setSections before you actually set a frame.");
			return;
		}
		this._stackedSections = {};
		var topY = 0;
		// Should account for header here.
		var l = this._sections.length;
		for (var i = 0; i < l; i++) {
		//	NgLogD("Calculating height for Section " + i + " / " + l + " from yPos " + topY);
			var section = this._sections[i];
			this._stackedSections[topY] = section;
			section.setListView(this);
			section.setYPosition(topY);
			var relTopY = this._scrollPosition[1/*y*/] - topY;
			section.updateVisibleRange(relTopY, relTopY + this._frame[3/*h*/]);
			var h = section._measureHeight();
			// Set the section's frame...
			section._setFrame(0, topY, this._frame[2], h);
			topY += h;
		}
		// Should account for footer here.
		this.setContentSize([this._frame[2], topY]);
	},
	
	/**
	 * @private
 	 * @status Javascript, iOS, Android, Flash
	 */
	updateScrollPosition:function(newVal) {
		if (this._scrollPosition[1] === newVal[1]) return;
		this._scrollPosition = newVal;
		
		var myHeight = this._frame[3];
		for (var yPos in this._stackedSections) {
			if(this._stackedSections.hasOwnProperty(yPos)) {
				var section = this._stackedSections[yPos];
				var relTopY = newVal[1] - yPos;
				section.updateVisibleRange(relTopY, relTopY + myHeight);
			}
		}
	},
	
	/**
	 * @protected
 	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	'_onScroll': function() {},
	
	/**
	 * @private
 	 * @status Javascript, iOS, Android, Flash
	 */
	enableEvent: function($super, eventName, enable) {
		// Don't allow scrolling events to be turned off!
		if ( (eventName == 'scroll') && !enable ) return;
		$super(eventName, enable);
	}
});

ListView._init = function() {
	delete ListView._init;
	if (ScrollView._init) ScrollView._init();

	/**
	 * Set the `header` property, which contains header text for the list.
	 * @name UI.ListView#setHeader
	 * @function
	 * @example 
	 * var listView = new UI.ListView();
	 * listView.setHeader("Friends");
	 * @param {String} header The new header text for the list.
	 * @see UI.ListView#getHeader
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `header` property, which contains header text for the list.
	 * @name UI.ListView#getHeader
	 * @function
	 * @returns {String} The current header text for the list.
	 * @see UI.ListView#setHeader
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	ListView.synthesizeProperty('header');
	/**
	 * Set the `footer` property, which contains footer text for the list.
	 * @name UI.ListView#setFooter
	 * @function
	 * @example
	 * var listView = new UI.ListView();
	 * listView.setFooter("Powered by Mobage");
	 * @param {String} footer The new footer text for the list.
	 * @returns {void}
	 * @see UI.ListView#getFooter
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	/**
	 * Retrieve the value of the `footer` property, which contains footer text for the list.
	 * @name UI.ListView#getFooter
	 * @function
	 * @returns {String} The current footer text for the list.
	 * @see UI.ListView#setFooter
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	ListView.synthesizeProperty('footer');
};
