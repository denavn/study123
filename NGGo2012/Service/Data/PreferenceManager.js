////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
// Core Package
var Network     = require('../../../NGCore/Client/Network').Network;
// NGGo Package
var ServerSync  = require('./ServerSync').ServerSync;
var Class       = require('../../Foundation/Class').Class;

/** @private */
var Action = Class.subclass(
/** @lends Service.Data.PreferenceManager.Action.prototype */
{
    classname: "Action",
    initialize: function(key, listener, func) {
        this.key = key;
        this.listener = listener;
        this.func = func;
    },
    call: function(argument_list) {
        this.func.apply(this.listener, argument_list);
    }
});

exports.Action = Action;

exports.PreferenceManager = ServerSync.singleton(
/** @lends Service.Data.PreferenceManager.prototype */
{
    classname: "PreferenceManager",
    /**
     * @class The <code>PreferenceManager</code> class stores game parameters.
     * <br><br>
     * Game code can access these values and update, reset.
     * If you use <code>DebugMenu</code>, you can access/changes values from
     * the debug menu on the mobile device.
     * @borrows Foundation.Observable#addObserver
     * @borrows Foundation.Observable#deleteObserver
     * @borrows Foundation.Observable#deleteObservers
     * @borrows Foundation.Observable#countObservers
     * @borrows Foundation.Observable#notify
     * @constructs
     * @name Service.Data.PreferenceManager
     * @augments Core.Class
     */
    initialize: function()
    {
        this._isRemoteSource = false;
        this._items = {};
        this._source = undefined;
        this._defaults = {};
        this._actions = [];
    },
    /**
     * Loads the configuration from a flat file.
     * @param {String} filename File name of config file.
     * @param {Function} [callback] Callback function it is called when finish loading.
     * @name Service.Data.PreferenceManager.loadConfigFromFile
     */
    /**
     * Loads the configuration from a data set.
     * @param {String|Object} jsonData This is a JSON string or Object.
     * @name Service.Data.PreferenceManager.loadConfigFromData
     */
    /**
     * Sets default values from several data sources.
     * <br><br>
     * You can use following inputs:
     * <ul>
     * <li>JSON: set values from JSON object.</li>
     * <li>localfile: set values from text file.</li>
     * <li>http: set values from HTTP.</li>
     * </ul>
     * If type of input is JSON object, set it directly. If type of input
     * is string and starts with "http://", get over http. If type of input
     * is string and not starts with "http://", treats it as file path.
     * <br><br>
     * The data that <code>PreferenceManager</code> can hold is Number and Boolean
     * and String.
     * <br><br>
     * It can have hierarchy. If the all data is following:
     * <pre class="code">
     * {
     *     grandparent:
     *     {
     *         parent:
     *         {
     *             child: 100
     *         }
     *     }
     * }
     * </pre>
     * You can access the value "100" by the key "grandparent/parent/child".
     * <br><br>
     * After reading input, <code>callback</code> is called.
     * @param {String|Object} input Data source.
     * @param {Function} callback When the reading data is finished, it is called.
     */
    /**
     * Refresh all values from original data source.
     * <br><br>
     * If you set actions, these are kept.
     * @param {Function} [callback] When the reading data is finished, it is called.
     */
    update: function(callback)
    {
        if(this._isRemoteSource)
        {
            this._load(callback);
        }
        else
        {
            var key;
            for(key in this._defaults)
            {
                if(this._defaults.hasOwnProperty(key))
                {
                    this._set(key, this._defaults[key]);
                }
            }
            this._defaults = {};
            if(callback)
            {
                callback();
            }
        }
    },
    /**
     * Get data from PreferenceManager.
     * @param {String} key Data access key.
     * @returns {Number|Boolean|String} Stored data.
     */
    get: function(key)
    {
        if(key === "")
        {
            return this._items;
        }
        var searchResult = this._traverse(key);
        var parent = searchResult[0];
        var finalKey = searchResult[1];
        return parent[finalKey];
    },
    /**
     * Set data to PreferenceManager. If there is "onUpdate" action in same hierarcy,
     * it is called after setting values.
     * @param {String} key Data access key.
     * @param {Number|Boolean|String} value Actual data to store.
     */
    set: function(key, value)
    {
        var oldValue = this.get(key);
        if (oldValue === undefined)
        {
            throw new Error("PreferenceManager.set: unknown key '" + key + "'");
        }
        var valueType = typeof value;
        var oldValueType = typeof oldValue;
        if (valueType !== "number" && valueType !== "boolean" && valueType !== "string")
        {
            throw new Error("PreferenceManager.set: value must be number or boolean or string, but " + valueType);
        }
        else if (valueType !== oldValueType)
        {
            throw new Error("PreferenceManager.set: '" + key + "' only accept " + oldValueType);
        }
        if (this._defaults[key] === undefined)
        {
            this._defaults[key] = oldValue;
        }
        this._set(key, value);
        this._callOnUpdate(key);
    },

    /**
     * Checks whether the key is updated or not.
     * @param {String} key Data access key.
     * @returns {Boolean} The value is updated or not.
     */
    isChanged: function(key)
    {
        var oldValue = this._defaults[key];
        if (oldValue === undefined)
        {
            return false;
        }
        else
        {
            return this.get(key) !== oldValue;
        }
    },

    /**
     * Reset changed value to original data.
     * <br><br>
     * If there is "onUpdate" action in same hierarcy, it is called after setting values.
     * @param {String} key Data access key.
     * @returns {Number|Boolean|String} Original value.
     */
    reset: function(key)
    {
        var oldValue = this._defaults[key];
        if (oldValue === undefined)
        {
            return this.get(key);
        }
        else
        {
            this._set(key, oldValue);
            this._callOnUpdate(key);
            return oldValue;
        }
    },

    /**
     * Add action to PreferenceManager. In <code>DebugMenu</code>, actions are shown as button.
     * <br><br>
     * You can add any tweek actions to debug menu.
     * The action named "onUpdate" is special action. If you change the value of
     * PreferenceManager, then "onUpdate" action is called.
     * @param {String} key Action name(it is used as button label)
     * @param {Object} listener This is listener object. It becomes "this" in action method.
     * @param {Function} func Action function object.
     */
    addAction: function(key, listener, func)
    {
        var oldValue = this.get(key);
        var oldValueType = typeof oldValue;
        if (oldValue !== undefined && !(oldValue instanceof Action))
        {
            throw new Error("PreferenceManager.addAction: '" + key + "' is already used for " + oldValueType);
        }
        var action = new Action(key, listener, func);
        this._actions.push(action);
        this._set(key, action);
    },

    /**
     * Run action which is registered by "addAction".
     * @param {String} key Access key to action.
     */
    runAction: function(key)
    {
        var action = this.get(key);
        if (!(action instanceof Action))
        {
            throw new Error("PreferenceManager.runAction: '" + key + "' is not action");
        }
        action.call(arguments);
    },
    /**
     * Does a XHR request for a fresh copy of the Preference data file.
     */
    getLastestPreferenceConfig : function()
    {
        var request = new Network.XHR();
        var self = this;
        request.onreadystatechange = function()
        {
            if(this.readyState === 4)
            {
                console.log("<NGGO PreferenceManager: data changed");
                self.loadConfigFromData(this.responseText);
                self.notify("onPreferenceManagerChanged", self);
                // Now start polling again
                self._pollServerForChanges();
            }
        };

        request.open("GET", this.mDevelopServerURL + '/Preference', true);
        request.send(null);
    },
    /** @private */
    _traverse: function(key)
    {
        var parent = this._items;
        var keys = key.split("/");
        var i;
        for (i=0; i<keys.length-1; ++i)
        {
            if (parent[keys[i]] === undefined)
            {
                parent[keys[i]] = {};
            }
            parent = parent[keys[i]];
        }
        return [parent, keys.pop()];
    },

    /** @private */
    _callOnUpdate: function(key)
    {
        var index = key.lastIndexOf("/");
        var handler;
        if(index === -1)
        {
            handler = this.get("onUpdate");
        }
        else
        {
            handler = this.get(key.slice(0, index) + "/onUpdate");
        }
        if(handler instanceof Action)
        {
            handler.call();
        }
    },

    /** @private */
    _set: function(key, value)
    {
        var searchResult = this._traverse(key);
        var parent = searchResult[0];
        var finalKey = searchResult[1];
        parent[finalKey] = value;
    },

    /** @private */
    __onLoadData: function(data)
    {
        this._defaults = {};
        this._items = data;
        this._isRemoteSource = this.isRemote;
        var i;
        for(i=0; i<this._actions.length; ++i)
        {
            var action = this._actions[i];
            this._set(action.key, action);
        }
    }
});
