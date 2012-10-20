////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Core diagnostic emitter; collects info from Core subsystem and also collects 
// general info.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var DiagnosticEmitter = require('./DiagnosticEmitter').DiagnosticEmitter;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;

////////////////////////////////////////////////////////////////////////////////
    
//
// Create and export a DiagnosticEmitter for Core.  Other modules should do this 
// this way too.
//

exports.Diagnostics = DiagnosticEmitter.singleton(
/** @lends Core.Diagnostics.prototype */
{
    classname: 'Core_Diagnostics',

    /**
     * @class The <code>Core.Diagnostics</code> class constructs a singleton object
     * to obtain overall frame tick diagnostic timing information and other diagnostics
     * generally applicable to the frame processing itself.  Other modules implement
     * module-specific detailed diagnostics.<br/><br/>
	 *
     * The emitter currently emits an object of the form:
     * <pre>
     *     {
     *         "name": "Core",             // The name of the emitter
     * 
     *         "frame": {Number},           // Frame number for which these Diagnostics apply.
     *         "fps": {Number},             // Instantaneous fps rate over the last sampling interval
     *         "skipped": {Number},         // Frames skipped in the last interval
     *         "skipped_fps": {Number},     // Instantaneous skipped fps rate over last interval
     * 
     *         "frame_total": {Timer},     // A Timer object reporting total time processing the frame:
     *                                     // See below for the object definition of Timer.
     *
     *         "tick_total": {Timer},      // Total time spent processing the current engine tick.
     *         "draw_total": {Timer},      // Total time spent drawing.
     *         "game_tick": {Timer},       // Total time spent executing the game JS.
     *         "priv_tick": {Timer},       // Total time spent executing the privileged JS.
     *         "app_tick": {Timer},        // Total time spent ticking the Application object.
     *         "physics_tick": {Timer},    // Total time spent in Physics.
     *         "audio_tick": {Timer},      // Total time spent in Audio.
     *         "motion_tick": {Timer},     // Total time spent processing motion input.
     *         "animations_tick": {Timer}  // Total time spent processing Animations.
     *     }
     * </pre>
     *
     * A Timer is an object of the form:
     * <pre>
     *      {
     *         "samples": {Number},        // number of timer executions captured this interval
     *         "average": {Number},        // average time spent in the timed block
     *         "min": {Number},            // minimum time spent in the timed block
     *         "max": {Number}             // maximum time spent in the timed block
     *      }
     * </pre>
     * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.DiagnosticEmitter
	 * @since 1.7
     */
    initialize: function($super) 
    {
	$super('Core');
    }
});

