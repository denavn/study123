var Class = require('./Class').Class;
var MessageListener = require('./MessageListener').MessageListener;

exports.MessageEmitter = Class.subclass(
/** @lends Core.MessageEmitter.prototype */
{
	classname: 'MessageEmitter',
	
	/**
	 * @class The <code>MessageEmitter</code> class constructs emitter objects that send messages to registered <code>{@link Core.MessageListener}</code> objects. 
	 * When a defined condition triggers an emitter, all registered listener objects are in turn triggered.
	 * <br /><br />
	 * Emitter objects support two communication modes: emit and chain. When emitting, each listener is called in turn.
	 * When chaining, each listener can halt the propagation of a message to 
	 * other listeners by returning <code>true</code> from their callback.
	 * <br /><br />
	 * Each listener can include an optional priority ranking. Priority determines the order
	 * in which an emitter calls each listener. 
	 * If two listener objects are registered with the same priority, the emitter calls them in the order they were registered. 
	 * The default priority is <code>0</code>. 
	 * <br /><br />
	 * The classes in ngCore provide a variety of built-in message emitters. For example, if an
	 * application adds a listener to <code>{@link Device.ShakeEmitter}</code>, the listener will
	 * receive a message when the user shakes the device. You can also use the
	 * <code>MessageEmitter</code> class to create custom message emitters for your application.
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @since 1.0
	 * @status iOS, Android, Flash
	 */
	initialize: function()
	{
		this._messageListenersCount = 0;
		this._messageListenerRecords = [];
		this._messageDeferredWork = [];
		this._messageShouldDefer = false;
	},
	
	/**
	 * Unregister all <code>MessageListener</code> objects from this <code>MessageEmitter</code>.<br /><br />
	 * <b>Note:</b> Do not use the emitter after calling this.
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function($super)
	{
		if(this._messageShouldDefer)
		{
			this._messageDeferredWork.push(this._destroyActual.bind(this, $super));
		}
		else
		{
			this._destroyActual($super);
		}
	},
	
	_destroyActual: function(superDestroy)
	{
		// Unregister all listeners.
		var records = this._messageListenerRecords;
		while(records.length)
		{
			this.removeListener(records[0].l);
		}
		
		if(superDestroy)
			superDestroy();
	},
	
	/**
	 * Retrieve the number of <code>MessageListener</code> objects registered with this <code>MessageEmitter</code>.
	 * @returns {Number} The current number of <code>MessageListener</code> objects.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getListenerCount: function()
	{
		return this._messageListenersCount;
	},
	
	/**
	 * Add a <code>MessageListener</code> to this <code>MessageEmitter</code>. When an application calls <code>emit()</code> 
	 * or <code>chain()</code> 
	 * on this emitter, a callback function passed as a parameter is called on the specified listener.
	 * The parameters for the callback function are identical to parameters for <code>emit()</code> or
	 * <code>chain()</code>.
	 * <br /><br />
	 * <b>Note:</b> Each listener can only listen to an emitter one time.<br /><br />
	 * The following code examples illustrate different call styles for <code>addListener()</code>.
	 *
	 * @example
	 * emitter.addListener(myListener, myListener.onCallback);
	 *
	 * @example
	 * emitter.addListener(myListener, myListener.onEvent, 200);
	 *
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to add.
	 * @cb {Function} func The function to call when an application triggers this emitter. The
	 *		callback function can accept any number of parameters. All parameters that are passed to
	 *		<code>emit()</code> or <code>chain()</code> will be passed to the callback function.
	 * @cb-returns {void}
	 * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
	 * @throws {Error} The specified listener is already listening to the emitter.
	 * @throws {Error} The specified listener is not an instance of <code>Core.MessageListener</code>.
	 * @see Core.MessageEmitter#removeListener
	 * @see Core.MessageEmitter#emit
	 * @see Core.MessageEmitter#chain
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	addListener: function(listener, func, priority)
	{
		if(!listener instanceof MessageListener)
			throw new Error('MessageEmitter.addListener: listener must be instances of MessageListener');
			
		if(!listener._startListeningEmitter(this))
			throw new Error('MessageEmitter.addListener: listener is already listening');
			
		if(!priority)
		{
			priority = 0;
		}
		
		this._messageListenersCount++;	
		if(this._messageShouldDefer)
		{
			this._messageDeferredWork.push(this._addListenerActual.bind(this, listener, func, priority));
		}
		else
		{
			this._addListenerActual(listener, func, priority);
		}
	},
	
	_addListenerActual: function(listener, func, priority)
	{
		//  The priority for default value is <code>0</code>
		if ((typeof priority) == 'undefined') {
			priority = 0;
		}
		// TODO Replace with binary search.
		var records = this._messageListenerRecords;
		var len = records.length;
		for(var i=0; i < len; ++i)
		{
			if(records[i].p <= priority)
				break;
		}
		records.splice(i, 0, {l: listener, f: func, p: priority});
	},
	
	/**
	 * Remove a <code>MessageListener</code> from this <code>MessageEmitter</code>.<br /><br /> 
	 * @example
	 * emitter.removeListener(myListener);
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to remove.
	 * @returns {Boolean} Returns <code>true</code> if the registered listener was removed. Returns <code>false</code> if the registered listener is not found 
	 * or is not registered with this emitter.
	 * @see Core.MessageEmitter#addListener
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeListener: function(listener)
	{
		if(!listener._stopListeningEmitter(this))
			//throw new Error('MessageEmitter.removeListner: listener is not listening');
			return false;
		
		this._messageListenersCount--;
		if(this._messageShouldDefer)
		{
			// TODO Replace with binary search.
			var records = this._messageListenerRecords;
			var len = records.length;
			for(var i=0; i < len; ++i)
			{
				var record = records[i];
				if(record.l == listener)
				{
					record.f = null;
					break;
				}
			}
			
			this._messageDeferredWork.push(this._removeListenerActual.bind(this, listener));
		}
		else
		{
			this._removeListenerActual(listener);
		}
		
		return true;
	},
	
	_removeListenerActual: function(listener)
	{
		// TODO Replace with binary search.
		var records = this._messageListenerRecords;
		var len = records.length;
		for(var i=0; i < len; ++i)
		{
			var record = records[i];
			if(record.l == listener)
			{
				records.splice(i, 1);
				break;
			}
		}
	},
	
	/**
	 * Send a message to every registered <code>MessageListener</code>. This emitter will trigger all listeners
	 * in descending order based on the listener priority. All listener callback functions are generated
	 * with parameters passed to <code>emit()</code>.
	 * @param {String} params Parameters to pass to the generated callback function. Any
	 *		number and type of parameters may be passed in.
	 * @returns {Boolean} Returns <code>true</code> if the message was sent immediately. Returns
	 * <code>false</code> if the message was deferred.
	 * @see Core.MessageEmitter#chain
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	emit: function(params)
	{
		var handled = false;
		if(this._messageShouldDefer)
		{
			this._messageDeferredWork.push(this._emitActual.bind(this, arguments, false));
		}
		else
		{
			handled = this._emitActual(arguments, true);
		}
		return handled;
	},
	
	_emitActual: function(params, executeDeferred)
	{
		this._messageShouldDefer = true;
		
		var records = this._messageListenerRecords;
		var len = records.length;
		var handled = false;
		for(var i=0; i < len; ++i)
		{
			var record = records[i];
			if(!record.f) continue;
			
			if(record.f.apply(record.l, params))
				handled = true;
		}

		this._messageShouldDefer = false;
		
		if(this._messageDeferredWork.length && executeDeferred)
		{
			this._executeDeferred();
		}

		return handled;
	},
	
	/**
	 * Send a message to every registered <code>MessageListener</code> through a chain of command. 
	 * This emitter will trigger all listeners in descending order based on the listener priority.
	 * All listener callback functions are generated with parameters passed to <code>chain()</code>.	 
	 * <br /><br />
	 * Unlike <code>emit()</code>, <code>chain()</code> allows a <code>MessageListener</code> to halt propagation of a message 
	 * to other listener objects by returning <code>true</code> for the callback function.
	 * This is useful for things like touch event handling. A <code>MessageListener</code> can respond to a touch event
	 * by returning <code>true</code>, masking the touch event from other listener objects.
	 *
	 * @param {String} params Parameters to pass in the generated callback function. Any number and
	 *		type of parameters may be passed in.
	 * @returns {Boolean} Returns <code>true</code> if the registered listener responded. Returns <code>false</code> in all other cases.
	 * <br /><br />
	 * <b>Note:</b> If the application calls <code>chain()</code> recursively from
	 * within a message handler callback, it will always return <code>undefined</code>
	 * regardless of if a <code>MessageListener</code> responds or not.
	 * @see Core.MessageEmitter#emit
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	chain: function(params)
	{
		if(this._messageShouldDefer)
		{
			this._messageDeferredWork.push(this._chainActual.bind(this, arguments, false));
			return undefined;
		}
		else
		{
			return this._chainActual(arguments, true);
		}
	},
	
	_chainActual: function(params, executeDeferred)
	{
		var result = false;
		this._messageShouldDefer = true;
		
		var records = this._messageListenerRecords;
		var len = records.length;
		for(var i=0; i < len; ++i)
		{
			var record = records[i];
			if(!record.f) continue;
			
			if(record.f.apply(record.l, params))
			{
				result = true;
				break;
			}
		}
		
		this._messageShouldDefer = false;
		
		if(this._messageDeferredWork.length && executeDeferred)
		{
			this._executeDeferred();
		}
		
		return result;
	},
	
	_executeDeferred: function()
	{
		// NOTE: Don't factor out deferred.length. Deferred work can add more deferred work.
		var deferred = this._messageDeferredWork;
		for(var i=0; i < deferred.length; ++i)
		{
			deferred[i]();
		}
		this._messageDeferredWork = [];
	}
});
