//
//  Mobclix.CreativeView.WebView.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var UI = require('../../UI').UI;
var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var Controller = require('../Core/Controller').Controller;
var WebViewMessageListener = require('./WebViewMessageListener').WebViewMessageListener;
var MMWebView = require('../Core/MMWebView').MMWebView;
var Browser = require('../Browser').Browser;
var $mc = require('../Core/Utils').Utils;

var WebView = exports.WebView = MMWebView.subclass({
	__className: "Mobclix.CreativeView.WebView",

    parentCreative: null,
    
    // Permissions
    uniqueKey: "",
    autoplay: true,
    requireUserInteraction: false,
    hasUserInteracted: false,
    
    // State tracking
    screenCover: null,
    backButton: null,
    adView_frame: [0,0,0,0],
    expanded: false,
    fullscreen: false,
    detaching: false,
    dont_destroy_me: false,
    
    // GPS
    gpsDistanceFilter: 0.0,
    gpsDataCallbackFunctionName: null,
    gpsListenerAdded: false,
    gpsEnabled: false,
    networkEnabled: false,
    
    messageListener: null,
    
    // Display Callbacks
    adDidDisplayCallbackFunctionName: null,
    adFinishedResizingCallbackFunctionName: null,
    adWillContractCallbackFunctionName: null,
    adWillTerminateCallbackFunctionName: null,
    adWillBecomeHiddenCallbackFunctionName: null,
    adDidReturnFromHiddenCallbackFunctionName: null,
    
    initialize: function($super, obj) {
		$super(obj);
		
        this.createBackButton();
        
        this.messageListener = new WebViewMessageListener(this);
        
        Device.KeyEmitter.addListener(this.messageListener, this.messageListener.onKeyEvent, 10000);
        Device.LifecycleEmitter.addListener(this.messageListener, this.messageListener.onLifecycleEvent, 10000);
	},
    
    createBackButton: function()
    {
    	// Add a back button.
        this.backButton = new UI.Button();
        this.backButton.setNormalText('x');
        this.backButton.setTextSize(32);
        this.backButton.setTextGravity(UI.ViewGeometry.Gravity.Center);
        this.backButton.setFrame([10, 10, 32, 32]);
        this.backButton.setNormalGradient({
            corners: '12 12 12 12',
            outerLine: "00 3",
            //gradient: [ "FF9bd6f4 0.0", "FF0077BC 1.0" ]
            gradient: [ "FFFF0000 0.0", "FFFF0000 1.0" ]
        });
        this.backButton.setHighlightedGradient({
            corners: '12 12 12 12',
            outerLine: "00 3",
            //gradient: [ "FF0077BC 0.0", "FF9bd6f4 1.0" ]
            gradient: [ "FF990000 0.0", "FF990000 1.0" ]
        });
        var self = this;
        this.backButton.onclick = function() {
            self.close(300);
        };
    
    },
    
    pauseListeners: function()
    {
        this.messageListener.pauseListeners();
    },
    
    resumeListeners: function()
    {
        this.messageListener.resumeListeners();
    },
    
    getParameterByName: function(url, name, d)
    {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( url );
        if( results == null )
            return d;
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    
    onPageEvent: function(event)
    {
        if (event == null) {
            console.log("WebView webgame Page Event: null");
        }
		console.log(["WebView webgame Page Event: ", event.eventStream].toString());
        var method = event.eventStream.split("?")[0];
        
        if (method == "domReady") {
            this.domReady();
        } else if (method == "checkPermissionsForUserInteractionResponse") {
            this.checkPermissionsForUserInteractionResponse(event.eventStream);
        } else if (method == "accelerometerStart") {
            this.accelerometerStart(event.eventStream);
        } else if (method == "accelerometerStop") {
            this.accelerometerStop(event.eventStream);
        } else if (method == "gyroscopeStart") {
            this.gyroscopeStart(event.eventStream);
        } else if (method == "gyroscopeStop") {
            this.gyroscopeStop(event.eventStream);
        } else if (method == "magnetometerStart") {
            this.magnetometerStart(event.eventStream);
        } else if (method == "magnetometerStop") {
            this.magnetometerStop(event.eventStream);
        } else if (method == "deviceMotionStart") {
            this.deviceMotionStart(event.eventStream);
        } else if (method == "deviceMotionStop") {
            this.deviceMotionStop(event.eventStream);
        } else if (method == "gpsStart") {
            this.gpsStart(event.eventStream);
        } else if (method == "gpsStop") {
            this.gpsStop(event.eventStream);
        } else if (method == "deviceAccelerometerAvailable") {
            this.deviceAccelerometerAvailable(event.eventStream);
        } else if (method == "deviceGyroscopeAvailable") {
            this.deviceGyroscopeAvailable(event.eventStream);
        } else if (method == "deviceDeviceMotionAvailable") {
            this.deviceDeviceMotionAvailable(event.eventStream);
        } else if (method == "deviceGPSAvailable") {
            this.deviceGPSAvailable(event.eventStream);
        } else if (method == "deviceMagnetometerAvailable") {
            this.deviceMagnetometerAvailable(event.eventStream);
        } else if (method == "deviceVibrateAvailable") {
            this.deviceVibrateAvailable(event.eventStream);
        } else if (method == "deviceEmailAvailable") {
            this.deviceEmailAvailable(event.eventStream);
        } else if (method == "deviceSMSAvailable") {
            this.deviceSMSAvailable(event.eventStream);
        } else if (method == "deviceShakeListeningAvailable") {
            this.deviceShakeListeningAvailable(event.eventStream);
        } else if (method == "deviceVibrate") {
            this.deviceVibrate(event.eventStream);
        } else if (method == "deviceStartShakeListening") {
            this.deviceStartShakeListening(event.eventStream);
        } else if (method == "deviceStopShakeListening") {
            this.deviceStopShakeListening(event.eventStream);
        } else if (method == "deviceAlert") {
            this.deviceAlert(event.eventStream);
        } else if (method == "deviceBatteryState") {
            this.deviceBatteryState(event.eventStream);
        } else if (method == "deviceUniqueId") {
            this.deviceUniqueId(event.eventStream);
        } else if (method == "deviceModel") {
            this.deviceModel(event.eventStream);
        } else if (method == "deviceSystemVersion") {
            this.deviceSystemVersion(event.eventStream);
        } else if (method == "deviceHardwareModel") {
            this.deviceHardwareModel(event.eventStream);
        } else if (method == "deviceConnectionType") {
            this.deviceConnectionType(event.eventStream);
        } else if (method == "deviceLanguage") {
            this.deviceLanguage(event.eventStream);
        } else if (method == "deviceLocale") {
            this.deviceLocale(event.eventStream);
        } else if (method == "deviceScalingFactor") {
            this.deviceScalingFactor(event.eventStream);
        } else if (method == "devicePlatform") {
            this.devicePlatform(event.eventStream);
        } else if (method == "deviceScreenSize") {
            this.deviceScreenSize(event.eventStream);
        } else if (method == "deviceScreenDensity") {
            this.deviceScreenDensity(event.eventStream);
        } else if (method == "deviceInterfaceOrientation") {
            this.deviceInterfaceOrientation(event.eventStream);
        } else if (method == "deviceCurrentOrientation") {
            this.deviceCurrentOrientation(event.eventStream);
        } else if (method == "displayExpandToFullScreen") {
            this.displayExpandToFullScreen(event.eventStream);
        } else if (method == "displayResizeTo") {
            this.displayResizeTo(event.eventStream);
        } else if (method == "displayContractAd") {
            this.displayContractAd(event.eventStream);
        } else if (method == "displayOpenInBrowser") {
            this.displayOpenInBrowser(event.eventStream);
        } else if (method == "displaySetAdDidDisplayCallback") {
            this.setAdDidDisplayCallback(event.eventStream);
        } else if (method == "displaySetAdFinishedResizingCallback") {
            this.setAdFinishedResizingCallback(event.eventStream);
        } else if (method == "displaySetAdWillContractCallback") {
            this.setAdWillContractCallback(event.eventStream);
        } else if (method == "displaySetAdWillTerminateCallback") {
            this.setAdWillTerminateCallback(event.eventStream);
        } else if (method == "displaySetAdWillBecomeHiddenCallback") {
            this.setAdWillBecomeHiddenCallback(event.eventStream);
        } else if (method == "displaySetAdDidReturnFromHiddenCallback") {
            this.setAdDidReturnFromHiddenCallback(event.eventStream);
        } else if (method == "displaySetAllDisplayCallbacks") {
            this.setAllDisplayCallbacks(event.eventStream);
        } else
            this.loadUrl("http://www.yahoo.com");
	},
    
    guidGenerator: function()
    {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    
    callback: function(callbackFunctionName, value, addQuotes)
    {
        var js = callbackFunctionName;
        if (addQuotes)
            js += "(\"";
        else
            js += "(";
        
        if (value != null)
            js += value;
        
        if (addQuotes)
            js += "\")";
        else
            js += ")";
            
        console.log(["WebView - callback: ", js].toString());
        return js;
    },
    
    domReady: function()
    {
        this.uniqueKey = this.guidGenerator();
        this.invoke("window.addEventListener('click', function(){mAdViewPermissionsKey=" + this.uniqueKey + ";}, true);");
    },
    
    checkPermissionsForUserInteraction: function(callback, errorCallbackFunctionName)
    {
        var js = "try { window.location=\"ngcore://checkPermissionsForUserInteractionResponse?uniquekey=mAdViewPermissionsKey";
        if (callback != null && callback != "") {
            js += "&callback=" + escape(callback)
        }
        js += "; } catch (e) { + " + errorCallbackFunctionName + "('User has not interacted with ad yet.');}";
        this.invoke(js);
    },
    
    checkPermissionsForUserInteractionResponse: function(uri)
    {
        var uniqueKey = this.getParameterByName(uri, "uniqueKey") || null;
        var callback = this.getParameterByName(uri, "callback") || null;
        if (this.uniqueKey == uniqueKey) {
            this.hasUserInteracted = true;
            
            if (callback != null && callback != "null") {
                this.invoke(unescape(callback));
            }
        }
    },
    
    
    // ****** SENSORS *********
    
    accelerometerStart: function(uri)
    {
        console.log(['WebView - accelerometerStart: ', uri].toString());
        var interval = this.getParameterByName(uri, "interval") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (Core.Capabilities.getHasAccel()) {
                this.messageListener.accelerometerListenerCallbackFunctionName = callbackFunctionName;
                this.messageListener.accelerometerListenerInterval = interval * 1000;
                Device.MotionEmitter.addListener(this.messageListener, this.messageListener.onMotionEvent, 10000);
                
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                        this.invoke(this.callback(errorCallbackFunctionName, "Device does not support an accelerometer.", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    accelerometerStop: function(uri)
    {
        console.log(['WebView - accelerometerStop: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            this.messageListener.accelerometerListenerCallbackFunctionName = null;
            this.messageListener.checkRemoveMotionListener();
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    gyroscopeStart: function(uri)
    {
        console.log(['WebView - gyroscopeStart: ', uri].toString());
        var interval = this.getParameterByName(uri, "interval") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (Core.Capabilities.getHasGyro()) {
                this.messageListener.gyroscopeListenerCallbackFunctionName = callbackFunctionName;
                this.messageListener.gyroscopeListenerInterval = interval * 1000;
                Device.MotionEmitter.addListener(this.messageListener, this.messageListener.onMotionEvent, 10000);
                
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                        this.invoke(this.callback(errorCallbackFunctionName, "Device does not support a gyroscope.", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    gyroscopeStop: function(uri)
    {
        console.log(['WebView - gyroscopeStop: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            this.messageListener.gyroscopeListenerCallbackFunctionName = null;
            this.messageListener.checkRemoveMotionListener();
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    magnetometerStart: function(uri)
    {
        console.log(['WebView - magnetometerStart: ', uri].toString());
        var interval = this.getParameterByName(uri, "interval") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (Core.Capabilities.getHasCompass()) {
                this.messageListener.compassListenerCallbackFunctionName = callbackFunctionName;
                this.messageListener.compassListenerInterval = interval * 1000;
                Device.MotionEmitter.addListener(this.messageListener, this.messageListener.onMotionEvent, 10000);
                
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                        this.invoke(this.callback(errorCallbackFunctionName, "Device does not support the magnetometer.", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    magnetometerStop: function(uri)
    {
        console.log(['WebView - magnetometerStop: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            this.messageListener.magnetometerListenerCallbackFunctionName = null;
            
            this.messageListener.checkRemoveMotionListener();
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    deviceMotionStart: function(uri)
    {
        console.log(['WebView - deviceMotionStart: ', uri].toString());
        var interval = this.getParameterByName(uri, "interval") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        if (errorCallbackFunctionName != null)
            this.invoke(this.callback(errorCallbackFunctionName, "Device does not support device motion.", false));
    },
    
    deviceMotionStop: function(uri)
    {
        console.log(['WebView - deviceMotionStop: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        if (errorCallbackFunctionName != null)
            this.invoke(this.callback(errorCallbackFunctionName, "Device does not support device motion.", false));
    },
    
    gpsStart: function(uri)
    {
        console.log(['WebView - gpsStart: ', uri].toString());
        var distanceFilter = this.getParameterByName(uri, "distanceFilter") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (Core.Capabilities.getHasGps()) {
                this.messageListener.gpsListenerCallbackFunctionName = callbackFunctionName;
                this.messageListener.gpsListenerDistanceFilter = distanceFilter;
                Device.LocationEmitter.addListener(this.messageListener, this.messageListener.onLocationEvent, 10000);
                
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                        this.invoke(this.callback(errorCallbackFunctionName, "Device does not support GPS location.", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    gpsStop: function(uri)
    {
        console.log(['WebView - gpsStop: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            this.messageListener.gpsListenerCallbackFunctionName = null;
            this.messageListener.gpsListenerDistanceFilter = 0;
            this.messageListener.gpsListenerLastReportedLongitude = 0;
            this.messageListener.gpsListenerLastReportedLatitude = 0;
            
            Device.LocationEmitter.removeListener(this.messageListener);
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    
    
    
    
    // ******* DEVICE *********
    
    deviceAccelerometerAvailable: function(uri)
    {
        console.log(['WebView - deviceAccelerometerAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (Core.Capabilities.getHasAccel())
            b = "true";
        else
            b= "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },
    
    deviceGyroscopeAvailable: function(uri)
    {
        console.log(['WebView - deviceGyroscopeAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (Core.Capabilities.getHasGyro())
            b = "true";
        else
            b= "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },
    
    deviceDeviceMotionAvailable: function(uri)
    {
        console.log(['WebView - deviceDeviceMotionAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },
    
    deviceGPSAvailable: function(uri)
    {
        console.log(['WebView - deviceGPSAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (Core.Capabilities.getHasGps())
            b = "true";
        else
            b= "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },

    deviceMagnetometerAvailable: function(uri)
    {
        console.log(['WebView - deviceMagnetometerAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (Core.Capabilities.getHasCompass())
            b = "true";
        else
            b= "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },
    
    deviceVibrateAvailable: function(uri)
    {
        console.log(['WebView - deviceVibrateAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;

        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, "false", false));
    },
    
    deviceEmailAvailable: function(uri)
    {
        console.log(['WebView - deviceEmailAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, "true", false));
    },
    
    deviceSMSAvailable: function(uri)
    {
        console.log(['WebView - deviceSMSAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, "true", false));
    },
    
    deviceShakeListeningAvailable: function(uri)
    {
        console.log(['WebView - deviceShakeListeningAvailable: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var b = "false";
        if (Core.Capabilities.getHasAccel())
            b = "true";
        else
            b= "false";
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, b, false));
    },
    
    deviceVibrate: function(uri)
    {
        console.log(['WebView - deviceVibrate: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;

        if (errorCallbackFunctionName != null)
            this.invoke(this.callback(errorCallbackFunctionName, "Device does not support vibrate.", false));
    },
    
    deviceStartShakeListening: function(uri)
    {
        console.log(['WebView - deviceStartShakeListening: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (Core.Capabilities.getHasAccel()) {               
                this.messageListener.shakeListenerCallbackFunctionName = callbackFunctionName;
                
                Device.ShakeEmitter.addListener(this.messageListener, this.messageListener.onShakeEvent, 10000);
                
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                        this.invoke(this.callback(errorCallbackFunctionName, "Device does not support shaking.", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    deviceStopShakeListening: function(uri)
    {
        console.log(['WebView - deviceStopShakeListening: ', uri].toString());
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            Device.ShakeEmitter.removeListener(this.messageListener);
            
            this.messageListener.shakeListenerCallbackFunctionName = null;
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), false));
        }
    },
    
    deviceAlert: function(uri)
    {
        console.log(['WebView - deviceAlert: ', uri].toString());
        var title = this.getParameterByName(uri, "title") || null;
        var message = this.getParameterByName(uri, "message") || null;
        var buttonTitles = this.getParameterByName(uri, "buttonTitles") || null;
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
        
        try {
            var dialog = new UI.AlertDialog();
            dialog.setTitle(title);
            dialog.setText(message);
            var buttonArray = buttonTitles.split("|");
            dialog.setChoices(buttonArray);
            var self = this;
            dialog.setOnChoice( function(event) {
                console.log(['WebView - deviceAlert - choice: ', event, callbackFunctionName].toString());
                self.invoke(self.callback(callbackFunctionName, event.choice + ", '" + buttonArray[event.choice] + "'", false));
                dialog.hide();
            });
            dialog.show();
        } catch (error) { }
    },
    
    deviceBatteryState: function(uri)
    {
        console.log(['WebView - deviceBatteryState: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, "unavailable", true));
    },
    
    deviceUniqueId: function(uri)
    {
        console.log(['WebView - deviceUniqueId: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getUniqueId(), true));
    },

    deviceModel: function(uri)
    {
        console.log(['WebView - deviceModel: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getDeviceName(), true));
    },
    
    deviceSystemVersion: function(uri)
    {
        console.log(['WebView - deviceSystemVersion: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getPlatformOSVersion(), true));
    },
    
    deviceHardwareModel: function(uri)
    {
        console.log(['WebView - deviceHardwareModel: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getPlatformHW(), true));
    },
    
    deviceConnectionType: function(uri)
    {
        console.log(['WebView - deviceConnectionType: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Controller.getNetworkState(), true));
    },
    
    deviceLanguage: function(uri)
    {
        console.log(['WebView - deviceLanguage: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getLanguage(), true));
    },
    
    deviceLocale: function(uri)
    {
        console.log(['WebView - deviceLocale: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getLocale(), true));
    },
    
    deviceScalingFactor: function(uri)
    {
        console.log(['WebView - deviceScalingFactor: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getScreenUnits(), true));
    },
    
    devicePlatform: function(uri)
    {
        console.log(['WebView - devicePlatform: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getPlatformOS(), true));
    },
    
    deviceScreenSize: function(uri)
    {
        console.log(['WebView - deviceScreenSize: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getScreenWidth() + ", " +
                              Core.Capabilities.getScreenHeight(), false));
    },
    
    deviceScreenDensity: function(uri)
    {
        console.log(['WebView - deviceScreenDensity: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, Core.Capabilities.getScreenPixelUnits(), false));
    },
    
    deviceCurrentOrientation: function(uri)
    {
        console.log(['WebView - deviceScreenDensity: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        var r = "landscape";
    
        var o = Device.OrientationEmitter.getDeviceOrientation();
        if (o == Device.OrientationEmitter.Orientation.Portrait ||
                o == Device.OrientationEmitter.Orientation.PortraitUpsideDown) 
            r = "portrait";
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, r, true));
    },
    
    deviceInterfaceOrientation: function(uri)
    {
        console.log(['WebView - deviceScreenDensity: ', uri].toString());
        var callbackFunctionName = this.getParameterByName(uri, "callbackFunctionName") || null;
    
        var r = "landscape";
    
        var o = Device.OrientationEmitter.getInterfaceOrientation();
        if (o == Device.OrientationEmitter.Orientation.Portrait ||
                o == Device.OrientationEmitter.Orientation.PortraitUpsideDown) 
            r = "portrait";
    
        if (callbackFunctionName != null)
            this.invoke(this.callback(callbackFunctionName, r, true));
    },
    
    

    
    
    
    
    
    // *********** DISPLAY ************
    
    displayExpandToFullScreen: function(uri)
    {
        console.log('ngcore: displayExpandToFullScreen');
            
        var animationDuration = this.getParameterByName(uri, "animationDuration") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (this.fullscreen) {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Cannot expand a fullscreen ad", false));
                return;
            }
        
            if (!this.autoplay && !this.userHasInteracted) {
                var js = "window.location=" + uri;
                this.checkPermissionsForUserInteraction(js);
                return;
            }
            
            if (this.expandTo(animationDuration,0,0,
                              Core.Capabilities.getScreenWidth(),
                              Core.Capabilities.getScreenHeight())) {                          
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Failed to expand", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error, false));
        }
    },
    
    displayResizeTo: function(uri)
    {
        console.log('ngcore: displayResizeTo');
        
        var x = this.getParameterByName(uri, "x", 0);
        var y = this.getParameterByName(uri, "y", 0);
        var w = this.getParameterByName(uri, "width", 0);
        var h = this.getParameterByName(uri, "height", 0);
        var animationDuration = this.getParameterByName(uri, "animationDuration") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (this.fullscreen) {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Cannot resize a fullscreen ad", false));
                return;
            }
        
            if (!this.autoplay && !this.userHasInteracted) {
                var js = "window.location=" + uri;
                this.checkPermissionsForUserInteraction(js);
                return;
            }
            
            if (this.expandTo(animationDuration,x,y,w,h)) {
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Failed to expand", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error, false));
        }
    },
    
    displayContractAd: function(uri)
    {
        console.log('ngcore: displayContractAd');
        var animationDuration = this.getParameterByName(uri, "animationDuration") || null;
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (this.fullscreen) {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Cannot contract a fullscreen ad", false));
                return;
            }
        
            if (this.close(animationDuration)) {
                if (successCallbackFunctionName != null)
                    this.invoke(this.callback(successCallbackFunctionName, null, false));
            } else {
                if (errorCallbackFunctionName != null)
                    this.invoke(this.callback(errorCallbackFunctionName, "Failed to contract ad", false));
            }
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error, false));
        }
    },

    exitCallback: function(event)
    {
        console.log(['WebView - exitCallback: ', event].toString());
        
        this.close(300);
    },
    
    close: function(duration)
    {
        if (this.expanded == false)
            return false;
        
        if (this.detaching)
            return false;
        this.detaching = true;
        
        if (duration <= 0) duration = 1;
        if (duration > 3000) duration = 3000;
        
        
        var self = this;
        var parentAdViewFrame;
        parentAdViewFrame = this.parentCreative.adView.getFrame();
        this.adWillContract();
        
        this.backButton.removeFromParent();
        
        UI.animate( function() {
                self.setFrame(parentAdViewFrame);
            }, duration, function() {
                self.adFinishedResizing();
            
                self.dont_destroy_me = true;
                self.removeFromParent();
                self.parentCreative.addChild(self);
                self.dont_destroy_me = false;
                
                self.setFrame(self.adView_frame);
                
                self.screenCover.removeFromParent();
                self.expanded = false;
                self.detaching = false;
                
                self.parentCreative.adView.didTouchThrough(this.parentCreative);
            });
        return true;
    },


    expandTo: function(duration, x, y, width, height)
    {
        console.log('WebView - expandTo');
        
        if (duration <= 0) duration = 1;
        if (duration > 3000) duration = 3000;
        
        var self = this;
        if (this.expanded == false) {
            if (!this.parentCreative.adView.shouldTouchThrough())
                return false;

            this.parentCreative.adView.willTouchThrough(this.parentCreative);
        
            if (this.detaching)
                return false;
            this.detaching = true;
        
            console.log('WebView - expandTo - expanding');
            this.adView_frame = this.getFrame(this.adView_frame);
            console.log(['WebView - expandTo - adView_frame: ', this.adView_frame].toString());
            
            this.screenCover = new UI.View();
            this.screenCover.setFrame([0,0,
                                       Core.Capabilities.getScreenWidth(),
                                       Core.Capabilities.getScreenHeight()]);
            
            /*var backgroundView = new UI.Button();
            backgroundView.setFrame([0,0,320,800]);
            backgroundView.setBackgroundColor("000000");
            backgroundView.setAlpha(0.3);
            this.screenCover.addChild(backgroundView);*/
            
            var closeCover = new UI.Button();
            closeCover.setFrame([0,0,
                                 Core.Capabilities.getScreenWidth(),
                                 Core.Capabilities.getScreenHeight()]);
            closeCover.setBackgroundColor("000000");
            closeCover.setAlpha(0.3);
            this.screenCover.addChild(closeCover);
            
            
            closeCover.setOnClick(function(event) {
                self.exitCallback(event);
            });

			var Window = require('../../UI/Window').Window;
            Window.document.addChild(this.screenCover);
            
            this.dont_destroy_me = true;
            this.parentCreative.removeChild(this);
            this.screenCover.addChild(this);
            this.dont_destroy_me = false;
            
            var parentAdViewFrame;
            parentAdViewFrame = this.parentCreative.adView.getFrame();
            this.setFrame(parentAdViewFrame);
            
            this.detaching = false;
            this.expanded = true;

        }
        
        try {
            this.backButton.removeFromParent();
        } catch (error) {}
        if (width >= Core.Capabilities.getScreenWidth() * .8 ||
                height >= Core.Capabilities.getScreenHeight() * .8) {
            this.screenCover.addChild(this.backButton);
        }
        
        UI.animate( function() {
                self.setFrame([x,y,width,height]);
            }, 500, function() {
                self.adFinishedResizing();
            });
        
        return true;
    },
    
    displayOpenInBrowser: function(uri)
    {
        console.log('ngcore: displayOpenInBrowser');
        var url = this.getParameterByName(uri, "url");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName") || null;
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName") || null;
        
        try {
            if (!this.autoplay && !this.userHasInteracted) {
                var js = "window.location=" + uri;
                this.checkPermissionsForUserInteraction(js);
                return;
            }
        
            var browser = new Browser();
            browser.onDidFinish = function() {
                // Whatever you need to do
            };
            
            browser.loadUrl(url);
            browser.presentViewController(true);
            browser.release();
            browser = null;
            
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, error.toString(), true));
        }
    },
    
    
    
    // ************** DISPLAY LISTENERS *****************
    
    setAdDidDisplayCallback: function(uri)
    {
        var adDidDisplayCallback = this.getParameterByName(uri, "adDidDisplayCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adDidDisplayCallback = adDidDisplayCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adDidDisplay: function()
    {
        if (this.adDidDisplayCallback != null)
            this.invoke(this.callback(this.adDidDisplayCallback, null, false));
    },
    
    setAdFinishedResizingCallback: function(uri)
    {
        var adFinishedResizingCallback = this.getParameterByName(uri, "adFinishedResizingCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adFinishedResizingCallback = adFinishedResizingCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adFinishedResizing: function()
    {
        if (this.adFinishedResizingCallback != null)
            this.invoke(this.callback(this.adFinishedResizingCallback, null, false));
    },
    
    setAdWillContractCallback: function(uri)
    {
        var adWillContractCallback = this.getParameterByName(uri, "adWillContractCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adWillContractCallback = adWillContractCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adWillContract: function()
    {
        if (this.adWillContractCallback != null)
            this.invoke(this.callback(this.adWillContractCallback, null, false));
    },
    
    setAdWillTerminateCallback: function(uri)
    {
        var adWillTerminateCallback = this.getParameterByName(uri, "adWillTerminateCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adWillTerminateCallback = adWillTerminateCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adWillTerminate: function()
    {
        if (this.adWillTerminateCallback != null)
            this.invoke(this.callback(this.adWillTerminateCallback, null, false));
    },
    
    setAdWillBecomeHiddenCallback: function(uri)
    {
        var adWillBecomeHiddenCallback = this.getParameterByName(uri, "adWillBecomeHiddenCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adWillBecomeHiddenCallback = adWillBecomeHiddenCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adWillBecomeHidden: function()
    {
        if (this.adWillBecomeHiddenCallback != null)
            this.invoke(this.callback(this.adWillBecomeHiddenCallback, null, false));
    },
    
    setAdDidReturnFromHiddenCallback: function(uri)
    {
        var adDidReturnFromHiddenCallback = this.getParameterByName(uri, "adDidReturnFromHiddenCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adDidReturnFromHiddenCallback = adDidReturnFromHiddenCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    adDidReturnFromHidden: function()
    {
        if (this.adDidReturnFromHiddenCallback != null)
            this.invoke(this.callback(this.adDidReturnFromHiddenCallback, null, false));
    },
    
    setAllDisplayCallbacks: function(uri)
    {
        var adFinishedResizingCallback = this.getParameterByName(uri, "adFinishedResizingCallbackFunctionName");
        var adWillContractCallback = this.getParameterByName(uri, "adWillContractCallbackFunctionName");
        var adWillTerminateCallback = this.getParameterByName(uri, "adWillTerminateCallbackFunctionName");
        var adWillBecomeHiddenCallback = this.getParameterByName(uri, "adWillBecomeHiddenCallbackFunctionName");
        var adDidReturnFromHiddenCallback = this.getParameterByName(uri, "adDidReturnFromHiddenCallbackFunctionName");
        var successCallbackFunctionName = this.getParameterByName(uri, "successCallbackFunctionName");
        var errorCallbackFunctionName = this.getParameterByName(uri, "errorCallbackFunctionName");
        try {
            this.adFinishedResizingCallback = adFinishedResizingCallback;
            this.adWillContractCallback = adWillContractCallback;
            this.adWillTerminateCallback = adWillTerminateCallback;
            this.adWillBecomeHiddenCallback = adWillBecomeHiddenCallback;
            this.adDidReturnFromHiddenCallback = adDidReturnFromHiddenCallback;
            if (successCallbackFunctionName != null)
                this.invoke(this.callback(successCallbackFunctionName, null, false));
        } catch (error) {
            if (errorCallbackFunctionName != null)
                this.invoke(this.callback(errorCallbackFunctionName, escape(error.toString()), true));
        }
    },
    
    
    /**
	 * Destroys the current object
	 * @private
	 */
	destroy: function($super) {
        console.log('WebView - destroy');
        if (this.dont_destroy_me) {

        } else {
            if (this.screenCover != null) {
                this.screenCover.removeFromParent();
                this.screenCover.destroy();
            }
            
            messageListener.destroy();
            
            $super();
        }
	}
});
