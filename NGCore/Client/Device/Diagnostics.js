////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Device diagnostic emitter; collects info from Device subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

//
// Create and export a DiagnosticEmitter for Device.
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
	classname: 'Device_Diagnostics',

	/**
	 * @class The <code>Device.Diagnostics</code> class provides detailed diagnostic information
	 * about the device's memory usage, orientation, and screen size. You can use this information
	 * to debug your app and learn more about the app's performance.
	 * <br /><br />
	 * The emitter emits an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     name: "Device",                          // The emitter's name
	 *     mem_info: {
	 *         totalFreeMemory: {Number},           // Total free memory, in bytes
	 *         virtualSize: {Number},               // Virtual memory size of the process, in bytes
	 *         residentSize: {Number}               // Resident memory size of the process, in bytes
	 *     },
	 *     interface_orientation: {Orientation},    // Current interface orientation
	 *     device_orientation: {Orientation},       // Current device orientation
	 *     layout: {Number[]}                       // The usable screen width and height
	 * }
	 * </pre>
	 * The <code>Orientation</code> type contains one of the following strings:
	 * <br /><br />
	 * <ul>
	 * <li><code>FaceDown</code>: Oriented with the face of the device down. Used only on iOS.</li>
	 * <li><code>FaceUp</code>: Oriented with the face of the device up. Used only on iOS.</li>
	 * <li><code>LandscapeLeft</code>: Landscape orientation with the top of the device to the
	 * left.</li>
	 * <li><code>LandscapeRight</code>: Landscape orientation with the top of the device to the
	 * right. Used only on iOS and on Android 2.3 and later.</li>
	 * <li><code>Portrait</code>: Portrait orientation.</li>
	 * <li><code>PortraitUpsideDown</code>: Portrait orientation, but rotated 180 degrees. Used only
	 * on iOS and on Android 2.3 and later.</li>
	 * <li><code>Unknown</code>: Orientation could not be determined.</li>
	 * </ul>
	 * @name Device.Diagnostics
	 * @constructs
	 * @augments Core.DiagnosticEmitter
	 * @singleton
	 * @since 1.8
	 */
	initialize: function($super)
	{
	$super('Device');
	}

});
