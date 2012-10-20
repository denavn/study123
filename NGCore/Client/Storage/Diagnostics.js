////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Storage diagnostic emitter; collects info from Storage subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////
    
//
// Create and export a DiagnosticEmitter for Storage.
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
    classname: 'Storage_Diagnostics',

	/**
	 * @class The `Storage.Diagnostics` class provides detailed diagnostic information about classes
	 * in the `Storage` module. You can use this information to debug your app's use of the
	 * `Storage` module and learn more about the app's performance.
	 *
	 * The emitter emits an object of the form:
	 *
	 *     {
	 *         name: "Storage",                         // The emitter's name
	 *         getItem: {
	 *             count: {Number}                      // The number of calls to Storage.KeyValue.getItem()
	 *         },
	 *         setItem: {
	 *             count: {Number}                      // The number of calls to Storage.KeyValue.setItem()
	 *         },
	 *         removeItem: {
	 *             count: {Number}                      // The number of calls to Storage.KeyValue.removeItem()
	 *         },
	 *         readFile: {
	 *             count: {Number}                      // The number of calls to read a file
	 *         },
	 *         writeFile: {
	 *             count: {Number}                      // The number of calls to write a file
	 *         },
	 *         deleteFile: {
	 *             count: {Number}                      // The number of calls to delete a file
	 *         },
	 *         renameFile: {
	 *             count: {Number}                      // The number of calls to rename a file
	 *         },
	 *         decompressFile: {
	 *             count: {Number}                      // The number of calls to decompress a file
	 *         },
	 *         readFile: {
	 *             count: {Number}                      // The number of calls to read a file
	 *         },
	 *         stat: {
	 *             count: {Number}                      // The number of calls to get information about a file
	 *         },
	 *         KeyValue: {                              // Detailed information for Storage.KeyValue
	 *             bytesSetItem: {KeyValueBytes},       // Amount of data written through setItem()
	 *             bytesGetItem: {KeyValueBytes}        // Amount of data read through getItem()
	 *         },
	 *         FileSystem: {                            // Detailed information for Storage.FileSystem
	 *             bytesRead: {FileSystemBytes},        // Number of bytes read from file system
	 *             bytesWritten: {FileSystemBytes}      // Number of bytes written to file system
	 *         }
	 *     }
	 *
	 * The `KeyValueBytes` type is an object of the form:
	 *
	 *     {
	 *         perSecondGlobal: {Number},   // Transfer rate, in bytes per second, for the global store
	 *         perSecondLocal: {Number},    // Transfer rate, in bytes per second, for the local store
	 *         accumGlobal: {Number},       // Total bytes transferred for the global store
	 *         accumLocal: {Number}         // Total bytes transferred for the local store
	 *     }
	 *
	 * The `FileSystemBytes` type is an object of the form:
	 *
	 *     {
	 *         perSecondLocal: {Number},    // Transfer rate, in bytes per second, for the
	 *                                      // persistent file store
	 *         perSecondTemp: {Number},     // Transfer rate, in bytes per second, for the
	 *                                      // temporary file store
	 *         accumLocal: {Number},        // Total bytes transferred for the persistent file store
	 *         accumTemp: {Number}          // Total bytes transferred for the temporary file store
	 *     }
	 * @name Storage.Diagnostics
	 * @constructs
	 * @augments Core.DiagnosticEmitter
	 * @singleton
	 * @since 1.8
	 */
	
	initialize: function($super)
	{
	$super('Storage');
	}

});
