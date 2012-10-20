////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Taha S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Class = require('../../NGCore/Client/Core/Class').Class;
var AbstractView = require('./AbstractView').AbstractView;
exports.ListViewItem = Class.subclass( /** @lends GLUI.ListViewItem.prototype */
{
    classname: 'ListViewItem',
    /**
     * @class The <code>ListViewItem</code> class constructs objects that contain data for individual items in a scrolling list (see <code>{@link GLUI.ListView}</code>).
     * @name GLUI.ListViewItem
     * @constructs The default constructor.
     * @augments Core.Class
     */
    _setters: [],
    _getters: [],
    initialize: function (reusableID)
    {
        if (reusableID === undefined)
        {
            this._reusableID = "rid";
        }
        else if (reusableID === "rid")
        {
            throw new Error("Trying to assign reserved ID \"rid\" as Reuse ID");
        }
        else
        {
            this._reusableID = reusableID;
        }
        this._onSetViewCallBack = null;
        this._scrollDirection = 0;
        this._effectiveMeasure = 0;
        this._rowHeight = 0;
        this._heightWidth = 0;
        this._glView = null;
        this._registerSetters();
        this._registerGetters();
        return this;
    },
    /**
     * @name GLUI.ListViewItem#setOnCreateView
     * @description Set the callback for the <code>onCreateView</code> event.
     * This event must return a newly created view that displays the data type represented by the item.
     * @param {Function} newFn The new function to call.
     * @event
     */
    setOnCreateView: function (newFn)
    {
        if (typeof (newFn) === "function")
        {
            this._onCreateView = newFn;
        }
    },
    /**
     * @name GLUI.ListViewItem#setOnReleaseView
     * @description Set the callback for the <code>onReleaseView</code> event. This event occurs when the view is set to <code>null</code>.
     * Use this to remove uncommon view states or clean up the view when necessary.
     * @param {Function} newFn The new function to call.
     * @event
     */
    setOnReleaseView: function (newFn)
    {
        if (typeof (newFn) === "function")
        {
            this._onReleaseView = newFn;
        }
    },
    /**
     * @name GLUI.ListViewItem#setOnSetView
     * @description Set the callback for the <code>onSetView</code> event. When this event occurs, the item puts any relevant visual state / data into <code>newView</code>.
     * This transfer should occur before the item is visible to the user:
     * <pre class="code">onSetView(newView)</pre>
     * @param {Function} newFn The new function to call.
     * @event
     */
    setOnSetView: function (newFn)
    {
        if (typeof (newFn) === "function")
        {
            this._onSetView = newFn;
        }
    },
    /**
     * @private
     * @status Android
     */
    getOnCreateView: function ()
    {
        return this._onCreateView;
    },
    /**
     * @private
     * @status Android
     */
    getOnReleaseView: function ()
    {
        return this._onReleaseView;
    },
    /**
     * @private
     * @status Android
     */
    getOnSetView: function ()
    {
        return this._onSetViewCallBack;
    },
    /**
     * @name GLUI.ListViewItem#getHeight
     * @description Get the current height of the ListViewItem.
     * <pre class="code">getHeight()</pre>
     * This should occur before the item is visible to the user.
     * @returns {Number} The height of this ListViewItem.
     * @function
     * @status Android, Test
     */
    getHeight: function ()
    {
        return this._heightWidth;
    },
    /**
     * @name GLUI.ListViewItem#setHeight
     * @description Set the height of the current ListViewItem in pixels.
     * <pre class="code">setHeight(Number)</pre>
     * This should occur before the item is visible to the user.
     * This setting is only used when the item's ListViewSection has height = -1
     * @param {Number} height The height of the current ListViewItem in pixels.
     * @function
     * @status Android, Test
     */
    setHeight: function (height)
    {
        if (isNaN(height))
        {
            throw new Error('Expecting number value but found ' + typeof (height) + ' for setHeight(height)');
        }
        else if (height === 0)
        {
            throw new Error('Cannot set height of item = 0');
        }
        else
        {
            if (height > 0)
            {
                this._heightWidth = height;
            }
        }
    },
    /**
     * @name GLUI.ListViewItem#getCurrentView
     * @description Retrieve the current view attached to this <code>ListViewItem</code>.
     * @returns {GLUI.View} The current <code>ListViewItem</code> view.
     * @function
     * @status Android, Test
     */
    getCurrentView: function ()
    {
        return this._glView;
    },
    destroy: function ()
    {
        this._scrollDirection = null;
        this._effectiveMeasure = null;
        this._rowHeight = null;
        this._reusableID = null;
        this._glView = null;
        this._heightWidth = null;
    },
    /**
     * @function
     * @private
     * @status Android
     */
    _registerSetters: function ()
    {
        this._setters.onCreateView = this.setOnCreateView.bind(this);
        this._setters.onReleaseView = this.setOnReleaseView.bind(this);
        this._setters.onSetView = this.setOnSetView.bind(this);
        this._setters.height = this.setHeight.bind(this);
    },
    /**
     * @function
     * @private
     * @status Android
     */
    _registerGetters: function ()
    {
        this._getters.onCreateView = this.getOnCreateView.bind(this);
        this._getters.onReleaseView = this.getOnReleaseView.bind(this);
        this._getters.onSetView = this.getOnSetView.bind(this);
        this._getters.height = this.getHeight.bind(this);
    },
    /**
     * @function
     * @private
     * @status Android
     */
    _onCreateView: function ()
    {},
    /**
     * @function
     * @private
     * @status Android
     */
    _onSetView: function ()
    {},
    /**
     * @function
     * @private
     * @status Android
     */
    __onSetView: function (newView)
    {
        if (this._rowHeight === 0)
        {
            throw new Error('Missing Row Height of Section');
        }
        if (newView && newView instanceof AbstractView)
        {
            var width = 0;
            var height = 0;
            if (this._scrollDirection === 1)
            {
                height = this._effectiveMeasure;
                width = this._rowHeight;
            }
            else
            {
                width = this._effectiveMeasure;
                height = this._rowHeight;
            }
            newView.setFrame([0, 0, width, height]);
        }
        this._glView = newView;
        this._onSetView(newView);
    },
    /**
     * @function
     * @private
     * @status Android
     */
    _onReleaseView: function (oldView)
    {},
    /**
     * @function
     * @private
     * @status Android
     */
    _setRowHeight: function (rowHeight)
    {
        if (rowHeight < 0)
        {
            this._rowHeight = this._heightWidth;
        }
        else
        {
            this._rowHeight = rowHeight;
        }
    },
    /**
     * @function
     * @private
     * @status Android
     */
    setAttributes: function (dict)
    {
        var key;
        for (key in dict)
        {
            if (dict.hasOwnProperty(key))
            {
                this.setAttribute(key, dict[key]);
            }
        }
        return this;
    },
    /**
     * @function
     * @private
     * @status Android
     */
    getAttributes: function (list)
    {
        var i, accessor;
        var output = {};
        if (list instanceof Array)
        {
            for (i = 0; i < list.length; i++)
            {
                var key = list[i];
                var methodName = this._getters[key];
                if (typeof methodName === 'function')
                {
                    output[key] = this._getters[key](this);
                }
            }
        }
        else
        {
            for (accessor in this._getters)
            {
                if (this._getters.hasOwnProperty(accessor))
                {
                    output[accessor] = this._getters[accessor](this);
                }
            }
        }
        return output;
    },
    /**
     * @function
     * @private
     * @status Android
     */
    getAttribute: function (key)
    {
        var getter = this._getters[key];
        if (typeof getter === 'function')
        {
            return getter(this, key);
        }
        else
        {
            console.log("Getter for '" + key + "' not found for " + this.classname);
            return undefined;
        }
    },
    /**
     * @function
     * @private
     * @status Android
     */
    setAttribute: function (key, value)
    {
        var myFunction = this._setters[key];
        if (myFunction)
        {
            myFunction(this, value);
        }
        else
        {
            console.log("Setter for '" + key + "' not found for " + this.classname);
        }
        return this;
    }
});