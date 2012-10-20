////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Network</code> module.</p>
 * @name Service.Network
 * @namespace
 * @description <p><code>Network</code> module provides many modules related network.</p>
 * <ul>
 * <li><code>{@link Service.Network.HTTP}</code>: HTTP related modules.</li>
 * <li><code>{@link Service.Network.MultiManifestManager}</code>: Smart download manager for multiple manifests.</li>
 * </ul>
 */

exports.Network = {};

exports.Network.__defineGetter__("HTTPRequest", function() {
        delete this.HTTPRequest;
        return this.HTTPRequest = require('./Network/HTTPRequest').HTTPRequest;
});

exports.Network.__defineGetter__("URI", function() {
        delete this.URI;
        return this.URI = require('./Network/URI').URI;
});

exports.Network.__defineGetter__("MultiManifestManager", function() {
        delete this.MultiManifestManager;
        return this.MultiManifestManager = require('./Network/MultiManifestManager').MultiManifestManager;
});
