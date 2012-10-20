/**
 * <p>Classes and objects contained by the Device module.</p>
 * @name Device
 * @namespace Capture a device's location, movement, and user input.
 * @description <p>The Device module is a collection of classes that support the effect of physical movement on a device.
 * Each class instantiates a device singleton that emits when specific device conditions are met:</p>
 *<ul>
 *<li><code>{@link Device.Diagnostics}</code>: A singleton object that provides diagnostic information about the device.</li>
 *<li><code>{@link Device.KeyEmitter}</code>: A singleton object for emitting when the user presses or releases a device hardware key.</li>
 *<li><code>{@link Device.LayoutEmitter}</code>: A singleton object for emitting when the size of the display's usable portion is changing.</li>
 *<li><code>{@link Device.LifecycleEmitter}</code>: A singleton object for emitting when device lifecycle events occur.</li>
 *<li><code>{@link Device.LocationEmitter}</code>: A singleton object for emitting the geographic location of a device.</li>
 *<li><code>{@link Device.MemoryEmitter}</code>: A singleton object for emitting when low-memory states occur on a device.</li>
 *<li><code>{@link Device.MotionEmitter}</code>: A singleton object for emitting objects that collect spatial data from a device.</li>
 *<li><code>{@link Device.NetworkEmitter}</code>: A singleton object for emitting when a change in network status occurs for a device.</li>
 *<li><code>{@link Device.NotificationEmitter}</code>: A singleton object for retrieving notifications and scheduling local notifications.</li>
 *<li><code>{@link Device.OrientationEmitter}</code>: A singleton object for emitting when a change to the physical orientation of the device occurs.</li>
 *<li><code>{@link Device.ShakeEmitter}</code>: A singleton object for emitting when the device detects a shake gesture.</li>
 *</ul>
 */
function DeviceLoader(map) {
	this.add = function(key, toEval) {
		this.__defineGetter__(key, function() {
			delete this[key];
			return this[key] = toEval();
		});
	};
	for (var k in map) {
		if (map.hasOwnProperty(k)) this.add(k, map[k]);
	}
}

exports.Device = new DeviceLoader({
	'LifecycleEmitter': function() { return require('./Device/LifecycleEmitter').LifecycleEmitter; },
	'LocationEmitter': function() { return require('./Device/LocationEmitter').LocationEmitter; },
	'MemoryEmitter': function() { return require('./Device/MemoryEmitter').MemoryEmitter; },
	'MotionEmitter': function() { return require('./Device/MotionEmitter').MotionEmitter; },
	'NetworkEmitter': function() { return require('./Device/NetworkEmitter').NetworkEmitter; },
	'OrientationEmitter': function() { return require('./Device/OrientationEmitter').OrientationEmitter; },
	'ShakeEmitter': function() { return require('./Device/ShakeEmitter').ShakeEmitter; },
	'KeyEmitter': function() { return require('./Device/KeyEmitter').KeyEmitter; },
	'PushNotificationEmitter': function() { return require('./Device/_PushNotificationEmitter').PushNotificationEmitter; },
	'InAppPurchaseEmitter': function() { return require('./Device/_InAppPurchaseEmitter').InAppPurchaseEmitter; },
	'InAppPurchase': function() { return require('./Device/_InAppPurchase').InAppPurchase; },
	'IPCEmitter': function() { return require('./Device/IPCEmitter').IPCEmitter; },
	'LayoutEmitter': function() { return require('./Device/LayoutEmitter').LayoutEmitter; },
	'LocalNotification': function() { return require('./Device/_LocalNotification').LocalNotification; },
	'UsageStats': function() { return require('./Device/_UsageStats').UsageStats; },
	'NotificationEmitter': function() { return require('./Device/NotificationEmitter').NotificationEmitter; }
});
exports.Device.__defineGetter__("NotificationEmitter", function() {
	delete this.UsageStats;
	return this.UsageStats= require('./Device/NotificationEmitter').NotificationEmitter;
});
exports.Device.__defineGetter__("Diagnostics", function() {
	delete this.Diagnostics;
	return this.Diagnostics = require('./Device/Diagnostics').Diagnostics;
});
