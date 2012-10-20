var Shape = require('./Shape').Shape;
var Core = require('../Core').Core;

exports.BoxShape = Shape.subclass(
/** @lends Physics2.BoxShape.prototype */
{
	classname: 'BoxShape',
	
	/**
	 * @class The <code>BoxShape</code> class constructs objects that define the collision box shape.
	 * @constructs The default constructor. 
	 * @augments Physics2.Shape
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._position = new Core.Point();
		this._anchor = new Core.Point(0.5, 0.5);
		this._size = new Core.Size();
		this._rotation = 0;
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},
	
	/**
	 * Retrieve the position for this <code>BoxShape</code>.
	 * @returns {Core.Point} The current position.
	 * @see Physics2.BoxShape#setPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPosition: function()
	{
		return this._position;
	},
	
	/**
	 * Set the position for this <code>BoxShape</code>.
	 * @example var box = new Physics2.BoxShape();
	 * box.setPosition(0, Core.Capabilities.getScreenHeight());
	 * @param {Core.Point} [position=(0, 0)] The new position.
	 * @returns {this}
	 * @see Physics2.BoxShape#getPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
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
	 * Retrieve the anchor for this <code>BoxShape</code>.
	 * @returns {Core.Point} The current anchor.
	 * @see Physics2.BoxShape#setAnchor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getAnchor: function()
	{
		return this._anchor;
	},
	
	/**
	 * Set the anchor for this <code>BoxShape</code>.
	 * @example var box = new Physics2.BoxShape();
	 * box.setAnchor(0, 1);
	 * @param {Core.Point} [anchor=(0.5, 0.5)] The new anchor.
	 * @returns {this}
	 * @see Physics2.BoxShape#getAnchor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAnchor: function(anchor)
	{
		var a = this._anchor;
		a.setAll.apply(a, arguments);
		this._setAnchorSendGen(a.getX(),a.getY());
		return this;
	},
	
	/**
	 * Retrieve the size for this <code>BoxShape</code>.
	 * @returns {Core.Size} The current size.
	 * @see Physics2.BoxShape#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSize: function()
	{
		return this._size;
	},
	
	/**
	 * Set the size for this <code>BoxShape</code>.
	 * @example var box = new Physics2.BoxShape();
	 * box.setSize(Core.Capabilities.getScreenWidth(), thick);
	 * @param {Core.Size} [size=(0, 0)] The new size.
	 * @returns {this}
	 * @see Physics2.BoxShape#getSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setSize: function(size)
	{
		var s = this._size;
		s.setAll.apply(s, arguments);
		this._setSizeSendGen(s.getWidth(),s.getHeight());
		return this;
	},
	
	/**
	 * Retrieve the rotation for this <code>BoxShape</code>.
	 * @returns {Number} The current rotation.
	 * @see Physics2.BoxShape#setRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRotation: function()
	{
		return this._rotation;
	},
	
	/**
	 * Set the rotation for this <code>BoxShape</code>.
	 * @example var box = BoxShape();
	 * box.setRotation(45);
	 * @param {Number} [rotation=0] The new rotation.
	 * @returns {this}
	 * @see Physics2.BoxShape#getRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setRotation: function(rotation)
	{
		this._rotation = rotation;
		this._setRotationSendGen(rotation);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 317,
	// Method create = -1
	// Method destroy = 2
	// Method setPosition = 3
	// Method setAnchor = 4
	// Method setSize = 5
	// Method setRotation = 6
	
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
					NgLogE("Unknown instance method id " + cmdId + " in BoxShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in BoxShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[317] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13dffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13d0002, this );
	},
	
	/** @private */
	_setPositionSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13d0003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setAnchorSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13d0004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setSizeSendGen: function( width, height )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13d0005, this, [ +width, +height ] );
	},
	
	/** @private */
	_setRotationSendGen: function( rotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13d0006, this, [ +rotation ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setPosition: function( x, y ) {}
	
	// setAnchor: function( x, y ) {}
	
	// setSize: function( width, height ) {}
	
	// setRotation: function( rotation ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
