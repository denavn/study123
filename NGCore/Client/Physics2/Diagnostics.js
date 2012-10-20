////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// Physics2 diagnostic emitter; collects info from Physics2 subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////
    
//
// Create and export a DiagnosticEmitter for Physics2.
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
    classname: 'Physics2_Diagnostics',

	/**
	 * @class The <code>Physics2.Diagnostics</code> class provides detailed diagnostic information
	 * about classes in the <code>Physics2</code> module. You can use this information to debug your
	 * app's physics and learn more about the app's performance.
	 * <br /><br />
	 * The emitter emits an object of the form:
	 * <br /><br />
	 * <pre>
	 * {
	 *     name: "Physics2",                // The emitter's name
	 *     collision_rate: {Number},        // The number of collisions per second
	 *     num_bodies: {
	 *         total: {Number},             // The total number of bodies.
	 *         synchonized: {Number},       // The number of synchronized bodies.
	 *         awake: {Number},             // The number of bodies that are awake.
	 *         by_type: {
	 *             kinematic: {Number},     // The number of kinematic bodies.
	 *             dynamic: {Number},       // The number of dynamic bodies.
	 *             static: {Number}         // The number of static bodies.
	 *         }
	 *     },
	 *     num_shapes: {Number},            // The total number of shapes.
	 *     num_joints: {Number},            // The total number of joints.
	 *     num_contacts: {Number}           // The total number of contacts.
	 * }
	 * </pre>
	 * @name Physics2.Diagnostics
	 * @constructs
	 * @augments Core.DiagnosticEmitter
	 * @singleton
	 * @since 1.8
	 */
	
	initialize: function($super)
	{
	$super('Physics2');
	}

});
