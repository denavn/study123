////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// GL2 diagnostic emitter; collects info from GL2 subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

//
// Create and export a DiagnosticEmitter for GL2.
//

var Diagnostics = exports.Diagnostics = Core.DiagnosticEmitter.singleton(
    /** @lends GL2.Diagnostics.prototype */
{
    classname: 'GL2_Diagnostics',

    /**
     * @class the <code>GL2.Diagnostics</code> class constructs a singleton object
     * that emits detailed GL2 diagnostic information to its listeners.
     *
     * The emitter currently emits an object of the form:
     * <pre>
     *  {
     *      "name":"GL2",                  // Emitter name, 'GL2'
     *
     *      "graph_nodes": {Number},       // Number of nodes in the scene graph
     *
     *      "gl2_scene_time":{             // A Timer object reporting total time traversing the scene:
     *           "samples": {Number},      // Number of timer executions captured this interval
     *           "average": {Number},      // Average time spent in the timed block
     *           "min": {Number},          // Minimum time spent in the timed block
     *           "max": {Number}           // Maximum time spent in the timed block
     *      },                             // Other {Timer} below are identical.
     *
     *      "gl2_touch_time":{Timer},      // Time spent processing Touch events
     *
     *      "ngfx_last_frame":{                // Object containing ngfx statistics from the last frame:
     *          "total_vertices": {Number},    // Total vertices drawn
     *          "total_primitives": {Number},  // Total number of GL2.Primitives drawn
     *          "total_indices": {Number},     // Total number of indices processed over all primitives
     *          "total_draw_calls": {Number}   // Total number of times draw calls were made into GL.
     *      },
     *
     *      "ngfx_texture_info":{              // Object containing info on currently loaded textures:
     *          "total_bytes": {Number},       // Total size of all loaded textures
     *          "num_textures_total":{Number}, // Number of textures loaded
     *          "num_textures_by_size":{       // Object containing a breakdown of how many of each size:
     *              {String} : {Number},       // Entries of the form "'nnnn bytes': m, ..."
     *              ...
     *          }
     *      },
     *
     *      "gl2_animations": {                // Object containing information about loaded Animations:
     *          "motion_controllers": {        // Object containing GL2.MotionController info:
     *              "num_total": {Number}      // Total number of motion controllers
     *              "num_playing": {Number},   // Number of motion controllers currently playing
     *          },
     *
     *          "motion_data": {               // Object containing GL2.MotionData info:
     *              "num_total": {Number},     // Total number of MotionData objects created
     *              "total_size": {Number}     // Total heap bytes consumed by MotionData objects
     *          }
     *      }
     *  }
     * </pre>
     * @name GL2.Diagnostics
     * @augments Core.DiagnosticEmitter
     * @constructs
     * @singleton
     * @since 1.7
     */

    initialize: function($super)
    {
	$super('GL2');
    }

});

