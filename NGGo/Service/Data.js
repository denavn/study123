////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Data</code> module.</p>
 * @name Service.Data
 * @namespace
 * @description <p><code>Data</code> module provides many modules related data.</p>
 * <ul>
 * <li><code>{@link Service.Data.AssetManager}</code>: The <code>AssetManager</code> will allow developers to abstract out the actual named asset from the intent of what the asset is.
 * <li><code>{@link Service.Data.JSONData}</code>: JavaScript object wrapper class which can build from JSON data on remote, local, sting JSON data and JavaScript object itself..</li>
 * <li><code>{@link Service.Data.PreferenceManager}</code>: Provides game preference support.
 * <li><code>{@link Service.Data.TextCache}</code>: It provide the same interface for text cache on memory, filesystem and keyvalue strage.
 * </ul>
 */

exports.Data = {};

exports.Data.__defineGetter__("AssetManager", function() {
        delete this.AssetManager;
        return this.AssetManager = require('./Data/AssetManager').AssetManager;
});
exports.Data.__defineGetter__("JSONData", function() {
        delete this.JSONData;
        return this.JSONData = require('./Data/JSONData').JSONData;
});
exports.Data.__defineGetter__("PreferenceManager", function() {
        delete this.PreferenceManager;
        return this.PreferenceManager = require('./Data/PreferenceManager').PreferenceManager;
});
exports.Data.__defineGetter__("TextCache", function() {
        delete this.TextCache;
        return this.TextCache = require('./Data/TextCache').TextCache;
});

