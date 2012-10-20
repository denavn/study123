////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Network diagnostic emitter; collects info from Network subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

//
// Create and export a DiagnosticEmitter for Network.
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
	classname: 'Network_Diagnostics',

	/**
	 * @class The <code>Network.Diagnostics</code> class provides detailed diagnostic information
	 * about classes in the <code>Network</code> module. You can use this information to debug your
	 * app's use of the <code>Network</code> module and learn more about the app's performance.
	 * <br /><br />
	 * The emitter emits an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     name: "Network",         // The emitter's name
	 *     socket_fds: {Number},    // Number of file descriptors used by network sockets
	 *     bytes_in: {Number},      // Total amount of data read, in bytes (excluding headers)
	 *     bytes_out: {Number},     // Total amount of data sent, in bytes (excluding headers)
	 *     bps_in: {Number},        // Current instantaneous download rate, in bits per second
	 *     bps_out: {Number},       // Current instantaneous upload rate, in bits per second
	 *     downloads: {Requests},   // Information about file downloads
	 *     xhr: {Requests}          // Information about Network.XHR requests
	 * }
	 * </pre>
	 * The <code>Requests</code> type is an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     complete: {Number},  // Number of completed requests
	 *     current: {Number},   // Number of requests in progress
	 *     failed: {Number}     // Number of failed downloads
	 * }
	 * </pre>
	 * @name Network.Diagnostics
	 * @constructs
	 * @augments Core.DiagnosticEmitter
	 * @singleton
	 * @since 1.8
	 */
	initialize: function($super)
	{
	$super('Network');
	}

});
