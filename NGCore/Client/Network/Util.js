////////////////////////////////////////////////////////////////////////////////
// Utilities for Network
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Caps = require("../Core/Capabilities").Capabilities;
var Time = require("../Core/Time").Time;
var LifecycleEmitter = require('../Device/LifecycleEmitter').LifecycleEmitter;
var AlertDialog = require("../UI/AlertDialog").AlertDialog;

////////////////////////////////////////////////////////////////////////////////

var urlPathServerSplit = /^(https?:\/\/)?([^\/]*)(.*[^\/])?.?/i;

var Util = exports.Util =
{
    /*
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	NormalizeUrl: function(url, keepTrailingSlash)
	{
		url = Util.buildRelativeUrl(url);

		// Now split it into parts and make server bits lower case
		var parsed = url.match(urlPathServerSplit);
		if (parsed && parsed[1])
		{
			// absolute path!
			url = parsed[1].toLowerCase() + parsed[2].toLowerCase() + (parsed[3] ? parsed[3] : "");
		}
		else
		{
			// Direct server, no path
			url = url.toLowerCase();
		}
		return url;
	},

	/*
	 * For a given game url, this returns the directory of that url on the SD card.
	 */
	GetMD5HashDirectoryFromUrl: function(url)
	{
		var name;
		if (url === Capabilities._getBootServer() + "/" + Capabilities._getBoot())
			name = Capabilities.getBootDir();
		else
			name = require('../../Shared/Lib/md5').toMD5(url);

		return name;
	},

	buildRelativeUrl: function(url)
	{
		if (!url.match(/^(https?:\/\/)/))
		{
			// If the path is relative, then we append our server to the beginning of it
			if (url.charAt(0) == '/' || !url.length)
			{
				url = Caps.getServer() + url;
			}
			else
			{
				url = Caps.getServer() + "/" + Caps.getGame() + "/" + url;
			}
		}

		return url;
	},

	RetrySchedule: function(initialRetry, maxDuration)
	{
		var count = Math.floor(Math.log(maxDuration / initialRetry));
		var schedule = [initialRetry];
		for(var i=0; i < count + 1; ++i)
		{
			initialRetry *= 2;
			schedule.push(initialRetry);
		}
		return schedule;
	},
	
	OperationWithRetries: function(operationCb, failureCb, failEarly)
	{
		var abortAttempts;
		var abortTime;
		var abortTimeAttempts;
		
		if(failEarly)
		{
			abortAttempts = 3;
			abortTime = 10000;
			abortTimeAttempts = 1;
		}
		else
		{
			abortAttempts = Infinity;
			abortTime = 30000;
			abortTimeAttempts = 6;
		}
		
		// console.log('retry config abortAttempts:', abortAttempts, 'abortTime', abortTime, 'abortTimeAttempts', abortTimeAttempts);
		
		abortTime = Core.Time.getRealTime() + abortTime;
		var timeout = 250;
		var attemptCount = 1;
		
		var failed = false;
		var armed = true;
		
		var failureParam = function()
		{
			if(failed) return;
			
			if(!armed)
			{
				console.log('OperationWithRetries: failureParam called when not armed');
				return;
			}
			armed = false;
			
			if(attemptCount >= abortAttempts)
			{
				console.log('OperationWithRetries: too many retry attempts');
				failed = true;
				failureCb();
				return;
			}
			
			if(Core.Time.getRealTime() >= abortTime && attemptCount >= abortTimeAttempts)
			{
				console.log('OperationWithRetries: retries took too long');
				console.log('OperationWithRetries: abortTime:', abortTime, 'realTime:', Core.Time.getRealTime());
				console.log('OperationWithRetries: attemptCount:', attemptCount, 'abortTimeAttempts:', abortTimeAttempts);
				failed = true;
				failureCb();
				return;
			}
			
			console.log('OperationWithRetries: Failure, will retry in ' + timeout + 'ms');
			setTimeout(function()
			{
				if(failed) return;
				armed = true;
				operationCb(failureParam, abortParam);
			}, timeout);
			
			attemptCount += 1;
			timeout *= 2;
		};
		
		var abortParam = function()
		{
			var failed = true;
			failureCb();
		};
		
		operationCb(failureParam, abortParam);
		
		return abortParam;
	},
	
	showFatalErrorDialog: function(status)
	{
		// Set up info dialog
		var myAlert = new AlertDialog();
		myAlert.setTitle(Core.Localization.getString("Network failure"));
		myAlert.setChoices([Core.Localization.getString("Exit")]);

		myAlert.onchoice =
		function(ret)
		{
			myAlert.hide();
			LifecycleEmitter.exitProcess();
		};
		
		// TODO: Move this list somewhere localizable
		var commonErrors = {
			'302': "File location has changed (302)",
			'400': "Bad request to server (400)",
			'401': "Authorization failed (401)",
			'403': "Server permissions error (403)",
			'404': "Resource not found (404)",
			'408': "Request timed out (408)",
			'500': "Internal server error (500)",
			'501': "Cannot process request (501)",
			'502': "Bad Gateway (502)",
			'503': "Service overloaded / down for maintenance (503)",
			'504': "Timeout at intervening gateway (504)"
		};
		myAlert.setText( Core.Localization.getString( commonErrors[status] || "This application requires a working data connection." ) );
		myAlert.show();
	},

	showSimpleNetworkError: function(status)
	{
		// Set up info dialog
		var myAlert = new AlertDialog();
		myAlert.setTitle(Core.Localization.getString("Network failure"));
		myAlert.setChoices([Core.Localization.getString("OK")]);

		myAlert.onchoice =
		function(ret)
		{
			myAlert.hide();
		};

		// TODO: Move this list somewhere localizable
		var commonErrors = {
			'302': " File location has changed (302)",
			'400': " Bad request to server (400)",
			'401': " Authorization failed (401)",
			'403': " Server permissions error (403)",
			'404': " Resource not found (404)",
			'408': " Request timed out (408)",
			'500': " Internal server error (500)",
			'501': " Cannot process request (501)",
			'502': " Bad Gateway (502)",
			'503': " Service overloaded / down for maintenance (503)",
			'504': " Timeout at intervening gateway (504)"
		};
		var message = "Cannot download game without network connection.";
		if (commonErrors[status])
		{
			message += commonErrors[status];
		}
		myAlert.setText( Core.Localization.getString( message ) );
		myAlert.show();
	},
	
	getCacheBustingString: function()
	{
		return '?t=' + (new Date()).getTime();
	},

	/*
	 * Ad
	 */
	Ad: {
		Tapjoy: {
			sendActionComplete: function(actionId) {
				var _int_Util = require('./_int_Util')._int_Util;
				_int_Util.adTapjoySendActionComplete(actionId);
			}
		}
	}
};
