var Core = require('../Core').Core;

var Touch = exports.Touch = Core.Class.subclass(
/** @lends GL2.Touch.prototype */
{
	classname: 'Touch',

	/**
	 * @class The `GL2.Touch` class provides objects that identify touch events and track a finger's
	 * movement across the device's screen. `GL2.Touch` objects are created by a
	 * `{@link GL2.TouchTarget}` object's touch emitter, then passed to the emitter's message
	 * listener. See `{@link GL2.TouchTarget#getTouchEmitter}` for details about creating a message
	 * listener for a touch emitter.
	 *
	 * **Note**: Do not instantiate this class directly.
	 * @constructs
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		this._id = 0;
		this._action = {};
		this._position = new Core.Point();
		this._targetIds = null;
		this._targetIdMap = {};
	},

	/**
	 * Retrieve a list of touch targets that are tracking the touch object's events.
	 * @returns {GL2.TouchTarget[]} An array of touch targets that are tracking the touch object's
	 *		events.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTouchTargets: function()
	{
		var ids = this._targetIds;
		var result = [];
		if (ids) {
			for(var i = 0; i < ids.length; i++)
			{
				var t = Core.ObjectRegistry.idToObject(ids[i]);
				if(t) result.push(t);
			}
		}
		return result;
	},

	/**
	 * Determine whether the user's initial touch fell within the specified touch target.
	 * @param {GL2.TouchTarget} touchTarget The touch target to evaluate.
	 * @returns {Boolean} Set to `true` if the user's initial touch fell within the touch target.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getIsInside: function(touchTarget)
	{
		// Check if the object's id is in the touchtargets map
		return ( Core.ObjectRegistry.objectToId(touchTarget) in this._targetIdMap);
	},

	/**
	 * Retrieve the touch object's current position within the global scene's coordinate space.
	 * @returns {Core.Point} The position of the touch object within the global scene's coordinate
	 *		space.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPosition: function()
	{
		return this._position;
	},

	/**
	 * Retrieve the touch object's unique ID.
	 *
	 * **Note**: Do not use this ID as an index to an array. The ID is often a very large number,
	 * and using it as an array index can cause JavaScript to allocate a much larger array than
	 * necessary.
	 * @returns {Number} The touch object's unique id.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getId: function()
	{
		return this._id;
	},

	/**
	 * Retrieve the current phase of the touch event that the touch object is tracking. Call this
	 * method from the touch emitter's listener. See `{@link GL2.TouchTarget#getTouchEmitter}` for
	 * an example of how to use this method.
	 *
	 * If this method returns the value `{@link GL2.Touch#Action.Start}`, the touch emitter's
	 * listener can capture the event by returning `true` from the event handler. If the event
	 * handler returns `true`, the emitter continues to fire throughout the touch event. If the
	 * event handler does not return `true`, the event propagates downwards to other touch targets.
	 * @returns {GL2.Touch#Action} The current phase of the touch event that the touch object is
	 *		tracking.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAction: function()
	{
		return this._action;
	},

	_setId: function(id)
	{
		this._id = id;
	},

	_setAction: function(action)
	{
		this._action = action;
	},

	_setPosition: function(position)
	{
		this._position.setAll(arguments);
	},

	_setTargetIds: function(targetIds)
	{
		// We transfer the array of numeric target IDs into a
		// map so we can support getIsInside call which uses 'in'.
		this._targetIds = targetIds.slice();
		this._targetIdMap = {};
		for (var i = 0; i < targetIds.length; i++)
			this._targetIdMap[targetIds[i]] = null;
	},

	/**
	 * Enumeration for the phases of a touch event.
	 * @name Action
	 * @fieldOf GL2.Touch#
	 */

	/**
	 * The user's finger started touching the screen.
	 * @name Action.Start
	 * @fieldOf GL2.Touch#
	 * @constant
	 */

	/**
	 * The user's finger stopped touching the screen.
	 * @name Action.End
	 * @fieldOf GL2.Touch#
	 * @constant
	 */

	/**
	 * The user's finger moved to a new location on the screen.
	 * @name Action.Move
	 * @fieldOf GL2.Touch#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Action:
	{ 
		Start: 0,
		End: 1,
		Move: 2
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 312,
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Touch._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Touch._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[312] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
