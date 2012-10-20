//
//  Mobclix.Core.MMWebViewMessageListener.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var UI = require('../../UI').UI;
var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var $mc = require('../Core/Utils').Utils;

var WebViewMessageListener = exports.WebViewMessageListener = Core.MessageListener.subclass({
	__className: "WebViewMessageListener",
    
    webview: null,
    
    accelerometerListenerCallbackFunctionName: null,
    accelerometerListenerInterval: 0,
    accelerometerListenerLastTimestamp: 0,
    
    gyroscopeListenerCallbackFunctionName: null,
    gyroscopeListenerInterval: 0,
    gyroscopeListenerLastTimestamp: 0,
    
    compassListenerCallbackFunctionName: null,
    compassListenerInterval: 0,
    compassListenerLastTimestamp: 0,
    
    shakeListenerCallbackFunctionName: null,
    gpsListenerCallbackFunctionName: null,
    gpsListenerDistanceFilter: 0,
    gpsListenerLastReportedLongitude: 0,
    gpsListenerLastReportedLatitude: 0,
    
    initialize: function($super, webview) {
		$super();
		this.webview = webview;
	},
    
    pauseListeners: function()
    {
        try {
            Device.ShakeEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.MotionEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.LocationEmitter.removeListener(this);
        } catch (error) {}
    },
    
    resumeListeners: function()
    {
        try {
            if (this.shakeListenerCallbackFunctionName != null) {
                Device.ShakeEmitter.addListener(this, this.onShakeEvent, 10000);
            }
        } catch (error) {}
        try {
            Device.MotionEmitter.addListener(this, this.onMotionEvent, 10000);
            this.checkRemoveMotionListener();
        } catch (error) {}
        try {
            if (this.gpsListenerCallbackFunctionName != null) {
                Device.LocationEmitter.addListener(this, this.onLocationEvent, 10000);
            }
        } catch (error) {}
    },
    
    onKeyEvent: function(params) {
        console.log(["MMWebViewMessageListener - onKeyEvent - event: ", params].toString());
    },
    
    onLifecycleEvent: function(params) {
        console.log(["MMWebViewMessageListener - onLifecycleEvent - event: ", params].toString());
        if (params == Device.LifecycleEmitter.Event.Suspend) {
            this.webview.adWillBecomeHidden();
            this.pauseListeners();
        } else if (params == Device.LifecycleEmitter.Event.Resume) {
            this.webview.adDidReturnFromHidden();
            this.resumeListeners();
        } else if (params == Device.LifecycleEmitter.Event.Terminate) {
            this.webview.adWillTerminate();
            this.pauseListeners();
        }
    },
 
    onMotionEvent: function(params) {
        var t = (new Date()).getTime();
        if (this.accelerometerListenerCallbackFunctionName != null &&
                t > this.accelerometerListenerLastTimestamp + this.accelerometerListenerInterval) {
            this.accelerometerListenerLastTimestamp = t;
            var data = params.getAccelData();
            try {
                this.webview.invoke(this.webview.callback(this.accelerometerListenerCallbackFunctionName,
                                                          data[0] + "," + data[1] + "," + data[2],
                                                          false));
            } catch (error) {}
        }
        if (this.gyroscopeListenerCallbackFunctionName != null &&
                t > this.gyroscopeListenerLastTimestamp + this.gyroscopeListenerInterval) {
            this.gyroscopeListenerLastTimestamp = t;
            var data = params.getGyroData();
            try {
                this.webview.invoke(this.webview.callback(this.gyroscopeListenerCallbackFunctionName,
                                                          data[0] + "," + data[1] + "," + data[2],
                                                          false));
            } catch (error) {}
        }
        if (this.compassListenerCallbackFunctionName != null &&
                t > this.compassListenerLastTimestamp + this.compassListenerInterval) {
            this.compassListenerLastTimestamp = t;
            var data = params.getCompassData();
            try {
                this.webview.invoke(this.webview.callback(this.compassListenerCallbackFunctionName,
                                                          data[0],
                                                          false));
            } catch (error) {}
        }
    },
    
    checkRemoveMotionListener: function() {
        console.log(["MMWebViewMessageListener - checkRemoveMotionListener"].toString());
        if (this.accelerometerListenerCallbackFunctionName == null &&
                this.gyroscopeListenerCallbackFunctionName == null &&
                this.compassListenerCallbackFunctionName == null) {
            try {
                console.log(["MMWebViewMessageListener - checkRemoveMotionListener - trying to remove listener"].toString());
                Device.MotionEmitter.removeListener(this);
            } catch (error) {
                console.log(["MMWebViewMessageListener - checkRemoveMotionListener - error: ", error].toString());
            }
        }
    },
 
    onLocationEvent: function(params)
    {
        if (this.gpsListenerCallbackFunctionName != null) {
            try {
                if (distanceBetweenCoordinates(
                        params.getPosition().getX(),
                        params.getPosition().getY(),
                        this.gpsListenerLastReportedLongitude,
                        this.gpsListenerLastReportedLatitude) < this.gpsListenerDistanceFilter) {
                    return;
                }
                
                this.gpsListenerLastReportedLongitude = params.getPosition().getX();
                this.gpsListenerLastReportedLatitude = params.getPosition().getY();
            
                var locationData = { "coordinate": { "latitude": params.getPosition().getX(),
                                                     "longitude": params.getPosition().getY() },
                                     "course": params.getHeading(),
                                     "speed": 0,
                                     "timestamp": params.getTimestamp(),
                                     "horizontalAccuracy": params.getAccuracy(),
                                     "verticalAccuracy": params.getAccuracy() };
                this.webview.invoke(this.webview.callback(this.gpsListenerCallbackFunctionName,
                                                          "eval('(" + JSON.stringify(locationData) + ")')",
                                                          false));
            
            } catch (error) {}
        }
    },
    
    distanceBetweenCoordinates: function(long1, lat1, long2, lat2)
    {
        var R = 6371000; // meters
        return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                         Math.cos(lat1)*Math.cos(lat2) *
                         Math.cos(long2-long1)) * R;
    },
 
    onShakeEvent: function(params)
    {
        console.log(['MMWebViewMessageListener - onShakeEvent: ', params].toString());
        if (this.shakeListenerCallbackFunctionName != null)
            webview.invoke(this.callback(this.shakeListenerCallbackFunctionName, null, false));
    },
    
    /**
	 * Destroys the current object
	 * @private
	 */
	destroy: function($super) {
        console.log('MMWebViewMessageListener - destroy');
        
        try {
            Device.KeyEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.LifecycleEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.ShakeEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.MotionEmitter.removeListener(this);
        } catch (error) {}
        try {
            Device.LocationEmitter.removeListener(this);
        } catch (error) {}
        
        $super();
	}
});
