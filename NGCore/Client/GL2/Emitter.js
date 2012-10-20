////////////////////////////////////////////////////////////////////////////////
// Class Emitter
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;
var Node = require('./Node').Node;
var EmitterData = require('./EmitterData').EmitterData;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

////////////////////////////////////////////////////////////////////////////////

var Emitter = exports.Emitter = Node.subclass(
/** @lends GL2.Emitter.prototype */
{
	classname: 'Emitter',

	/**
	 * @class The `GL2.Emitter` class is a `{@link GL2.Node}` that can play a particle effect defined by a `{@link GL2.EmitterData}` object.
	 *
	 * `{@link GL2.EmitterData}` objects are associated with the `Emitter` using the 
	 * `setData` method. Once `EmitterData` is associated with the Emitter, the particle
	 * effect can be played by calling the `play` method or stopped by using the `stop` 
	 * method. The application can be notified when the particle system has stopped emitting 
	 * particles by registering a callback with the `onDoneCallback` method.
	 * Similarly, the application can be notified when all the particles in the system 
	 * have been killed (i.e. no longer visible) by using the `onDeadCallback` method.
	 *
	 * All particles in the system are relative to the `Emitter` object's position, scale, 
	 * and  rotation, which can be changed using the `setPosition`, `setScale`, and 
	 * `setRotation` methods inherited from the {@link GL2.Node} base class.
	 * @name GL2.Emitter
	 * @constructs The default constructor.
	 * @augments GL2.Node
	 * @since 1.8
	 */
	initialize: function () {

	},

    /**
     * Destroys this GL2.Emitter. When using objects with
     * a native counterpart, you must explicitly destroy them to avoid leaking memory.
     * @returns {void}
     * @since 1.8
     * @status iOS, Android, Flash
     */
	destroy: function () {

	},

	/**
	 * Begins playback of the particle system.
     * @returns {void}
     * @since 1.8
     * @status iOS, Android, Flash
	 */
	play: function () {
		this._playSendGen();
	},

	/**
	 * Stops playback of the particle system.
	 * 
     * @returns {void}
     * @param {GL2.Emitter.StopMode} stopMode Determines whether to stop emitting particles 
     * _and_ stop playback or to stop emitting particles and allow individual particles to
     * complete their playback cycle.
     * @since 1.8
     * @status iOS, Android, Flash
     * @see GL2.Emitter#StopMode
	 */
	stop: function (stopMode) {
/*#if TYPECHECK
		var verifyStopMode = function (i) {
			if (i !== undefined && i !== Emitter.StopMode.Soft &&
			    i !== Emitter.StopMode.Hard) {
				return '' + i + ' is not a valid StopMode';
			}
		};
		T.validateArgs(arguments, [T.OptionalArg('integer', verifyStopMode)]);
#endif*/
		var mode = (stopMode === undefined) ? Emitter.StopMode.Soft : stopMode;

		this._stopSendGen(mode);
	},

	/**
	 * Associates a `{@link GL2.EmitterData}` object with this `Emitter`.
	 * This is required for play and stop to function.
     * @returns {void}
     * @param {GL2.EmitterData} data An `EmitterData` object describing the behavior of the particle system.
     * @since 1.8
     * @status iOS, Android, Flash
	 */
	setData: function (data) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(EmitterData)]);
#endif*/
		this._setDataSendGen(data.__objectRegistryId);
	},

	/**
	 * Registers a user defined callback function that will be called when this emitter 
	 * stops emitting particles.
     * @returns {void}
     * @cb {Function} doneCallback The function that will be called upon completion of the animation
     * @cb-param {GL2.Emitter} emitter The emitter which triggered the callback
     * @cb-returns {void}
     * @since 1.8
     * @status iOS, Android, Flash
	 */
	setDoneCallback: function (doneCallback)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('function')]);
#endif*/
		this._doneCallback = doneCallback;
	},

	/**
	 * Registers a user defined callback function that will be called when all of this 
	 * emitter's particles have finished their playback cycle.
     * @returns {void}
     * @cb {Function} deadCallback
     * @cb-param {GL2.Emitter} emitter The emitter which triggered the callback
     * @cb-returns {void}
     * @since 1.8
     * @status iOS, Android, Flash
	 */
	setDeadCallback: function (deadCallback)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('function')]);
#endif*/
		this._deadCallback = deadCallback;
	},

	/**
	 * @private
	 */
	_invokeDoneCallbackRecv: function () {
		if (this._doneCallback)
			this._doneCallback(this);
	},

	/**
	 * @private
	 */
	_invokeDeadCallbackRecv: function () {
		if (this._deadCallback)
			this._deadCallback(this);
	},
	
	/**
	 * Enumeration for stop modes.
	 * @name StopMode
	 * @fieldOf GL2.Emitter#
	 * @see GL2.Emitter#stop
	 */
	/**
	 * The system will stop emitting particles. Any existing particles will continue to play to
	 * completion.
	 * @name StopMode.Soft
	 * @fieldOf GL2.Emitter#
	 * @constant
	 */
	/**
	 * The system will stop emitting particles. All existing particles will immediately stop as
	 * well.
	 * @name StopMode.Hard
	 * @fieldOf GL2.Emitter#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	StopMode:
	{ 
		Soft: 0,
		Hard: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 368,
	// Method create = -1
	// Method destroy = 2
	// Method setData = 3
	// Method play = 4
	// Method stop = 5
	// Method invokeDoneCallback = 6
	// Method invokeDeadCallback = 7
	
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
				
				case 6:
					instance._invokeDoneCallbackRecv( cmd );
					break;
				case 7:
					instance._invokeDeadCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Emitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Emitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[368] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_invokeDoneCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in Emitter.invokeDoneCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_invokeDeadCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in Emitter.invokeDeadCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( id )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x170ffff, [ +id ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1700002, this );
	},
	
	/** @private */
	_setDataSendGen: function( emitterDataId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1700003, this, [ +emitterDataId ] );
	},
	
	/** @private */
	_playSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1700004, this );
	},
	
	/** @private */
	_stopSendGen: function( stopMode )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1700005, this, [ +stopMode ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( id ) {}
	
	// destroy: function(  ) {}
	
	// setData: function( emitterDataId ) {}
	
	// play: function(  ) {}
	
	// stop: function( stopMode ) {}
	
	// _invokeDoneCallbackRecv: function( cmd ) {}
	// _invokeDeadCallbackRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
