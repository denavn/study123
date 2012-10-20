var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

// Private Class Statics
var keyCodeReverseMap = null;

exports.KeyEmitter = Core.MessageEmitter.singleton(
/** @lends Device.KeyEmitter.prototype */
{
	classname: 'KeyEmitter',

	/**
	 * @class The <code>KeyEmitter</code> class constructs a singleton object that sends its
	 * listeners a <code>{@link Device.KeyEmitter.KeyEvent}</code> object when the user presses or
	 * releases a device hardware key.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @example
	 * var KeyListener = Core.MessageListener.subclass({
	 *   onUpdate: function(keyEvent) {
	 *     // back to the launcher when the back button is pressed
	 *     if (keyEvent.code === Device.KeyEmitter.Keycode.back) {
	 *        this.destroy();
	 *        LGL.runUpdatedGame('/Samples/Launcher');
	 *        return;
	 *     }
	 *
	 *     var text = '';
	 *     switch (keyEvent.type) {
	 *        case Device.KeyEmitter.EventType.onDown:
	 *           text += 'onDown :';
	 *           break;
	 *        case Device.KeyEmitter.EventType.onUp:
	 *           text += 'onUp :';
	 *           break;
	 *     }
	 *
	 *     text += Device.KeyEmitter.keyCodeToSymbol(keyEvent.code);
	 *     console.log(text);
	 *   }
	 * });
	 *
	 * var keyListener = new KeyListener();
	 * Device.KeyEmitter.addListener(keyListener, keyListener.onUpdate);
	 * @status Android, Test, AndroidTested
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},

	/**
	 * Convert a keycode into the equivalent human-readable symbol. The keycode to convert is passed in as a parameter.
	 * The following code example illustrates how to convert a keycode into a human-readable symbol.
	 * @param {String} keyCode The keycode to convert.
	 * @example
	 *   var symbol = Device.KeyEmitter.keyCodeToSymbol(0x1d);
	 *   // symbol => 'a'
	 * @returns {String} The keycode as a human-readable symbol.
	 * @status
	 * @since 1.0
	 */
	keyCodeToSymbol: function(keyCode)
	{
		if (!keyCodeReverseMap) {
			keyCodeReverseMap = {};
			for (var codename in this.Keycode) {
				keyCodeReverseMap[this.Keycode[codename]] = codename;
			}
		}
		return keyCodeReverseMap[keyCode] || '';
	},

	KeyEvent: Core.Class.subclass(
	/** @lends Device.KeyEmitter.KeyEvent.prototype */
	{
		classname: 'KeyEvent',

		/**
		 * @class <code>KeyEvent</code> constructs objects that contain the parcel of a keyboard event. 
		 * The keycode of the key that triggered the event is passed in as a parameter.
		 * @constructs The default constructor. 
		 * @augments Core.Class
		 * @param {Device.KeyEmitter.EventType} type The type of the keyboard event.
		 * @param {Integer} modifiers the bit-and of {@link Device.KeyEmitter#Modifier} combination.
		 * @param {Device.KeyEmitter.Keycode} code The actual keycode.
		 * @since 1.0
		 */
		initialize: function(type, modifiers, code)
		{
			this.type      = type;
			this.modifiers = modifiers;
			this.code      = code;
		}
	}),

	_onKeyEventRecv: function( cmd )
	{
		var msg = {};
		if(!this._onKeyEventRecvGen(cmd, msg))
			return;

		var keyEvent = new Device.KeyEmitter.KeyEvent(msg.type, msg.modifiers, msg.code);
		
		if(!this.chain(keyEvent)) {
			//Noone handled this keyEvent. Cascade the original back out to native for forwarding
			//	to the next interpreter in the chain.
			this._onKeyEventSendGen(msg.type, msg.modifiers, msg.code);
		}
	},
	
	/** 
	 * Enumeration identifying whether the key was pressed or released.
	 * @name EventType
	 * @fieldOf Device.KeyEmitter#
	 */
	 
	/** 
	 * The key was released.
	 * @name EventType.onUp
	 * @fieldOf Device.KeyEmitter.prototype
	 * @constant
	 */
	
	/** 
	 * The key was pressed.
	 * @name EventType.onDown
	 * @fieldOf Device.KeyEmitter.prototype
	 * @constant
	 */
	
	
	/** 
	 * Enumeration identifying any modifier keys that are being pressed.
	 * @name Modifier
	 * @fieldOf Device.KeyEmitter#
	 * @example
	 * var keyEvent; // emitted from KeyEmitter
	 * if (keyEvent.modifiers &amp; Device.KeyEmitter.Modifier.ALT &amp;&amp; 
	 *     keyEvent.modifiers &amp; Device.KeyEmitter.Modifier.SHIFT) {
	 *     console.log("ALT+SHIFT");
	 * }
	 */
	
	/**
	 * No modifier key is pressed.
	 * @name Modifier.NONE
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The SYMBOL modifier key is pressed.
	 * @name Modifier.SYMBOL
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The ALT modifier key is pressed.
	 * @name Modifier.ALT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The left ALT modifier key is pressed.
	 * @name Modifier.ALT_LEFT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The right ALT modifier key is pressed.
	 * @name Modifier.ALT_RIGHT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The SHIFT modifier key is pressed.
	 * @name Modifier.SHIFT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/** 
	 * The left SHIFT modifier key is pressed.
	 * @name Modifier.SHIFT_LEFT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The right SHIFT modifier key is pressed.
	 * @name Modifier.SHIFT_RIGHT
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */


	/** 
	 * Enumeration identifying the key that is pressed.
	 * @name Keycode
	 * @fieldOf Device.KeyEmitter#
	 */
	 
	/**
	 * The a key is pressed.
	 * @name Keycode.a
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The b key is pressed.
	 * @name Keycode.b
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The c key is pressed.
	 * @name Keycode.c
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The d key is pressed.
	 * @name Keycode.d
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The e key is pressed.
	 * @name Keycode.e
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The f key is pressed.
	 * @name Keycode.f
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The g key is pressed.
	 * @name Keycode.g
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The h key is pressed.
	 * @name Keycode.h
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The i key is pressed.
	 * @name Keycode.i
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The j key is pressed.
	 * @name Keycode.j
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The k key is pressed.
	 * @name Keycode.k
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The l key is pressed.
	 * @name Keycode.l
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The m key is pressed.
	 * @name Keycode.m
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The n key is pressed.
	 * @name Keycode.n
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The o key is pressed.
	 * @name Keycode.o
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The p key is pressed.
	 * @name Keycode.p
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The q key is pressed.
	 * @name Keycode.q
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	
	/**
	 * The r key is pressed.
	 * @name Keycode.r
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The s key is pressed.
	 * @name Keycode.s
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/** 
	 * The t key is pressed.
	 * @name Keycode.t
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The u key is pressed.
	 * @name Keycode.u
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The v key is pressed.
	 * @name Keycode.v
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The w key is pressed.
	 * @name Keycode.w
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The x key is pressed.
	 * @name Keycode.x
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The y key is pressed.
	 * @name Keycode.y
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The z key is pressed.
	 * @name Keycode.z
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The Up key is pressed.
	 * @name Keycode.up
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The Down key is pressed.
	 * @name Keycode.down
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The Left key is pressed.
	 * @name Keycode.left
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */
	 
	/**
	 * The Right key is pressed.
	 * @name Keycode.right
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * The Enter key is pressed.
	 * @name Keycode.enter
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/** 
	 * The Backspace key is pressed.
	 * @name Keycode.backspace
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/** 
	 * The Back key is pressed.
	 * @name Keycode.back
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 */

	/**
	 * Special KeyCode to tell MobageService that the back was unhandled by the game, after the
	 * service declined first dibs. Stole MAX_KEYCODE (deprecated constant).
	 * @name Keycode.backunhandled
	 * @fieldOf Device.KeyEmitter#
	 * @constant
	 * @ignore
	 */
	
	/**
	 * The Menu key is pressed.
	 * @name Keycode.menu
	 * @fieldOf Device.KeyEmitter.prototype
	 * @constant
	 */
	

// {{?Wg Generated Code}}
	
	// Enums.
	EventType:
	{ 
		onUp: 0,
		onDown: 1
	},
	
	Modifier:
	{ 
		NONE: 0,
		SYMBOL: 1 << 0,
		ALT: 1 << 1,
		ALT_LEFT: 1 << 2,
		ALT_RIGHT: 1 << 3,
		SHIFT: 1 << 4,
		SHIFT_LEFT: 1 << 5,
		SHIFT_RIGHT: 1 << 6
	},
	
	Keycode:
	{ 
		a: 0x1d,
		b: 0x1e,
		c: 0x1f,
		d: 0x20,
		e: 0x21,
		f: 0x22,
		g: 0x23,
		h: 0x24,
		i: 0x25,
		j: 0x26,
		k: 0x27,
		l: 0x28,
		m: 0x29,
		n: 0x2a,
		o: 0x2b,
		p: 0x2c,
		q: 0x2d,
		r: 0x2e,
		s: 0x2f,
		t: 0x30,
		u: 0x31,
		v: 0x32,
		w: 0x33,
		x: 0x34,
		y: 0x35,
		z: 0x36,
		up: 0x13,
		down: 0x14,
		left: 0x15,
		right: 0x16,
		enter: 0x42,
		backspace: 0x43,
		back: 0x04,
		backunhandled: 0x54,
		menu: 0x52
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 343,
	// Method create = -1
	// Method onKeyEvent = 2
	
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
				
				case 2:
					instance._onKeyEventRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in KeyEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in KeyEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[343] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onKeyEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyEmitter.onKeyEvent from command: " + cmd );
			return false;
		}
		
		obj[ "type" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "type" ] === undefined )
		{
			NgLogE("Could not parse type in KeyEmitter.onKeyEvent from command: " + cmd );
			return false;
		}
		
		obj[ "modifiers" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "modifiers" ] === undefined )
		{
			NgLogE("Could not parse modifiers in KeyEmitter.onKeyEvent from command: " + cmd );
			return false;
		}
		
		obj[ "code" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "code" ] === undefined )
		{
			NgLogE("Could not parse code in KeyEmitter.onKeyEvent from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x157ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_onKeyEventSendGen: function( type, modifiers, code )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1570002, this, [ +type, +modifiers, +code ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _onKeyEventRecv: function( cmd ) {}
	// onKeyEvent: function( type, modifiers, code ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
// vim:set fdm=marker noexpandtab:
