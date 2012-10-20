////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas S, Taha S
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Element = require('./Element').Element;
exports.ListViewSection = Element.subclass( /** @lends GLUI.ListViewSection.prototype */
{
    classname: 'ListViewSection',
    'type': 'listview-section',
    /**
     * @class The <code>ListViewSection</code> class constructs objects that contain <code>ListViewItem</code> objects. 
     * These objects are rendered as individual sections of a scrolling list (see <code>{@link GLUI.ListView}</code>).
     * @name GLUI.ListViewSection
     * @constructs
     * @augments GLUI.Element
     */
    initialize: function (properties)
    {
        this._items = [];
        this._rowHeightWidth = 0;
        this._titleView = null;
        this._parentListView = null;
        if (properties)
        {
            this.setAttributes(properties);
        }
    },
    /**
     * @name GLUI.ListViewSection#setItems
     * @description Set the value for the <code>items</code> property.
     * Setting this updates the visual state of the <code>listView</code> if the section is in a <code>listView</code> that is visible.
     * @param {UI.ListViewItem} items The new <code>ListView</code> items.
     * @see UI.ListViewSection#getItems
     * @status Android, Test
     * @function
     */
    setItems: function (items)
    {
        if (items instanceof Array)
        {
            this._items = items; //not creating a deep copy here.
            if (this._parentListView)
            {
                this._parentListView.reloadData();
                //this._updateHeight();     //this will not be called now, listView calls it.
            }
        }
        else
        {
            throw new Error(this.classname + ' setItems() expects an array, getting ' + items.type);
        }
    },
    /**
     * @name GLUI.ListViewSection#setRowHeight
     * @description Set the value for the <code>rowHeight</code> property.
     * @param {Number} rowHeight The new row height.
     * @see GLUI.ListViewSection#getRowHeight
     * @status Android, Test
     * @function
     */
    setRowHeight: function (height)
    {
        if (isNaN(height))
        {
            throw new Error('Expecting number value but found ' + typeof (height) + ' for setRowHeight(height)');
        }
        else if (height === 0)
        {
            throw new Error('Cannot set row height of section = 0');
        }
        else
        {
            this._rowHeightWidth = height;
            //this._updateHeight();     //this will not be called now, listView calls it.
        }
    },
    /**
     * @name GLUI.ListViewSection#getTitleView
     * @description 
     * @see GLUI.ListViewSection#setTitleView
     * @status Android, Test
     * @function
     */
    getTitleView: function ()
    {
        return this._titleView;
    },
    /**
     * @name GLUI.ListViewSection#setTitleView
     * @description Sets the object for <code>title</code> property.
     * @param {View} The GLUI.View object that is to be set as the Section Title View
     * @see GLUI.ListViewSection#getTitleView
     * @function
     */
    setTitleView: function (titleView)
    {
        this._titleView = titleView;
    },
    /**
     * @name GLUI.ListViewSection#setYPosition
     * @description Set the value for the <code>yPosition</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Number}  yPosition The new position for y.
     * @see GLUI.ListViewSection#getYPosition
     * @function
     */
    setYPosition: function ()
    {
        //to be implemented
        console.log('<NGGo>@ WARNING This method is not implemented due to GL2 limitation: setYPosition() ' + this.classname);
    },
    /**
     * @name GLUI.ListViewSection#getYPosition
     * @description Retrieve the value of the <code>yPosition</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Number} The current position of y.
     * @see GLUI.ListViewSection#setYPosition
     * @function
     */
    getYPosition: function ()
    {
        //to be implemented
        console.log('<NGGo>@ WARNING This method is not implemented due to GL2 limitation: getYPosition() ' + this.classname);
    },
    /**
     * @name GLUI.ListViewSection#getItems
     * @description Retrieve the value of the <code>items</code> property.
     * @returns {GLUI.ListViewItem} The current <code>ListView</code> items.
     * @see UI.ListViewSection#setItems
     * @status Android, Test
     * @function
     */
    getItems: function ()
    {
        return this._items;
    },
    /**
     * @name GLUI.ListViewSection#getRowHeight
     * @description Retrieve the value of the <code>rowHeight</code> property.
     * @returns {Number} The current row height.
     * @see GLUI.ListViewSection#setRowHeight
     * @status Android, Test
     * @function
     */
    getRowHeight: function ()
    {
        return this._rowHeightWidth;
    },
    /**
     * @name GLUI.ListViewSection#flush
     * @description Reset the visible range for this <code>ListViewSection</code>.
     * @function
     * @status Android, Test
     */
    flush: function ()
    {
        if (this._parentListView)
        {
            this._parentListView._flushSection(this);
        }
    },
    /**
     * @private 
     * */
    destroy: function ()
    {
        this._items = null;
        this._rowHeightWidth = null;
        this._titleView = null;
        this._parentListView = null;
    },
    /**
     * @private 
     * */
    _registerSetters: function ($super)
    {
        $super();
        this._setters['items'] = this._setItemsProperty;
        this._setters['rowHeight'] = this._setRowHeightProperty;
        this._setters['titleView'] = this._setTitleViewProperty;
    },
    /**
     * @private 
     * */
    _registerGetters: function ($super)
    {
        $super();
        this._getters['items'] = this._getItemsProperty;
        this._getters['rowHeight'] = this._getRowHeightProperty;
        this._getters['titleView'] = this._getTitleViewProperty;
    },
    /**
     * @private 
     * */
    _updateHeight: function ()
    {
        var i = 0;
        if (this._items)
        {
            for (i = 0; i < this._items.length; i++)
            {
                this._items[i]._setRowHeight(this._rowHeightWidth);
            }
        }
    },
    ////////// Empty Functions //////////////
    /**
     * @name GLUI.ListViewSection#setTitle
     * @description Set the value for the <code>title</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {String} title The new section title.
     * @param {GLUI.State} [flags Optional, Default: GLUI.State.Normal] The GLUI view state. 
     * @see GLUI.ListViewSection#getTitle
     * @function
     */
    setTitle: function ()
    {
        console.log('<NGGo>@ WARNING This method is not implemented due to GL2 limitation: setTitle() ' + this.classname);
    },
    /**
     * @name GLUI.ListViewSection#getTitle
     * @description Retrieve the value of the <code>title</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {String} The current section title.
     * @see GLUI.ListViewSection#setTitle
     * @function
     */
    getTitle: function ()
    {
        console.log('<NGGo>@ WARNING This method is not implemented due to GL2 limitation: getTitle() ' + this.classname);
    },
    /** @private Property accessors*/
    _setItemsProperty: function (callee, args)
    {
        return callee.setItems(args);
    },
    _setRowHeightProperty: function (callee, args)
    {
        return callee.setRowHeight(args);
    },
    _setTitleViewProperty: function (callee, args)
    {
        return callee.setTitleView(args);
    },
    _getItemsProperty: function (callee, args)
    {
        return callee.getItems(args);
    },
    _getRowHeightProperty: function (callee, args)
    {
        return callee.getRowHeight(args);
    },
    _getTitleViewProperty: function (callee, args)
    {
        return callee.getTitleView(args);
    }
});