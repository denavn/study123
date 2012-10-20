var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var WebView = exports.WebView = AbstractView.subclass(
/** @lends UI.WebView.prototype */
{
	'type':'webview',

	/**
	 * @class The `UI.WebView` class provides web views for loading HTML documents, either from
	 * local files or from remote servers. It also provides methods for navigating back and forward
	 * in the web view's history.
	 * 
	 * On Android devices, email addresses and telephone numbers in a web view are automatically
	 * turned into active links. Web addresses in a web view are not autodetected.
	 * 
	 * On iOS devices, by default, web addresses in a web view are automatically turned into active 
	 * links. You can use the `{@link UI.WebView#setAutodetection}` method to control this behavior. 
	 * Email addresses and phone numbers are not autodetected.
	 *
	 * **Note**: If your app uses the `UI.WebView` class to display a web-based game, avoid adding
	 * listeners to the `{@link Core.UpdateEmitter}` class when possible. Attaching a listener to
	 * `Core.UpdateEmitter` can limit the performance of web-based games.
	 * @name UI.WebView
	 * @constructs Create a web view.
	 * @augments UI.AbstractView
	 * @param {Object} [properties] An object whose properties will be added to the new `UI.WebView`
	 *		object.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (WebView._init) WebView._init();
		this._canGoBack = false;
		this._canGoForward = false;
		return $super(properties);
	},
	
	/** @private */
	_onShouldLoad: function(event) {
		NgLogD("Should Load " + event.url + " ???????");
		var fn = this.getOnShouldload();
		if (typeof fn == 'function') {
			// If we SHOULDN'T load the url, bail.
			if (!Boolean(fn.call(this, event))) return;
		}
		// The default (if the function was missing or not a function) is to load the url.
		this.loadUrl(event.url);
	},
	
	/** @private */
	performEventCallback: function($super, event) {
		try {
			if (event.eventType == 'shouldload') {
				// We need to call the onShouldLoad function in a way that captures the return value.
				this._onShouldLoad(event);
				return;
			}
			if (event.eventType == 'pageload') {
				// Do not touch this parsing code. Everything else is wrong, extensive testing was done.
				this._canGoBack = event.canGoBack = Boolean(JSON.parse(event.canGoBack));
				this._canGoForward = event.canGoForward = Boolean(JSON.parse(event.canGoForward));
			}
			$super(event);
		} catch(e) {
			NgHandleException(e);
		}
	},
	// invoke doesn't return a value. to get response, use onpageevent
	/**
	 * Execute the JavaScript code specified in the `script` parameter. To return a value, your code
	 * must do the following:
	 *
	 * 1. Convert the return value to a string.
	 * 2. Turn the string into a URL by adding `ngcore://` to the beginning of the string.
	 * 3. Attempt to load the `ngcore://` URL. This fires a `pageevent` event, and the return value
	 * is passed to the callback function that was set through
	 * `{@link UI.WebView#event:setOnPageevent}`.
	 * @function
	 * @example
	 * // Log the text "Hello World" to the console.
	 * var js = "var message = 'Hello World'; " + 
	 *     "window.location.href = 'ngcore://' + message;";
	 * var webView = new UI.WebView();
	 * webView.setOnPageevent(function(event) {
	 *     console.log(event.eventStream);
	 * });
	 * webView.invoke(js);
	 * @param {String} script The JavaScript code to execute.
	 * @returns {void}
 	 * @see UI.WebView#event:setOnPageevent
	 * @status iOS, Android, Flash
	 */
	invoke: Commands.invoke,
	/**
	 * Request a file from the specified URL using the HTTP `GET` method. You can specify an
	 * `http://` or `https://` URL.
	 * @example
	 * // Load a webpage from a remote server.
	 * var webView = new UI.WebView();
	 * webView.loadUrl("http://www.example.com/testpage/");
	 * @param {String} url The URL to request.
	 * @param {String} [headers] A JSON object containing key-value pairs to include in the HTTP 
	 *		request headers. Supported only on iOS.
	 * @param {Number} [timeout] The timeout length for the request, in seconds.
	 * @returns {void}
 	 * @see UI.WebView#loadDocument
	 * @see UI.WebView#postUrl
	 * @status iOS, Android, Flash, Test, FlashTested
	 * @since 1.0
	 */
	loadUrl: function(url, headers, timeout) {
		Commands.loadURL.call(this, url, headers || null, +(timeout || 0));
	},
	/**
	 * Load a document from the specified local path.
	 * @example
	 * // Load a local file.
	 * var webView = new UI.WebView();
	 * webView.loadDocument("./html/page.html");
	 * @param {String} relativePath The local path from which to load a document.
	 * @returns {void}
	 * @see UI.WebView#loadUrl
	 * @see UI.WebView#postUrl
	 * @status iOS, Android, Flash, Test, FlashTested
	 * @since 1.0
	 */
	loadDocument: Commands.setSourceDocument,
	/**
	 * Post data to the specified URL using the HTTP `POST` method.
	 * @example
	 * // Post data using a string that contains the raw body of the `POST` request.
	 * var webView = new UI.WebView();
	 * var postData = "catalog=Fall;retrieve=titles";
	 * webView.postUrl("http://www.example.com/getCatalogInfo", postData);
	 * @example
	 * // Post data using an object that contains key-value pairs.
	 * var webView = new UI.WebView();
	 * var postData = {
	 *     catalog: "Fall",
	 *     retrieve: "titles"
	 * };
	 * webView.postUrl("http://www.example.com/getCatalogInfo", postData);
	 * @param {String} url The URL that will be used to post data.
	 * @param {String|Object} data A string that contains the raw body of the `POST` request, or an
	 *		object whose properties will be converted into key-value pairs for the request, using
	 *		`www/form-data` encoding.
	 * @see UI.WebView#loadUrl
	 * @see UI.WebView#loadDocument
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.0
	 */
	postUrl: function(url, data){
		var dataStr;
		if(typeof data == "object"){
			var params = [];
			for(var key in data){
				params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
			}
			dataStr = params.join('&');
		}else{
			dataStr = data;
		}
		Commands.postURL.call(this, url, dataStr);
	},
	/**
     * Stop loading a document. 
	 * @function
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	stopLoading: Commands.stopLoading,
	/**
	 * Reload a document that was requested with `{@link UI.WebView#loadDocument}` or
	 * `{@link UI.WebView#loadUrl}`.
	 * @function
	 * @returns {void}
	 * @see UI.WebView#loadDocument
	 * @see UI.WebView#loadUrl
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	reload: Commands.reload,
	/**
	 * Go back one page in the web view's history.
	 * @function
	 * @returns {void}
	 * @see UI.WebView#goForward
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	goBack: Commands.goBack,
	/**
	 * Go forward one page in the web view's history.
	 * @function
	 * @returns {void}
	 * @see UI.WebView#goBack
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	goForward: Commands.goForward,
	/**
	 * Determine whether the web view can go back a page in the web view's history.
	 * @returns {Boolean} Set to `true` if the web view can go back a page in the web view's
	 *		history.
	 * @see UI.WebView#canGoForward
	 * @status iOS, Flash, Test, FlashTested
	 * @since 1.0
	 */
	canGoBack: function(){
		return this._canGoBack;
	},
	/**
	 * Determine whether the web view can go forward a page in the web view's history.
	 * @returns {Boolean} Set to `true` if the web view can go forward a page in the web view's
	 *		history.
	 * @see UI.WebView#canGoBack
	 * @status iOS, Flash, Test, FlashTested
	 * @since 1.0
	 */
	canGoForward: function(){
		return this._canGoForward;
	},
	/**
	 * Set the authentication credentials for this web view, including the username, the password,
	 * the authentication host, and the security realm. This method supports HTTP Basic Access
	 * Authentication.
	 *
	 * For more information about using the `host` and `realm` parameters, see
	 * [RFC 2617](http://www.ietf.org/rfc/rfc2617.txt), which provides the specification for Basic
	 * Access Authentication.
	 * @param {String} host The authentication host.
	 * @param {String} realm The security realm.
	 * @param {String} username The username for the session.
	 * @param {String} password The password for the session.
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.0
	 */
	setBasicAuthCredential: function(host, realm, username, password){
		Commands.setBasicAuthCredentials.call(this, {'host':host, 'realm':realm, 'username':username, 'password':password});
	},
    /**
     * Set whether the web view should honor an HTML document's `viewport` meta tags. These meta
 	 * tags are honored by default.
	 *
	 * For example, if this property is set to `true`, the following meta tags would cause the page
	 * content to be scaled to fill the viewport:
	 *
     *     <meta name="viewport" content="initial-scale=1.0" />
     *     <meta name="viewport" content="user-scalable=false" />
     * @param {Boolean} enabled Set to `true` if the web view should honor the page's `viewport`
	 *		meta tags.
     * @returns {void}
     * @since 1.4.1
     */
	setViewportEnabled: Commands.setViewportEnabled,

	/**
	 * Set whether to autodetect phone numbers in this web view. By default, phone numbers are not
	 * autodetected. Call this method before calling `{@link UI.WebView#loadDocument}` or
	 * `{@link UI.WebView#loadUrl}`. Supported only on iOS.
	 * @param {UI.Commands#Autodetect} type Set to `UI.Commands.Autodetect.Phone` to enable
	 *		autodetection of phone numbers.
	 * @returns {void}
	 * @see UI.WebView#loadDocument
	 * @see UI.WebView#loadUrl
	 * @status iOS
	 * @since 1.4.1
	 */
	setAutodetection: function(type) {
		Commands.setAutodetection.call(this, type);
	}
});

WebView._init = function() {
	delete WebView._init;
	if (AbstractView._init) AbstractView._init();
	
	WebView.synthesizeProperty('scrollable', Commands.setScrollable);
	WebView.synthesizeProperty('pluginsEnabled', Commands.setPluginsEnabled);
	
	/**
	 * Set a function to call when a `startload` event occurs. This event occurs when a document
	 * starts loading.
	 * @name UI.WebView#setOnStartload
	 * @event
	 * @example
	 * var webView = new UI.WebView();
	 * webView.setOnStartload(function(event) {
	 *     console.log("Started loading the following URL: " + event.url);
	 * });
	 * @cb {Function} startloadCallback The function to call when a `startload` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.url The URL of the page being loaded.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.WebView#event:getOnStartload
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the function to call when a `startload` event occurs.
	 * @name UI.WebView#getOnStartload
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnStartload
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	WebView.registerEventType('startload');
	/**
	 * Set a function to call when a `pageload` event occurs. This event occurs when a document
	 * finishes loading.
	 * @name UI.WebView#setOnPageload
	 * @event
	 * @example
	 * var backOK = false;
	 * var forwardOK = false;
	 * var webView = new UI.WebView();
	 * webView.setOnPageload(function(event) {
	 *     console.log("Finished loading the following URL: " + event.url);
	 *     backOK = event.canGoBack;
	 *     forwardOK = event.canGoForward;
	 * });
	 * @cb {Function} pageloadCallback The function to call when a `pageload` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Boolean} event.canGoBack Set to `true` if the web view can go back a page in the
	 *		web view's history.
	 * @cb-param {Boolean} event.canGoForward Set to `true` if the web view can go forward a page in
	 *		the web view's history.
	 * @cb-param {String} event.url The URL of the page that loaded.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.WebView#event:getOnPageload
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	/**
	 * Retrieve the function to call when a `pageload` event occurs.
	 * @name UI.WebView#getOnPageload
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnPageload
	 * @status iOS, Android, Flash, Test, FlashTested
	 */
	WebView.registerEventType('pageload');
	/**
	 * Set a function to call when an `error` event occurs. This event occurs when a document cannot
	 * be loaded.
	 * @name UI.WebView#setOnError
	 * @event
	 * @example
	 * var webView = new UI.WebView();
	 * webView.setOnError(function(error) {
	 *     console.log("The document could not be loaded: " + event.code + ": " +
	 *         event.description);
	 * });
	 * @cb {Function} errorCallback The function to call when an `error` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Number} event.code The HTTP error code for the error.
	 * @cb-param {String} [event.description] A description of the error.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.WebView#event:getOnError
	 * @status iOS, Android
	 */
	/**
	 * Retrieve the function to call when an `error` event occurs.
	 * @name UI.WebView#getOnError
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnError
	 * @status iOS, Android
	 */
	WebView.registerEventType('error');
	/**
	 * Set a function to call when a `pageevent` event occurs. This event occurs when the
	 * application executes JavaScript code by calling `{@link UI.WebView#invoke}`, and the
	 * JavaScript code attempts to load a URL that begins with `ngcore://`. The text of the URL,
	 * excluding the `ngcore://` prefix, is passed to the callback function.
	 * @name UI.WebView#setOnPageevent
	 * @event
	 * @cb {Function} pageeventCallback The function to call when a `pageevent` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.eventStream The text of the URL, excluding the `ngcore://` prefix.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see UI.WebView#event:getOnPageevent
	 * @status iOS, Android, Flash
	 */
	/**
	 * Retrieve the function to call when a `pageevent` event occurs.
	 * @name UI.WebView#getOnPageevent
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnPageevent
	 * @status iOS, Android, Flash
	 */
	WebView.registerEventType('pageevent');	
	/**
	 * Set a function to call when a `shouldload` event occurs. When a callback function is
	 * specified, a `shouldload` event occurs each time a document is requested via the HTTP `GET`
	 * method. The callback function returns a boolean to indicate whether the URL should be loaded.
	 * @name UI.WebView#setOnShouldload
	 * @event
	 * @example
	 * // Only load http:// and https:// links. Ignore other types of links, such
	 * // as links that will open external applications.
	 * var webView = new UI.WebView();
	 * webView.setOnShouldload(function(event) {
	 *     if (event.url.match(/^http[s?]:\/\//)) {
	 *         return true;
	 *     } else {
	 *         console.log("Attempted to load the external link " + event.url);
	 *         return false;
	 *     }
	 * });
	 * @cb {function} shouldloadCallback The function to call when a `shouldload` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.navigation The type of navigation event that occurred. Contains one
	 *		of the following values:
	 * 
	 * + `click`: The user clicked a link.
	 * + `other`: The user performed an unspecified action.
	 * + `reload`: The user reloaded the page.
	 * + `resubmit`: The user resubmitted a form.
	 * + `submit`: The user submitted a form.
	 * @cb-param {String} event.url The URL to be loaded.
	 * @cb-returns {Boolean} Set to `true` if the document should be loaded.
	 * @see UI.WebView#event:getOnShouldload
	 * @returns {void}
	 */
	/**
	 * Retrieve the function to call when a `shouldload` event occurs.
	 * @name UI.WebView#getOnShouldload
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnShouldload
	 * @event
	 */
	WebView.registerEventType('shouldload');
	
	/**
	 * Set a function to call when an `externalLink` event occurs, indicating that a link will be
	 * opened in an external application.
	 * @name UI.WebView#setOnExternalLink
	 * @event
	 * @example
	 * var webView = new UI.WebView();
	 * webView.setOnExternalLink(function(event) {
	 *     console.log("Opened the external link " + event.url);
	 * });
	 * @cb {function} externalLinkCallback The function to call when an `externalLink` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.url The URL to be loaded.
	 * @cb-returns {Boolean} Set to `true` if the URL should be opened.
	 * @returns {void}
	 * @see UI.WebView#event:getOnExternalLink
	 */
	/**
	 * Retrieve the function to call when an `externalLink` event occurs.
	 * @name UI.WebView#getOnExternalLink
	 * @event
	 * @returns {Function} The current callback function.
	 * @see UI.WebView#event:setOnExternalLink
	 */
	WebView.registerEventType('externalLink');
};
