var Core = require('../Core').Core;

exports.Body = Core.Class.subclass(
/** @lends Physics2.Body.prototype */
{
	classname: 'Body',
	
	/**
	 * @class The <code>Body</code> class constructs instances of application bodies.
	 * Most properties are identical to properties for the <code>b2Body</code> class
	 * of <code>Box2d</code>.
	 * @constructs The default constructor. 
	 * @see <a href="http://www.box2d.org/manual.html">Properties of b2Body</a>
	 * @augments Core.Class 
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._shapes = [];
		this._gl2Node = null;
		this._type = this.Type.Dynamic;
		this._contactFlags = 0;
		this._isSynchronized = false;
		this._isBullet = false;
		this._isAwake = true;
		this._isSleepingAllowed = true;
		this._isFixedRotation = false;
		this._linearDamping = 0;
		this._angularDamping = 0;
		this._position = new Core.Point();
		this._rotation = 0;
		this._linearVelocity = new Core.Vector();
		this._angularVelocity = 0;
		this._world = null;
		this._joints = [];
				
		this._callbackIndexCounter = 1;
		this._callbacks = [];
		
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	destroy: function()
	{
		var shapes = this._shapes;
		while(shapes.length)
		{
			this.removeShape(shapes[0]);
		}
		
		if(this._world)
		{
			this._world.removeBody(this);
		}

		var joints = this._joints;
		while(joints.length)
		{
			this._removeFromJoint(joints[0]);
		}
			
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},
	
	/**
	 * Add a collision shape to this <code>Body</code>.
	 * @example var body = new Physics2.Body();
	 * ...
	 * var shape = new Physics2.BoxShape();
	 * ...
	 * body.addShape(shape);
	 * @param {Physics2.Shape} shape The collision shape to add.
	 * @see Physics2.Body#removeShape
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	addShape: function(shape)
	{
		this._shapes.push(shape);
		shape._body = this;
		this._addShapeSendGen(Core.ObjectRegistry.objectToId(shape));
	},
	
	/**
	 * Remove a collision shape from this <code>Body</code>.
	 * @param {Physics2.Shape} shape The collision shape to remove.
	 * @see Physics2.Body#addShape
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeShape: function(shape)
	{
		var index = this._shapes.indexOf(shape);
		if(index != -1)
			this._shapes.splice(index, 1);
		
		shape._body = null;
		this._removeShapeSendGen(Core.ObjectRegistry.objectToId(shape));
	},
	
	/**
	 * Retrieve the number of collision shapes in this <code>Body</code>.
	 * @returns {Number} The current number of collision shapes.
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getShapeCount: function()
	{
		return this._shapes.length;
	},
	
	/**
	 * Retrieve a collision shape at a specific index of this <code>Body</code>.
	 * @param {Number} index The index from which to retrieve a collision shape.
	 * @returns {Physics2.Shape} The current collision shape retrieved from the specified index.
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getShape: function(index)
	{
		return this._shapes[index];
	},
	
	/**
	 * Retrieve the node this <code>Body</code> is controlling.
	 * @returns {GL2.Node} The current node.
	 * @see Physics2.Body#setGL2Node
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getGL2Node: function()
	{
		return this._gl2Node;
	},
	
	/**
	 * Set the node this <code>Body</code> is controlling.
	 * When the physics simulation moves this <code>Body</code>,
	 * the position and rotation will automatically
	 * apply to the node specified through this call.
	 * @param {GL2.Node} [gl2Node=null] The new node to control.
	 * @returns {this}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setGL2Node: function(gl2Node)
	{
		this._gl2Node = gl2Node;
		this._setGL2NodeSendGen(Core.ObjectRegistry.objectToId(gl2Node));
		return this;
	},
	
	/**
	 * Retrieve the body type for this <code>Body</code>.
	 * @returns {Physics2.Body#Type} The current body type.
	 * @see Physics2.Body#setType
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getType: function()
	{
		return this._type;
	},
	
	/**
	 * Set the body type for this <code>Body</code>.
	 * @example var ground = new Physics2.Body();
	 * ground.setType(Physics2.Body.Type.Static);
	 * @param {Physics2.Body#Type} [type=Dynamic] The new body type.
	 * @returns {this}
	 * @see Physics2.Body#getType
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setType: function(type)
	{
		this._type = type;
		
		if(type == this.Type.Static)
		{
			this._linearVelocity.setAll(0,0);
			this._angularVelocity = 0.0;
		}
		
		this._isAwake = true;
		
		this._setTypeSendGen(type);
		return this;
	},
	
	/**
	 * Retrieve the contact flags for this <code>Body</code>.
	 * @returns {Number} The current number of contact flags.
	 * @see Physics2.Body#setContactFlags
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getContactFlags: function()
	{
		return this._contactFlags;
	},
	
	/**
	 * Set the contact flags for this <code>Body</code>.
	 * Contact flags control the collision dynamics that will generate
	 * contact events for this <code>Body</code>.
	 * @example var body = new Physics2.Body();
	 * body.setContactFlags(Physics2.Body.ContactFlags.Begin);
	 * @param {Physics2.Body#ContactFlags} [flags=none] The new number of contact flags.
	 * @returns {this}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setContactFlags: function(contactFlags)
	{
		this._contactFlags = contactFlags;
		this._setContactFlagsSendGen(contactFlags);
		return this;
	},
	
	/**
	 * Retrieve the synchronization state for this <code>Body</code>.
	 * @returns {Boolean} Returns <code>true</code> if this <code>Body</code> is synchronized.
	 * @see Physics2.Body#setIsSynchronized
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsSynchronized: function()
	{
		return this._isSynchronized;
	},
	
	/**
	 * Set the synchronization state for this <code>Body</code>.
	 * A <code>Body</code> specified through this call will synchronize the position, rotation, linear velocity, and angular
	 * velocity with the physics simulation on the backend.	 
	 * <br /><br />
	 * <b>Note:</b> Synchronized bodies require significantly more processing time than non-synchronized bodies.
	 * Enable this only for bodies that require inspection from application code.
	 * @example var body = new Physics2.Body();
	 * body.setIsSynchronized(true);
	 * @param {Boolean} [isSynchronized=false] Set as <code>true</code> if this <code>Body</code> is synchronized.
	 * If <code>true</code>, <code>getPosition()</code>, <code>getRotation()</code>,
	 * <code>getLinearVelocity()</code>, <code>getAngularVelocity()</code> and 
	 * <code>getIsAwake()</code> return the state of the body on the native backend. If <code>false</code>,
	 * those functions will return the last value passed to the corresponding set function and will not
	 * reflect the current state of the physics simulation.
	 * @returns {this}
	 * @see Physics2.Body#getIsSynchronized
	 * @see Physics2.Body#getPosition
	 * @see Physics2.Body#getRotation
	 * @see Physics2.Body#getLinearVelocity
	 * @see Physics2.Body#getAngularVelocity
	 * @see Physics2.Body#getIsAwake
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setIsSynchronized: function(isSynchronized)
	{
		this._isSynchronized = isSynchronized;
		this._setIsSynchronizedSendGen(isSynchronized);
		return this;
	},
	
	/**
	 * Retrieve whether this <code>Body</code> is a bullet.
	 * @returns {Boolean} Returns <code>true</code> if this <code>Body</code> is a bullet.
	 * @see Physics2.Body#setIsBullet
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsBullet: function()
	{
		return this._isBullet;
	},
	
	/**
	 * Set this <code>Body</code> as a bullet.
	 * @param {Boolean} [isBullet=false] Set as <code>true</code> if this <code>Body</code> is a bullet.
	 * @returns {this}
	 * @see Physics2.Body#getIsBullet
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setIsBullet: function(isBullet)
	{
		this._isBullet = isBullet;
		this._setIsBulletSendGen(isBullet);
		return this;
	},
	
	/**
	 * Retrieve whether this <code>Body</code> is awake.
	 * @returns {Boolean} Returns <code>true</code> if this <code>Body</code>.
	 * @see Physics2.Body#setIsAwake
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsAwake: function()
	{
		return this._isAwake;
	},
	
	/**
	 * Set this <code>Body</code> as awake.
	 * @param {Boolean} [isAwake=true] Set as <code>true</code> if this <code>Body</code> is awake.
	 * @returns {this}
	 * @see Physics2.Body#getIsAwake
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setIsAwake: function(isAwake)
	{
		this._isAwake = isAwake;
		this._setIsAwakeSendGen(isAwake);
		return this;
	},
	
	/**
	 * Retrieve whether sleeping is allowed for this <code>Body</code>.
	 * @returns {Boolean} Returns <code>true</code> if sleeping is allowed.
	 * @see Physics2.Body#setIsSleepingAllowed
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsSleepingAllowed: function()
	{
		return this._isSleepingAllowed;
	},
	
	/**
	 * Set whether this <code>Body</code> is allowed to sleep.
	 * @param {Boolean} [isSleepingAllowed=true] Set as <code>true</code> if sleeping is allowed.
	 * @returns {this}
	 * @see Physics2.Body#getIsSleepingAllowed
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setIsSleepingAllowed: function(isSleepingAllowed)
	{
		this._isSleepingAllowed = isSleepingAllowed;
		this._setIsSleepingAllowedSendGen(isSleepingAllowed);
		return this;
	},
	
	/**
	 * Retrieve whether rotation is fixed for this <code>Body</code>.
	 * @returns {Boolean} Returns <code>true</code> if the rotation is fixed.
	 * @see Physics2.Body#setIsFixedRotation
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getIsFixedRotation: function()
	{
		return this._isFixedRotation;
	},
	
	/**
	 * Set whether rotation is fixed for this <code>Body</code>.
	 * @param {Boolean} [isFixedRotation=false] Returns <code>true</code> if rotation is fixed.
	 * @returns {this}
	 * @see Physics2.Body#getIsFixedRotation
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setIsFixedRotation: function(isFixedRotation)
	{
		this._isFixedRotation = isFixedRotation;
		this._setIsFixedRotationSendGen(isFixedRotation);
		return this;
	},
	
	/**
	 * Retrieve the linear damping amount for this <code>Body</code>.
	 * @returns {Number} The current linear damping amount.
	 * @see Physics2.Body#setLinearDamping
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLinearDamping: function()
	{
		return this._linearDamping;
	},
	
	/**
	 * Set the linear damping amount for this <code>Body</code>.
	 * @param {Number} [linearDamping=0] The new linear damping amount.
	 * @returns {this}
	 * @see Physics2.Body#getLinearDamping
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLinearDamping: function(linearDamping)
	{
		this._linearDamping = linearDamping;
		this._setLinearDampingSendGen(linearDamping);
		return this;
	},
	
	/**
	 * Retrieve the angular damping amount for this <code>Body</code>.
	 * @returns {Number} The current angular damping amount.
	 * @see Physics2.Body#setAngularDamping
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAngularDamping: function()
	{
		return this._angularDamping;
	},
	
	/**
	 * Set the angular damping amount for this <code>Body</code>.
	 * @param {Number} [angularDamping=0] The new angular damping amount.
	 * @returns {this}
	 * @see Physics2.Body#getAngularDamping
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAngularDamping: function(angularDamping)
	{
		this._angularDamping = angularDamping;
		this._setAngularDampingSendGen(angularDamping);
		return this;
	},
	
	/**
	 * Retrieve the position for this <code>Body</code>. If this <code>Body</code> is synchronized,
	 * this call will retrieve the current value from the physics simulation.
	 * @returns {Core.Point} The current position.
	 * @see Physics2.Body#setPosition
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPosition: function()
	{
		return this._position;
	},
	
	/**
	 * Set the position for this <code>Body</code>.
	 * @example var w = Core.Capabilities.getScreenWidth();
	 * var h = Core.Capabilities.getScreenHeight();
	 * ...
	 * var body = new Physics2.Body();
	 * body.setPosition(w/4, h/5);
	 * @param {Core.Point} [position=(0,0)] The new position.
	 * @returns {this}
	 * @see Physics2.Body#getPosition
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setPosition: function(position)
	{
		var p = this._position;
		p.setAll.apply(p, arguments);
		this._setPositionSendGen(p.getX(),p.getY());
		return this;
	},
	
	/**
	 * Retrieve the rotation for this <code>Body</code>. If this <code>Body</code> is synchronized,
	 * this call will retrieve the current value from the physics simulation.
	 * @returns {Core.Point} The current rotation.
	 * @see Physics2.Body#setRotation
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRotation: function()
	{
		return this._rotation;
	},
	
	/**
	 * Set the rotation for this <code>Body</code>.
	 * @example var body = new Physics2.Body();
	 * body.setRotation(5);
	 * @param {Number} [rotation=0] The new rotation.
	 * @returns {this}
	 * @see Physics2.Body#getRotation
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setRotation: function(rotation)
	{
		this._rotation = rotation;
		this._setRotationSendGen(rotation);
		return this;
	},

	/**
	 * Retrieve the linear velocity for this <code>Body</code>. If this <code>Body</code> is synchronized,
	 * this call will retrieve the current value from the physics simulation.
	 * @returns {Core.Vector} The current linear velocity.
	 * @see Physics2.Body#setLinearVelocity
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLinearVelocity: function()
	{
		return this._linearVelocity;
	},
	
	/**
	 * Set the linear velocity for this <code>Body</code>.
	 * @example var body = new Physics2.Body();
	 * body.setLinearVelocity(40, 0);
	 * @param {Core.Vector} [linearVelocity=(0, 0)] The new linear velocity.
	 * @returns {this}
	 * @see Physics2.Body#getLinearVelocity
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLinearVelocity: function(linearVelocity)
	{
		var v = this._linearVelocity;
		v.setAll.apply(v, arguments);
		this._setLinearVelocitySendGen(v.getX(),v.getY());
		return this;
	},
	
	/**
	 * Retrieve the angular velocity of this <code>Body</code>. If this <code>Body</code> is synchronized,
	 * this call will retrieve the current value from the physics simulation.
	 * @returns {Number} The current angular velocity.
	 * @see Physics2.Body#setAngularVelocity
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAngularVelocity: function()
	{
		return this._angularVelocity;
	},
	
	/**
	 * Set the angular velocity of this <code>Body</code>.
	 * @example var body = new Physics2.Body();
	 * ...
	 * var rvel = Math.random() * 12 - 6;
	 * ...
	 * body.setAngularVelocity(rvel);
	 * @param {Number} [angularVelocity=0] The new angular velocity.
	 * @returns {this}
	 * @see Physics2.Body#getAngularVelocity
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAngularVelocity: function(angularVelocity)
	{
		this._angularVelocity = angularVelocity;
		this._setAngularVelocitySendGen(angularVelocity);
		return this;
	},
	
	/**
	 * Set the force an application will apply to this <code>Body</code> at a specific location. The application will continue to apply the specified force
	 * every physics step until reaching a force of <code>0</code>.
	 * @param {Core.Vector} force The force to apply.
	 * @param {Core.Point} point The location point where force is applied.
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	applyForce: function(force, point)
	{
		this._applyForceSendGen(force.getX(),force.getY(),point.getX(),point.getY());
	},
	
	/**
	 * Set the torque an application will apply to this <code>Body</code>. The application will continue to apply the specified torque
	 * every physics step until reaching a toruqe of <code>0</code>.
	 * @param {Number} torque The torque to apply.
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	applyTorque: function(torque)
	{
		this._applyTorqueSendGen(torque);
	},
	
	/**
	 * Apply a one-time impulse to this <code>Body</code> at a specific location. 
	 * @param {Core.Vector} impulse The impulse to apply.
	 * @param {Core.Point} point The location point where the impulse is applied.
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	applyLinearImpulse: function(impulse, point)
	{
		this._applyLinearImpulseSendGen(impulse.getX(),impulse.getY(),point.getX(),point.getY());
	},
	
	/**
	 * Apply a one-time angular impulse. The impulse is designed to generate angular momentum on the <code>Body</code>.
	 * @param {Number} impulse The impulse to apply.
	 * @returns {void}
	 * @status iOS, Android, Flash,  Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	applyAngularImpulse: function(impulse)
	{
		this._applyAngularImpulseSendGen(impulse);
	},
	
	_setIsAwakeRecv: function( cmd ) 
	{
		var msg = {};
		if (!this._setIsAwakeRecvGen(cmd, msg))
			return;
		
		this._isAwake = msg.isAwake;
	},
	
	_synchronizeBodyRecv: function(cmd)
	{
		if (!this._isSynchronized) return;
		var msg = {};
		if(!this._synchronizeBodyRecvGen(cmd, msg))
			return;
		this._position.setAll(msg.px, msg.py);
		this._rotation = msg.rotation;
		this._linearVelocity.setAll(msg.vx, msg.vy);
		this._angularVelocity = msg.angularVelocity;
	},
	
	_didAddToWorld: function(world)
	{
		if(this._world)
			this._world.removeBody(this);
		
		this._world = world;
	},
	
	_willRemoveFromWorld: function(world)
	{
		this._world = null;
	},
	
	_didAddToJoint: function(joint)
	{
		this._joints.push(joint);
	},

	_willRemoveFromJoint: function(joint)
	{
		var index = this._joints.indexOf(joint);
		if(index == -1)
			return;

		this._joints.splice(index,1);
	},

	_removeFromJoint: function(joint)
	{
		this._willRemoveFromJoint(joint);

		if(joint.getBodyA() == this)
		   joint.setBodyA(null);
	   if(joint.getBodyB() == this)
		   joint.setBodyB(null);
	},
	
	getMassDetails: function( callback )
	{
		if (this._type == this.Type.Static)
		{
			callback(new Core.Point(0, 0));
			return;
		}
		
		var id = 0;
		if (callback) {
			id = this._callbackIndexCounter++;
			this._callbacks[id] = callback;
		}
		
		this._getMassDetailsSendGen(id);
	},
	
	_getMassDetailsCommandCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._getMassDetailsCommandCbRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;
		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("_getMassDetailsCommandCbRecv command : No registered callback found, id = " + id);
			return;
		}
		
		delete this._callbacks[id];
		cb(msg.mass, new Core.Point(msg.x, msg.y));
	},
	
	/**
	 * Enumeration for body type.
	 * @name Type
	 * @fieldOf Physics2.Body#
	 */
	
	/**
	 * <code>Body</code> will never move under simulation.
	 * @name Type.Static
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	/**
	 * <code>Body</code> assumes control of velocity and will push dynamic bodies aside.
	 * @name Type.Kinematic
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	/**
	 * <code>Body</code> is under complete control of the simulation.
	 * @name Type.Dynamic
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for contact flags.
	 * @name ContactFlags
	 * @fieldOf Physics2.Body#
	 */
	
	/**
	 * Generate a contact callback when this <code>Body</code> begins touching another 
	 * <code>Body</code>.
	 * @name ContactFlags.Begin
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	/**
	 * Generate a contact callback when this <code>Body</code> stops touching another
	 * <code>Body</code>.
	 * @name ContactFlags.End
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	/**
	 * Generate a contact callback for each simulation step in which this <code>Body</code> is
	 * touching another <code>Body</code>.
	 * @name ContactFlags.Solved
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	/**
	 * Generate a contact callback for all cases.
	 * @name ContactFlags.All
	 * @fieldOf Physics2.Body#
	 * @constant
	 */
	
	
// {{?Wg Generated Code}}
	
	// Enums.
	Type:
	{ 
		Static: 0,
		Kinematic: 1,
		Dynamic: 2
	},
	
	ContactFlags:
	{ 
		Begin: 1,
		End: 2,
		Solved: 4,
		PreSolved: 8,
		All: 15
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 315,
	// Method create = -1
	// Method destroy = 2
	// Method addShape = 3
	// Method removeShape = 4
	// Method setGL2Node = 5
	// Method setType = 6
	// Method setContactFlags = 7
	// Method setIsSynchronized = 8
	// Method setIsBullet = 9
	// Method setIsAwake = 10
	// Method setIsSleepingAllowed = 11
	// Method setIsFixedRotation = 12
	// Method setLinearDamping = 13
	// Method setAngularDamping = 14
	// Method setPosition = 15
	// Method setRotation = 16
	// Method setLinearVelocity = 17
	// Method setAngularVelocity = 18
	// Method applyForce = 19
	// Method applyTorque = 20
	// Method applyLinearImpulse = 21
	// Method applyAngularImpulse = 22
	// Method synchronizeBody = 23
	// Method getMassDetails = 24
	// Method getMassDetailsCommandCb = 25
	
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
				
				case 10:
					instance._setIsAwakeRecv( cmd );
					break;
				case 23:
					instance._synchronizeBodyRecv( cmd );
					break;
				case 25:
					instance._getMassDetailsCommandCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Body._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Body._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[315] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_setIsAwakeRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Body.setIsAwake from command: " + cmd );
			return false;
		}
		
		obj[ "isAwake" ] = Core.Proc.parseBool( cmd[ 0 ] );
		if( obj[ "isAwake" ] === undefined )
		{
			NgLogE("Could not parse isAwake in Body.setIsAwake from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_synchronizeBodyRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 6 )
		{
			NgLogE("Could not parse due to wrong argument count in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "px" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "px" ] === undefined )
		{
			NgLogE("Could not parse px in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "py" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "py" ] === undefined )
		{
			NgLogE("Could not parse py in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "rotation" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "rotation" ] === undefined )
		{
			NgLogE("Could not parse rotation in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "vx" ] = Core.Proc.parseFloat( cmd[ 3 ] );
		if( obj[ "vx" ] === undefined )
		{
			NgLogE("Could not parse vx in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "vy" ] = Core.Proc.parseFloat( cmd[ 4 ] );
		if( obj[ "vy" ] === undefined )
		{
			NgLogE("Could not parse vy in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		obj[ "angularVelocity" ] = Core.Proc.parseFloat( cmd[ 5 ] );
		if( obj[ "angularVelocity" ] === undefined )
		{
			NgLogE("Could not parse angularVelocity in Body.synchronizeBody from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getMassDetailsCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in Body.getMassDetailsCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Body.getMassDetailsCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "mass" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "mass" ] === undefined )
		{
			NgLogE("Could not parse mass in Body.getMassDetailsCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in Body.getMassDetailsCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 3 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in Body.getMassDetailsCommandCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13bffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0002, this );
	},
	
	/** @private */
	_addShapeSendGen: function( shape )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0003, this, [ +shape ] );
	},
	
	/** @private */
	_removeShapeSendGen: function( shape )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0004, this, [ +shape ] );
	},
	
	/** @private */
	_setGL2NodeSendGen: function( gl2Node )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0005, this, [ +gl2Node ] );
	},
	
	/** @private */
	_setTypeSendGen: function( type )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0006, this, [ +type ] );
	},
	
	/** @private */
	_setContactFlagsSendGen: function( contactFlags )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0007, this, [ +contactFlags ] );
	},
	
	/** @private */
	_setIsSynchronizedSendGen: function( isSynchronized )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0008, this, [ ( isSynchronized ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setIsBulletSendGen: function( isBullet )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0009, this, [ ( isBullet ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setIsAwakeSendGen: function( isAwake )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000a, this, [ ( isAwake ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setIsSleepingAllowedSendGen: function( isSleepingAllowed )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000b, this, [ ( isSleepingAllowed ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setIsFixedRotationSendGen: function( isFixedRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000c, this, [ ( isFixedRotation ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setLinearDampingSendGen: function( linearDamping )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000d, this, [ +linearDamping ] );
	},
	
	/** @private */
	_setAngularDampingSendGen: function( angularDamping )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000e, this, [ +angularDamping ] );
	},
	
	/** @private */
	_setPositionSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b000f, this, [ +x, +y ] );
	},
	
	/** @private */
	_setRotationSendGen: function( rotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0010, this, [ +rotation ] );
	},
	
	/** @private */
	_setLinearVelocitySendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0011, this, [ +x, +y ] );
	},
	
	/** @private */
	_setAngularVelocitySendGen: function( angularVelocity )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0012, this, [ +angularVelocity ] );
	},
	
	/** @private */
	_applyForceSendGen: function( fx, fy, px, py )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0013, this, [ +fx, +fy, +px, +py ] );
	},
	
	/** @private */
	_applyTorqueSendGen: function( torque )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0014, this, [ +torque ] );
	},
	
	/** @private */
	_applyLinearImpulseSendGen: function( ix, iy, px, py )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0015, this, [ +ix, +iy, +px, +py ] );
	},
	
	/** @private */
	_applyAngularImpulseSendGen: function( angularImpulse )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0016, this, [ +angularImpulse ] );
	},
	
	/** @private */
	_getMassDetailsSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13b0018, this, [ +callbackId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// addShape: function( shape ) {}
	
	// removeShape: function( shape ) {}
	
	// setGL2Node: function( gl2Node ) {}
	
	// setType: function( type ) {}
	
	// setContactFlags: function( contactFlags ) {}
	
	// setIsSynchronized: function( isSynchronized ) {}
	
	// setIsBullet: function( isBullet ) {}
	
	// _setIsAwakeRecv: function( cmd ) {}
	// setIsAwake: function( isAwake ) {}
	
	// setIsSleepingAllowed: function( isSleepingAllowed ) {}
	
	// setIsFixedRotation: function( isFixedRotation ) {}
	
	// setLinearDamping: function( linearDamping ) {}
	
	// setAngularDamping: function( angularDamping ) {}
	
	// setPosition: function( x, y ) {}
	
	// setRotation: function( rotation ) {}
	
	// setLinearVelocity: function( x, y ) {}
	
	// setAngularVelocity: function( angularVelocity ) {}
	
	// applyForce: function( fx, fy, px, py ) {}
	
	// applyTorque: function( torque ) {}
	
	// applyLinearImpulse: function( ix, iy, px, py ) {}
	
	// applyAngularImpulse: function( angularImpulse ) {}
	
	// _synchronizeBodyRecv: function( cmd ) {}
	// getMassDetails: function( callbackId ) {}
	
	// _getMassDetailsCommandCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
