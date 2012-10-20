//
//  Mobclix.Core.MMWebView.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var UI = require('../../UI').UI;
var $mc = require('./Utils').Utils;

var MMWebView = exports.MMWebView = UI.WebView.subclass($mc.extend(require('./MMView').MMViewMethods, {
	__className: "MMWebView"
}));
