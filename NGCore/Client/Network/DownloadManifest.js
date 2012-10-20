////////////////////////////////////////////////////////////////////////////////
// Class XHR
// XMLHttpRequest implementation
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('../Core/Class').Class;
var MessageListener = require('../Core/MessageListener').MessageListener;
var XHR = require('./XHR').XHR;
var Util = require('./Util').Util;
var DownloadFile = require('./DownloadFile').DownloadFile;
var FileSystem = require('../Storage/FileSystem').FileSystem;
var LocalGameList = require('../Core/LocalGameList').LocalGameList;

// JMarr temporary hack to supress archive downloads on flash.
var Capabilities = require('../Core/Capabilities').Capabilities;

////////////////////////////////////////////////////////////////////////////////

var Manifest = Class.subclass(
/**
 * @private
 */
{
	classname: 'Manifest',

	/**
	 * @private
	 */
	initialize: function()
	{
    this.mNumAdded = 0;
    this.mNumRemoved = 0;
	},

	/**
	 * @private
	 */
	reset: function ()
	{
		this.mJson = null;
		this.mArchives = null;
	},

	/**
	 * @private
	 */
	initWithJsonText: function ( text, emptyOnFail)
	{
		try
		{
			this.mJson = JSON.parse ( text );
			if (!this.mJson)
			{
				this.mJson = {};
			}
		}
		catch (e)
		{
			this.mJson = {};
		}

		if('__archives' in this.mJson)
		{
			this.mArchives = this.mJson['__archives'].files;
			delete this.mJson['__archives'];
		}
		else
		{
			this.mArchives = [];
		}
	},

	//cb: function ( itemKey, dstList, srcList ), which is compareItems
	//cb returns ! null, then dst[ item ] = cb return value.
	//cb returns null, then delete dst[ item ].
	/**
	 * @private
	 */
	foreach: function ( other, cb )
	{
		var dst = this.mJson;
		var src = other.mJson;
	        var key;
		// Handle all things in src.
		for ( key in src )
		{
			this.handleItem ( key, dst, src, cb );
		}
		// Build up list of all things not in src.
		for ( key in dst )
		{
			// Handle all things not in src.
			if ( ! (key in src) )
			{
				this.handleItem ( key, dst, src, cb );
			}
		}
	},

	/**
	 * @private
	 */
	handleItem: function ( key, dst, src, cb )
	{
		var ret = cb ( key, dst, src );
		if(ret)
		{
      if(ret < 0) {
        this.mNumRemoved++;
        delete dst[ key ];
      } else {
        this.mNumAdded++;
      }
		}
	},

  isModified: function()
  {
    return (this.mNumAdded > 0 || this.mNumRemoved > 0);
  },

	/**
	 * @private
	 */
	write: function ( fname, callback )
	{
		var cb = function (err)
		{
			if (err)
			{
				console.log('Error writing manifest! ' + err);
			}
			if(callback)
			{
				callback();
			}
		};

		if (this.mJson)
		{
			var out = JSON.stringify(this.mJson);
			FileSystem.writeFile(fname, out, {}, cb);
		}
		else
		{
			callback();
		}
	}
});

////////////////////////////////////////////////////////////////////////////////

exports.DownloadManifest = MessageListener.subclass(
/** @lends Network.DownloadManifest.prototype */
{
	classname: 'DownloadManifest',

	/**
	 * @class The `DownloadManifest` class constructs objects that initiate the handling of a
	 * manifest file. This ensures a set of files are kept up-to-date in the specified directory
	 * from the specified URL.
	 * @constructs The default constructor. 
	 * @augments Core.MessageListener
	 * @since 1.0
	 */
	initialize: function()
	{
		this.reset();
	},

	_clearConnections: function()
	{
		for (var i in this.mConnections)
		{
			if(!this.mConnections.hasOwnProperty(i)) continue;
			
			this.mConnections[i].abort();
		}
		this.mConnections = [];
	},

	/**
	 * @private
	 */
	reset: function ()
	{
		this.mConcurrentRequests = 6;

		this.mManifest = null;

		this.mRemoteUrl = null;
		this.mLocalPath = null;
		this.mLocalRoot = null;

		this.mLocalText = null;
		this.mRemoteText = null;
		/** @inner */
		this.mProgressCb = function() {};
		/** @inner */
		this.mDoneCb = function() {};

		this.mPaused = false;
		this.mValid = false;

		this._clearConnections();
		this.mPendingItems = [];
		this.mCompleteBytes = 0;
		this.mTotalBytes = 0;
		
		this.mSpaceNeeded = 0;
		
		this.mNumRemoteManifestFiles = 0;
		this.mNumRemoteManifestBytes = 0;
		
		this.mDownloadArchives = true;
		this.mActiveRequests = [];

		this.mLocalGameList = LocalGameList;

		this.mNewJS = false;
		this.mAppObserver = null;

		this.mRetrySchedule = Util.RetrySchedule(50, 2000);
		this.mManifestRetrySchedule = this.mRetrySchedule.slice(0);

		if(this._statusListener)
		{
			this._statusListener.destroy();
			this._statusListener = null;
		}
		this.mCheckUpdateOnly = false;
		this.mCheckUpdateCallback = null;
		this.mDecompCtxId = 0;
	},

	_ensureTrailingSlashes: function(remoteUrl, localPath, secureContentUrl)
	{
		// Check for trailing slashes
		this.mRemoteUrl = remoteUrl.match(/.*\/$/) ? remoteUrl : remoteUrl + '/';
		// If the local path is nothing, do not alter the filename. Otherwise, ensure trailing slash
		this.mLocalRoot = (localPath.match(/.*\/$/) || (!localPath)) ? localPath : localPath + '/';
		this._secureContentUrl = ((!secureContentUrl) || secureContentUrl.match(/.*\/$/)) ? secureContentUrl : secureContentUrl + '/';
	},

	_readLocalManifest: function()
	{
		FileSystem.readFile ( this.mLocalPath, {}, this._onReadLocalManifest.bind(this) );
	},

	_setRemotePath: function(manifestName)
	{
		if (this._secureContentUrl)
		{
			this.mRemotePath = this._secureContentUrl + manifestName;
		}
		else
		{
			this.mRemotePath = this.mRemoteUrl + manifestName;
		}
	},

	_parseManNames: function (man)
	{
		if (typeof man === 'string')
		{
			var obj = {};
			obj[man] = man;
			man = obj;
		}
		return man;
	},

	/**
	 * @private
	 */
	isUpdated: function(remoteUrl, localPath, manifest, doneCB, errorCB)
	{
		this.mCheckUpdateOnly = true;
		this.mCheckUpdateCallback = doneCB;

		this.mDoneCb = (typeof errorCB == 'function') ? errorCB : function() {};
		this.mProgressCb = function(done, left) {};
		var httpStatusCode = 0;
		var fullUrl = remoteUrl + "/configuration.json" + Util.getCacheBustingString();
		Util.OperationWithRetries(
			(function(failCall, abortCall)
			{
				// Start remote manifest download.
				var req = new XHR();
				/** @inner */
				req.onreadystatechange = (function()
				{
					if( req.readyState == 4 && this.mValid )	// done && not cancelled
					{
						this.mManifest = new Manifest ();
						var manifestUrl = null;
						// Only parse if we got a good response back
						if (req.status == 200 && req.responseText)
						{
							var config = JSON.parse(req.responseText);
							manifestUrl = config.contentUrl;
							if (!manifest)
							{
								manifest =
								{
									"webgame.ngmanifest":
									require('../Core/_int_LGL')._int_LGL.getManifestName(config)
								};
							}

							// If config didn't have contentUrl or we never parsed(local testing), use the base URL
							if (!manifestUrl)
								manifestUrl = remoteUrl;

							manifest = this._parseManNames(manifest);
							var manifestSourceName;
							var manifestName;
							for (var key in manifest)
							{
								manifestSourceName = manifest[key];
								manifestName = key;
								break;
							}

							this._ensureTrailingSlashes(manifestUrl, localPath);
							this.mLocalPath = this.mLocalRoot + manifestName;
							this._setRemotePath(manifestSourceName);
							this._readLocalManifest();
						}
						else if (req.status == 404)
						{
							this._processError('404! Failed to download configuration at '+ fullUrl, false);
						}
						else
						{
							httpStatusCode = req.status;
							failCall();
						}
					}
				}).bind(this);

				req.open ( 'GET', fullUrl, true );
				req.send ();
			}).bind(this),
			(function()
			{
				console.log('Exceeded maximum number of manifest download retires, failing');
				this._processError('Failed to download manifest (' + httpStatusCode + ') at ' + fullUrl, false);
			}).bind(this),
			this.mFailEarly
		);

		this.mValid = true;
	},

	// progressCb: function ( completedRequests, totalRequests )
	// doneCb: function ( err, manifest )
	// throws if url/path arguments are null or empty.
	// TODO: Allow headers argument.  Currently null.
	// TODO: Allow HTTP method argument.  Currently GET.
    /**
	 * Start a download of a remote manifest file at `[remoteUrl + manifestName]` and read a local
	 * manifest at `[localPath + manifestName]`.
	 * 
	 * + If the local manifest does not exist, all files specified by the remote manifest are
	 * downloaded.
	 * + If the local manifest does exist, this method will update the file system at `[localPath]`
	 * to match the files specified in the remote manifest.
	 * 
	 * Each file download will trigger a callback function that returns the number of items
	 * downloaded and the total number of items to download. When all downloads are complete, a
	 * second callback function is triggered that returns an error (if any) and the contents of
	 * `[localPath + manifestName]`. If an error does not occur, this function returns `undefined`.
	 *
	 * **Note**: The contents of `[localPath + manifestName]` are saved whether an error occurs or
	 * not.
	 * 
	 * **Important**: It is currently not supported for multiple manifests to refer to the same 
	 * file.  If a file exists in several different manifests this may cause a race condition 
	 * when downloading multiple manifests that will lead to difficult to debug asset issues.
	 * 
	 * @param {String} remoteUrl The URL to a manifest file.
	 * @param {String} localPath The directory path to a manifest file.
	 * @param {String} manifestName The manifest filename. 
	 * @cb {Function} progressCb The function to call when a file has downloaded.
	 * @cb-param {Number} completedRequests The number of completed downloads.
	 * @cb-param {Number} totalRequests The total number of items being downloaded. Includes items 
	 *		that have already been downloaded.
	 * @cb-returns {void}
	 * @cb {Function} doneCb The function to call when all downloads are complete.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String[]} manifest The contents of `[localPath + manifestName]`.
	 * @cb-returns {void}
	 * @param {Boolean} disableArchives Set to `true` to disable downloading files using archives.
	 * @param {Boolean} failEarly Set to `true` to reduce the number of times to attempt to download
	 *		files and the timeout length for each request.
	 * @throws {Error} The URL or directory path to the manifest file was empty or missing.
	 * @example
	 * Network.DownloadManifest.start(this._URL, './', this._manifestName,
	 *   progressCb, doneCallback);
	 * @function
	 * @returns {void}
     * @status iOS, Android
	 * @since 1.0
	 */
	start: function ( remoteUrl, localPath, manifest, progressCb, doneCb, disableArchives, failEarly )
	{
		this.mCheckUpdateOnly = false;
		
		// Allow manifestName to be a hash with {manifestDestName: manifestSourceName}
		manifest = this._parseManNames(manifest);
		var manifestSourceName;
		var manifestName;
		for (var key in manifest)
		{
			manifestSourceName = manifest[key];
			manifestName = key;
			break;
		}

		console.log('DownloadManifest.start(', remoteUrl, localPath, manifestSourceName, ')');
		if ( ! remoteUrl || ! localPath || remoteUrl === '' || localPath === '' )
		{
			throw new Error ( 'invalid arguments: ' + JSON.stringify ( arguments ) );
		}

		// Set up instance state for this request.
		this.mManifest = new Manifest ();
		if(disableArchives)
			this.mDownloadArchives = false;
		
		// JMarr temporary hack to disable archive downloads on flash.
		if(Capabilities.getPlatformOS() == 'flash')
		{
			console.log('Flash does not yet support archive downloads');
			this.mDownloadArchives = false;
		}

		this._ensureTrailingSlashes(remoteUrl, localPath, this._secureContentUrl);
		this._setRemotePath(manifestSourceName);
		this.mLocalPath = this.mLocalRoot + manifestName;
		this.mFailEarly = failEarly;

		// try these to prevent a failed update due to bad code
		/** @inner */
		this.mProgressCb = function (done, left)
		{
			try
			{
				progressCb(done, left);
			}
			catch (ex)
			{
				NgLogException(ex);
			}
		};

		var that = this;
		/** @inner */
		this.mDoneCb = function (err, man, hadCache)
		{
			try
			{
				// touch the .nomedia file (MOB-1355)
				FileSystem.writeFile(that.mLocalRoot + '/.nomedia', '', {});

				/** @inner */
				this.mProgressCb = function() {};
				/** @inner */
				this.mDoneCb = function() {};
				this._setLifecycleListening(false);
				doneCb(err, man, hadCache);
			}
			catch (ex)
			{
				NgLogException(ex);
			}
		};

		this._readLocalManifest();
		this._setLifecycleListening(true);
		this.mValid = true;
	},

	/**
	 * Reinitialize a `Network.DownloadManifest` object.
	 * @returns {void}
	 * @since 1.4.1
	 */
	abort: function()
	{
		this.reset();
	},

	/**
	 * Pause downloading of a download manifest.
	 * @returns {void}
	 * @since 1.4.1
	 */
	pause: function()
	{
		// Cancel downloads
		this._clearConnections();

		// move active requests back to pending
		this.mPendingItems = this.mPendingItems.concat(this.mActiveRequests);
		this.mActiveRequests = [];

		// Invalidate current unzip operations.
		this.mDecompCtxId++;

		this.mPaused = true;
	},

	/**
	 * Resume downloading of a download manifest.
	 * @returns {void}
	 * @since 1.4.1
	 */
	resume: function()
	{
		if (this.mPaused)
		{
			this.mPaused = false;
			this._downloadPendingItems();
		}
	},

	_setLifecycleListening: function(toListen)
	{
		if (toListen && !this.lifeListening)
		{
			Device.LifecycleEmitter.addListener(this,
				function (event)
				{
					switch (event)
					{
						case Device.LifecycleEmitter.Event.Suspend:
						case Device.LifecycleEmitter.Event.Terminate:
							this._writeManifest();
						break;
					}
				}
			);
			this.lifeListening = true;
		}
		else if (this.lifeListening)
		{
			Device.LifecycleEmitter.removeListener(this);
			this.lifeListening = false;
		}
	},

	_theQuestion: function (toBe)
	{
		return toBe | !toBe;
	},

	_setConfig: function (cfg)
	{
		// For saving after completion
		this._Config = cfg;
		// for skipping JS download
		this._noJS = cfg.omitJsUpdate;
		// For using separate content URL
		this._secureContentUrl = cfg.secureContentUrl;
	},

	// Callback for read of local manifest file in start method.

	_onReadLocalManifest: function ( err, data )
	{
		if (this.mValid)
		{
			try	// always start try block in async callbacks
			{
				if ( ! err )
				{
					this.mLocalText = data;
				}
				else
				{
					this.mLocalText = '{}';	// Empty string is ! null.  It's ok for the read to fail.
				}
				this._downloadManifest();
			}
			catch ( ex )
			{
				NgLogException ( ex );
				this._processError ( 'Error reading local manifest err: ' + err , false );
			}
		}
	},

	// Called to start the manifest download.
	_downloadManifest: function()
	{
		var httpStatusCode = 0;
		Util.OperationWithRetries(
			(function(failCall, abortCall)
			{
				// Start remote manifest download.
				var req = new XHR();
				var id = this.mConnections.push(req) - 1;
				/** @inner */
				req.onreadystatechange = (function()
				{
					if( req.readyState == 4 && this.mValid )	// done && not cancelled
					{
						delete this.mConnections[id];
						httpStatusCode = req.status;
						if ( httpStatusCode == 200 )
						{
							this.mRemoteText = req.responseText;
							this._checkItems();

							if (this.mCheckUpdateOnly)
								this._checkUpdate();
							else
								this._evalManifests ();
						}
						else
						{
							console.log( 'Download of manifest at ' + this.mRemotePath
								+Util.getCacheBustingString() + ' failed: ' + httpStatusCode + ' '
								+ req.responseText);
							if (httpStatusCode == 404)
							{
								abortCall();
							}
							else
							{
								failCall();
							}
						}
					}
				}).bind(this);

				req.open ( 'GET', this.mRemotePath + Util.getCacheBustingString(), true );
				req.send ();
			}).bind(this),
			(function()
			{
				this._processError('Failed to download manifest (' + httpStatusCode + ')', false);
			}).bind(this),
			this.mFailEarly
		);
	},

	// Can be called at any time.

	_processError: function ( message , writeManifest)
	{
		if (writeManifest && this.mManifest)
		{
			this._writeManifest();
		}

		// Don't call the doneCB without checking local text
		if (this.mValid)
		{
			this.mDoneCb ( message, null,  this.mLocalText ? this.mLocalText.length > 2 : false );
			this.reset ();
		}
	},

	_checkItems: function()
	{
		// Init source and destination manifests.
		this.mManifest.initWithJsonText ( this.mLocalText , true );
		var other = new Manifest ();
		other.initWithJsonText ( this.mRemoteText );

		// Build list of pending local items.
		this.mManifest.foreach ( other, this._compareItems.bind(this));
	},

	_checkUpdate: function()
	{
		this.mPendingItems = [];
		this.mCheckUpdateCallback(this.mTotalBytes > 0, this.mTotalBytes);
	},

	_evalManifests: function ()
	{
		try
		{
			// JMarr always download with zips if they are available.
			// If we only need to download less than 33% of files and less than 33% of bytes, then don't use an archive.
			// Additinoally, we must be on wifi, or else carriers might tamper with our files.
			/*var NetworkEmitter = require('../Device/NetworkEmitter').NetworkEmitter;
			if(this.mPendingItems.length < this.mNumRemoteManifestFiles * 0.33
				&& this.mTotalBytes < this.mNumRemoteManifestBytes * 0.33
				&& NetworkEmitter.getLastStatus() == NetworkEmitter.Status.Wifi)
			{
				this.mDownloadArchives = false;
			}*/
			
			// Cache total bytes into separate variable. Archive download might increase
			// space needed, but not total bytes.
			this.mSpaceNeeded = this.mTotalBytes;

			var other = new Manifest ();
			other.initWithJsonText ( this.mRemoteText );
			// If there is no archive in the manifest, don't download an archive.
			if(!other.mArchives)
				this.mDownloadArchives = false;

			// Prepare for archive downloads. If mDownloadArchives is true,
			// then all files will be downloaded through an archive. Otherwise,
			// only files that are makred as force archive will be downloaded
			// through archive.
			this._prepareForArchiveDownload(other.mArchives, !this.mDownloadArchives);
			
			// Trigger progress callback.
			this.mProgressCb ( this.mCompleteBytes, this.mTotalBytes );

			this.mLocalGameList.freeSpace(this.mSpaceNeeded, (function (err)
			{
				if (err)
				{
					this._processError(err, false);
					return;
				}
				var num = this.mPendingItems.length;
				if (num)
				{
					console.log("Going to download %d items.", num);
					if (num < 10)
					{
						console.log("Items: " + JSON.stringify(this.mPendingItems));
					}
				}
				// Download anything that got into pending list
				this._downloadPendingItems ();
			}).bind(this));
		}
		catch (e)
		{
			NgLogException ( e );
			this.mDoneCb ( 'Failed processing manifests!', null );
		}
	},
	
	// Decides which archives need to be downloaded to ensure that all of the pending files are downloaded.
	_prepareForArchiveDownload: function(archives, onlyForcedFiles)
	{
		console.log('DownloadManfiest._prepareForArchiveDownload onlyForcedFiles:', onlyForcedFiles);
		// Iterate over files that need to be covered and make sure they are included.
		var neededFiles = [];
		var includedArcns = {};
		var includedExpSize = 0;
		var includedArcSize = 0;
		var filesToCover = this.mPendingItems;
		var nonForcedFiles = [];
	        var f;
		for(var i=0; i < filesToCover.length; ++i)
		{
			// If this file isn't an archive, just download the file.
			f = filesToCover[i];
			if(!f.arcn)
			{
				//console.log('NonForced: including arnc-less %s', f.name);
				neededFiles.push(f);
				includedExpSize += f.size;
				continue;
			}
			
			// Record that this archive provides this file.
			var arcn = f.arcn;
			var a = archives[arcn];
			if(!a.files)
				a.files = [f];
			else
				a.files.push(f);
			
			// Is this archive already incldued?
			if(includedArcns[arcn])
				continue;
			
			// If we are only including forced files, remember that this
			// is a non forced file that we need to download. If after evaluating
			// all of the forced files and these files are not included, they will
			// be explicitly included.
			if(onlyForcedFiles && !f.arcForce)
			{
				nonForcedFiles.push(f);
				//console.log('NonForced: delaying decision about %s in arcn %d', f.name, f.arcn);
				continue;
			}
			
			//console.log('Forced: including %s from arcn %d', f.name, f.arcn);
			
			// Include the archive associated with this arcn.
			neededFiles.push(a);
			includedArcns[arcn] = true;
			includedExpSize += a.expSize;
			includedArcSize += a.arcSize;
		}
		
		// If only downloading forced archives, examine all of the queued
		// files that are not forced. If their archive is not included, then 
		// directly include the file.
		for(i=0; i < nonForcedFiles.length; ++i)
		{
			// Is the archive for this file already incldued?
			// This will happen if a forced file (like a .js) 
			// forced the archive to be included.
			f = nonForcedFiles[i];
			if(includedArcns[f.arcn])
			{
				//console.log('NonForced: skipping %s because it is already in arcn %d', f.name, f.arcn);
				continue;
			}
			
			//console.log('NonForced: including %s from arch %d', f.name, f.arcn);
			
			// Otherwise, include this file.
			neededFiles.push(f);
			includedExpSize += f.size;
		}
		
		// Tell the rest of the world about our choices.
		this.mPendingItems = neededFiles;
		this.mTotalBytes = includedExpSize;
		this.mSpaceNeeded = includedExpSize + includedArcSize;
	},

	// Callback from Manifest.foreach.

	_compareItems: function ( key, dst, src )
	{
		var ditem = dst[key];
		var sitem = src[key];

		// Early out for removed file.  Always delete.
		if ( ! sitem )
		{
			var fname = this.mLocalRoot + key;
			var cb = function(err)
			{
				if (err)
				{
					console.log('Error deleting ' + fname + ' error: ' + err);
				}
			};
			FileSystem.deleteFile(fname, {}, cb);

			// If the item was pending, delete the temporary file it was downloading
			if ('pending' in ditem )
			{
				fname = fname + '.tmp';
				FileSystem.deleteFile(fname, {}, cb);
			}
			return -1; // removed
		}

		var isJS = this._extensionMatch ( key, 'js' );

		// Don't download the html or the js with noJS.
		if (this._noJS && (isJS || key == "index.html"))
		{
			// Don't download JS!! keep it in the local manifest, but don't push it to download
			return 0; // no change
		}

		sitem.name = key;
		this.mNumRemoteManifestFiles += 1;
		this.mNumRemoteManifestBytes += sitem.size;

		// No local version or version mismatch, must download.
		if ( ! ditem || ditem.hash != sitem.hash)
		{
			if ( isJS )
			{
				this.mNewJS = true;
			}

			// Tally the space we need for downloading new items
			this.mTotalBytes += sitem.size;

			// Add to the pending queue.
			this.mPendingItems.push ( sitem );

      return 1; // added
		}
		
		return 0; // no chage
	},

	// Utility method to check for case-insensitive match for file extension.
	
	_extensionMatch: function ( fname, ext )
	{
		var pattern = new RegExp ( '^.*\\.(' + ext + ')$', 'i' );
		var ret = fname.match ( pattern );
		return ret;
	},

	// Once in download state, this method is called to start downloading 
	// assets from manifest.  When each asset successfully completes, this method
	// will also be called to start the next download.  This method institutes
	// the logic for having a limited number of concurrent downloads from
	// the mCurrentRequests and mConcurrentRequests members.

	_downloadPendingItems: function ()
	{
		if (this.mValid && !this.mPaused)
		{
			// Are we done?
			if ( this.mPendingItems.length === 0 && this.mActiveRequests.length === 0)
			{
				var cb = function()
				{
					this._writeConfig(function()
					{
						// Trigger done callback and reset.
						this.mDoneCb ( null, this.mManifest );
						this.reset ();
					}.bind(this));
				}.bind(this);

				//if (this.mTotalBytes > 0)
				if(this.mManifest && this.mManifest.isModified())
				{
					this._writeManifest ( cb );
				}
				else
				{
					FileSystem.registerManifest ( this.mLocalPath );
					cb();
				}
				return;
			}

			// Not done, pop more pending items and start their downloads.
			while ( this.mPendingItems.length && this.mActiveRequests.length < this.mConcurrentRequests )
			{
				// Download the next pending file.
				var item = this.mPendingItems.pop ();
				item.retrySchedule = this.mRetrySchedule.slice(0);
				this._downloadItem(item);
			}
		}
	},
	
	_downloadItem: function(item)
	{
		this.mActiveRequests.push(item);
		var remoteUrl = this.mRemoteUrl + item.name;
		if(item.mangled)
		{
			var i = remoteUrl.lastIndexOf('.');
			remoteUrl = remoteUrl.substr(0, i) + '-' + remoteUrl.substr(i+1) + '.bin';
		}

		Util.OperationWithRetries((function(failCb)
		{
			// Start the download.
			var dlFile = new DownloadFile();
			var id = this.mConnections.push(dlFile) - 1;
			dlFile.start(this.mLocalRoot + item.name,
				'GET',
				remoteUrl + Util.getCacheBustingString(),
				[],
				this._onDownloadItemComplete.bind(this, item, failCb, id));
		}).bind(this), (function()
		{
			console.log('Manifest download failed. Too many failed download attempts for ' + item.name );
			this._processError ( 'Could not download file ' + item.name , true);
		}).bind(this), this.mFailEarly);
	},

	_removeActiveRequest: function (item)
	{
		for (var i in this.mActiveRequests)
		{
			if (item == this.mActiveRequests[i])
			{
				this.mActiveRequests.splice(i, 1);
			}
		}
	},

	// Callback for completion of download started in downloadItem method.
	// Will throw if item does not have pending member set.

	_onDownloadItemComplete: function ( item, failCb, id, status, hash )
	{
		var decompCtxId = this.mDecompCtxId;
		try
		{
			delete this.mConnections[id];
			// Was there an error or bad download?
			if(status != 200 || item.hash != hash)
			{
				// Try to download the item again.
				console.log('Download failed.  Retrying ' + item.name );
				console.log('Status: ' + status + ' manifest hash: ' + JSON.stringify(item.hash) + ' actual hash: ' + JSON.stringify(hash));
				failCb();
				return;
			}
			
			// Is this an archive?
			if(item.files)
			{
				// Temporarially increase the max number of connections while we decompress the archive.
				++this.mConcurrentRequests;
				this._downloadPendingItems();
				
				FileSystem.decompressFile(this.mLocalRoot + item.name, this.mLocalRoot, { returnFiles:false }, (function(err, files)
				{
					// Restore max connections to original value.
					--this.mConcurrentRequests;
					
					if(decompCtxId !== this.mDecompCtxId) {
						return;
					}

					// Delete the zip file.
					FileSystem.deleteFile(this.mLocalRoot + '/' + item.name, {});

					if(err)
					{
						// Try to download the item again.
						console.log('Decompress failed.  Retrying ' + item.name );
						failCb();
					}
					else
					{
						for(var i=0; i < item.files.length; ++i)
						{
							var f = item.files[i];
							this.mManifest.mJson[f.name] = {size: f.size, hash: f.hash};
							if (typeof f.encryption != "undefined")
								this.mManifest.mJson[f.name].encryption = f.encryption;
							if (typeof f.is_code != "undefined")
								this.mManifest.mJson[f.name].is_code = f.is_code;
						}

						this._removeActiveRequest(item);
						this.mCompleteBytes += Number(item.expSize);
						this.mProgressCb ( this.mCompleteBytes, this.mTotalBytes );
						this._downloadPendingItems ();
					}
				}).bind(this));
			}
			else
			{
				// Update our working manifest.
				this.mManifest.mJson[item.name] = {size: item.size, hash: item.hash};
			    if (typeof item.encryption != "undefined")
					this.mManifest.mJson[item.name].encryption = item.encryption;
				if (typeof item.is_code != "undefined")
					this.mManifest.mJson[item.name].is_code = item.is_code;

				// Make callbacks (like a boss).
				this._removeActiveRequest(item);
				this.mCompleteBytes += Number(item.size);
				this.mProgressCb ( this.mCompleteBytes, this.mTotalBytes );
				this._downloadPendingItems ();
			}
		}
		catch ( ex )
		{
			// Unlikely, but safety
			NgLogException ( ex );
			this._processError ( 'Error after finishing the download of item ' + item 
				+ '. status is ' + status , true );
		}
	},

	// Flush changes to locally cached manifest file.

	_writeManifest: function ( callback )
	{
		console.log("DM Complete!");
		try
		{
			if (this.mManifest) {
				var onComplete = function () {
					FileSystem.registerManifest ( this.mLocalPath );
					if (callback)
						callback.apply(this, arguments);
				};
				this.mManifest.write ( this.mLocalPath, onComplete.bind(this) );
			}
		}
		catch (ex)
		{
			NgLogException(ex);
		}
	},

	_writeConfig: function ( callback )
	{
		try
		{
			if (this._Config)
			{
				// console.log("writing |%s| to %s", JSON.stringify(this._Config), this.mLocalRoot + Capabilities._getConfigFile());
				FileSystem.writeFile(this.mLocalRoot + Capabilities._getConfigFile(),
					JSON.stringify(this._Config), {}, function(err) {
						console.log(err);
						if(callback)
						{
							callback();
						}
					} );
			}
			else
			{
				if(callback)
				{
					callback();
				}
			}
		}
		catch (ex)
		{
			NgLogException(ex);
		}
	}
});

