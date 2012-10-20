////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Core        = require('../../../NGCore/Client/Core').Core;
var ServerSync  = require('./ServerSync').ServerSync;

////////////////////////////////////////////////////////////////////////////////
exports.AssetManager = ServerSync.singleton(
/** @lends Service.Data.AssetManager.prototype */
{
    classname: "AssetManager",
    /**
     * @class The <code>AssetManager</code> will allow developers to abstract out the actual named asset from the intent of what the asset is.
     * <br><br>
     * The benefits of such a system is it allows artist/producers to swap out assets as they become
     * available without having to go back and modify code.
     * <br><br>
     * It can also allow developers to make many keys that all point to the same assets and producers
     * can later decide if they do infact need a new custom asset or just reuse a preexisting one.
     * <br><br>
     * All entries are consisit of following objects:<br>
     * <pre class="code">
     * { asset : "", info : null };
     * </pre>
     * <code>setAssetForKey()</code> and <code>getAssetForKey()</code> access <code>asset</code> part of this
     * entry, and <code>setInfoForKey()</code> and <code>getInfoForKey()</code> access <code>info</code> part
     * of one.
     * @example
     * var sound = AssetManager.getAssetForKey("explosion");
     * if(effect) {
     *     var effect = new Audio.Effect(sound);
     *     var activeEffect = new Audio.ActiveEffect(effect);
     *     activeEffect.play();
     * }
     * @constructs Constructor for the class
     * @name Service.Data.AssetManager
     * @augments Core.Class
     */
    initialize : function()
    {
        this.mAssetCount = 0;
        this.mAssetMap = {};
        this.mEmptyEntry = { asset : "", info : null };
        this.setNotifyKey("onAssetManagerLoadComplete");
    },

    /**
     * Resets the Asset manager and unloads any assets.
     */
    reset : function()
    {
        // Remove all the dynamic methods
        this.__flushAssetMap();
    },

    /**
     * Loads the configuration from a flat file.
     * @param {String} fileName File name.
     * @param {Object} environment Environment object which as "os", "size", "device" parameter.
     * @param {Function} [callback] Callback function.
     */
    /**
     * Loads the configuration from a data set.
     * @param {String} jsonData Which should be JSON data.
     * @param {Object} environment Environment object which as "os", "size", "device" parameter.
     * @returns {Foundation.NGGOError} Error object
     */
    /**
     * Gets an actual asset string from a key name defined in the config.
     * @param {String} key Name for the asset entry.
     * @returns {String} String of the actual asset requested.
     */
    getAssetForKey : function(key)
    {
        var entry = this.mAssetMap[key] || this.mEmptyEntry;
        entry.wasRequested = true;
        return entry.asset;
    },

    /**
     * Sets the asset instance for a given key.
     *
     * If you are changing the node it will go though and reattach the children nodes.
     * @param {String} key Name for the asset entry. If key does not exits then nothing is set.
     * @param {String} asset Actual asset access string.
     */
    setAssetForKey : function(key, asset)
    {
        if(this.mAssetMap[key])
        {
            this.mAssetMap[key].asset = asset;
        }
        if(this['getAssetForKey' + key])
        {
            this['getAssetForKey' + key] = function(){ return asset; };
        }
    },

    /**
     * Returns infomation object.
     * @param {String} key Name for the information.
     * @returns {Object} Information for the assets.
     */
    getInfoForKey : function(key)
    {
        var entry = this.mAssetMap[key] || this.mEmptyEntry;
        return entry.info;
    },

    /**
     * Sets the info struct for a given key.
     * @param {String} key Name for the information.
     * @param {Object} info Information for the assets.
     */
    setInfoForKey : function(key, info)
    {
        if(this.mAssetMap[key])
        {
            this.mAssetMap[key].info = info;
        }

        if(this['getInfoForKey' + key])
        {
            this['getInfoForKey' + key] = function(){ return info; };
        }
    },

    /**
     * As the game runs each time a call to getAssetForKey (or it's dynamically generated version)
     * is called it will log that call. The dumpTrackingMap will list each key that was requested,
     * the actual asset that was returned.
     * @returns {Object} String of json data.
     */
    dumpTrackingMap : function()
    {
        var track = {};
        // We will give the following info
        // 1) Keys Requested
        // 2) Keys Unrequested
        // 3) Assets Returned
        // 4) Assets Unused
        track.keys = {};
        track.keys.dirty = [];
        track.keys.clean = [];

        // Lets iterate over all the keys and see what we got
        var cleanAssets = {};
        var dirtyAssets = {};
        var key;
        for(key in this.mAssetMap)
        {
            if(this.mAssetMap.hasOwnProperty(key))
            {
                if(this.mAssetMap[key].wasRequested)
                {
                    track.keys.dirty.push(key);
                    dirtyAssets[this.mAssetMap[key].asset] = 1;
                }
                else
                {
                    track.keys.clean.push(key);
                    cleanAssets[this.mAssetMap[key].asset] = 1;
                }
            }
        }

        track.assets = {};
        track.assets.dirty = [];
        track.assets.clean = [];

        // Now lets build out the assets list
        var ckey;
        for(ckey in cleanAssets)
        {
            if(cleanAssets.hasOwnProperty(ckey))
            {
                track.assets.clean.push(ckey);
            }
        }
        var dkey;
        for(dkey in dirtyAssets)
        {
            if(dirtyAssets.hasOwnProperty(dkey))
            {
                track.assets.dirty.push(dkey);
            }
        }
        return track;
    },

    /**
     * Returns the total number of JSON assets.
     * @returns {Number} Number of JSON assets.
     */
    getAssetCount : function()
    {
        return this.mAssetCount;
    },

    /** @private */
    __flushAssetMap : function()
    {
        var key;
        for(key in this.mAssetMap)
        {
            if(this.mAssetMap.hasOwnProperty(key))
            {
                if(this['getAssetForKey' + key])
                {
                    delete this['getAssetForKey' + key];
                }
                if(this['setAssetForKey' + key])
                {
                    delete this['setAssetForKey' + key];
                }
                if(this['getInfoForKey' + key])
                {
                    delete this['getInfoForKey' + key];
                }
                if(this['setInfoForKey' + key])
                {
                    delete this['setInfoForKey' + key];
                }
            }
        }

        this.mAssetMap = {};
        this.mAssetCount = 0;
    },

    /** @private */
    __createAssetKeyPair : function(asset, key)
    {
        // If the key does not already exists .. create it
        this.mAssetMap[key] = this.mAssetMap[key] || {};

        // Now set the asset for the key
        this.mAssetMap[key].asset = asset;

        // Cache of the object for faster access with the set method
        var mapObj = this.mAssetMap[key];
        var self = this;

        // Create dynamic api
        this['getAssetForKey' + key] = function(){ mapObj.wasRequested = true; return asset; };
        this['setAssetForKey' + key] = function(newAsset)
        {
            self['getAssetForKey' + key] = function(){ return newAsset; };
            mapObj.asset = newAsset;
        };

        // Increment the count
        ++this.mAssetCount;
    },

    /** @private */
    __createInfoKeyPair : function(info, key)
    {
        // If the key does not already exists .. create it
        this.mAssetMap[key] = this.mAssetMap[key] || {};

        // Now set the asset for the key
        this.mAssetMap[key].info = info;

        // Cache of the object for faster access with the set method
        var mapObj = this.mAssetMap[key];
        var self = this;

        // Create dynamic api
        this['getInfoForKey' + key] = function(){ return info; };
        this['setInfoForKey' + key] = function(newInfo)
        {
            self['getInfoForKey' + key] = function(){ return newInfo; };
            mapObj.info = newInfo;
        };
    },

    /** @private */
    __onLoadData : function(data, environment)
    {
        this.__flushAssetMap();
        var screenSize = Core.Capabilities.getScreenWidth().toString() + "x"
            + Core.Capabilities.getScreenHeight().toString();
        environment = environment || { os : Core.Capabilities.getPlatformOS(), size : screenSize, device : Core.Capabilities.getDeviceName() };

        console.log("ENVIRONMENT = " + environment.os + ", " + environment.size + ", " + environment.device);

        var prop;
        // Lets walk the data file
        for(prop in data)
        {
            if(data.hasOwnProperty(prop))
            {
                var useGeneric = true;

                if(data[prop][environment.os])
                {
                    // We have the environment defined
                    var dataAtEnv = data[prop][environment.os];
                    if(dataAtEnv.device &&
                            dataAtEnv.device[environment.device] &&
                            dataAtEnv.device[environment.device].asset)
                    {
                        // we know the device so load it up
                        useGeneric = false;
                        this.__createAssetKeyPair(dataAtEnv.device[environment.device].asset, prop);
                        if(dataAtEnv.device[environment.device].info)
                        {
                            this.__createInfoKeyPair(dataAtEnv.device[environment.device].info, prop);
                        }
                    }
                    else if(dataAtEnv.size &&
                            dataAtEnv.size[environment.size] &&
                            dataAtEnv.size[environment.size].asset)
                    {
                        // We have a defined screen size
                        useGeneric = false;
                        this.__createAssetKeyPair(dataAtEnv.size[environment.size].asset, prop);
                        if(dataAtEnv.size[environment.size].info)
                        {
                            this.__createInfoKeyPair(dataAtEnv.size[environment.size].info, prop);
                        }
                    }
                    if(useGeneric && dataAtEnv.def && dataAtEnv.def.asset)
                    {
                        useGeneric = false;
                        // Load the default for the os type
                        this.__createAssetKeyPair(dataAtEnv.def.asset, prop);
                        if(dataAtEnv.def.info)
                        {
                            this.__createInfoKeyPair(dataAtEnv.def.info, prop);
                        }
                    }
                }

                if(useGeneric && data[prop].generic)
                {
                    var useDefault = true;
                    // Check to see if we defined the size struct for this
                    if( data[prop].generic.size &&
                        data[prop].generic.size[environment.size] &&
                        data[prop].generic.size[environment.size].asset)
                    {
                        this.__createAssetKeyPair(data[prop].generic.size[environment.size].asset, prop);
                        if(data[prop].generic.size[environment.size].info)
                        {
                            this.__createInfoKeyPair(data[prop].generic.size[environment.size].info, prop);
                        }
                        // Do we have a prop for the generic?  If so use it
                        else if(data[prop].generic.def && data[prop].generic.def.info)
                        {
                            this.__createInfoKeyPair(data[prop].generic.def.info, prop);
                        }
                    }
                    else if(useDefault && data[prop].generic.def && data[prop].generic.def.asset)
                    {
                        // We have a generic asset
                        this.__createAssetKeyPair(data[prop].generic.def.asset, prop);
                        if(data[prop].generic.def.info)
                        {
                            this.__createInfoKeyPair(data[prop].generic.def.info, prop);
                        }
                    }
                }
            }
        }
    },
    loadConfigFromAsset: function() {
        throw new Error("AssetManager doesn't support loadConfigFromAsset()");
    }
});

