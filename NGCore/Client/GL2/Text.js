var Core = require('../Core').Core;
var Node = require('./Node').Node;
var Font = require('./Font').Font;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var Text = exports.Text = Node.subclass(
/** @lends GL2.Text.prototype */
{
	classname: 'Text',

	/**
	 * @class The `GL2.Text` class enables applications to display text areas. The methods in this
	 * class control the text area's font, alignment, and placement.
	 *
	 * By default, text areas are styled as follows:
	 *
	 * 1. Text is rendered in Arial, using 18 pixels per em.
	 * 2. Text is horizontally and vertically centered with the text area.
	 * 3. The text area's size is not constrained. If a width constraint is added, the text area's
	 * text string will wrap onto multiple lines.
	 * 4. The text area's anchor point is centered within the text area.
	 *
	 * **Important**: Text areas may have rendering problems when they are scaled. Do not apply a
	 * scale to text areas unless absolutely necessary. In addition, minimize the number of font
	 * sizes that your application uses; each new font size uses additional memory on the device.
	 * @constructs Create a text area.
	 * @augments GL2.Node
	 * @param {String} [text] The text to display.
	 * @since 1.0
	 */
    initialize: function(text)
    {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.OptionalArg('string')]);
#endif*/
		this._size = new Core.Size();
		this._anchor = new Core.Point(0.5, 0.5);
        this._horizontalAlign = this.HorizontalAlign.Center;
        this._verticalAlign = this.VerticalAlign.Middle;
        this._text = '';
		if (text)
			 this.setText(text);

        this._fontFamily = '';
        this._fontSize = 18;
		this._overflowMode = this.OverflowMode.Multiline;
		this._fontLocation = this.FontLocation.Default;

		this._font = null;

		this._callbackIdCounter = 1;
		this._callbacks = {};
    },

	/**
	 * Destroy the text area, and release the resources allocated by the text area.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},

	/**
	 * Retrieve the width and height of the text area. If one of these dimensions is set to 0, the
	 * rendering engine will allow that dimension to expand if necessary to fit the text.
	 * @returns {Core.Size} The current size of the text area, in pixels.
	 * @see GL2.Text#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSize: function()
	{
		return this._size;
	},

	/**
	 * Retrieve the offset of the text area's anchor point. The anchor point defines the origin of
	 * any scaling or rotation that is applied to the text area.
	 * @returns {Core.Point} The current offset of the text area's anchor point.
	 * @see GL2.Text#setAnchor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getAnchor: function()
	{
		return this._anchor;
	},

	/**
	 * Retrieve the text area's horizontal alignment.
	 * @returns {GL2.Text#HorizontalAlign} The current horizontal alignment of the text area.
	 * @see GL2.Text#setHorizontalAlign
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHorizontalAlign: function()
	{
		return this._horizontalAlign;
	},

	/**
	 * Retrieve the text area's vertical alignment.
	 * @returns {GL2.Text#VerticalAlign} The current vertical alignment of the text area.
	 * @see GL2.Text#setVerticalAlign
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVerticalAlign: function()
	{
		return this._verticalAlign;
	},

	/**
	 * Retrieve the text string to render in the text area.
	 * @returns {String} The current text string to render in the text area.
	 * @see GL2.Text#setText
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getText: function()
	{
		return this._text;
	},

	/**
	 * Retrieve the text area's font family.
	 * @returns {String|GL2.Font} The current font family for the text area.
	 * @see GL2.Text#setFontFamily
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFontFamily: function()
	{
//#assert(this._font==null,"expected this._font to be null in call to GL2.Text.getFontFamily");

		return this._fontFamily;
	},

	/**
	 * Retrieve the text area's font size, in pixels per em.
	 * @returns {Number} The current font size for the text area.
	 * @see GL2.Text#setFontSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFontSize: function()
	{
//#assert(this._font==null,"expected this._font to be null in call to GL2.Text.getFontSize");

		return this._fontSize;
	},

	/**
	 * Retrieve the text area's overflow mode, which defines the text area's behavior when the text
	 * area is not large enough to fit the text string.
	 * @returns {GL2.Text#OverflowMode} The current overflow mode for the text area.
	 * @see GL2.Text#OverflowMode
	 * @see GL2.Text#setOverflowMode
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getOverflowMode: function()
	{
		return this._overflowMode;
	},

    /**
	 * Set the text area's width and height. The size is relative to the scale that has been applied
	 * to the parent node.
	 *
	 * **Important**: Text areas may have rendering problems when they are scaled. Do not apply a
	 * scale to text areas unless absolutely necessary.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setSize(200, 100);
	 * @param {Core.Size} size The text area's new width and height, in pixels.
	 * @returns {this}
	 * @see GL2.Text#getSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setSize: function(size)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Size)],    // a single Core.Size
									   [T.Arg('number'), T.Arg('number')],  // two numbers
									   [[T.Arg('number'), T.Arg('number')]]));  // an array of two numbers.
#endif*/
		var s = this._size;
		s.setAll.apply(s, arguments);

		this._setSizeSendGen(s.getWidth(),s.getHeight());

		return this;
	},

    /**
	 * Set the offset of the text area's anchor point. The anchor point defines the origin of any
	 * scaling or rotation that is applied to the text area. Its offset is defined as a multiple of
	 * the text area's width and height. For example, the default anchor offset, `[0.5, 0.5]`,
	 * represents a point that is centered on the U and V axes.
	 *
	 * If the text area's width or height is set to 0, the anchor point's offset is measured based
	 * on the rendered size of the text string.
	 *
	 * **Note**: The anchor point is calculated before transformations are applied to the text area.
	 * @example
	 * // Create a text area with horizontally and vertically centered text.
	 * var textArea = new GL2.Text("Next Level");
	 * textArea.setHorizontalAlign(GL2.Text.HorizontalAlign.Center).
	 *   setVerticalAlign(GL2.Text.VerticalAlign.Middle).
	 *   setAnchor(new Core.Point(0.5, 0.5));
	 * @param {Core.Point} location The new offset of the text area's anchor point.
	 * @returns {this}
	 * @see GL2.Text#getAnchor
	 * @see GL2.Text#setHorizontalAlign
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAnchor: function(location)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, T.Or([T.Arg(Core.Point)],    // a single Core.Point
									   [T.Arg('number'), T.Arg('number')],  // two numbers
									   [[T.Arg('number'), T.Arg('number')]]));  // an array of two numbers.
#endif*/
		var a = this._anchor;
		a.setAll.apply(a, arguments);

		this._setAnchorSendGen(a.getX(),a.getY());

		return this;
	},

    /**
	 * Set the text area's horizontal alignment.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setHorizontalAlign(GL2.Text.HorizontalAlign.Right);
	 * @param {GL2.Text#HorizontalAlign} horizontalAlign The new horizontal alignment for the text
	 *		area.
	 * @returns {this}
	 * @see GL2.Text#getHorizontalAlign
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setHorizontalAlign: function(horizontalAlign)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/
		this._horizontalAlign = horizontalAlign;

		this._setHorizontalAlignSendGen(horizontalAlign);

		return this;
	},

    /**
	 * Set the text area's vertical alignment.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setVerticalAlign(GL2.Text.VerticalAlign.Bottom);
	 * @param {GL2.Text#VerticalAlign} verticalAlign The new vertical alignment for the text area.
	 * @returns {this}
	 * @see GL2.Text#getVerticalAlign
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setVerticalAlign: function(verticalAlign)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/
		this._verticalAlign = verticalAlign;

		this._setVerticalAlignSendGen(verticalAlign);

		return this;
	},

    /**
	 * Set the text string to display in the text area.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setText("Choose an Item");
	 * @param {String} text The new text string to display in the text area.
	 * @returns {this}
	 * @see GL2.Text#getText
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setText: function(text)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string')]);
#endif*/
		this._text = text;

		this._setTextSendGen(text);

		return this;
	},

    /**
	 * Set the font family to use for the text area. By default, you can use the font families that
	 * are provided by the device. You can also use the font families that are bundled with ngCore
	 * or include your own font family in the application bundle.
	 *
	 * To retrieve a list of font families that are provided by the device, call
	 * `{@link Core.Capabilities#getAvailableFonts}`.
	 *
	 * To use a font family that is bundled with your application, do the following:
	 *
	 * 1. Include the necessary font files in your application's `manifest.json` file, or in a
	 * secondary manifest. The font files must be in TrueType (.ttf) or OpenType (.otf) format. You
	 * can include the font files in the `other` or `other_encrypted` section of `manifest.json`.
	 * 2.  Call `{@link GL2.Text#setFontLocation}` to indicate that the text area will use a font
	 * family from the application bundle.
	 * 3. Call `setFontFamily()`, and pass in the path to the font file.
	 *
	 * In addition, you can use the `{@link GL2.Font}` class to load a font, then pass the
	 * `GL2.Font` object to this method. The `GL2.Font` class enables you to load a font
	 * asynchronously, so the application is not blocked while it waits for the font to load.
	 * @example
	 * // Use a random system-provided font.
	 * var textArea = new GL2.Text();
	 * var systemFonts = Core.Capabilities.getAvailableFonts();
	 * textArea.setFontFamily(systemFonts[Math.floor(Math.random() * systemFonts.length)]);
	 * @example
	 * // Use a font family from the application bundle.
	 * var textArea = new GL2.Text();
	 * textArea.setFontLocation(GL2.Text.FontLocation.Manifest);
	 * textArea.setFontFamily("./Content/fontName.otf");
	 * @param {String|GL2.Font} fontFamily The name of the font family to use in the text area; the
	 *		path to a font file in the application bundle; or a `{@link GL2.Font}` object that
	 *		contains a font resource.
	 * @returns {this}
	 * @see Core.Capabilities#getAvailableFonts
	 * @see GL2.Text#FontLocation
	 * @see GL2.Text#getFontFamily
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setFontFamily: function(fontFamily)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string')]);
#endif*/

//#assert(this._font==null,"expected this._font to be null in call to GL2.Text.setFontFamily");

		this._fontFamily = fontFamily;

		this._setFontFamilySendGen(fontFamily);

		this._font = null;

		return this;
	},

    /**
	 * Set the text area's font size, in pixels per em.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setFontSize(24);
	 * @param {Number} fontSize The text area's new font size, in pixels per em.
	 * @returns {this}
	 * @see GL2.Text#getFontSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setFontSize: function(fontSize)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/

//#assert(this._font==null,"expected this._font to be null in call to GL2.Text.setFontSize");

		this._fontSize = fontSize;

		this._setFontSizeSendGen(fontSize);

		this._font = null;

		return this;
	},

	/**
	 * Retrieve the text area's overflow mode, which defines the text area's behavior when the text
	 * area is not large enough to fit the text string.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setOverflowMode(GL2.Text.OverflowMode.ReduceFontSize);
	 * @param {GL2.Text#OverflowMode} overflowMode The new overflow mode for the text area.
	 * @returns {this}
	 * @see GL2.Text#getOverflowMode
	 * @see GL2.Text#OverflowMode
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setOverflowMode: function(overflowMode)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/
		this._overflowMode = overflowMode;

		this._setOverflowModeSendGen(overflowMode);

		return this;
	},

	/**
	 * Set the location of font families that can be used by the text area. By default, the text
	 * area can use font families that are provided by the device.
	 * @example
	 * var textArea = new GL2.Text();
	 * textArea.setFontLocation(GL2.Text.FontLocation.Manifest);
	 * @param {GL2.Text#FontLocation} fontLocation The location of font families that can be used by
	 *		the text area.
	 * @returns {this}
	 * @see GL2.Text#setFontFamily
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setFontLocation: function(fontLocation)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('integer')]);
#endif*/

//#assert(this._font==null,"expected this._font to be null in call to GL2.Text.setFontLocation");

		this._fontLocation = fontLocation;

		this._setFontLocationSendGen(fontLocation);

		this._font = null;

		return this;
	},

	/**
	 * Translate a location in the global scene's coordinate space to the text area's local
	 * coordinate space.
	 * @name GL2.Text#screenToLocal
	 * @function
	 * @param {Core.Point} location The location in the global scene to transform.
	 * @returns {Core.Point} The location's coordinate within the text area's local coordinate
	 *		space.
	 * @see GL2.Text#localToScreen
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */

	screenToLocal: function($super, location)
	{
/*#if TYPECHECK
		var realArgs = Array.prototype.slice.call(arguments, 1);  // strip off $super
		T.validateArgs(realArgs, [T.Arg(Core.Point)]);
#endif*/
		location = $super(location);
		if(!location)
			return undefined;

		var a = this._anchor;
		var s = this._size;

		location.setX(location.getX() + a.getX() * s.getWidth());
		location.setY(location.getY() + a.getY() * s.getHeight());
		return location;
	},

	/**
	 * Translate a location in the text area's local coordinate space to the global scene's
	 * coordinate space. Use this method to translate between two local coordinate spaces.
	 * @name GL2.Text#localToScreen
	 * @function
	 * @param {Core.Point} location The location in the text area's local coordinate space to
	 *		transform.
	 * @returns {Core.Point} The location's coordinate within the global scene's coordinate space.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */

	localToScreen: function($super, location)
	{
/*#if TYPECHECK
		var realArgs = Array.prototype.slice.call(arguments, 1);  // strip off $super
		T.validateArgs(realArgs, [T.Arg(Core.Point)]);
#endif*/
		var a = this._anchor;
		var s = this._size;

		location.setX(location.getX() - a.getX() * s.getWidth());
		location.setY(location.getY() - a.getY() * s.getHeight());

		location = $super(location);
		if(!location)
			return undefined;
		return location;
	},


	/**
	 * Measure the text area's total width and height, as well as the width of each line of text.
	 *
	 * **Note**: Before you call this method, you must add text to the text area or set the text
	 * area's size.
     * @example
	 * var textArea = new GL2.Text("Play Game");
	 * var size = new Core.Size();
	 * var lineWidths = [];
	 * var totalWidth = 0;
	 * textArea.measureArea(function(result) {
	 *     size.setAll(result.width, result.height);
	 *     lineWidths = result.lineWidths;
	 *     totalWidth = result.totalWidth;
	 * });
     * @cb {Function} callback The function to call after measuring the text.
     * @cb-param {Object} result Information about the text area's size.
     * @cb-param {Number} result.width The width, in pixels, of the block of text.
     * @cb-param {Number} result.height The height, in pixels, of the block of text.
     * @cb-param {Number[]} result.lineWidths The widths, in pixels, of each line in the block of
	 *		text.
     * @cb-param {Number} result.totalWidth The combined width, in pixels, of all of the lines in
	 *		the text block.
	 * @cb-returns {void}
     * @returns {void}
	 * @since 1.6
	 */
	measureArea: function(callback)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('function')]);
#endif*/
		var callbackId = this._callbackIdCounter++;
		this._callbacks[callbackId] = callback;
		this._measureAreaSendGen(callbackId);
 	},

	_measureAreaCbRecv: function(cmd)
	{
		var msg = {};
		if (! this._measureAreaCbRecvGen(cmd, msg))
			return;

		var callbackId = msg["callbackId"];
		var result = msg["result"];

		var callback = this._callbacks[callbackId];
		delete this._callbacks[callbackId];

		callback(result);
	},

	/**
	 * Set the text area's font family by providing a `{@link GL2.Font}` object. The `GL2.Font`
	 * object's settings will override the existing font family, font location, and font size.
	 * @example
	 * var font = new GL2.Font("Default"),
	 * var text = new GL2.Text();
	 * text.setFont(font);
	 * @param {GL2.Font} font The font to use for this text area.
	 * @returns {this}
	 * @see GL2.Text#setFontFamily
	 * @status iOS, Android
	 * @since 1.8
	 */
	setFont: function( font )
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Font)]);
#endif*/

		this._font = font;

		this._setFontSendGen(Core.ObjectRegistry.objectToId(font));

		return this;
	},

	/**
	 * Enumeration for horizontal alignment modes.
	 * @name HorizontalAlign
	 * @fieldOf GL2.Text#
	 */

	/**
	 * Align text to the left.
	 * @name HorizontalAlign.Left
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Align text in the center.
	 * @name HorizontalAlign.Center
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Align text to the right.
	 * @name HorizontalAlign.Right
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Enumeration for vertical alignment modes.
	 * @name VerticalAlign
	 * @fieldOf GL2.Text#
	 */

	/**
	 * Align text at the top.
	 * @name VerticalAlign.Top
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Align text in the middle.
	 * @name VerticalAlign.Middle
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Align text at the bottom.
	 * @name VerticalAlign.Bottom
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Enumeration for the behavior when there is too much text to fit on one line.
	 * @name OverflowMode
	 * @fieldOf GL2.Text#
	 */

	/**
	 * Reduce the font size until the text fits.
	 * @name OverflowMode.ReduceFontSize
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Split the text into multiple lines.
	 * @name OverflowMode.Multiline
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Enumeration to choose the source of fonts for the application.
	 * @name FontLocation
	 * @fieldOf GL2.Text#
	 */

	/**
	 * Use the default fonts, which are the system fonts. Equivalent to
	 * `{@link GL2.Text#FontLocation.System}`.
	 * @name FontLocation.Default
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Use the system fonts.
	 * @name FontLocation.System
	 * @fieldOf GL2.Text#
	 * @constant
	 */

	/**
	 * Use the fonts that are bundled with ngCore. Not currently supported.
	 * @name FontLocation.Bundled
	 * @fieldOf GL2.Text#
	 * @constant
	 * @ignore
	 */

	/**
	 * Use custom fonts that are loaded through the application manifest.
	 * @name FontLocation.Manifest
	 * @fieldOf GL2.Text#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	HorizontalAlign:
	{ 
		Left: 0,
		Center: 1,
		Right: 2
	},
	
	VerticalAlign:
	{ 
		Top: 0,
		Middle: 1,
		Bottom: 2
	},
	
	OverflowMode:
	{ 
		ReduceFontSize: 0,
		Multiline: 1
	},
	
	FontLocation:
	{ 
		Default: 0,
		System: 1,
		Bundled: 2,
		Manifest: 3
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 311,
	// Method create = -1
	// Method destroy = 2
	// Method setSize = 3
	// Method setAnchor = 4
	// Method setHorizontalAlign = 5
	// Method setVerticalAlign = 6
	// Method setText = 7
	// Method setFontFamily = 8
	// Method setFontSize = 9
	// Method setOverflowMode = 10
	// Method setFontLocation = 11
	// Method measureArea = 12
	// Method measureAreaCb = 13
	// Method setFont = 14
	
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
					instance._measureAreaCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Text._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Text._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[311] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_measureAreaCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Text.measureAreaCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Text.measureAreaCb from command: " + cmd );
			return false;
		}
		
		obj[ "result" ] = Core.Proc.parseObject( cmd[ 1 ] );
		if( obj[ "result" ] === undefined )
		{
			NgLogE("Could not parse result in Text.measureAreaCb from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x137ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1370002, this );
	},
	
	/** @private */
	_setSizeSendGen: function( width, height )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370003, this, [ +width, +height ] );
	},
	
	/** @private */
	_setAnchorSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setHorizontalAlignSendGen: function( align )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370005, this, [ +align ] );
	},
	
	/** @private */
	_setVerticalAlignSendGen: function( align )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370006, this, [ +align ] );
	},
	
	/** @private */
	_setTextSendGen: function( text )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370007, this, [ Core.Proc.encodeString( text ) ] );
	},
	
	/** @private */
	_setFontFamilySendGen: function( fontFamily )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370008, this, [ Core.Proc.encodeString( fontFamily ) ] );
	},
	
	/** @private */
	_setFontSizeSendGen: function( fontSize )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1370009, this, [ +fontSize ] );
	},
	
	/** @private */
	_setOverflowModeSendGen: function( overflowMode )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x137000a, this, [ +overflowMode ] );
	},
	
	/** @private */
	_setFontLocationSendGen: function( fontLocation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x137000b, this, [ +fontLocation ] );
	},
	
	/** @private */
	_measureAreaSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x137000c, this, [ +callbackId ] );
	},
	
	/** @private */
	_setFontSendGen: function( font )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x137000e, this, [ +font ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setSize: function( width, height ) {}
	
	// setAnchor: function( x, y ) {}
	
	// setHorizontalAlign: function( align ) {}
	
	// setVerticalAlign: function( align ) {}
	
	// setText: function( text ) {}
	
	// setFontFamily: function( fontFamily ) {}
	
	// setFontSize: function( fontSize ) {}
	
	// setOverflowMode: function( overflowMode ) {}
	
	// setFontLocation: function( fontLocation ) {}
	
	// measureArea: function( callbackId ) {}
	
	// _measureAreaCbRecv: function( cmd ) {}
	// setFont: function( font ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
