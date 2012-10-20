var Core = require('../Core').Core;
var Contact = require('./Contact').Contact;
var Body = require('./Body').Body;

exports.World = Core.Class.subclass(
/** @lends Physics2.World.prototype */
{
	classname: 'World',
	
	/**
	 * @class The <code>World</code> class constructs objects that contain application bodies and support simulation stepping.
	 * Most properties are identical to <a href="http://www.box2d.org/manual.html">properties of the b2Body</a> class
	 * of <code>Box2d</code>.<br /><br />
	 * <strong>Note</strong>: The <code>pixelsPerMeter</code> argument was introduced in version
	 * 1.6 and does not exist in earlier versions. Providing a value greater than 1.0 on an
	 * unsupported version of ngCore will result in an exception.
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @param {Number} [pixelsPerMeter=1] The number of pixels that represent a meter in the
	 *		simulation.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function(pixelsPerMeter)
	{
	    // Pixels to meters conversion
        if (pixelsPerMeter === undefined)
        {
            pixelsPerMeter = 1;
        }
        else if (pixelsPerMeter < 1)
        {
            throw new Error('pixelsPerMeter should be greater or equal than one');
        }
        
        this._pixelsPerMeter = Math.floor(pixelsPerMeter);
	    
		this._bodies = [];
		this._timeStep = 1/60;
		this._timeScale = 1;
		this._maxSteps = 5;
		this._velocityIterations = 10;
		this._positionIterations = 10;
		this._gravity = new Core.Vector(0, 9.8 * this._pixelsPerMeter);
		this._debugDrawFlags = 0;
		this._debugDrawGL2Node = null;
		this._contactEmitter = new Core.MessageEmitter();
		this._callbackIndexCounter = 1;
		
		this._callbacks = [];
		
		Core.ObjectRegistry.register(this);

		if ( Core.Capabilities.meetsBinaryVersion("1.6") || ( Core.Capabilities.meetsBinaryVersion("1.3.5.12") && !Core.Capabilities.meetsBinaryVersion("1.4") ) )
		{
			this._createWithScaleSendGen(this.__objectRegistryId, this._pixelsPerMeter);
		}
		else
		{
			if (this._pixelsPerMeter != 1) {
				throw new Error('PixelsPerMeter is not supported on ngCore ' + Core.Capabilities.getBinaryVersion());
			}
			this._createSendGen(this.__objectRegistryId);
		}
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	destroy: function()
	{
		this._contactEmitter.destroy();
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},
	
	/**
	 * Retrieve the time step for this <code>World</code>. 
	 * @returns {Number} The current time step.
	 * @see Physics2.World#setTimeStep
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTimeStep: function()
	{
		return this._timeStep;
	},
	
	/**
	 * Retrieve the number of pixels that represent a meter for this <code>World</code>.
	 * @returns {Number} The current number of pixels per meter.
	 * @since 1.6
	 */
	getPixelsPerMeter: function()
	{
	    return this._pixelsPerMeter;
	},
	
	/**
	 * Set the time step for this <code>World</code>. This method controls how often the physics simulation will perform a time step.
	 * @example var body = new Physics2.Body();
	 * ...
	 * World.setTimeStep(1/30);
	 * @param {Number} [timeStep=1/60] The new time step.
	 * @returns {this}
	 * @see Physics2.World#getTimeStep
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setTimeStep: function(timeStep)
	{
		this._timeStep = timeStep;
		this._setTimeStepSendGen(timeStep);
		return this;
	},
	
	/**
	 * Retrieve the time scale for this <code>World</code>.
	 * @returns {Number} The current time scale.
	 * @see Physics2.World#setTimeScale
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTimeScale: function()
	{
		return this._timeScale;
	},
	
	/**
	 * Set the time scale for this <code>World</code>.
	 * For each simulation step, the amount of time that is
	 * simulated by the physics engine is:
	 * <pre class=code>timeStep * timeScale</pre> 
	 * <b>Note:</b> You must set this value as greater than zero (<i>x</i> > 0). Setting this to a value less than one but greater than zero
	 * will cause the <code>World</code> physics to run slower. Setting this to a value greater than one causes the <code>World</code>
	 * physics to run faster.
	 * @example var world = this._world.getTimeScale();
	 * ...
	 * this._world.setTimeScale(world);
	 * @param {Number} [timeScale=1] The new time scale.
	 * @returns {this}
	 * @see Physics2.World#getTimeScale
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setTimeScale: function(timeScale)
	{
		this._timeScale = timeScale;
		this._setTimeScaleSendGen(timeScale);
		return this;
	},
	
	/**
	 * Retrieve the maximum number of physics steps for this <code>World</code>.
	 * @returns {Number} The current maximum number of physics steps.
	 * @see Physics2.World#setMaxSteps
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getMaxSteps: function()
	{
		return this._maxSteps;
	},
	
	/**
	 * Set the maximum number of physics steps for this <code>World</code>. This method controls the maximum number of
	 * physics steps covered in a single step. This prevents the physics engine from getting too far behind and freezing because it fails to
	 * catch up.
	 * @example var world = new Physics2.World();
	 * ...
	 * world.setMaxStep(3);
	 * @param {Number} [maxSteps=5] The new maxmimum number of physics steps.
	 * @returns {this}
	 * @see Physics2.World#getMaxSteps
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setMaxSteps: function(maxSteps)
	{
		this._maxSteps = maxSteps;
		this._setMaxStepsSendGen(maxSteps);
		return this;
	},
	
	/**
	 * Retrieve the number of velocity iterations for this <code>World</code>.
	 * @returns {Number} The current number of velocity iterations.
	 * @see Physics2.World#setVelocityIterations
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVelocityIterations: function()
	{
		return this._velocityIterations;
	},
	
	/**
	 * Set the number of velocity iterations for this <code>World</code>.
	 * @example var world = new Physics2.World();
	 * ...
	 * world.setVelocityIterations(5);
	 * @param {Number} [velocityIterations=10] The new number of velocity iterations.
	 * @returns {this}
	 * @see Physics2.World#getVelocityIterations
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setVelocityIterations: function(velocityIterations)
	{
		this._velocityIterations = velocityIterations;
		this._setVelocityIterationsSendGen(velocityIterations);
		return this;
	},
	
	/**
	 * Retrieve the number of position iterations for this <code>World</code>.
	 * @returns {Number} The number of position iterations.
	 * @see Physics2.World#setPositionIterations
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPositionIterations: function()
	{
		return this._positionIterations;
	},
	
	/**
	 * Set the number of position iterations for this <code>World</code>.
	 * @example var world = new Physics2.World();
	 * ...
	 * world.setPositionIterations(5);
	 * @param {Number} [positionIterations=10] The new number of position iterations.
	 * @returns {this}
	 * @see Physics2.World#getPositionIterations
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setPositionIterations: function(positionIterations)
	{
		this._positionIterations = positionIterations;
		this._setPositionIterationsSendGen(positionIterations);
		return this;
	},
	
	/**
	 * Retrieve the number of bodies in this <code>World</code>.
	 * @returns {Number} The current number of bodies.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getBodyCount: function()
	{
		return this._bodies.length;
	},
	
	/**
	 * Retrieve a body at a specific index.
	 * @param {Number} index The specified index.
	 * @returns {Physics2.Body} The body to retrieve.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getBody: function(index)
	{
		return this._bodies[index];
	},
	
	/**
	 * Add a body to this <code>World</code>.
	 * @example var p = new Physics2.World(); 
	 * ...
	 * var b = new Physics2.Body();
	 * ...
	 * p.addBody(b);
	 * @param {Physics2.Body} body The body to add.
	 * @see Physics2.World#removeBody
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	addBody: function(body)
	{	
		this._bodies.push(body);
		body._didAddToWorld(this);
		
		this._addBodySendGen(Core.ObjectRegistry.objectToId(body));
	},
	
	/**
	 * Remove a body from this <code>World</code>.
	 * @example var p = new Physics2.World(); 
	 * ...
	 * var b = new Physics2.Body();
	 * ...
	 * p.addBody(b);
	 *...
	 * p.removeBody(b);
	 * @param {Physics2.Body} body The body to remove.
	 * @see Physics2.World#addBody
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeBody: function(body)
	{
		var index = this._bodies.indexOf(body);
		if(index != -1)
		{
			this._bodies.splice(index, 1);
			body._willRemoveFromWorld(this);
		}
		
		this._removeBodySendGen(Core.ObjectRegistry.objectToId(body));
	},
	
	/**
	 * Retrieve the number of debug draw flags for this <code>World</code>.
	 * @returns {Number} The current number of debug draw flags.
	 * @see Physics2.World#setDebugDrawFlags
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getDebugDrawFlags: function()
	{
		return this._debugDrawFlags;
	},
	
	/**
	 * Set the number of debug draw flags for this <code>World</code>.<br /><br />
	 * <b>Note:</b> This value is a bitwise combination of 
	 * <code>DebugDrawFlags</code>.
	 * @example var p = new Physics2.World(); 
	 * ...
	 * p.setDebugDrawFlags(Physics2.World.DebugDrawFlags.Shapes); 
	 * @param {Number} [debugDrawFlags=0] The new number of debug draw flags.
	 * @returns {this}
	 * @see Physics2.World#DebugDrawFlags
	 * @see Physics2.World#getDebugDrawFlags
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setDebugDrawFlags: function(debugDrawFlags)
	{
		if (arguments.length === 0)
			this._debugDrawFlags = 0;
		else
			this._debugDrawFlags = debugDrawFlags;
		
		this._setDebugDrawFlagsSendGen(this._debugDrawFlags);
		
		return this;
	},
	
	/**
	 * Retrieve the debug draw node for this <code>World</code>.
	 * @returns {GL2.Node} The current debug draw node.
	 * @see Physics2.World#setDebugDrawGL2Node
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getDebugDrawGL2Node: function()
	{
		return this._debugDrawGL2Node;
	},
	
	/**
	 * Set the debug draw node for this <code>World</code>. When performing debug drawing,
	 * all of the debug elements will translate as if the elements were children of this node.
	 * This allows debug drawing to accurately maintain camera position, rotation, and scale.
	 * @example var p = new Physics2.World(); 
	 * ...
	 * this._world.setDebugDrawGL2Node(this._root);
	 * @param {GL2.Node} [debugDrawGL2Node=null] The new debug draw node.
	 * @returns {this}
	 * @see Physics2.World#getDebugDrawGL2Node
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setDebugDrawGL2Node: function(debugDrawGL2Node)
	{
		this._debugDrawGL2Node = debugDrawGL2Node;
		
		this._setDebugDrawGL2NodeSendGen(Core.ObjectRegistry.objectToId(debugDrawGL2Node));
		
		return this;
	},
	
	/**
	 * Retrieve the gravity applied to this <code>World</code>.
	 * @returns {Core.Vector} The current gravity applied.
	 * @see Physics2.World#setGravity
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getGravity: function()
	{
		return this._gravity;
	},
	
	/**
	 * Set the gravity applied to this <code>World</code>.
	 * @example var p = new Physics2.World(); 
	 * ...
	 * p.setGravity(0, 98);
	 * @param {Core.Vector} [gravity=(0, 9.8)] The new gravity applied.
	 * @returns {this}
	 * @see Physics2.World#getGravity
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setGravity: function(gravity)
	{
		var g = this._gravity;
		g.setAll.apply(g, arguments);
		
		this._setGravitySendGen(g.getX(),g.getY());
		
		return this;
	},
	
	/**
	 * Retrieve the contact emitter for this <code>World</code>. When contact occurs between two
	 * bodies, and one of the bodies contains contact flags that are configured for that specific
	 * collision, the contact emitter will send a <code>{@link Physics2.Contact}</code> object to
	 * each of its listeners.
	 * @returns {Core.MessageEmitter} The current contact emitter.
	 * @see Physics2.Contact
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getContactEmitter: function()
	{
		return this._contactEmitter;
	},
	
	_contactEventRecv: function(cmd)
	{
		var header = {};
		if( ! this._contactEventRecvGen(cmd, header) )
			return;
		
		var contact = new Contact();
		contact._type = header.type;
		contact._shapeA = Core.ObjectRegistry.idToObject(header.shapeA);
		contact._shapeB = Core.ObjectRegistry.idToObject(header.shapeB);
		contact._timestamp = header.timestamp;
		contact._normal = new Core.Vector(header.nx, header.ny);
		contact._locations = [];
		
		var impulses = (contact._type == Body.ContactFlags.Solved);
		
		for(var i=0; i < header.locationCount; ++i)
		{
			var msg = {};
			if( ! this._contactLocationRecvGen(cmd, msg) )
				return;
			
			var location = new Contact.Location();
			location._position = new Core.Point(msg.px, msg.py);
			
			if(impulses)
			{
				msg = {};
				if( ! this._contactImpulsesRecvGen(cmd, msg) )
					return;

				location._normalImpulse = msg.normalImpulse;
				location._tangentImpulse = msg.tangentImpulse;
			}
			else
			{
				location._normalImpulse = NaN;
				location._tangentImpulse = NaN;
			}
			
			contact._locations.push(location);
		}
		
		this._contactEmitter.emit(contact);
	},
	
	/**
	 * Query this <code>World</code> to identify shapes that intersect with a specified axis-aligned
	 * bounding box (AABB).
	 * @param {Core.Point|Number[]} lowerBound The lower bound of the AABB. Accepts either a
	 *		<code>Core.Point</code> object or an array of two floats.
	 * @param {Core.Point|Number[]} upperBound The upper bound of the AABB. Accepts either a
	 *		<code>Core.Point</code> object or an array of two floats.
	 * @cb {Function} callback The function to execute after performing the query.
	 *		<strong>Note</strong>: If there are no shapes that intersect with the specified AABB,
	 *		the callback function will not be executed.
	 * @cb-param {Object[]} result The shapes that intersect with the specified AABB. The objects in
	 *		the array will all inherit from <code>{@link Physics2.Shape}</code>.
	 * @cb-returns {void}
	 * @param {Number} [maxCount=25] The maximum number of shapes to retrieve.
	 * @returns {void}
	 * @status Flash, Test, FlashTested
	 * @since 1.6
	 */
	queryAABB: function( lowerBound, upperBound, callback, maxCount) {
		if (!(lowerBound instanceof Core.Point)) {
			lowerBound = new Core.Point(lowerBound);
		}
				
		if (!(upperBound instanceof Core.Point)) {
			upperBound = new Core.Point(upperBound);
		}
		
		if ((lowerBound._x === undefined || lowerBound._y === undefined) || 
			(upperBound._x === undefined || upperBound._y === undefined))
		{
			throw new Error("queryAABB requires lower bound and upper bound to be valid points");
		}
		
		if (!(callback instanceof Function)) {
			throw new Error('queryAABB requires a callback function, given: ' + callback);
		}
		
		var callbackId = this._callbackIndexCounter++;
		this._callbacks[callbackId] = callback;
		
		if (maxCount === null) {
			maxCount = 25;
		}
		
		this._queryAABBSendGen( callbackId, lowerBound._x, lowerBound._y, upperBound._x, upperBound._y, maxCount );
	},
	
	_queryAABBEventRecv: function(cmd)
	{
		var header = {};
		if( ! this._queryAABBEventRecvGen(cmd, header) )
			return;
		
		var shapes = [];
		var callback = this._callbacks[header.callbackId];
		delete this._callbacks[header.callbackId];
		
		for(var i=0; i < header.shapeCount; ++i)
		{
			var msg = {};
			if( ! this._queryAABBEventSubCommandRecvGen(cmd, msg) )
				return;
			var shape = Core.ObjectRegistry.idToObject(msg.shape);
			shapes.push(shape);
		}
		
		callback(shapes);
	},
	
	/**
	 * Enumeration to control drawing of <code>Physics2</code> objects for debugging purposes.
	 * @name DebugDrawFlags
	 * @fieldOf Physics2.World#
	 */
	
	/**
	 * Draw all shapes.
	 * @name DebugDrawFlags.Shapes
	 * @fieldOf Physics2.World#
	 * @constant
	 */
	
	/**
	 * Draw all joints.
	 * @name DebugDrawFlags.Joints
	 * @fieldOf Physics2.World#
	 * @constant
	 */
	
	/**
	 * Draw all bounding boxes.
	 * @name DebugDrawFlags.AABBs
	 * @fieldOf Physics2.World#
	 * @constant
	 */
	
	/**
	 * Draw all pairs that overlap in the broad phase.
	 * @name DebugDrawFlags.Pairs
	 * @fieldOf Physics2.World#
	 * @constant
	 */
	
	/**
	 * Draw the center of mass for all bodies.
	 * @name DebugDrawFlags.CenterOfMass
	 * @fieldOf Physics2.World#
	 * @constant
	 */
	
// {{?Wg Generated Code}}
	
	// Enums.
	DebugDrawFlags:
	{ 
		Shapes: 1,
		Joints: 2,
		AABBs: 4,
		Pairs: 8,
		CenterOfMass: 16
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 314,
	// Method create = -1
	// Method destroy = 2
	// Method setTimeStep = 3
	// Method setTimeScale = 4
	// Method setMaxSteps = 5
	// Method setVelocityIterations = 6
	// Method setPositionIterations = 7
	// Method setDebugDrawFlags = 8
	// Method setDebugDrawGL2Node = 9
	// Method addBody = 10
	// Method removeBody = 11
	// Method setGravity = 12
	// Method contactEvent = 13
	// Method contactLocation = 14
	// Method contactImpulses = 15
	// Method queryAABB = 16
	// Method queryAABBEvent = 17
	// Method queryAABBEventSubCommand = 18
	// Method createWithScale = -19
	
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
				
				case 13:
					instance._contactEventRecv( cmd );
					break;
				case 14:
					instance._contactLocationRecv( cmd );
					break;
				case 15:
					instance._contactImpulsesRecv( cmd );
					break;
				case 17:
					instance._queryAABBEventRecv( cmd );
					break;
				case 18:
					instance._queryAABBEventSubCommandRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in World._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in World._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[314] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_contactEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 7 )
		{
			NgLogE("Could not parse due to wrong argument count in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "type" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "type" ] === undefined )
		{
			NgLogE("Could not parse type in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "shapeA" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "shapeA" ] === undefined )
		{
			NgLogE("Could not parse shapeA in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "shapeB" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "shapeB" ] === undefined )
		{
			NgLogE("Could not parse shapeB in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "timestamp" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "timestamp" ] === undefined )
		{
			NgLogE("Could not parse timestamp in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "nx" ] = Core.Proc.parseFloat( cmd[ 4 ] );
		if( obj[ "nx" ] === undefined )
		{
			NgLogE("Could not parse nx in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "ny" ] = Core.Proc.parseFloat( cmd[ 5 ] );
		if( obj[ "ny" ] === undefined )
		{
			NgLogE("Could not parse ny in World.contactEvent from command: " + cmd );
			return false;
		}
		
		obj[ "locationCount" ] = Core.Proc.parseInt( cmd[ 6 ] );
		if( obj[ "locationCount" ] === undefined )
		{
			NgLogE("Could not parse locationCount in World.contactEvent from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 7);
		return true;
	},
	
	/** @private */
	_contactLocationRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in World.contactLocation from command: " + cmd );
			return false;
		}
		
		obj[ "px" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "px" ] === undefined )
		{
			NgLogE("Could not parse px in World.contactLocation from command: " + cmd );
			return false;
		}
		
		obj[ "py" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "py" ] === undefined )
		{
			NgLogE("Could not parse py in World.contactLocation from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/** @private */
	_contactImpulsesRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in World.contactImpulses from command: " + cmd );
			return false;
		}
		
		obj[ "normalImpulse" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "normalImpulse" ] === undefined )
		{
			NgLogE("Could not parse normalImpulse in World.contactImpulses from command: " + cmd );
			return false;
		}
		
		obj[ "tangentImpulse" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "tangentImpulse" ] === undefined )
		{
			NgLogE("Could not parse tangentImpulse in World.contactImpulses from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/** @private */
	_queryAABBEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in World.queryAABBEvent from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in World.queryAABBEvent from command: " + cmd );
			return false;
		}
		
		obj[ "shapeCount" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "shapeCount" ] === undefined )
		{
			NgLogE("Could not parse shapeCount in World.queryAABBEvent from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/** @private */
	_queryAABBEventSubCommandRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 1 )
		{
			NgLogE("Could not parse due to wrong argument count in World.queryAABBEventSubCommand from command: " + cmd );
			return false;
		}
		
		obj[ "shape" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "shape" ] === undefined )
		{
			NgLogE("Could not parse shape in World.queryAABBEventSubCommand from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 1);
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13affff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0002, this );
	},
	
	/** @private */
	_setTimeStepSendGen: function( timeStep )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0003, this, [ +timeStep ] );
	},
	
	/** @private */
	_setTimeScaleSendGen: function( timeScale )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0004, this, [ +timeScale ] );
	},
	
	/** @private */
	_setMaxStepsSendGen: function( maxSteps )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0005, this, [ +maxSteps ] );
	},
	
	/** @private */
	_setVelocityIterationsSendGen: function( velocityIterations )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0006, this, [ +velocityIterations ] );
	},
	
	/** @private */
	_setPositionIterationsSendGen: function( positionIterations )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0007, this, [ +positionIterations ] );
	},
	
	/** @private */
	_setDebugDrawFlagsSendGen: function( debugDrawFlags )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0008, this, [ +debugDrawFlags ] );
	},
	
	/** @private */
	_setDebugDrawGL2NodeSendGen: function( debugDrawGL2Node )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0009, this, [ +debugDrawGL2Node ] );
	},
	
	/** @private */
	_addBodySendGen: function( body )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a000a, this, [ +body ] );
	},
	
	/** @private */
	_removeBodySendGen: function( body )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a000b, this, [ +body ] );
	},
	
	/** @private */
	_setGravitySendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a000c, this, [ +x, +y ] );
	},
	
	/** @private */
	_queryAABBSendGen: function( callbackId, lbx, lby, ubx, uby, maxCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13a0010, this, [ +callbackId, +lbx, +lby, +ubx, +uby, +maxCount ] );
	},
	
	/** @private */
	$_createWithScaleSendGen: function( __objectRegistryId, pixelsPerMeter )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13affed, [ +__objectRegistryId, +pixelsPerMeter ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setTimeStep: function( timeStep ) {}
	
	// setTimeScale: function( timeScale ) {}
	
	// setMaxSteps: function( maxSteps ) {}
	
	// setVelocityIterations: function( velocityIterations ) {}
	
	// setPositionIterations: function( positionIterations ) {}
	
	// setDebugDrawFlags: function( debugDrawFlags ) {}
	
	// setDebugDrawGL2Node: function( debugDrawGL2Node ) {}
	
	// addBody: function( body ) {}
	
	// removeBody: function( body ) {}
	
	// setGravity: function( x, y ) {}
	
	// _contactEventRecv: function( cmd ) {}
	// _contactLocationRecv: function( cmd ) {}
	// _contactImpulsesRecv: function( cmd ) {}
	// queryAABB: function( callbackId, lbx, lby, ubx, uby, maxCount ) {}
	
	// _queryAABBEventRecv: function( cmd ) {}
	// _queryAABBEventSubCommandRecv: function( cmd ) {}
	// $createWithScale: function( __objectRegistryId, pixelsPerMeter ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
