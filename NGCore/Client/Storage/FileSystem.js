////////////////////////////////////////////////////////////////////////////////
// Class FileSystem
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;
var Diagnostics = require('./Diagnostics').Diagnostics;

////////////////////////////////////////////////////////////////////////////////

var FSError = function(code, description) {
	this.code = code;
	this.description = description;
	return this;
};

FSError.prototype = {
	classname:"FileSystemError",
	toString: function() {
		return this.className + " " + this.code + ": " + this.description;
	}
};

exports.FileSystem = Core.Class.singleton(
/** @lends Storage.FileSystem.prototype */
{
	classname: 'FileSystem',

  /** @private */
  _options: {
    blocking    : 0x0001, /* legacy blocking(main thread) mode operation for backward compatibility */
    binary      : 0x0002,
    useBinaryCb : 0x0004, /* if _NOT_ set, uses readFileCb for returning binary (legacy) */
    returnFiles : 0x0100,
    returnMd5   : 0x0200
  },
	
	/**
	 * @class The `Storage.FileSystem` class constructs a singleton object that enables an 
	 * application to work with files stored on a device. Use this class to read, write, rename, 
	 * delete, decompress, and retrieve information about files.
	 *
	 * The files you store with `Storage.FileSystem` are not tied to a specific Mobage user. If you 
	 * need to store user-specific files, verify that your application is storing and retrieving 
	 * files for the correct Mobage user. Keep in mind that several different Mobage users could all
	 * use the same application on the same device.
	 * @singleton
	 * @constructs
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		/** @private */
		this.readRequests = {};
		/** @private */
		this.writeRequests = {};
        /** @private */
		this.statRequests = {};
		/** @private */
		this.cbIdCounter = 1;

		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		this._readCount = 0;
		this._writeCount = 0;
		this._deleteCount = 0;
		this._renameCount = 0;
		this._decompressCount = 0;
		this._statCount = 0;

		Diagnostics.pushCollector(this.collectDiagnostics.bind(this));
	},

	/**
	 * Read a file into memory from local storage. Calling this method is equivalent to calling
	 * `{@link Storage.FileSystem#readFileIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * // Read a binary-format game level into memory.
	 * var levelName = "level.bin";
	 *
	 * // Call readFile(), and use the options parameter to indicate that the file is in
	 * // binary format.
	 * Storage.FileSystem.readFile(levelName, { binary: true }, function(err, data) {
	 *     if (err) {
	 *         console.log("An error occurred while reading " + fileName + ": " + err);
	 *     } else {
	 *         // parse the game level file
	 *     }	
	 * });
	 * @param {String} fname The name of the file to read into memory.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to read the file synchronously
	 *		(i.e., the application pauses until the entire file is read). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot
	 *		function without synchronous file access.
	 * @param {Boolean} [options.binary=false] Set to `true` to assume that the file is in binary
	 *		format.
	 * @cb {Function} cb The function to call after reading the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {String} [data] The file data, if the file loaded successfully.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	readFile: function( fname, options, cb )
	{
		this.readFileIn(this.Store.Local, fname, options, cb);
	},
	
	/**
	 * Deprecated signature for reading a file into memory from local storage.
	 * @name readFile^2
	 * @function
	 * @memberOf Storage.FileSystem#
	 * @deprecated Since version 1.4.1. Use the signature readFile(fname, options, cb) rather than
	 * this signature.
	 * @example
	 * Storage.FileSystem.readFile("filename", true, function(err, data) {
	 *     // Add callback code.
	 * });
	 * @param {String} fname The name of the file to read into memory.
	 * @param {Boolean} [binary=false] Set to `true` if `readFile()` should assume that the file is
	 *		in binary format.
	 * @cb {Function} cb The function to call after reading the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {String} [data] The file data, if the file loaded successfully.
	 * @cb-returns {void}
	 * @returns {void}
	 */

	/**
	 * Read a file into memory from a specified local file store. There are separate stores for
	 * persistent files, which are intended to be saved between application sessions, and temporary
	 * files, which can be deleted at any time.
	 * @example
	 * // Cache a user's first name.
	 * var firstName = "Danielle";
	 * Storage.FileSystem.writeFileIn(Storage.FileSystem.Store.Temp, "first-name.txt", 
	 *   firstName, {}, function (err) {
	 *     if (err) {
	 *         console.log("An error occurred while writing " + fileName + ": " + err);
	 *     } else {
	 *         // Read the user's first name.
	 *         Storage.FileSystem.readFileIn(Storage.FileSystem.Store.Temp,
	 *           "first-name.txt", {}, function(err, data) {
	 *             if (err) {
	 *                 console.log("An error occurred while reading " + fileName + 
	 *                   ": " + err);
	 *             } else {
	 *                 console.log("The user's first name is " + data);
	 *             }
	 *         });
	 *     }	
	 * });
	 * @param {Storage.FileSystem#Store} store The local file store to read from. Use
	 *		`Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} fname The name of the file to read into memory.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to read the file synchronously
	 *		(i.e., the application pauses until the entire file is read). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot
	 *		function without synchronous file access.
	 * @param {Boolean} [options.binary=false] Set to `true` to assume that the file is in binary
	 *		format.
	 * @cb {Function} cb The function to call after reading the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {String} [data] The file data, if the file loaded successfully.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	readFileIn: function( store, fname, options, cb )
	{
		var op, cbId = 0;

		this._readCount++;

		if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      NgLogW("FileSystem.readFile/readFileIn(): using deprecated function signature");
      var binary = options;

      if(typeof(binary) == 'function')
      {
        cb = binary;
        binary = false;
      }
      binary = binary || false;

      if ( cb )
      {
        cbId = this.cbIdCounter++;
        this.readRequests[ cbId ] = cb;
      }

      op = this._options.blocking;
      if (binary)
          op |= this._options.binary | this._options.useBinaryCb;
      this._readFileAsyncSendGen(cbId,store,fname,op);
    }
    else
    {
      op = 0;
      if(options['blocking'])
        op |= this._options.blocking;
      if(options['binary'])
        op |= this._options.binary | this._options.useBinaryCb;

      if(cb)
      {
        cbId = this.cbIdCounter++;
        this.readRequests[ cbId ] = cb;
      }

      this._readFileAsyncSendGen(cbId,store,fname,op);
    }
	},

	/**
	 * Write a file to local storage. Calling this method is equivalent to calling
	 * `{@link Storage.FileSystem#writeFileIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * var fileName = "write_test";
	 * var data = "test data";
	 * 
	 * Storage.FileSystem.writeFile(fileName, data, {}, function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while reading " + fileName + ": " + err);
	 *     }	
	 * });
	 * @param {String} fname The name of the file to write into storage.
	 * @param {Binary, String} data The data to write to the file.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to write the file synchronously
	 *		(i.e., the application pauses until the entire file is written). This option can
	 *		cause significant delays on some devices and should be used only if your application
	 *		cannot function without synchronous file access.
	 * @param {Boolean} [options.binary=false] Set to `true` to assume that the data is in binary
	 *		format.
	 * @cb {Function} cb The function to call after writing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	writeFile: function( fname, data, options, cb )
	{
		this.writeFileIn(this.Store.Local, fname, data, options, cb);
	},

	/**
	 * Deprecated signature for writing a file to local storage.
	 * @name writeFile^2
	 * @function
	 * @memberOf Storage.FileSystem#
	 * @deprecated Since version 1.4.1. Use the signature writeFile(fname, data, options, cb)
	 * rather than this signature.
	 * @example
	 * Storage.FileSystem.writeFile("filename", true, function(err) {
	 *     // Add callback code.
	 * });
	 * @param {String} fname The name of the file to write into storage.
	 * @param {Boolean} [binary=false] Set to `true` if `writeFile()` should assume that the file is
	 *		in binary format.
	 * @cb {Function} cb The function to call after writing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 */

	/**
	 * Write a file to a specified local file store. There are separate stores for persistent files,
	 * which are intended to be saved between application sessions, and temporary files, which can
	 * be deleted at any time.
	 * @example
	 * var fileName = "write_test";
	 * var data = "test data";
	 * 
	 * Storage.FileSystem.writeFileIn(Storage.FileSystem.Store.Temp, fileName, 
	 *   data, {}, function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while reading " + fileName + ": " + err);
	 *     }
	 * });
	 * @param {Storage.FileSystem#Store} store The local file store to write to. Use
	 *		`Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} fname The name of the file to write into storage.
	 * @param {Binary, String} data The data to write to the file.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to write the file synchronously
	 *		(i.e., the application pauses until the entire file is written). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot 
	 *		function without synchronous file access.
	 * @param {Boolean} [options.binary=false] Set to `true` to assume that the data is in binary 
	 *		format.
	 * @cb {Function} cb The function to call after writing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	writeFileIn: function( store, fname, data, options, cb )
	{
		var cbId = 0;

		this._writeCount++;

    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      NgLogW("FileSystem.writeFile/writeFileIn(): using deprecated function signature");
      var binary = options;

      if(typeof(binary) == 'function')
      {
        cb = binary;
        binary = false;
      }
      binary = binary || false;

      if ( cb )
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }

      this._writeFileSendGen(cbId,store,fname,data,binary);
    }
    else
    {
      var op = 0;
      if(options['blocking'])
        op |= this._options.blocking;
      if(options['binary'])
        op |= this._options.binary;

      if(cb)
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }

      if((op & this._options.binary) !== 0 && Core.Capabilities.compareBinaryVersion(1, 4) >= 0)
        this._writeFileAsyncBinarySendGen(cbId,store,fname,data,op);
      else
        this._writeFileAsyncSendGen(cbId,store,fname,data,op);
    }
	},

	/**
	 * Delete a file from local storage. Calling this method is equivalent to calling
	 * `{@link Storage.FileSystem#deleteFileIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * var fileName = "delete_test";
	 * 
	 * Storage.FileSystem.deleteFile(fileName, {}, function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while deleting " + fileName + ": " + err);
	 *     }	
	 * });
	 * @param {String} fname The name of the file to delete.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to delete the file synchronously
	 *		(i.e., the application pauses until the entire file is deleted). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot 
	 *		function without synchronous file access.
	 * @cb {Function} cb The function to call after deleting the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	deleteFile: function ( fname, options, cb )
	{
		this.deleteFileIn(this.Store.Local, fname, options, cb);
	},

	/**
	 * Deprecated signature for deleting a file from local storage.
	 * @name deleteFile^2
	 * @function
	 * @memberOf Storage.FileSystem#
	 * @deprecated Since version 1.4.1. Use the signature deleteFile(fname, options, cb) rather
	 * than this signature.
	 * @example
	 * Storage.FileSystem.deleteFile("filename", function(err) {
	 *     // Add callback code.
	 * });
	 * @param {String} fname The name of the file to delete.
	 * @cb {Function} cb The function to call after deleting the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 */

	/**
	 * Delete a file from a specified local file store. There are separate stores for persistent 
	 * files, which are intended to be saved between application sessions, and temporary files, 
	 * which can be deleted at any time.
	 * @example
	 * var fileName = "delete_test";
	 * 
	 * Storage.FileSystem.deleteFile(Storage.FileSystem.Store.Temp, fileName, {},
	 *   function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while deleting " + fileName + ": " + err);
	 *     }	
	 * });
	 * @param {Storage.FileSystem#Store} store The local file store to delete from. Use
	 *		`Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} fname The name of the file to delete.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to delete the file synchronously
	 *		(i.e., the application pauses until the entire file is deleted). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot 
	 *		function without synchronous file access.
	 * @cb {Function} cb The function to call after deleting the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	deleteFileIn: function ( store, fname, options, cb )
	{
		var cbId = 0;

		this._deleteCount++;

    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      NgLogW("FileSystem.deleteFile/deleteFileIn(): using deprecated function signature");
      cb = options;

      if ( cb )
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }
      this._deleteFileSendGen(cbId,store,fname);
    }
    else
    {
      var op = 0;

      if(options['blocking'])
      {
        op |= this._options.blocking;
      }

      if(cb)
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }
      this._deleteFileAsyncSendGen(cbId, store, fname, op);
    }
	},
	
	/**
	 * Decompress a .zip file from local storage. Calling this method is equivalent to calling
	 * `{@link Storage.FileSystem#decompressFileIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * var fileName = "unzip_test";
	 * var fileDir = "dir_test";
	 * 
	 * Storage.FileSystem.decompressFile(fileName, fileDir, {}, function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while decompressing " + fileName +
	 *           ": " + err);
	 *     }	
	 * });
	 * @example
	 * var fileName = "unzip_test";
	 * var fileDir = "dir_test";
	 * 
	 * Storage.FileSystem.decompressFile(fileName, fileDir, { returnFiles: true },
	 *   function(err, files) {
	 *     if (err) {
	 *         console.log("An error occurred while decompressing " + fileName +
	 *           ": " + err);
	 *     } else {
	 *         for (var i = 0; files[i]; i++) {
	 *             console.log("The file " + files[i].name + " has the MD5 hash " +
	 *               files[i].hash + " and is " + files[i].size + " bytes");
	 *         }
	 *     }
	 * });
	 * @param {String} fname The name of the .zip file to decompress.
	 * @param {String} destination The directory where the contents of the decompressed file are
	 *		stored.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to decompress the file synchronously
	 *		(i.e., the application pauses until the entire file is decompressed). This option can
	 *		cause significant delays on some devices and should be used only if your application
	 *		cannot function without synchronous file access.
	 * @param {Boolean} [options.returnFiles=false] If this is set to `true`, an array will be
	 *		passed to the callback function containing a list of the files that were decompressed,
	 *		each file's MD5 hash, and each file's size in bytes.
	 * @cb {Function} cb The function to call after decompressing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {Object[]} [files] Information about the files that were decompressed.
	 * @cb-param {String} [files[].name] The relative path of the file that was decompressed.
	 * @cb-param {String} [files[].hash] The MD5 hash of the file.
	 * @cb-param {Number} [files[].size] The file's size in bytes.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.0
	 */
	decompressFile: function( fname, destination, options, cb )
	{
		this.decompressFileIn(this.Store.Local, fname, destination, options, cb);
	},
	
	/**
	 * Deprecated signature for decompressing a .zip file.
	 * @name decompressFile^2
	 * @function
	 * @memberOf Storage.FileSystem#
	 * @deprecated Since version 1.4.1. Use the signature decompressFile(fname, destination,
	 * options, cb) rather than this signature.
	 * @example
	 * Storage.FileSystem.decompressFile("filename", "dir_test", true,
	 *   function(err, files) {
	 *     // Add callback code.
	 * });
	 * @param {String} fname The name of the .zip file to decompress.
	 * @param {String} destination The directory path where the contents of the decompressed file
	 *		are written.
	 * @param {Boolean} [returnFiles=false] If this is set to `true`, an array will be passed to the
	 *		callback function containing a list of the files that were decompressed, each file's MD5
	 *		hash, and each file's size in bytes.
	 * @cb {Function} cb The function to call after decompressing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {Object[]} [files] Information about the files that were decompressed.
	 * @cb-param {String} [files[].name] The relative path of the file that was decompressed.
	 * @cb-param {String} [files[].hash] The MD5 hash of the file.
	 * @cb-param {Number} [files[].size] The file's size in bytes.
	 * @cb-returns {void}
	 * @returns {void}
	 */

	/**
	 * Decompress a .zip file in a specified local file store. There are separate stores for
	 * persistent files, which are intended to be saved between application sessions, and temporary 
	 * files, which can be deleted at any time.
	 * @example
	 * var fileName = "unzip_test";
	 * var fileDir = "dir_test";
	 * 
	 * Storage.FileSystem.decompressFileIn(Storage.FileSystem.Store.Temp, fileName,
	 *   fileDir, {}, function(err) {
	 *     if (err) {
	 *         console.log("An error occurred while decompressing " + fileName + 
	 *           ": " + err);
	 *     }	
	 * });
	 * @example
	 * var fileName = "unzip_test";
	 * var fileDir = "dir_test";
	 * 
	 * Storage.FileSystem.decompressFileIn(Storage.FileSystem.Store.Temp, fileName,
	 *   fileDir, { returnFiles: true }, function(err, files) {
	 *     if (err) {
	 *         console.log("An error occurred while decompressing " + fileName + 
	 *           ": " + err);
	 *     } else {
	 *         for (var i = 0; files[i]; i++) {
	 *             console.log("The file " + files[i].name + " has the MD5 hash " + 
	 *               files[i].hash + " and is " + files[i].size + " bytes");
	 *         }
	 *     }
	 * });
	 * @param {Storage.FileSystem#Store} store The local file store for the .zip file to decompress. 
	 *		Use `Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} fname The name of the .zip file to decompress.
	 * @param {String} destination The directory where the contents of the decompressed file are
	 *		stored.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to decompress the file synchronously
	 *		(i.e., the application pauses until the entire file is decompressed). This option can
	 *		cause significant delays on some devices and should be used only if your application 
	 *		cannot function without synchronous file access.
	 * @param {Boolean} [options.returnFiles=false] If this is set to `true`, an array will be
	 *		passed to the callback function containing a list of the files that were decompressed,
	 *		each file's MD5 hash, and each file's size in bytes.
	 * @cb {Function} cb The function to call after decompressing the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-param {Object[]} [files] Information about the files that were decompressed.
	 * @cb-param {String} [files[].name] The relative path of the file that was decompressed.
	 * @cb-param {String} [files[].hash] The MD5 hash of the file.
	 * @cb-param {Number} [files[].size] The file's size in bytes.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android    
	 * @since 1.0
	 */
	decompressFileIn: function( store, fname, destination, options, cb )
	{
		var cbId = 0;

		this._decompressCount++;

    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      NgLogW("FileSystem.decompressFile/decompressFileIn(): using deprecated function signature");
      var returnFiles = options;
      if ( cb )
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }
      this._decompressFileSendGen(cbId,store,fname,destination,returnFiles);
    }
    else
    {
      var op = 0;

      if(options['blocking'])
      {
        op |= this._options.blocking;
      }
      if(options['returnFiles'])
      {
        op |= this._options.returnFiles;
      }

      if ( cb )
      {
        cbId = this.cbIdCounter++;
        this.writeRequests[ cbId ] = cb;
      }
      this._decompressFileAsyncSendGen(cbId, store, fname, destination, op);
    }
	},
	
	/**
	 * Rename a file on local storage. Calling this method is equivalent to calling
	 * `{@link Storage.FileSystem#renameFileIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * var filenameOld = "important_file.txt";
	 * var filenameNew = "important_file.xml";
	 *
	 * Storage.FileSystem.writeFile(filenameOld, "test", {}, function (err) {
	 *     if (err) {
	 *         log("An error occurred while writing " + filenameOld + ": " + err);
	 *     } else {
	 *         Storage.FileSystem.renameFile(filenameOld, filenameNew, {},
	 *           function(err) {
	 *             if (err) {
	 *                 log("An error occurred while renaming the file: " + err);
	 *             }
	 *         });
	 *     }
	 * });
	 * @param {String} oldPath The full path of the file to rename.
	 * @param {String} newPath The full path of the file's new name.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to rename the file synchronously
	 *		(i.e., the application pauses until the file is renamed). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot
	 *		function without synchronous file access.
	 * @cb {Function} cb The function to call after renaming the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.4.1
	 */
	renameFile: function ( oldPath, newPath, options, cb )
	{
		this.renameFileIn(this.Store.Local, oldPath, newPath, options, cb);
	},
	/**
	 * Rename a file in a specified local file store. There are separate stores for persistent
	 * files, which are intended to be saved between application sessions, and temporary files, 
	 * which can be deleted at any time.
	 * @example
	 * var filenameOld = "temp_file.txt";
	 * var filenameNew = "temp_file.xml";
	 *
	 * Storage.FileSystem.writeFileIn(Storage.FileSystem.Store.Temp, filenameOld,
	 *   "test", {}, function (err) {
	 *     if (err) {
	 *         log("An error occurred while writing " + filenameOld + ": " + err);
	 *     } else {
	 *         fileSys.renameFileIn(Storage.FileSystem.Store.Temp, filenameOld,
	 *           filenameNew, {}, function(err) {
	 *             if (err) {
	 *                 log("An error occurred while renaming the file: " + err);
	 *             }
	 *         });
	 *     }
	 * });
	 * @param {Storage.FileSystem#Store} store The local file store for the file to rename. Use
	 *		`Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} oldPath The full path of the file to rename.
	 * @param {String} newPath The full path of the file's new name.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to rename the file synchronously
	 *		(i.e., the application pauses until the file is renamed). This option can cause
	 *		significant delays on some devices and should be used only if your application cannot
	 *		function without synchronous file access.
	 * @cb {Function} cb The function to call after renaming the file.
	 * @cb-param {String} [err] The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.4.1
	 */
	renameFileIn: function ( store, oldPath, newPath, options, cb )
	{
		var cbId = 0;
		var op = 0;

		this._renameCount++;

		if(Core.Capabilities.compareBinaryVersion(1, 4) < 0)
		{
			if(typeof(options) == 'function')
			{
				cb = options;
			}
		
			if(cb)
			{
				cb('Not supported');
			}

			return;
		}

		if(typeof(options) !== 'object')
		{
			// assume 'options' arg is not supplied.
			// default behavior is non-blocking.
			cb = options;
		}
		else
		{
			if(options['blocking'])
			{
				op |= this._options.blocking;
			}
		}

		if(cb)
		{
			cbId = this.cbIdCounter++;
			this.writeRequests[ cbId ] = cb;
		}
		this._renameFileAsyncSendGen(cbId, store, oldPath, newPath, op);
	},
	/**
	 * Retrieve information about a file on local storage. Calling this method is equivalent to 
	 * calling `{@link Storage.FileSystem#statIn}` with the `store` parameter set to
	 * `Storage.FileSystem.Store.Local`.
	 * @example
	 * var newFileName = "important_file.txt";
	 *
	 * Storage.FileSystem.writeFile(newFileName, "test", {}, function (err) {
	 *     if (err) {
	 *         log("An error occurred while writing " + newFileName + ": " + err);
	 *     } else {
	 *         Storage.FileSystem.stat(newFileName, {}, function(err, stats) {
	 *             if (err) {
	 *                 log("An error occurred while retrieving file information: " + 
	 *                   JSON.stringify(err));
	 *             }
	 *             else {
	 *                 log("Retrieved file information: " + JSON.stringify(stats));
	 *             }
	 *         });
	 *     }
	 * });
	 * @param {String} filePath The full path of the file for which to retrieve information.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to retrieve information about the
	 *		file synchronously (i.e., the application pauses until the information is obtained).
	 *		This option can cause significant delays on some devices and should be used only if your
	 *		application cannot function without synchronous file access.
	 * @param {Boolean} [options.returnMd5=false] Set to `true` to retrieve the MD5 hash of the
	 *		file's contents. Available since ngCore 1.7.
	 * @cb {Function} cb The function that is called after retrieving information about the file.
	 * @cb-param {Object} [err] Information about the error, if any.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {Storage.FileSystem#ErrorCode} [err.code] A code identifying the type of
	 *		error.
	 * @cb-param {Object} [stats] Information about the file.
	 * @cb-param {Number} [stats.atime] The time when the file was last accessed. Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {Number} [stats.ctime] The time when the file's status was last changed (for 
	 *		example, the file was modified, or its owner or permissions changed). Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {String} [stats.hash] The MD5 hash of the file's contents. Returned only if the
	 *		parameter `options.returnMd5` is set to `true`. Available since ngCore 1.7.
	 * @cb-param {Number} [stats.mtime] The time when the file was last modified. Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {Number} [stats.size] The size of the file, in bytes.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.6
	 */
	stat: function ( filePath, options, cb )
	{
		this.statIn(this.Store.Local, filePath, options, cb);
	},
	/**
	 * Retrieve information about a file in a specified local file store. There are separate stores 
	 * for persistent files, which are intended to be saved between application sessions, and 
	 * temporary files, which can be deleted at any time.
	 * @example
	 * var newFileName = "temp_file.txt";
	 *
	 * Storage.FileSystem.writeFileIn(Storage.FileSystem.Store.Temp, newFileName,
	 *   "test", {}, function (err) {
	 *     if (err) {
	 *         log("An error occurred while writing " + newFileName + ": " + err);
	 *     } else {
	 *         Storage.FileSystem.statIn(Storage.FileSystem.Store.Temp, newFileName, 
	 *           {}, function(err, stats) {
	 *             if (err) {
	 *                 log("An error occurred while retrieving file information: " + 
	 *                   JSON.stringify(err));
	 *             }
	 *             else {
	 *                 log("Retrieved file information: " + JSON.stringify(stats));
	 *             }
	 *         });
	 *     }
	 * });
	 * @param {Object} store The local file store for the file for which to retrieve information.
	 *		Use `Storage.FileSystem.Store.Local` for persistent files and
	 *		`Storage.FileSystem.Store.Temp` for temporary files.
	 * @param {String} filePath The full path of the file for which to retrieve information.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to retrieve information about the
	 *		file synchronously (i.e., the application pauses until the information is obtained).
	 *		This option can cause significant delays on some devices and should be used only if your
	 *		application cannot function without synchronous file access.
	 * @param {Boolean} [options.returnMd5=false] Set to `true` to retrieve the MD5 hash of the
	 *		file's contents. Available since ngCore 1.7.
	 * @cb {Function} cb The function that is called after retrieving information about the file.
	 * @cb-param {Object} [err] Information about the error, if any.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {Storage.FileSystem#ErrorCode} [err.code] A code identifying the type of
	 *		error.
	 * @cb-param {Object} [stats] Information about the file.
	 * @cb-param {Number} [stats.atime] The time when the file was last accessed. Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {Number} [stats.ctime] The time when the file's status was last changed (for 
	 *		example, the file was modified, or its owner or permissions changed). Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {String} [stats.hash] The MD5 hash of the file's contents. Returned only if the
	 *		parameter `options.returnMd5` is set to `true`. Available since ngCore 1.7.
	 * @cb-param {Number} [stats.mtime] The time when the file was last modified. Expressed in
	 *		Unix time (milliseconds since 00:00:00 UTC on January 1, 1970).
	 * @cb-param {Number} [stats.size] The size of the file, in bytes.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.6
	 */
	statIn: function ( store, filePath, options, cb )
	{
		var cbId = 0;
		var op = 0;

		this._statCount++;

		if(Core.Capabilities.compareBinaryVersion(1, 6) < 0)
		{
			if(typeof(options) == 'function')
			{
				cb = options;
			}

			if(cb)
			{
				cb(new FSError(this.ErrorCode.Unsupported, "Not Supported"));
			}

			return;
		}

		if(typeof(options) !== 'object')
		{
			// assume 'options' arg is not supplied.
			// default behavior is non-blocking.
			cb = options;
		}
		else
		{
			if(options['blocking'])
			{
				op = this._options.blocking;
			}
			if(options['returnMd5'])
			{
				op |= this._options.returnMd5;
			}
		}

		if(cb)
		{
			cbId = this.cbIdCounter++;
			this.statRequests[ cbId ] = cb;
		}

		this._statAsyncSendGen(cbId, store, filePath, op);
	},

	/**
	 * Enumeration for local file stores.
	 * @name Store
	 * @fieldOf Storage.FileSystem#
	 */
	
	/**
	 * Temporary file store. Used for files that can be deleted at any time.
	 * @name Store.Temp
	 * @fieldOf Storage.FileSystem#
	 * @constant
	 */
	
	/**
	 * Persistent file store. Used for files that are intended to be saved between application
	 * sessions.
	 * @name Store.Local
	 * @fieldOf Storage.FileSystem#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for errors that occurred during a request.
	 * @name ErrorCode
	 * @fieldOf Storage.FileSystem#
	 */
	
	/**
	 * The file was not found.
	 * @name ErrorCode.NotFound
	 * @fieldOf Storage.FileSystem#
	 * @constant
	 */
	
	/**
	 * An unknown error occurred.
	 * @name ErrorCode.Unknown
	 * @fieldOf Storage.FileSystem#
	 * @constant
	 */
	
	/**
	 * The requested operation is not available.
	 * @name ErrorCode.Unsupported
	 * @fieldOf Storage.FileSystem#
	 * @constant
	 */

	

	/**
	  * @private
	  */
	registerManifest: function ( manifest, cb )
	{
		// left for source code-level compatibility from < 1.6
		if ( cb )
		{
			cb( "" );
		}
	},
	
	/**
	 * @private
	 */
        _readFileCbRecv: function(cmd)
        {
		var msg = {};
		if(!this._readFileCbRecvGen(cmd, msg))
			return;
                this._readFileCbRecvCore(msg["callbackId"], msg["data"], msg["error"]);
        },

	/**
	 * @private
	 */
        _readFileBinaryCbRecv: function(cmd)
        {
		var msg = {};
		if(!this._readFileBinaryCbRecvGen(cmd, msg))
			return;
                this._readFileCbRecvCore(msg["callbackId"], msg["data"], msg["error"]);
        },

	_readFileCbRecvCore: function(cbId, data, err)
	{
		if ( !cbId )
		{
			NgLogE ( "FileSystem.onReadFile: No cbId" );
			return;
		}
		
		var cb = this.readRequests[ cbId ];
		
		if ( !cb )
		{
			NgLogE ( "FileSystem.onReadFile: No registered cb found..cbId is :" + cbId );
			return;
		}
		
		delete this.readRequests[ cbId ];
		cb ( err, data );
	},
	
	/**
	 * @private
	 */
	_writeFileCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._writeFileCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg[ "callbackId" ];
		var err = msg[ "error" ];
		
		if ( !cbId )
		{
			//NgLogE ( "FileSystem command : No cbId" );
			return;
		}
		
		var cb = this.writeRequests[ cbId ];
			
		if ( !cb )
		{
			NgLogE ( "FileSystem command : No registered cb found..cbId is :" + cbId );
			return;
		}

		delete this.writeRequests[ cbId ];
		cb ( err );
	},
	
	/**
	 * @private
	 */
	_deleteFileCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._deleteFileCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg[ "callbackId" ];
		var err = msg[ "error" ];
		
		if ( !cbId )
		{
			//NgLogE ( "FileSystem command : No cbId" );
			return;
		}
		
		var cb = this.writeRequests[ cbId ];
		
		if ( !cb )
		{
			NgLogE ( "FileSystem command : No registered cb found..cbId is :" + cbId );
			return;
		}
		
		delete this.writeRequests[ cbId ];
		cb ( err );
	},
	
	/**
	 * @private
	 */
	_decompressFileCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._decompressFileCbRecvGen(cmd, msg))
			return;
			
		var cbId = msg[ "callbackId" ];
		var files = msg[ "files" ];
		var err = msg[ "error" ];
		
		if ( !cbId )
		{
			//NgLogE ( "FileSystem command : No cbId" );
			return;
		}
		
		var cb = this.writeRequests[ cbId ];
		
		if ( !cb )
		{
			NgLogE ( "FileSystem command : No registered cb found..cbId is :" + cbId );
			return;
		}
		
		try
		{
			files = JSON.parse(files);
		}
		catch(e)
		{
			NgLogE ( "FileSystem command : Could not parse response :" + files );
			err = "Could not parse files";
		}
		
		delete this.writeRequests[ cbId ];
		cb ( err, files );
	},
	
	/**
	 * @private
	 */
	_renameFileCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._renameFileCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg[ "callbackId" ];
		var err = msg[ "error" ];
		
		if ( !cbId )
		{
			//NgLogE ( "FileSystem command : No cbId" );
			return;
		}
		
		var cb = this.writeRequests[ cbId ];
		
		if ( !cb )
		{
			NgLogE ( "FileSystem command : No registered cb found..cbId is :" + cbId );
			return;
		}
		
		delete this.writeRequests[ cbId ];
		cb ( err );
	},

	/**
	 * @private
	 */
	_statCbRecv: function( cmd )
	{
		var msg = {};
		if(!this._statCbRecvGen(cmd, msg))
			return;

		var cbId = msg[ "callbackId" ];
		var data = msg[ "data" ];
		var err = msg[ "error" ];

		if ( !cbId )
		{
			//NgLogE ( "FileSystem command : No cbId" );
			return;
		}

		var cb = this.statRequests[ cbId ];

		if ( !cb )
		{
			NgLogE ( "FileSystem command : No registered cb found..cbId is :" + cbId );
			return;
		}
		
		delete this.statRequests[ cbId ];

		var errObject = null;
		if(err !== '')
		{
			errObject = JSON.parse(err);
		}

		var dataObject = null;
		if(data !== '')
		{
			dataObject = JSON.parse(data);
		}

		cb ( errObject, dataObject );
	},

	/**
	 * @private
	 */
	_registerManifestCbRecv: function ( cmd )
	{
		var msg = {};
		if ( !this._registerManifestCbRecvGen( cmd, msg ) )
			return;
		
		var cbId = msg[ "callbackId" ];
		var err = msg[ "error" ];
		
		if ( !cbId )
		{
			//NgLocE (" FileSystem command : No cbId" );
			return;
		}
		
		var cb = this.registerManifestRequests[ cbId ];
		
		if ( !cb )
		{
			NgLogE (" FileSystem command : No register cb found..cbId is :" + cbId );
			return;
		}
		
		delete this.registerManifestRequests[ cbId ];
		cb( err );
	},
	
// {{?Wg Generated Code}}
	
	// Enums.
	Store:
	{ 
		Temp: 0,
		Local: 1
	},
	
	ErrorCode:
	{ 
		Unknown: -1,
		NotFound: -2,
		Unsupported: -3
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 338,
	// Method create = -1
	// Method readFile = 2
	// Method writeFile = 3
	// Method deleteFile = 4
	// Method decompressFile = 5
	// Method readFileCb = 6
	// Method writeFileCb = 7
	// Method deleteFileCb = 8
	// Method decompressFileCb = 9
	// Method readFileAsync = 10
	// Method writeFileAsync = 11
	// Method deleteFileAsync = 12
	// Method decompressFileAsync = 13
	// Method readFileBinaryCb = 14
	// Method writeFileAsyncBinary = 15
	// Method renameFileAsync = 16
	// Method renameFileCb = 17
	// Method registerManifest = 18
	// Method registerManifestCb = 19
	// Method statAsync = 20
	// Method statCb = 21
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 6:
					instance._readFileCbRecv( cmd );
					break;
				case 7:
					instance._writeFileCbRecv( cmd );
					break;
				case 8:
					instance._deleteFileCbRecv( cmd );
					break;
				case 9:
					instance._decompressFileCbRecv( cmd );
					break;
				case 14:
					instance._readFileBinaryCbRecv( cmd );
					break;
				case 17:
					instance._renameFileCbRecv( cmd );
					break;
				case 19:
					instance._registerManifestCbRecv( cmd );
					break;
				case 21:
					instance._statCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in FileSystem._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in FileSystem._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[338] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_readFileCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.readFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.readFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in FileSystem.readFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.readFileCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_writeFileCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.writeFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.writeFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.writeFileCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_deleteFileCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.deleteFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.deleteFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.deleteFileCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_decompressFileCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.decompressFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.decompressFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "files" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "files" ] === undefined )
		{
			NgLogE("Could not parse files in FileSystem.decompressFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.decompressFileCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_readFileBinaryCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.readFileBinaryCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.readFileBinaryCb from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseBinary( cmd[ 1 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in FileSystem.readFileBinaryCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.readFileBinaryCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_renameFileCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.renameFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.renameFileCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.renameFileCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_registerManifestCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.registerManifestCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.registerManifestCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.registerManifestCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_statCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in FileSystem.statCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in FileSystem.statCb from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in FileSystem.statCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in FileSystem.statCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_readFileSendGen: function( callbackId, storeId, filename, binary )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520002, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), ( binary ? 1 : 0 ) ] );
	},
	
	/** @private */
	_writeFileSendGen: function( callbackId, storeId, filename, data, binary )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520003, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), Core.Proc.encodeString( data ), ( binary ? 1 : 0 ) ] );
	},
	
	/** @private */
	_deleteFileSendGen: function( callbackId, storeId, filename )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520004, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ) ] );
	},
	
	/** @private */
	_decompressFileSendGen: function( callbackId, storeId, filename, destination, returnFiles )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520005, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), Core.Proc.encodeString( destination ), ( returnFiles ? 1 : 0 ) ] );
	},
	
	/** @private */
	_readFileAsyncSendGen: function( callbackId, storeId, filename, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152000a, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), +options ] );
	},
	
	/** @private */
	_writeFileAsyncSendGen: function( callbackId, storeId, filename, data, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152000b, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), Core.Proc.encodeString( data ), +options ] );
	},
	
	/** @private */
	_deleteFileAsyncSendGen: function( callbackId, storeId, filename, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152000c, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), +options ] );
	},
	
	/** @private */
	_decompressFileAsyncSendGen: function( callbackId, storeId, filename, destination, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152000d, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), Core.Proc.encodeString( destination ), +options ] );
	},
	
	/** @private */
	_writeFileAsyncBinarySendGen: function( callbackId, storeId, filename, data, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x152000f, this, [ +callbackId, +storeId, Core.Proc.encodeString( filename ), Core.Proc.encodeBinary( data ), +options ] );
	},
	
	/** @private */
	_renameFileAsyncSendGen: function( callbackId, storeId, oldPath, newPath, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520010, this, [ +callbackId, +storeId, Core.Proc.encodeString( oldPath ), Core.Proc.encodeString( newPath ), +options ] );
	},
	
	/** @private */
	_registerManifestSendGen: function( callbackId, filename )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520012, this, [ +callbackId, Core.Proc.encodeString( filename ) ] );
	},
	
	/** @private */
	_statAsyncSendGen: function( callbackId, storeId, filePath, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1520014, this, [ +callbackId, +storeId, Core.Proc.encodeString( filePath ), +options ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// readFile: function( callbackId, storeId, filename, binary ) {}
	
	// writeFile: function( callbackId, storeId, filename, data, binary ) {}
	
	// deleteFile: function( callbackId, storeId, filename ) {}
	
	// decompressFile: function( callbackId, storeId, filename, destination, returnFiles ) {}
	
	// _readFileCbRecv: function( cmd ) {}
	// _writeFileCbRecv: function( cmd ) {}
	// _deleteFileCbRecv: function( cmd ) {}
	// _decompressFileCbRecv: function( cmd ) {}
	// readFileAsync: function( callbackId, storeId, filename, options ) {}
	
	// writeFileAsync: function( callbackId, storeId, filename, data, options ) {}
	
	// deleteFileAsync: function( callbackId, storeId, filename, options ) {}
	
	// decompressFileAsync: function( callbackId, storeId, filename, destination, options ) {}
	
	// _readFileBinaryCbRecv: function( cmd ) {}
	// writeFileAsyncBinary: function( callbackId, storeId, filename, data, options ) {}
	
	// renameFileAsync: function( callbackId, storeId, oldPath, newPath, options ) {}
	
	// _renameFileCbRecv: function( cmd ) {}
	// registerManifest: function( callbackId, filename ) {}
	
	// _registerManifestCbRecv: function( cmd ) {}
	// statAsync: function( callbackId, storeId, filePath, options ) {}
	
	// _statCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,

	//Diagnostics collector
	collectDiagnostics: function(type, interval)
	{
		var collectedInfo = {
			readFile: {
				count: this._readCount
			},
			writeFile: {
				count: this._writeCount
			},
			deleteFile: {
				count: this._deleteCount
			},
			renameFile: {
				count: this._renameCount
			},
			decompressFile: {
				count: this._decompressCount
			},
			stat: {
				count: this._statCount
			}
         };

		 return collectedInfo;
	}
});

// vim: ts=2:sw=2:noexpandtab:
