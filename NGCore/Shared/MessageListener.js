var Class = require('./Class').Class;

exports.MessageListener = Class.subclass(
/** @lends Core.MessageListener.prototype */
{
	classname: 'MessageListener',
	
	/**
	 * @class The <code>MessageListener</code> class is a base class for constructing objects that listen for notifications from emitters 
	 * (see <code>{@link Core.MessageEmitter}</code>). Objects of this type are registered with emitters.
	 * When <code>{@link Core.MessageEmitter#emit}</code> or <code>{@link Core.MessageEmitter#chain}</code> is called on an emitter
	 * all registered listeners will generate a callback function.
	 * <br /><br />
	 * Applications must unregister listener objects when they are no longer required in one of three ways: 
	 * <ul>
	 * <li>Calling <code>{@link Core.MessageEmitter#removeListener}</code> on the <code>MessageEmitter</code>.</li>
	 * <li>Calling <code>{@link Core.MessageEmitter#destroy}</code> on the <code>MessageEmitter</code>.</li>
	 * <li>Calling <code>{@link Core.MessageListener#destroy}</code> on the <code>MessageListener</code></li>
	 * </ul><br />
	 * <p><b>Note:</b> Applications should not attempt to register a listener with an emitter more than once. Registering a listener with an emitter
	 * multiple times results in exceptions.</p>
	 * @example
	 * var MyListener = Core.MessageListener.subclass({
	 *     myCallback: function(verb, value) {
	 *         console.log('MyListener.myCallback(' + verb + ', ' + value + ')');
	 *     }
	 * });
	 * var listener = new MyListener();
	 * emitter.addListener(listener, listener.myCallback);
	 * emitter.emit('fun', 5);
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._messageEmitters = [];
	},
	
	/**
	 * Unregister this <code>MessageListener</code> from all emitters.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		// Unregister from all emitters.
		var emitters = this._messageEmitters;
		while(emitters.length)
			emitters[0].removeListener(this);
	},
	
	// Called by MessageEmitter when this receiver starts listening.
	_startListeningEmitter: function(emitter)
	{
		var emitters = this._messageEmitters;
		var index = emitters.indexOf(emitter);
		if(index !== -1)
			return false;
		
		emitters.push(emitter);
		return true;
	},
	
	// Called by MessageEmitter when this receiver stops listening.
	_stopListeningEmitter: function(emitter)
	{
		var emitters = this._messageEmitters;
		var index = emitters.indexOf(emitter);
		if(index === -1)
			return false;
		
		emitters.splice(index, 1);
		return true;
	}
});
