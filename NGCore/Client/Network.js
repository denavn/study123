////////////////////////////////////////////////////////////////////////////////
// Class Network
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
/**
 * @name Network
 * @namespace Connect to remote servers.
 * @description The Network module is a collection of classes that support manipulation of network flow.
 * Each class handles a specific aspect of the module implementation and contains APIs that support the class:
 *
 * + `{@link Network.DNS}`: Obtain the IP address associated with a domain name.
 * + `{@link Network.Diagnostics}`: Provide diagnostic information about the app's use of the
 * `Network` module.
 * + `{@link Network.DownloadFile}`: Construct objects that conduct a file download.
 * + `{@link Network.DownloadManifest}`: Construct objects that keep manifests up-to-date.
 * + `{@link Network.Socket}`: Connect to a server using TCP or UDP sockets.
 * + `{@link Network.XHR}`: Construct XmlHttpRequest objects.
 */
function NetworkLoader(map) {
	this.add = function(key, toEval) {
		this.__defineGetter__(key, function() {
			delete this[key];
			return this[key] = toEval();
		});
	};
	for (var k in map) {
		if (map.hasOwnProperty(k)) this.add(k, map[k]);
	}
}

exports.Network = new NetworkLoader({
	'XHR': function() { return require("./Network/XHR").XHR; },
	'DownloadFile': function() { return require("./Network/DownloadFile").DownloadFile; },
	'DownloadManifest': function() { return require("./Network/DownloadManifest").DownloadManifest; },
	'Util': function() { return require("./Network/Util").Util; },
	'_int_Util': function() { return require("./Network/_int_Util")._int_Util; },
	'Socket': function() { return require("./Network/Socket").Socket; },
	'DNS': function() { return require("./Network/DNS").DNS; },
	'Diagnostics': function() { return require("./Network/Diagnostics").Diagnostics; }
});
