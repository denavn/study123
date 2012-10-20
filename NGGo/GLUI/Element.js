////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Jabbar M.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;

exports.Element = Class.subclass( /** @lends GLUI.Element.prototype */
{
    classname: 'Element',
    _setters: [],
    _getters: [],
    /**
     * @class The <code>Element</code> class is a base class for derived classes that manage object properties and handle user interface events.<br><br>
     * <b>Caution!:</b> This base class is not exported in the GLUI module. Do not access it or subclass it at runtime.
     * Derived classes from <code>Element</code> include:
     * <div class="ul">
     * <li>{@link GLUI.AbstractView}</li>
     * <li>{@link GLUI.ListViewSection}</li>
     * </div>
     * @constructs The default constructor.
     * @param {String} properties
     * @augments Core.Class
     */
    initialize: function ()
    {
        this._internalGLObject = null;
        this._onLoadCallBack = null;
        this._onUnloadCallBack = null;
        this.__retainCount = 0; //by default ngcore uses 0, will be used by listview.
        this._registerSetters(); //to be implemented by the derived classes
        this._registerGetters(); //to be implemented by the derived classes
    },
    /**
     * @private
     * @name GLUI.Element#setOnLoad
     * @description Set a function to call when the <code>load</code> event occurs.<br><br><b>Note:</b> The <code>load</code> event is not supported yet for GLUI.Element
     * @param {Function} loadCallback The new functoin to call.<br><br><b>Note:</b> The <code>load</code> event is disabled
     * if the value of this parameter is not a function.
     * @example function() {
     *  onLoad.loaded = true;
     * };
     * @see GLUI.Element#event:getOnLoad
     */
    setOnLoad: function (onLoadCallBack)
    {
        this._onLoadCallBack = onLoadCallBack;
    },
    /**
     * @private
     * @name GLUI.Element#getOnUnload
     * @description Retrieve the function to call when the <code>unload</code> event occurs.<br><br><b>Note:</b> The <code>load</code> event is not supported yet for GLUI.Element
     * @returns {Function} The current function to call.
     * @see GLUI.Element#event:setOnUnload
     */
    getOnUnload: function ()
    {
        return this._onUnloadCallBack;
    },
    /**
     * @private
     * @name GLUI.Element#getOnLoad
     * @description Retrieve the function to call when the <code>load</code> event occurs.<br><br><b>Note:</b> The <code>load</code> event is not supported yet for GLUI.Element
     * @returns {Function} The current function to call.
     * @see GLUI.Element#event:setOnLoad
     */
    getOnLoad: function ()
    {
        return this._onLoadCallBack;
    },
    /**
     * @private
     * @name GLUI.Element#setOnUnload
     * @description Set a function to call when the <code>unload</code> event occurs.<br><br><b>Note:</b> The <code>load</code> event is not supported yet for GLUI.Element
     * @param {Function} unloadCallback The new functoin to call.<br><br><b>Note:</b> The <code>unload</code> event is disabled
     * if the value of this parameter is not a function.
     * @example function() {
     *  onUnload.unloaded = true;
     * };
     * @see GLUI.Element#event:getOnUnload
     */
    setOnUnload: function (onUnloadCallback)
    {
        this._onUnloadCallBack = onUnloadCallback;
    },
    /**
     * Set the property value for each specified key. Property values are passed in as key/value pairs.
     * @param {Object} dict A dictionary of property key/value pairs.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see GLUI.Element#getAttribute,
     * @see GLUI.Element#getAttributes,
     * @see GLUI.Element#setAttribute
     * @status Android, Test
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
     * Retrieve property values for each specified key.
     * @param {String} list A list of property keywords.
     * @returns {Object} A list of key/value pairs.
     * @see GLUI.Element#getAttribute,
     * @see GLUI.Element#setAttribute,
     * @see GLUI.Element#setAttributes
     * @status Android, Test
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
     * Retrieve the property value of the given key.
     * @param {String} key The property keyword.
     * @returns {String} The current property value.
     * @see GLUI.Element#getAttributes,
     * @see GLUI.Element#setAttribute,
     * @see GLUI.Element#setAttributes
     * @status Android, Test
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
     * Set the property value for the given key.
     * @example var glView = new GLUI.GLView
     * ...
     * glView.setAttribute('normalImage', {url:'./Content/example.png', size:[120, 30] });
     * @param {String} key The property keyword.
     * @param {String} value The new property value.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see GLUI.Element#getAttribute,
     * @see GLUI.Element#getAttributes,
     * @see GLUI.Element#setAttributes
     * @status Android, Test
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
    },
    retain: function ()
    { //will be used by listview.
        if (this.__retainCount)
        {
            ++this.__retainCount;
        }
        else
        {
            this.__retainCount = 1;
        }
        return this;
    },
    release: function ()
    { //will be used by listview.
        if (--this.__retainCount === 0)
        {
            this.destroy();
        }
    },
    retainCount: function ()
    { //will be used by listview.
        return this.__retainCount;
    },
    /**
     * @function
     * @description Destroy this instance and release resources on the backend.
     * @status Android, Test
     */
    destroy: function ($super)
    {
        if (this._internalGLObject)
        {
            this._internalGLObject.destroy();
            this._internalGLObject = null;
        }
        this.__retainCount = 0;
        //this._setters = null; //SETTERS ARE AT CLASS LEVEL
        //this._getters = null; //GETTERS ARE AT CLASS LEVEL
        this._onLoadCallBack = null;
        this._onUnloadCallBack = null;
        if ($super)
        {
            $super();
        }
    },
    /**
     * @private
     * */
    getGLObject: function ()
    {
        if (this._parentNode)
        {
            return this._parentNode;
        }
        else
        {
            return this._internalGLObject;
        }
    },
    _registerSetters: function ()
    {
        //must be written by derived classes
    },
    _registerGetters: function ()
    {
        //must be written by derived classes
    }
});
