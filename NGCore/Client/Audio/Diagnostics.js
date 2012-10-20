////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Audio diagnostic emitter; collects info from Audio subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////
    
//
// Create and export a DiagnosticEmitter for Audio.
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
	classname: 'Audio_Diagnostics',

	/**
	 * @class The <code>Audio.Diagnostics</code> class provides detailed diagnostic information
	 * about classes in the <code>Audio</code> module. You can use this information to debug your
	 * app's use of the <code>Audio</code> module and learn more about the app's performance.
	 * <br /><br />
	 * The emitter emits an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     name: "Audio",                       // The emitter's name
	 *     effects: {
	 *         count: {Number},                 // Total number of effects
	 *         effectPaths: {String[]}          // Paths to the effects
	 *     },
	 *     volume: {Number},                    // Audio volume, from 0 (muted) to 1 (full volume)
	 *     audio_update_time: {Timer}           // Time spent processing effects
	 *     audio_update_detached_time: {Timer}, // Time spent processing detached sounds
	 *     audio_update_music_time: {Timer},    // Time spent processing music
	 *     activeEffects: {
	 *         count: {Number}                  // Number of ActiveEffect objects
	 *     },
	 *     detachedSounds: {                    // Number of detached sounds
	 *         count: {Number}
	 *     },
	 *     music: {
	 *         filename: {String},              // Path to the background music file
	 *         isPlaying: {Boolean},            // Set to true if the background music is playing
	 *         volume: {Number},                // Background music volume, from 0 (muted) to 1 (full volume)
	 *         currentTime: {Number}            // Elapsed playback time, in milliseconds
	 *     },
	 *     totalMemory: {Number}                // Total memory, in bytes, used for music and effects
	 * }
	 * </pre>
	 * The <code>Timer</code> type is an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     samples: {Number},   // Number of samples that were captured
	 *     average: {Number},   // Average time spent in the timed block
	 *     min: {Number},       // Minimum time spent in the timed block
	 *     max: {Number}        // Maximum time spent in the timed block
	 * }
	 * </pre>
	 * @name Audio.Diagnostics
	 * @constructs
	 * @augments Core.DiagnosticEmitter
	 * @singleton
	 * @since 1.8
	 */
	
	initialize: function($super)
	{
	$super('Audio');
	this._includeDetails = false;
	},

	/**
	 * @this Diagnostics
	 * @private
	 */
	includeDetails: function()
	{
		return this._includeDetails;
	}
});
