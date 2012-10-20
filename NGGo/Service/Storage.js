////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Storage</code> module.</p>
 * @name Service.Storage
 * @namespace
 * @description <p><code>Storage</code> module provides many modules related with storage.</p>
 * <ul>
 * <li><code>{@link Service.Storage.BufferedFileSystem}</code>: Module which extends ngCore's Storage.FileSystem to add buffering feature.
 * <li><code>{@link Service.Storage.BufferedKeyValue}</code>: Module which extends ngCore's Storage.KeyValue to add buffering feature.
 * </ul>
 */

exports.Storage = {};

exports.Storage.__defineGetter__("BufferedFileSystem", function() {
        delete this.BufferedFileSystem;
        return this.BufferedFileSystem = require('./Storage/BufferedFileSystem').BufferedFileSystem;
});
exports.Storage.__defineGetter__("BufferedKeyValue", function() {
        delete this.BufferedKeyValue;
        return this.BufferedKeyValue = require('./Storage/BufferedKeyValue').BufferedKeyValue;
});

