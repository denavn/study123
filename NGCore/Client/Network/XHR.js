////////////////////////////////////////////////////////////////////////////////
// Class XHR
// XMLHttpRequest implementation
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('../Core/Class').Class;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Util = require('./Util').Util;
var Caps = require('../Core/Capabilities').Capabilities;

////////////////////////////////////////////////////////////////////////////////

var Header = function (item, content)
{
	this.item = item;
	this.content = content;
};
var headerEx = /(.*?): (.*)/;

// Constants
var State =
{
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
};

// ///////////// Begin HTTP req'd methods of testing! //////
var methods =
[
	"OPTIONS",
	"GET",
	"HEAD",
	"POST",
	"PUT",
	"DELETE",
	"TRACE",
	"CONNECT"
];

var unsecureMethods = ["CONNECT", "TRACE", "TRACK"];

var checkMethod = function(method)
{
	if(!method) return "GET";

	method = method.toString();

	if (method in unsecureMethods)
	{
		throw "SECURITY_ERROR " + method + " not allowed.";
	}
	if (method.toUpperCase() in methods)
	{
		return method.toUpperCase();
	}
	return method;
};

// ////////////////////////// End! /////////////////////

////////////////////////////////////////////////////////////////////////////////

exports.XHR = Class.subclass(
/** @lends Network.XHR.prototype */
{
	classname: 'XHR',
	
	/**
	 * @class The `XHR` class constructs `XmlHttpRequest` objects. Applications can use these
	 * objects to send HTTP or HTTPS requests directly to a web server and load the server response
	 * data directly back into a script. For additional details, see the [W3C XmlHttpRequest
	 * specification](http://www.w3.org/TR/XMLHttpRequest/).
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		this.respHeaders = {};

		this.settings = {};
		this.headers = [];

		// State-associated flags
		this.sendFlag = false;
		this.errorFlag = false;
		
		// Status & response
		this.readyState = State.UNSENT;
		this.responseText = null;
		this.responseXML = null;
		this.status = 0;
		this.statusText = "";
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 340,
	// Method create = -1
	// Method destroy = 2
	// Method sendStatus = 3
	// Method sendHeaders = 4
	// Method sendData = 5
	// Method onFinish = 6
	// Method start = 7
	// Method header = 8
	// Method setComposition = 9
	
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
				
				case 3:
					instance._sendStatusRecv( cmd );
					break;
				case 4:
					instance._sendHeadersRecv( cmd );
					break;
				case 5:
					instance._sendDataRecv( cmd );
					break;
				case 6:
					instance._onFinishRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in XHR._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in XHR._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[340] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_sendStatusRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in XHR.sendStatus from command: " + cmd );
			return false;
		}
		
		obj[ "statNum" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "statNum" ] === undefined )
		{
			NgLogE("Could not parse statNum in XHR.sendStatus from command: " + cmd );
			return false;
		}
		
		obj[ "statStr" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "statStr" ] === undefined )
		{
			NgLogE("Could not parse statStr in XHR.sendStatus from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_sendHeadersRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in XHR.sendHeaders from command: " + cmd );
			return false;
		}
		
		obj[ "headers" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "headers" ] === undefined )
		{
			NgLogE("Could not parse headers in XHR.sendHeaders from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_sendDataRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in XHR.sendData from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in XHR.sendData from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onFinishRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in XHR.onFinish from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseBool( cmd[ 0 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in XHR.onFinish from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x154ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1540002, this );
	},
	
	/** @private */
	_startSendGen: function( method, url, data, headers )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1540007, this, [ Core.Proc.encodeString( method ), Core.Proc.encodeString( url ), Core.Proc.encodeString( data ), +headers ] );
	},
	
	/** @private */
	_headerSendGen: function( item, content )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ Core.Proc.encodeString( item ), Core.Proc.encodeString( content ) ] );
	},
	
	/** @private */
	_setCompositionSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1540009, this );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// _sendStatusRecv: function( cmd ) {}
	// _sendHeadersRecv: function( cmd ) {}
	// _sendDataRecv: function( cmd ) {}
	// _onFinishRecv: function( cmd ) {}
	// start: function( method, url, data, headers ) {}
	
	// header: function( item, content ) {}
	
	// setComposition: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,
// API
	/**
	 * Initialize a request for this `XHR`.
	 *
	 * **Note**: Calling `open()` will wipe all request headers. You must set them after making this
	 * call.
	 * @param {String} method The request method (`GET`, `POST`, `OPTIONS`, `HEAD`, `PUT`, `DELETE`,
	 *		`TRACE`, `CONNECT`).
	 * @param {String} url The request URL.
	 * @param {Boolean} [async=true] Set to `true` if the request is synchronous. Set to `false` in
	 *		all other cases. **Note**: Currently not implemented.
	 * @param {String} [user] Username for basic authentication. **Note**: Currently not
	 *		implemented.
	 * @param {String} [password] Password for basic authentication.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	open: function(method, url, async, user, password)
	{
		url = url.split(' ').join('%20');
		this.settings =
		{
			"method": checkMethod(method),
			"url": Util.buildRelativeUrl(url),
			"async": async,
			"user": user,
			"password": password
		};

		this.reset();
		this.setState(State.OPENED);
	},

	/**
	 * @private
	 * Send a request initialized by the `open()` method. 
	 * @param {Array} [composition] Array of strings and file names to be composed into the body.
	 * **Note**: This parameter is ignored if `readyState` is set as `GET` or `HEAD`.
	 * @throws {INVALID_STATE_ERR} If `readyState` is set as anything other than `OPENED` or if the `send()` flag is true.
	 * @see Network.XHR#open
	 * @returns {void}
	 * @status iOS, Android, Flash
	 * @since 1.1.6
	 */
	sendComposition: function(comp)
	{
		// ex: [{"str":"string to send"},{"file":"path/to/file.bin"},{"str":"more goods"}]
		this.composing = true;
		this.send(JSON.stringify(comp));
	},

	/**
	 * Send a request initialized by the `open()` method.
	 * @param {String} [data] The request entity body. **Note**: This parameter is ignored if
	 *		`readyState` is set as `GET` or `HEAD`.
	 * @throws {INVALID_STATE_ERR} If `readyState` is set as anything other than `OPENED` or if the
	 *		`send()` flag is true.
	 * @see Network.XHR#open
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	send: function(data)
	{
		if (this.readyState != State.OPENED || this.sendFlag)
		{
			throw "INVALID_STATE_ERR: " + (this.sendFlag ? "Already sending" : "in state " + this.readyState);
		}
		this.sendFlag = true;

		/* Skip unused code.
		if (data && this.settings.method != "GET" && this.settings.method != "HEAD")
		{
			// TODO http://www.w3.org/TR/XMLHttpRequest/#the-send-method step 3
		}
		*/

		this.errorFlag = false;

	        var i;

		// Set content length header
		if (this.settings.method == "GET" || this.settings.method == "HEAD")
		{
			data = null;
		}
		else if (data)
		{
			var bFound = false;
			for (i in this.headers)
			{
				if (this.headers[i].item == "Content-Type")
				{
					bFound = true;
					break;
				}
			}
			if (!bFound)
			{
				this.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
			}
		}

		this.responseText = "";

		// Send data to the server
		if (!data)
		{
			data = "";
		}

		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		if (this.composing)
			this._setCompositionSendGen();

		this._startSendGen(this.settings.method, this.settings.url, data, this.headers.length);
		for (i in this.headers)
		{
			var obj = this.headers[i];
			this._headerSendGen(obj.item, obj.content);
		}
	}, // this.send() 

	/**
	 * Cancel any existing or pending network activity for this `XHR`. 
	 * This method is invoked using the
	 * [specification outlined by W3C for `abort()`](http://www.w3.org/TR/XMLHttpRequest/#the-abort-method).
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	abort: function()
	{
		this.responseText = null;
		this.errorFlag = true;
		this.headers = [];

		if (this.sendFlag)
		{
			if (this.readyState != State.DONE)
			{
				this.sendFlag = false;
				this.setState(State.DONE);
			}
		}
		this.readyState = State.UNSENT;
	},

	/**
	 * Retrieve a header from the server response.
	 * @param {String} header Name of header to retrieve.
	 * @returns {String} Text of the header or `null` if text does not exist.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getResponseHeader: function(header)
	{
		if (this.readyState > State.OPENED)
		{
			return this.respHeaders[header.toLowerCase()];
		}
		return null;
	},

	/**
	 * Nonstandard: Retrieve the key-value map of all response headers.
	 * @return {Object} A key-value map as an object.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getUnflattenedResponseHeaders: function()
	{
		return this.respHeaders;
	},

	/**
	 * Retrieve all the response headers from a request. This method is invoked using the
	 * [specification outlined by W3C for `getAllResponseHeaders()`](http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method).
	 * @return {String} All the response headers from a request.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAllResponseHeaders: function()
	{
		if (this.readyState < State.HEADERS_RECEIVED || this.errorFlag)
		{
			return "";
		}

		var result = "";
		for (var i in this.respHeaders)
		{
			result += i + ": " + this.respHeaders[i] + "\r\n";
		}
		return result.substr(0, result.length - 2);
	},

	/**
	 * Set a header for the request.
	 * @param {String} header The name of the header.
	 * @param {String} value The value of the header.
	 * @see Network.XHR#getRequestHeader
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setRequestHeader: function(header, value)
	{
		this.headers.push(new Header(header, value));
	},

	/**
	 * Retrieve a header from the request.
	 * @param {String} header The name of the header.
	 * @return {String} The value of the header.
	 * @see Network.XHR#setRequestHeader
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRequestHeader: function(header)
	{
		var ret = null;
		for (var i in this.headers)
		{
			if (this.headers[i].item == header)
			{
				ret = this.headers[i].content;
				break;
			}
		}
		return ret;
	},

// Receivers
    /*
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	onStatus: function ( num, str)
	{
		this.status = num;
		this.statusText = str;
	},

	_sendStatusRecv: function( cmd )
	{
		var obj = {};
		this._sendStatusRecvGen(cmd, obj);
		this.onStatus(obj.statNum, obj.statStr);
	},
    /*
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	onHeaders: function(str)
	{
		var lines = str.split('\n');
		lines.pop();
		for (var i in lines)
		{
			var match = headerEx.exec(lines[i]);
			if (match)
				this.respHeaders[match[1].toLowerCase()] = match[2];
		}
		this.setState(State.HEADERS_RECEIVED);
	},

	_sendHeadersRecv: function( cmd )
	{
		var obj = {};
		this._sendHeadersRecvGen(cmd, obj);
		this.onHeaders(obj.headers);
	},
    /*
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	onData: function(data)
	{
		this.responseText += data;
		this.setState(State.LOADING);
	},

	_sendDataRecv: function( cmd )
	{
		var obj = {};
		this._sendDataRecvGen(cmd, obj);
		this.onData(obj.data);
	},
    /*
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	onFinish: function (err)
	{
		this.sendFlag = false;
		if (err)
		{
			this.responseText = null;
			this.error = "Network Error";
			this.errorFlag = true;
			this.status = 0;
		}
		this.setState(State.DONE);
	},

	_onFinishRecv: function( cmd )
	{
		var obj = {};
		this._onFinishRecvGen(cmd, obj);
		this.onFinish(obj.error);
	},

// Internal methods
	/**
	 * Reset all fields from a request. This call sets `readyState` to `UNSENT` and the response
	 * properties to `null`.
	 * @ignore
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	reset: function()
	{
		this.headers = [];
		this.readyState = State.UNSENT;
		this.responseText = null;
		this.responseXML = null;
		this.composing = false;
	},
	/**
	 * Change the value of `readyState` and call `onreadystatechange()`.
	 * @param {Number} state The new value for `readyState`
	 * @ignore
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	setState: function(state)
	{
		this.readyState = state;
		if (state == State.DONE)
		{
			this._destroySendGen();
			ObjectRegistry.unregister(this);
		}
		if (typeof this.onreadystatechange != 'undefined')
		{
			try
			{
				this.onreadystatechange();
			}
			catch (e)
			{
				NgLogException(e);
			}
		}
	}
});
