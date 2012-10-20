/**
 * @name Storage
 * @namespace Access files and key/value pairs.
 * @description The `Storage` module is a collection of classes that support data manipulation
 * operations. Each class handles a specific aspect of the module implementation and contains APIs
 * that support the class:
 *
 * + `{@link Storage.Diagnostics}`: Provide diagnostic information about the app's use of the
 * `Storage` module.
 * + `{@link Storage.FileSystem}`: Construct objects for reading a file, writing to a file, deleting
 * a file, decompressing a file, or retrieving information about a file.
 * + `{@link Storage.KeyValue}`: Construct objects that store key/value pairs on the device.
 * + `{@link Storage.KeyValueCache}`: Obtain access to the local key/value store.
 *
 * When you use these classes, the data you store is not tied to a specific Mobage user. If you need
 * to store user-specific data, do one of the following:
 *
 * 1. Verify that your application is storing and retrieving data for the correct Mobage user. Keep
 * in mind that several different Mobage users could all use the same application on the same
 * device.
 * 2. As an alternative to `{@link Storage.KeyValue}`, consider using the
 * `{@link Social.Common.Appdata}` class, which stores application data that is tied to a specific
 * Mobage user.
 */
function StorageLoader(map) {
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

exports.Storage = new StorageLoader({
	'KeyValue': function() { return require('./Storage/KeyValue').KeyValue; },
	'KeyValueCache': function() { return require('./Storage/KeyValue').KeyValueCache; },
	'FileSystem': function() { return require('./Storage/FileSystem').FileSystem; },
	'Diagnostics': function() { return require('./Storage/Diagnostics').Diagnostics; }
});
