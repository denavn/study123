var OAuthReq  = require("././oauth");
var CoreReq = require('./../Core');
var SessionReq = require("./Session");
var Network = require('../Network').Network;
var Capabilities = require('../Core/Capabilities').Capabilities;

// turn this off if your platform doesn't support Storage yet. This will be removed at some point.
var StorageEnabled = true;

/**
 * Synthesizes a getter and setter for various property names, and assigns them to the class' prototype
 * TODO Decide if we want to reuse something like this, replace it with Classes, or remove it outright
 *
 * @param classObj The class object (something with a prototype) that you want to extend with synthesized getters/setters
 * @param {Array{String}} propertyNames An array of names that you want synthesized getters (where "foo" becomes "setFoo" and "getFoo")
 */
var NgDefineProperties = function(classObj, propertyNames){
	var defPropFn = function(key) {
		var casedKey = "" + key.substr(0,1).toUpperCase() + key.substr(1, key.length - 1);
		classObj.prototype["set" + casedKey] = function(obj){
			this[key] = obj;
		};
		classObj.prototype["get" + casedKey] = function(){
			return this[key];
		};
	};
	for(var idx=0; idx<propertyNames.length; idx++){
		defPropFn(propertyNames[idx]);
	}
};

/**
 * PlusRequest represents an HTTP request to the Plus+ servers. It manages HTTP including authentication, as well as
 * parsing JSON responses. It is used by the classes in the Plus module as the foundation class for server communication, and
 * should generally be used through those APIs. To use an PlusRequest, you typically:
 * - Create one with `new PlusRequest()`,
 * - Set the API method and appropriate options, and
 * - Call send(), with a callback function to receive on completion.
 *
 * All completion callbacks follow this general pattern:
 * - an error object (if an error occurred),
 * - the response data (if no error occurred) as a string, or as a hash if the object was JSON,
 * - a hash of response headers, and
 * - an HTTP status code
 *
 * When writing a wrapper API, it is recommended to follow this pattern whenever possible, including the error object first.
 *
 * PlusRequest has a few properties that you can set:
 * - apiMethod (required) The name of the API endpoint to use.
 * - entityTag (optional) Supplies the entity tag passed as an If-None-Match header. Defaults to undefined.
 * - secure (optional) Determines if the request goes over HTTPS or not. Defaults to true for production, false for staging.
 * - httpHeaders (optional) A hash of HTTP headers to be sent. Defaults to an empty hash.
 * - httpMethod (optional) The type of HTTP method to use (GET, POST, PUT, DELETE, etc.) Defaults to GET.
 * - postBody (optional) Either a string of data to send, or a hash of objects to turn into encoded form data.
 *
 * @constructor
 * @class PlusRequest
 */
var PlusRequest = function(){
	PlusRequest._initialize();

	this.secure = (PlusRequest.getServerMode() == PlusRequest.serverModes.production);
	this.apiMethod = "";
	this.attachments = [];
	this.httpMethod = "GET";
	this.httpHeaders = {};
};

/**
 * Does some deferred setup to determine the correct hostname to route API requests to.
 * It overwrites itself after execution to speed up subsequent requests.
 * 
 * @private
 */
PlusRequest._initialize = function(){
	// We need to wait until the capabilities object is setup to do this check
	if(Capabilities.getPlatformOS().toLowerCase() == "flash"){
		// this is a proxy server needed for Flash which also serves a XSS access policy file
		PlusRequest.apiDomain = "10.15.100.241";
		/*
		 * TODO - fbarthelemy - 2010-12-07 web browsers don't all
		 * support storage yet.
		 */
		StorageEnabled = false;
	}else if(PlusRequest.apiDomain === null){ // if it's not null, someone already set the server mode
		PlusRequest.setServerMode(PlusRequest.serverModes.partner);
	}

	// No need to waste time on this later
	PlusRequest._initialize = function(){};
};

NgDefineProperties(PlusRequest, ["apiMethod", "entityTag", "secure", "httpHeaders", "httpMethod", "postBody"]);

PlusRequest.apiDomain = null; // this will get initialized by PlusRequest.setServerMode
PlusRequest.apiVersion = "1";

PlusRequest.platformAccessToken = null;
PlusRequest.platformAccessSecret = null;
PlusRequest.platformConsumerKey = null;
PlusRequest.platformConsumerSecret = null;

PlusRequest.serverModes = {
	staging: "staging",
	integration: "integration",
	partner: "partner",
	production: "production",
	unknown: "unknown"
};

PlusRequest.getServerMode = function(){
	var apiDomain = PlusRequest.apiDomain;
	var serverModes = PlusRequest.serverModes;
	var mode = serverModes.unknown;

	if(apiDomain == "staging.plusplus.com"){
		mode = serverModes.staging;
	}else if(apiDomain == "partner.plusplus.com"){
		mode = serverModes.partner;
	}else if(apiDomain == "integration.plusplus.com"){
		mode = serverModes.integration;
	}else if(apiDomain == "app.plusplus.com"){
		mode = serverModes.production;
	}
	
	NgLogD("Getting server mode: " + mode);
	return mode;
};

PlusRequest.setServerMode = function(mode){
	var serverModes = PlusRequest.serverModes;
	if(mode == serverModes.staging){
		PlusRequest.apiDomain = "staging.plusplus.com";
	}else if(mode == serverModes.partner){
		PlusRequest.apiDomain = "partner.plusplus.com";
	}else if(mode == serverModes.integration){
		PlusRequest.apiDomain = "integration.plusplus.com";
	}else if(mode == serverModes.production){
		PlusRequest.apiDomain = "app.plusplus.com";
	}
};

PlusRequest.serverModeIsProduction = function(){
	return (PlusRequest.getServerMode() === PlusRequest.serverModes.production);
};

/**
 * Builds and sends the request, and sends a callback when the request completes (successfully or not).
 * The callback receives:
 *
 * All completion callbacks follow this general pattern:
 * - an error object (if an error occurred),
 * - the response data (if no error occurred) as a string, or as a hash if the object was JSON,
 * - a hash of response headers
 * - an HTTP status code
 *
 * @param {Function(error, contents, responseHeaders, statusCode)} cb The completion callback.
 */
PlusRequest.prototype.send = function(cb){
	var request = this._prepareRequest();
	var headers;
	request.onreadystatechange = function(){
		if (request.readyState == 4) {
			headers = request.getUnflattenedResponseHeaders();
			var data = request.responseText;
			var error = request.error;
			var contentType = request.getResponseHeader("Content-Type") || "text";
			if(contentType.indexOf("application/json") != -1){
				try{
					data = JSON.parse(data);
				} catch(e){
					NgLogD("EXCEPTION - Could not parse JSON data: " + e + " - " + data);
					error = e;
				}
				
				if(data && data.error_msg){
					error = data.error_msg;
				}
			}
			
			if(request.status !== 200 && request.status !== 304){
				// HACK: probably shouldn't rely on this, but Plus+ server returns 200 unless catastrophe strikes
				// ...unless it's a 304 for etags.
				error = "Error connecting to server";
			}

			cb(error, data, headers, request.status);
		}
	};
	request.send(this._postData);
	if ((typeof PlusRequest.mockXHR) != 'undefined') {
		// mock invoke the callback
		request.mockCallBack(cb);
	}
};

/**
 * Adds an attachment to the request, which causes the request to submit with a Content-Type of multipart/form-data.
 * The request must have (httpMethod == "GET") for attachments to be sent with the request.
 *
 * @param {String} attachment The contents of the attachment. Required.
 * @param {String} name The name of the attachment. Defaults to filename, or "value" if both are undefined.
 * @param {String} filename The filename of the attachment. Defaults to name, or "value" if both are undefined.
 * @param {String} type The Content-Type of the attachment
 */
PlusRequest.prototype.addAttachmentWithNameAndFilenameOfType = function(attachment, name, filename, type){
	if(!attachment){
		return;
	}

	if(!name && filename){
		name = filename;
	}else if(!filename && name){
		filename = name;
	}else if(!name && !filename){
		name = filename = "value";
	}

	if(!type){
		type = "application/octet-stream";
	}

	this.attachments.push({
		data: attachment,
		name: name,
		filename: filename,
		type: type
	});
};

// Utility APIs

/**
 * Returns the name of the app for sending information to the Plus server
 * @return The app name.
 */
PlusRequest.appKey = function(){
	return SessionReq.Session.getCurrentSession().appKey();
};

/**
 * Returns the version of the app for sending information to the Plus server
 * @return The app version.
 */
PlusRequest.appVersion = function(){
	return SessionReq.Session.getCurrentSession().appVersion();
};

/**
 * Returns the version of the SDK for sending information to the Plus server
 * @return The SDK version.
 */
PlusRequest.getPlatformVersion = function(){
	return "1.0";
};

/**
 * Returns a hash of OAuth info needed for the request
 * @return The hash of OAuth info.
 */
PlusRequest.getPlatformOAuthInfo = function(){
	return SessionReq.Session.getCurrentSession().OAuthConsumerInfo();
};

// Platform APIs

/**
 * Checks the status of the current logged-in session.
 *
 * @param {CompletionCallback} cb The completion callback (passing back the error and data)
 * @return the PlusRequest that is handling the call
 */

PlusRequest.checkSessionStatus = function(cb){
	var request = new PlusRequest();
	request.setApiMethod("session");
	request.setHttpMethod("GET");
	request.setPostBody(SessionReq.Session.getCurrentSession()._loginParameters());
	request.setSecure(false);

	request.send(function(err, data){
		cb(err, data);
	});
	return request;
};

/**
 * Establishes a new session with the user's username and password. These values should not be saved.
 *
 * @param {String} username The username of the password to login.
 * @param {String} password The password of the password to login.
 * @param {CompletionCallback} cb The completion callback. Returns the error (on failure) and the logged-in User (on success).
 * @return the PlusRequest that is handling the call
 */

PlusRequest.loginWithUsernameAndPassword = function(username, password, cb){
	SessionReq.Session.getCurrentSession().loginWithUsernameAndPassword(username, password, cb);
};

/**
 * Establishes a new session with the user's old auth token. This is stored automatically.
 *
 * @param {CompletionCallback} cb The completion callback. Returns the error (on failure) and the logged-in User (on success).
 * @return the PlusRequest that is handling the call
 */

PlusRequest.loginWithSession = function(cb){
	SessionReq.Session.getCurrentSession().loginWithSession(cb);
};

/**
 * Sends a password reset email to the supplied email address.
 *
 * @param {String} address The email address of the user
 * @param {CompletionCallback} cb The completion callback.
 * @return the PlusRequest that is handling the call.
 */

PlusRequest.sendPasswordResetEmailWithAddress = function(address, cb){
	if(!address){
		cb("No email address", null);
		return;
	}
	
	var request = new PlusRequest();
	request.setSecure(true);
	request.setApiMethod("users/reset_password");
	request.setHttpMethod("POST");
	request.setPostBody({
		email: address
	});

	request.send(function(err, data){
		if(err || (data && !data.success)){
			cb(err, null);
		}else{
			cb(null, data);
		}
	});
};

/**
 * Establishes a new session with the logged in user for the game.
 *
 * @param {String} consumerKey The OAuth consumer key of the game for logging into Plus+
 * @param {CompletionCallback} cb The completion callback. Returns the error (on failure) and the logged-in User (on success).
 * @return the PlusRequest that is handling the call
 */

PlusRequest.getSessionTokensForConsumerKey = function(consumerKey, cb){
	var request = new PlusRequest();
	request.setApiMethod("oauth/authorize_new");
	request.setHttpMethod("POST");
	request.setPostBody({
		key: consumerKey
	});

	request.send(function(err, data){
		NgLogD("getSessionTOkensForConsumerKey *" + err + "* - **" + data + "**");
		cb(err, data);
	});
	return request;
};


/**
 * Update device_token so gserver may use it to send Apple APN or Google c2dm
 * notification(s) to a user.  One way to check that this was successful is
 * to log into staging.plusplus.com/admin and check the device_token field
 * of the logged in user.
 *
 * @param {String} devToken The up-to-date device token obtained from system
 *                 binding callback
 * @param {CompletionCallback} cb The completion callback. Returns the server
 *                             response.
 * @return the PlusRequest that is handling the call
 */

PlusRequest.updateSessionDeviceToken = function(devToken, cb){
	var request = new PlusRequest();
	request.setApiMethod("session");
	// supposedly, PUT should be used to perform the update.  However, on
	// staging, PUT did not work but POST did
	request.setHttpMethod("POST");
	request.setPostBody({
		device_token: devToken
	});
	request.send(function(err, data) {
		cb(err, data);
	});
	return request;
};


// Private APIs

/**
 * Generates the request URL from the environment
 * @return the request URL
 * @private
 */

PlusRequest.prototype._getRequestURL = function(){
	var appKeyString = PlusRequest.appKey();
	var path = [
		PlusRequest.apiDomain,
		PlusRequest.apiVersion,
		appKeyString,
		this.apiMethod
	];
	var urlString = "" + (this.secure ? "https" : "http") + "://" + path.join("/");
	return urlString;
};

/**
 * Builds, but does not send, the request object:
 *
 * - Generates the request URL, embedding the post body parameters if the request is a GET
 * - Signs the request with OAuth
 * - Sets the HTTP headers and entity tag
 * - Adds attachments
 * - Sets the Content-Type
 *
 * @return the raw NgXHR request
 * @private
 */
PlusRequest.prototype._prepareRequest = function(){
	var key;
	var method = this.getHttpMethod();
	var path = this._getRequestURL();

	this._postData = this.postBody;

	// mix the key/value pairs needed for OAuth into a hash
	var oauthParameters = {};
	for(key in this._postData) {
	 if (this._postData.hasOwnProperty(key)) {
		oauthParameters[key] = this._postData[key];
	 }
	}

	var credentials = PlusRequest.getPlatformOAuthInfo();

	// build the OAuth signature
	var message = {
		action: path,
		method: method,
		parameters: oauthParameters
	};
	OAuthReq.OAuth.completeRequest(message, credentials);

	// append the post body parameters to the URL if the HTTP method is a GET
	if(method == "GET"){
		var pathBits = [];
		for(key in this.postBody) {
			if (this.postBody.hasOwnProperty(key)) {
				key = OAuthReq.OAuth.percentEncode(key);
				var value = OAuthReq.OAuth.percentEncode(this.postBody[key]);
				pathBits.push("" + key + "=" + value);
			}
		}
		if(pathBits.length > 0){
			path = path + "?" + pathBits.join("&");
		}
		NgLogD("New URL: " + path);
	}

	// setup the request
	if ((typeof PlusRequest.mockXHR) == 'undefined') {
		this.request = new Network.XHR();
	} else {
		// Use mock NgXHR for tests
		this.request = PlusRequest.mockXHR;
	}

	this.request.open(message.method, path, true);

	// set the OAuth signature on the request
	this.request.setRequestHeader("Authorization", OAuthReq.OAuth.getAuthorizationHeader(undefined, message.parameters));

	// set some headers for the Plus+ servers
	var userAgent = "" + PlusRequest.appKey() + "/" + PlusRequest.appVersion() + " PlusPlus/" + PlusRequest.getPlatformVersion();
	this.request.setRequestHeader("User-Agent", userAgent);
	this.request.setRequestHeader("Accept", "application/binary-plist, application/json");

	// determine if this platform supports GZip in the HTTP response
	var supportsGZip = false;
	if (// TODO: gerald - workaround ngCapabilities bug for now
		(typeof Capabilities.getPlatformOS() == "undefined") ||
	    (Capabilities.getPlatformOS().toLowerCase() != 'android' && Capabilities.getPlatformOS().toLowerCase() != "flash")) {
		NgLogD("GZIP supported: " + Capabilities.getPlatformOS());
			supportsGZip = true;
	}
	this.request.setRequestHeader("Accept-Encoding", (supportsGZip ? "gzip" : ""));
	
	// TODO: Locale
	this.request.setRequestHeader("Accept-Language", "en_US");

	// iterate through the headers and set them on the request
	if(this.httpHeaders){
		for(key in this.httpHeaders) {
			if (this.httpHeaders.hasOwnProperty(key)){
				this.request.setRequestHeader(key, this.httpHeaders[key]);
			}
		}
	}
	
	// send the Analytics SID to the Plus server
	this.request.setRequestHeader("X-Stat-Session", CoreReq.Core.Analytics._getPipe().getMeta("sid"));

	// set the Etg, if one exists
	if(this.entityTag){
		this.request.setRequestHeader("If-None-Match", this.entityTag);
	}

	if(this._postData && this.httpMethod != "GET"){
		if(this.attachments.length > 0){
			// if we have attachments, generate multipart form data for the request
			var boundary = "---ABlkjasfdkjsdifsdf098asdfa3lka90aflallyourbasekjas09ds0fjasdkal3lj0sa";
			var newline = '\r\n';
			var boundaryLine = "--" + boundary + newline;

			var body = [];
			body.push(this._multipartPostBodyFromDataWithBoundary(this._postData, boundary));

			for(var index in this.attachments){
				var attachment = this.attachments[index];

				var type = attachment.type;
				if(!type) {
					type = "application/octet-stream";
				}

				body.push(boundaryLine);
				body.push("Content-Disposition: form-data; name=\"" + attachment.name + "\"; filename=\"" + attachment.filename + "\"" + newline);
				body.push("Content-Type: " + type + newline + newline);
				body.push(attachment.data);
				body.push(newline);
			}

			body.push("--" + boundary + "--" + newline);

			this._postData = body.join("");
			
			this.request.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

		}else{
			// if we don't have attachments, generate encoded form data for the request
			if(!this.request.getRequestHeader("Content-Type")){
				this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			this._postData = this._getStringRepresentationOfPostData();
		}
	}
	return this.request;
};

/**
 * Turns a data hash and a boundary string into a string of form data
 * @param data The hash of key/values to turn into form data
 * @param boundary A string boundary, defined in the multipart form data
 * @return The string representation of the data (this is not a complete multipart form-data body!)
 * @private
 */
PlusRequest.prototype._multipartPostBodyFromDataWithBoundary = function(data, boundary){
	var newline = '\r\n';
	var boundaryLine = "--" + boundary + newline;
	var buffer = [];
	for(var key in data){
		var value = data[key];
		buffer.push(boundaryLine);
		buffer.push("Content-Disposition: form-data; name=\"" + key + "\"" + newline + newline);
		buffer.push(value);
		buffer.push(newline);
	}
	return buffer.join("");
};

/**
 * Recursively turns a hash of data into a URL-encoded form string recursively.
 * WARNING: Do not include something that has a circular dependency, as this method will not detect it.
 * @param {Object} data The hash to turn into a URL-encoded form string
 * @return The URL-encoded form string
 * @private
 */
PlusRequest.prototype._getStringRepresentationOfPostData = function(data, previousKey){
	if(data === null){
		return "";
	}

	if(data === undefined){
		data = data || this.postBody;
	}

	var dataString = this._flattenedResultsForPostData(data, "");
	data = dataString.join("&");

	return data;
};

PlusRequest.prototype._flattenedResultsForPostData = function(data, prefix){
	var flattenedData = [];
	for(var key in data){
		if (data.hasOwnProperty(key)) {
			var value = data[key];
			if(prefix && prefix.length > 0){
				key = "" + prefix + "[" + key + "]";
			}

			NgLogD("Getting " + key + ": " + (typeof value));
			if(typeof value == "object"){
				flattenedData = flattenedData.concat(this._flattenedResultsForPostData(value, key));
			}else{
				flattenedData.push("" + key + "=" + value);
			}
		}
	}
	return flattenedData;
};

// cleanup
for(var key in PlusRequest.prototype){
	if (PlusRequest.prototype.hasOwnProperty(key)) {
		var fn = PlusRequest.prototype[key];
		fn.displayName = "PlusRequest." + key + "()";
	}
}

PlusRequest.noOp = function(){};

exports.PlusRequest = PlusRequest;
