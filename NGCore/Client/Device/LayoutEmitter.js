////////////////////////////////////////////////////////////////////////////////
// Class LayoutEmitter
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;

var _window = null;

////////////////////////////////////////////////////////////////////////////////

exports.LayoutEmitter = Core.MessageEmitter.singleton(
/** @lends Device.LayoutEmitter.prototype */
{
	classname: 'LayoutEmitter',
	
	/**
	 * @class The <code>LayoutEmitter</code> class constructs a singleton that sends an object to
	 * its listeners when the size of the display's usable portion is changing. The object has
	 * <code>width</code> and <code>height</code> properties representing the width and height, in
	 * logical units, of the display's usable portion. To determine how many pixels the device uses
	 * per logical unit, call <code>{@link Core.Capabilities#getScreenPixelUnits}</code>.
	 * @singleton
	 * @constructs The default constructor.
	 * @augments Core.MessageEmitter
	 * @since 1.1.1.2
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	_layoutChangedRecv: function( cmd ) 
	{
		var msg = {};
		if(!this._layoutChangedRecvGen(cmd, msg))
			return;

		this.setWidthAndHeight(msg.width, msg.height);
		
 		//NgLogD("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++JS received width as :"+ this._width + " and height as :" + this._height); 
		this.emit(msg);
		this._layoutChangedSendGen(msg.width, msg.height);
	},
	
	/**
	 * Retrieve the width of the usable portion of the display, in logical units, from the last 
	 * known event. To determine how many pixels the device uses per logical unit, call
	 * <code>{@link Core.Capabilities#getScreenPixelUnits}</code>.
	 * @name Device.LayoutEmitter.getWidth
	 * @function
	 * @static
	 * @returns {Number} The width of the usable portion of the display, in logical units.
	 * @since 1.4.1
	 */
	$getWidth: function()
	{
		return this._width;
	},
	
	/**
	 * Retrieve the height of the usable portion of the display, in logical units, from the last
	 * known event. To determine how many pixels the device uses per logical unit, call
	 * <code>{@link Core.Capabilities#getScreenPixelUnits}</code>.
	 * @name Device.LayoutEmitter.getHeight
	 * @function
	 * @static
	 * @returns {Number} The height of the usable portion of the display, in logical units.
	 * @since 1.4.1
	 */
	$getHeight: function()
	{
		return this._height;
	},
	
	$_setWindow: function(UIWindow) {
		_window = UIWindow;
	},
	
	/**
	 * @private
	 */
	setWidthAndHeight: function(width, height) {
		//NgLogD("---------------------------------Setting width and height for LayoutEmitter directly from native ......... width is " + width + " and height is " + height );
		this._width = width;
		this._height = height;
		if (_window) {
			_window._setWidthAndHeight(width, height);
		}
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 352,
	// Method create = -1
	// Method layoutChanged = 2
	
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
					instance._layoutChangedRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in LayoutEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in LayoutEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[352] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_layoutChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in LayoutEmitter.layoutChanged from command: " + cmd );
			return false;
		}
		
		obj[ "width" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "width" ] === undefined )
		{
			NgLogE("Could not parse width in LayoutEmitter.layoutChanged from command: " + cmd );
			return false;
		}
		
		obj[ "height" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "height" ] === undefined )
		{
			NgLogE("Could not parse height in LayoutEmitter.layoutChanged from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x160ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_layoutChangedSendGen: function( width, height )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1600002, this, [ +width, +height ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _layoutChangedRecv: function( cmd ) {}
	// layoutChanged: function( width, height ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
