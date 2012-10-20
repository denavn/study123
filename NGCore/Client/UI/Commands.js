////////////////////////////////////////////////////////////////////////////////
// Class Commands
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

/** @ignore */
function UIAnimationOptions() {
	this.animationCurve = "EaseInOut";
	return this;
}

var Commands = exports.Commands = Core.Class.singleton(
/** @lends UI.Commands.prototype */
{
	/** @ignore */
	classname: 'Commands',
	
	/**
	 * @class The `UI.Commands` class provides a singleton with enumerated constants that are used 
	 * by other classes in the `UI` module.
	 * @name UI.Commands
	 * @singleton
	 * @augments Core.Class
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this.initializeNative(this.__objectRegistryId);
		this._tempCBs = {};
		this._tempCBCount = 0;
	},
	
	/**
	 * Enumeration for different ways to fit an image within a view. The image is scaled relative
	 * to the boundaries of the view, minus any text insets or image insets that have been applied
	 * to the view.
	 * @name FitMode
	 * @fieldOf UI.Commands#
	 */
	 
	/**
	 * The image will not be scaled. It will be clipped if necessary.
	 * @name FitMode.None
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be proportionally scaled to fit within the view.
	 * @name FitMode.Inside
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be proportionally scaled to fill the entire view. Portions of the image that
	 * fall outside the view will be clipped.
	 * @name FitMode.Fill
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be distorted to fill the entire view.
	 * @name FitMode.Stretch
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be proportionally scaled so that its width fills the view. Portions of the
	 * image that fall outside the view will be clipped.
	 * @name FitMode.AspectWidth
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be proportionally scaled so that its height fills the view. Portions of the
	 * image that fall outside the view will be clipped.
	 * @name FitMode.AspectHeight
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The image will be proportionally scaled down to fit completely within the view. If the image 
	 * is smaller than the view, it will not be upscaled.
	 * @name FitMode.InsideNoUpscaling
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for supported units for dimensions.
	 * @name Scaling
	 * @fieldOf UI.Commands#
	 */
	
	/**
	 * One unit equals one pixel. On Android devices, when your application uses this scaling mode,
	 * use integers to represent coordinates. On iOS devices, it may be appropriate in some cases
	 * to use half-pixels or quarter-pixels to position content.
	 * @name Scaling.Pixels
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * One unit equals roughly one typesetting point, rescaled from 72 dpi to 160 dpi.
	 * @name Scaling.Points
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The value 1.0 represents 100 percent of the view width or height.
	 * @name Scaling.Unit
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * One unit equals one percent of the view width or height.
	 * @name Scaling.Percent
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is scaled so that its width is 320 units.
	 * @name Scaling.iPhone
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for view states that are used by `{@link UI.AbstractView}` and its subclasses.
	 * Your application can set different display properties for each view state, which will cause
	 * a view's appearance to change automatically when its view state changes. For example, a
	 * button's fill color could change when the button is selected, and its text could be displayed
	 * in a lighter color when the button is disabled.
	 * 
	 * A view can be in multiple states simultaneously. You can specify display properties that
	 * apply to a particular combination of view states. For example, you can use one fill color for
	 * a checkbox when it is checked, and a different fill color when it is both pressed and
	 * checked.
	 *
	 * If a view is in multiple states, and there are no display properties defined for that
	 * combination of states, ngCore will use the display properties from the view state that has
	 * the highest priority. The priority order for view states is as follows:
	 *
	 * 1. `{@link UI.Commands#State.Disabled}`
	 * 2. `{@link UI.Commands#State.Custom}`
	 * 3. `{@link UI.Commands#State.Checked}`
	 * 4. `{@link UI.Commands#State.Pressed}`
	 * 5. `{@link UI.Commands#State.Selected}`
	 * 6. `{@link UI.Commands#State.Focused}`
	 * 7. `{@link UI.Commands#State.Normal}`
	 *
	 * Your application can define its own custom view states for UI components. For example, you
	 * could assign two different view states to even and odd rows in a table, so that even and odd
	 * rows could use different background colors. A custom view state should be represented by a
	 * constant that is greater than `0x00FF0000` and less than `0x40000000`. Any value in this
	 * range will have a display priority between `{@link UI.Commands#State.Disabled}` and
	 * `{@link UI.Commands#State.Custom}`; higher numbers will have a higher display priority. If
	 * your application needs only one custom view state, you can use the constant
	 * `{@link UI.Commands#State.Custom}`.
	 *
	 * **Note**: Many methods in the `UI` module are documented as accepting parameters or returning
	 * values that correspond to an enumerated constant of `UI.Commands.State`. These parameters
	 * and return values can also contain a bitwise combination of constants, including any custom
	 * view states that have been defined.
	 * @name State
	 * @fieldOf UI.Commands#
	 * @example
	 * // Create a UI.Button object, defining its text.
	 * var button = new UI.Button({
	 *     text: "Send"
	 * });
	 * // Define a custom view state.
	 * var customViewState = 0x10000000;
	 * // Specify text colors for various view states.
	 * button.setTextColor("4B4B4B", UI.Commands.State.Normal);    // dark gray
	 * button.setTextColor("FFFFFF", UI.Commands.State.Focused);   // black
	 * button.setTextColor("006BDB", UI.Commands.State.Pressed);   // blue
	 * button.setTextColor("DB1A00",                               // red
	 *   customViewState | UI.Commands.State.Pressed);
	 * // Update the button's view state.
	 * button.setState(UI.Commands.State.Focused);    // text is black
	 * button.setState(UI.Commands.State.Pressed);    // text is blue
	 * button.addState(customViewState);              // text is red
	 * button.clearState(customViewState);            // text is blue
	 * button.setState(UI.Commands.State.Normal);     // text is dark gray
	 * @see UI.AbstractView#addState
	 * @see UI.AbstractView#clearState
	 * @see UI.AbstractView#getState
	 * @see UI.AbstractView#setState
	 */
	
	/**
	 * The view is in a normal state.
	 * @name State.Normal
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is focused.
	 * @name State.Focused
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is selected.
	 * @name State.Selected
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is pressed.
	 * @name State.Pressed
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is checked.
	 * @name State.Checked
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is in a custom state whose properties are defined by the application.
	 * @name State.Custom
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The view is disabled.
	 * @name State.Disabled
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Enumeration for the action that will occur when the user types Enter in a text field. For 
	 * devices that have soft keyboards, the device uses this value and the value of 
	 * `{@link UI.Commands#InputType}` to control which keyboard is displayed to the user.
	 * @name EnterKeyType
	 * @fieldOf UI.Commands#
	 * @see UI.Commands#InputType
	 */
	
	/**
	 * Add a line break.
	 * @name EnterKeyType.Return
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Indicate that the user is done editing text.
	 * @name EnterKeyType.Done
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Advance to the next text field.
	 * @name EnterKeyType.Next
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Submit the user's input.
	 * @name EnterKeyType.Submit
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Go to a webpage.
	 * @name EnterKeyType.Go
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Perform a search.
	 * @name EnterKeyType.Search
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Send a message.
	 * @name EnterKeyType.Send
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for the input type to use for a text field. For devices that have soft keyboards,
	 * the device uses this value and the value of `{@link UI.Commands#EnterKeyType}` to control 
	 * which keyboard is displayed to the user.
	 * @name InputType
	 * @fieldOf UI.Commands#
	 * @see UI.Commands#EnterKeyType
	 */
	
	/**
	 * The field will contain text and should not be autocorrected.
	 * @name InputType.None
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain text and should be autocorrected.
	 * @name InputType.TextWithCorrection
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain a password.
	 * @name InputType.Password
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain a numeric value.
	 * @name InputType.Numeric
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain an email address.
	 * @name InputType.Email
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain a URL.
	 * @name InputType.URL
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field will contain a date.
	 * @name InputType.Date
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The field should cover the entire screen in landscape mode. Available only on Android.
	 * @name InputType.ANDROID_LANDSCAPE_FULLSCREEN
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Arrangement of combinations of text and images for buttons. When stacked, the button rect
	 * will be divided proportionally into two rects that completely cover the button. Gravity will
	 * apply to the image and text within their rects.
	 * @name ButtonLayout
	 * @fieldOf UI.Commands#
	 * @ignore
	 */

	
	/**
	 * Enumeration for the direction in which the user swiped a finger.
	 * @name SwipeDirection
	 * @fieldOf UI.Commands#
	 * @see UI.AbstractView#event:setOnSwipe
	 */
	
	/**
	 * The user swiped left.
	 * @name SwipeDirection.Left
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The user swiped right.
	 * @name SwipeDirection.Right
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The user swiped up.
	 * @name SwipeDirection.Up
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The user swiped down.
	 * @name SwipeDirection.Down
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for the orientations in which a view should be visible.
	 * @name OrientationFlag
	 * @fieldOf UI.Commands#
	 * @see UI.AbstractView#setVisibleInOrientations
	 */
	
	/**
	 * Display the view when in landscape mode.
	 * @name OrientationFlag.Landscape
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Display the view when in portrait mode.
	 * @name OrientationFlag.Portrait
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	/**
	 * Enumeration for controlling the types of fields that are autodetected in web views. Available
	 * only on iOS.
	 * @name Autodetect
	 * @fieldOf UI.Commands#
	 * @see UI.WebView#setAutodetection
	 */
	
	/**
	 * Disable autodetection. Available only on iOS.
	 * @name Autodetect.None
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Autodetect phone numbers, and show them as links. Available only on iOS.
	 * @name Autodetect.Phone
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Enumeration for the types of errors that can result from attempting to retrieve a file. In
	 * addition to these enumerated values, the application may receive a numeric HTTP error code.
	 * @name ResourceError
	 * @fieldOf UI.Commands#
	 */
	
	/**
	 * No error occurred.
	 * @name ResourceError.None
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * An unspecified error occurred.
	 * @name ResourceError.Other
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The requested file could not be found.
	 * @name ResourceError.File_Not_Found
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The file could not be loaded because the device is out of memory.
	 * @name ResourceError.Out_Of_Memory
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The file could not be loaded because of a problem with network connectivity.
	 * @name ResourceError.Connectivity_Error
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * The file could not be decoded.
	 * @name ResourceError.Decode_Failed
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Enumeration for screenshot options.
	 * @name ScreenshotType
	 * @fieldOf UI.Commands#
	 */
	
	/**
	 * Capture graphics drawn with both the `UI` and `{@link GL2}` modules.
	 * @name ScreenshotType.Normal
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Only capture graphics drawn with the `{@link GL2}` module.
	 * @name ScreenshotType.GLOnly
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	/**
	 * Only capture graphics drawn with the `UI` module.
	 * @name ScreenshotType.UIOnly
	 * @fieldOf UI.Commands#
	 * @constant
	 */
	
	
	
// {{?Wg Generated Code}}
	
	// Enums.
	FitMode:
	{ 
		None: 0,
		Inside: 1,
		Fill: 2,
		Stretch: 3,
		AspectWidth: 5,
		AspectHeight: 6,
		InsideNoUpscaling: 7
	},
	
	Scaling:
	{ 
		Pixels: 0,
		Points: 1,
		Unit: 2,
		Percent: 3,
		iPhone: 4
	},
	
	FontStyle:
	{ 
		Normal: 0,
		Bold: 1,
		Italic: 2,
		BoldItalic: 3
	},
	
	State:
	{ 
		Normal: 0x00,
		Focused: 0x01,
		Selected: 0x02,
		Pressed: 0x04,
		Checked: 0x08,
		Custom: 0x00FF0000,
		Disabled: 0x40000000
	},
	
	EnterKeyType:
	{ 
		Return: 0,
		Done: 1,
		Next: 2,
		Submit: 3,
		Go: 4,
		Search: 5,
		Send: 6
	},
	
	InputType:
	{ 
		None: 0,
		TextWithCorrection: 1,
		Password: 2,
		Numeric: 4,
		Email: 5,
		URL: 6,
		Date: 7,
		ANDROID_LANDSCAPE_FULLSCREEN: 8
	},
	
	ButtonLayout:
	{ 
		CenterTextOver: 0,
		StackImageLeft: 1,
		StackImageTop: 2,
		StackImageRight: 3,
		StackImageBottom: 4,
		CenterImageOver: 5
	},
	
	SwipeDirection:
	{ 
		Left: 1,
		Right: 2,
		Up: 3,
		Down: 4
	},
	
	OrientationFlag:
	{ 
		Landscape: 0x01,
		Portrait: 0x02
	},
	
	Autodetect:
	{ 
		None: 0,
		Phone: 1
	},
	
	ResourceError:
	{ 
		None: 0,
		Other: -1,
		File_Not_Found: -2,
		Out_Of_Memory: -3,
		Connectivity_Error: -4,
		Decode_Failed: -5
	},
	
	ScreenshotType:
	{ 
		Normal: 0,
		GLOnly: 1,
		UIOnly: 2
	},
	
	///////
	// Class Summary and Generated Constants (for internal use only):
	_classId: 337,
	// Method -1: _initializeNative ( int reservedId )
	// Method -2: _create ( int newObjectId, str className )
	// Method 3: _destroy (  )
	// Method 4: _setActive ( bool active )
	// Method 5: _setTouchable ( bool touchable )
	// Method 6: _enableEvent ( str eventName )
	// Method 7: _disableEvent ( str eventName )
	// Method -8: _eventOccurred ( json eventObject )
	// Method 9: _setIsVisible ( bool visible )
	// Method 10: _setEnabled ( bool enable )
	// Method 11: _setState ( int state )
	// Method 12: _addSubview ( int __objectRegistryId, int index )
	// Method 13: _removeFromSuperview (  )
	// Method -14: _startAnimation ( int durationMs, str callbackId )
	// Method -15: _executeAnimation ( json options )
	// Method 16: _setFrame ( float x, float y, float w, float h )
	// Method 17: _setOrigin ( float x, float y )
	// Method 18: _setAnchor ( float x, float y )
	// Method 19: _setSize ( float w, float h )
	// Method 20: _setTransform ( float a, float b, float c, float d, float tx, float ty )
	// Method 21: _setBackgroundColor ( str color )
	// Method 22: _setImage ( int state, str imageURL )
	// Method 23: _setImageBorder ( int state, json gradientJSON )
	// Method 24: _setImageFitMode ( int fitMode )
	// Method 25: _setImageGravity ( float x, float y )
	// Method 26: _setImageOrigin ( float x, float y )
	// Method 27: _setImageAnchor ( float x, float y )
	// Method 28: _setImageSize ( float w, float h )
	// Method 29: _setImageInsets ( float t, float r, float b, float l )
	// Method 30: _setImageTransform ( float a, float b, float c, float d, float tx, float ty )
	// Method 31: _setText ( int state, str text )
	// Method 32: _setTextColor ( int state, str text )
	// Method 33: _setTextFont ( int state, str fontName )
	// Method 34: _setTextShadow ( int state, str shadow )
	// Method 35: _setTextSize ( float textFontSize )
	// Method 36: _setTextGravity ( float x, float y )
	// Method 37: _setTextInsets ( float t, float r, float b, float l )
	// Method 38: _setTextOverflow ( int overflowMode )
	// Method 39: _setTextMaxLines ( int maxLines )
	// Method 40: _setTextMinSize ( float minSize )
	// Method 41: _setTitle ( int state, str title )
	// Method 42: _setTitleColor ( int state, str title )
	// Method 43: _setTitleFont ( int state, str fontName )
	// Method 44: _setTitleShadow ( int state, str shadow )
	// Method 45: _setTitleSize ( float titleFontSize )
	// Method 46: _setTitleGravity ( float x, float y )
	// Method 47: _setTitleInsets ( float t, float r, float b, float l )
	// Method 48: _setTitleOverflow ( int overflowMode )
	// Method 49: _setTitleMaxLines ( int maxLines )
	// Method 50: _setTitleMinSize ( float minSize )
	// Method 51: _setGradient ( int state, json gradientJSON )
	// Method 52: _setStringValue ( str value )
	// Method 53: _setFloatValue ( float value )
	// Method 54: _setIntValue ( int value )
	// Method 55: _setBoolValue ( bool value )
	// Method 56: _setButtonLayout ( int layoutType )
	// Method 57: _setContentInsets ( float t, float r, float b, float l )
	// Method 58: _setBarGradient ( int state, json gradientJSON )
	// Method 59: _setPlaceholderText ( str placeholder )
	// Method 60: _setPlaceholderTextColor ( str color )
	// Method 61: _setPlaceholderTextShadow ( str shadow )
	// Method 62: _setEnterKeyType ( int enterKeyType )
	// Method 63: _setInputType ( int inputType )
	// Method 64: _setChecked ( bool checked )
	// Method 65: _setScrollPosition ( float x, float y )
	// Method 66: _setScrollableSize ( float w, float h )
	// Method 67: _setSections ( json idArray )
	// Method 68: _setTitleView ( int titleObjectID )
	// Method 69: _setSourceDocument ( str documentURL )
	// Method 70: _setChoices ( json stringArray, int defaultChoiceIndex, int cancelChoiceIndex )
	// Method 71: _show (  )
	// Method 72: _hide (  )
	// Method 73: _setPostData ( str data )
	// Method 74: _loadPostURL ( str url )
	// Method 75: _loadGetURL ( str url )
	// Method 76: _loadURL ( str url, json headers, float timeout )
	// Method 77: _stopLoading (  )
	// Method 78: _reload (  )
	// Method 79: _invoke ( str script )
	// Method 80: _goBack (  )
	// Method 81: _goForward (  )
	// Method 82: _setBasicAuthCredentials ( json credentials )
	// Method 83: _setRightImage ( int state, str rightImageURL )
	// Method 84: _setRightImageBorder ( int state, json gradientJSON )
	// Method 85: _setRightImageFitMode ( int fitMode )
	// Method 86: _setRightImageGravity ( float x, float y )
	// Method 87: _setRightImageOrigin ( float x, float y )
	// Method 88: _setRightImageAnchor ( float x, float y )
	// Method 89: _setRightImageSize ( float w, float h )
	// Method 90: _setRightImageInsets ( float t, float r, float b, float l )
	// Method 91: _setRightImageTransform ( float a, float b, float c, float d, float tx, float ty )
	// Method -92: _setStatusBarHidden ( bool statusBarStatus )
	// Method 93: _pauseAds (  )
	// Method 94: _resumeAds (  )
	// Method 95: _setAdRefreshRate ( int refreshRate )
	// Method 96: _setAdAllowAutoplay ( bool autoplay )
	// Method 97: _setAlpha ( float alpha )
	// Method 98: _postURL ( str url, str data )
	// Method 99: _setProgressGradient ( int state, json gradientJSON )
	// Method 100: _setSecondaryGradient ( int state, json gradientJSON )
	// Method 101: _setProgress ( float progress, float secondaryProgress )
	// Method 102: _useForUpdateProgress ( bool use )
	// Method 103: _setDarkStyle ( bool use )
	// Method -104: _doCompositeImages ( int w, int h, str filename, json infoArray, str callbackId )
	// Method -105: _REMOVED_doChoosePhoto ( int w, int h, str filename, json options, str callbackId )
	// Method -106: _doChooseCamera ( int w, int h, str filename, json options, str callbackId )
	// Method 107: _setScrollable ( bool enabled )
	// Method 108: _setZoomable ( bool enabled )
	// Method 109: _addAnnotation ( int __objectRegistryId )
	// Method 110: _removeAnnotation ( int __objectRegistryId )
	// Method 111: _selectAnnotation ( int __objectRegistryId )
	// Method 112: _setRegion ( float latitude, float longitude, float latitudeDelta, float longitudeDelta, bool animated )
	// Method 113: _setView ( int __objectRegistryId )
	// Method 114: _setCoordinate ( float latitude, float longitude )
	// Method 115: _setCalloutTitle ( str title )
	// Method 116: _setCalloutSubtitle ( str subTitle )
	// Method 117: _setCalloutEnabled ( bool enabled )
	// Method 118: _setCalloutLeftView ( int __objectRegistryId )
	// Method 119: _setCalloutRightView ( int __objectRegistryId )
	// Method 120: _setCenterOffset ( float xOffset, float yOffset )
	// Method -121: _doChoosePhoto ( int w, int h, str filename, json options, str callbackId, int invokingView )
	// Method 122: _setScrollIndicatorsVisible ( bool enabled )
	// Method -123: _measureText ( str string, int w, int h, str font, float fontSize, str callbackId )
	// Method 124: _setFocus ( bool enabled )
	// Method 125: _setViewportEnabled ( bool enabled )
	// Method 126: _clearAnimations (  )
	// Method 127: _setStyle ( int styleID )
	// Method 128: _setVisibleInOrientations ( int orientationFlags )
	// Method 129: _setAutodetection ( int type )
	// Method 130: _playVideo ( str path, str callbackId )
	// Method 131: _setLineHeight ( float lineHeight )
	// Method -132: _hideKeyboard (  )
	// Method -133: _takeScreenshot ( int w, int h, str filename, json options, str callbackId )
	// Method 134: _setPluginsEnabled ( bool enable )
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift() );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift() );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Commands._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -8:
					Commands._eventOccurredRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in Commands._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) == 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[337] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	$_eventOccurredRecvGen: function( cmd, obj )
	{ 
		if( cmd.length != 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Commands.eventOccurred from command: " + cmd );
			return false;
		}
		
		obj[ "eventObject" ] = Core.Proc.parseObject( cmd[ 0 ] );
		if( obj[ "eventObject" ] === undefined )
		{
			NgLogE("Could not parse eventObject in Commands.eventOccurred from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$initializeNative: function( reservedId )
	{
		Core.Proc.appendToCommandString( 0x151ffff, [ +reservedId ] );
	},
	
	/** @private */
	$create: function( newObjectId, className )
	{
		Core.Proc.appendToCommandString( 0x151fffe, [ +newObjectId, Core.Proc.encodeString( className ) ] );
	},
	
	/** @private */
	destroy: function(  )
	{
		Core.Proc.appendToCommandString( 0x1510003, this );
	},
	
	/** @private */
	setActive: function( active )
	{
		Core.Proc.appendToCommandString( 0x1510004, this, [ ( active ? 1 : 0 ) ] );
	},
	
	/** @private */
	setTouchable: function( touchable )
	{
		Core.Proc.appendToCommandString( 0x1510005, this, [ ( touchable ? 1 : 0 ) ] );
	},
	
	/** @private */
	enableEvent: function( eventName )
	{
		Core.Proc.appendToCommandString( 0x1510006, this, [ Core.Proc.encodeString( eventName ) ] );
	},
	
	/** @private */
	disableEvent: function( eventName )
	{
		Core.Proc.appendToCommandString( 0x1510007, this, [ Core.Proc.encodeString( eventName ) ] );
	},
	
	/** @private */
	setIsVisible: function( visible )
	{
		Core.Proc.appendToCommandString( 0x1510009, this, [ ( visible ? 1 : 0 ) ] );
	},
	
	/** @private */
	setEnabled: function( enable )
	{
		Core.Proc.appendToCommandString( 0x151000a, this, [ ( enable ? 1 : 0 ) ] );
	},
	
	/** @private */
	setState: function( state )
	{
		Core.Proc.appendToCommandString( 0x151000b, this, [ +state ] );
	},
	
	/** @private */
	addSubview: function( __objectRegistryId, index )
	{
		Core.Proc.appendToCommandString( 0x151000c, this, [ +__objectRegistryId, +index ] );
	},
	
	/** @private */
	removeFromSuperview: function(  )
	{
		Core.Proc.appendToCommandString( 0x151000d, this );
	},
	
	/** @private */
	$startAnimation: function( durationMs, callbackId )
	{
		Core.Proc.appendToCommandString( 0x151fff2, [ +durationMs, Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	$executeAnimation: function( options )
	{
		Core.Proc.appendToCommandString( 0x151fff1, [ Core.Proc.encodeObject( options ) ] );
	},
	
	/** @private */
	setFrame: function( x, y, w, h )
	{
		Core.Proc.appendToCommandString( 0x1510010, this, [ +x, +y, +w, +h ] );
	},
	
	/** @private */
	setOrigin: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510011, this, [ +x, +y ] );
	},
	
	/** @private */
	setAnchor: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510012, this, [ +x, +y ] );
	},
	
	/** @private */
	setSize: function( w, h )
	{
		Core.Proc.appendToCommandString( 0x1510013, this, [ +w, +h ] );
	},
	
	/** @private */
	setTransform: function( a, b, c, d, tx, ty )
	{
		Core.Proc.appendToCommandString( 0x1510014, this, [ +a, +b, +c, +d, +tx, +ty ] );
	},
	
	/** @private */
	setBackgroundColor: function( color )
	{
		Core.Proc.appendToCommandString( 0x1510015, this, [ Core.Proc.encodeString( color ) ] );
	},
	
	/** @private */
	setImage: function( state, imageURL )
	{
		Core.Proc.appendToCommandString( 0x1510016, this, [ +state, Core.Proc.encodeString( imageURL ) ] );
	},
	
	/** @private */
	setImageBorder: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x1510017, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setImageFitMode: function( fitMode )
	{
		Core.Proc.appendToCommandString( 0x1510018, this, [ +fitMode ] );
	},
	
	/** @private */
	setImageGravity: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510019, this, [ +x, +y ] );
	},
	
	/** @private */
	setImageOrigin: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x151001a, this, [ +x, +y ] );
	},
	
	/** @private */
	setImageAnchor: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x151001b, this, [ +x, +y ] );
	},
	
	/** @private */
	setImageSize: function( w, h )
	{
		Core.Proc.appendToCommandString( 0x151001c, this, [ +w, +h ] );
	},
	
	/** @private */
	setImageInsets: function( t, r, b, l )
	{
		Core.Proc.appendToCommandString( 0x151001d, this, [ +t, +r, +b, +l ] );
	},
	
	/** @private */
	setImageTransform: function( a, b, c, d, tx, ty )
	{
		Core.Proc.appendToCommandString( 0x151001e, this, [ +a, +b, +c, +d, +tx, +ty ] );
	},
	
	/** @private */
	setText: function( state, text )
	{
		Core.Proc.appendToCommandString( 0x151001f, this, [ +state, Core.Proc.encodeString( text ) ] );
	},
	
	/** @private */
	setTextColor: function( state, text )
	{
		Core.Proc.appendToCommandString( 0x1510020, this, [ +state, Core.Proc.encodeString( text ) ] );
	},
	
	/** @private */
	setTextFont: function( state, fontName )
	{
		Core.Proc.appendToCommandString( 0x1510021, this, [ +state, Core.Proc.encodeString( fontName ) ] );
	},
	
	/** @private */
	setTextShadow: function( state, shadow )
	{
		Core.Proc.appendToCommandString( 0x1510022, this, [ +state, Core.Proc.encodeString( shadow ) ] );
	},
	
	/** @private */
	setTextSize: function( textFontSize )
	{
		Core.Proc.appendToCommandString( 0x1510023, this, [ +textFontSize ] );
	},
	
	/** @private */
	setTextGravity: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510024, this, [ +x, +y ] );
	},
	
	/** @private */
	setTextInsets: function( t, r, b, l )
	{
		Core.Proc.appendToCommandString( 0x1510025, this, [ +t, +r, +b, +l ] );
	},
	
	/** @private */
	setTextOverflow: function( overflowMode )
	{
		Core.Proc.appendToCommandString( 0x1510026, this, [ +overflowMode ] );
	},
	
	/** @private */
	setTextMaxLines: function( maxLines )
	{
		Core.Proc.appendToCommandString( 0x1510027, this, [ +maxLines ] );
	},
	
	/** @private */
	setTextMinSize: function( minSize )
	{
		Core.Proc.appendToCommandString( 0x1510028, this, [ +minSize ] );
	},
	
	/** @private */
	setTitle: function( state, title )
	{
		Core.Proc.appendToCommandString( 0x1510029, this, [ +state, Core.Proc.encodeString( title ) ] );
	},
	
	/** @private */
	setTitleColor: function( state, title )
	{
		Core.Proc.appendToCommandString( 0x151002a, this, [ +state, Core.Proc.encodeString( title ) ] );
	},
	
	/** @private */
	setTitleFont: function( state, fontName )
	{
		Core.Proc.appendToCommandString( 0x151002b, this, [ +state, Core.Proc.encodeString( fontName ) ] );
	},
	
	/** @private */
	setTitleShadow: function( state, shadow )
	{
		Core.Proc.appendToCommandString( 0x151002c, this, [ +state, Core.Proc.encodeString( shadow ) ] );
	},
	
	/** @private */
	setTitleSize: function( titleFontSize )
	{
		Core.Proc.appendToCommandString( 0x151002d, this, [ +titleFontSize ] );
	},
	
	/** @private */
	setTitleGravity: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x151002e, this, [ +x, +y ] );
	},
	
	/** @private */
	setTitleInsets: function( t, r, b, l )
	{
		Core.Proc.appendToCommandString( 0x151002f, this, [ +t, +r, +b, +l ] );
	},
	
	/** @private */
	setTitleOverflow: function( overflowMode )
	{
		Core.Proc.appendToCommandString( 0x1510030, this, [ +overflowMode ] );
	},
	
	/** @private */
	setTitleMaxLines: function( maxLines )
	{
		Core.Proc.appendToCommandString( 0x1510031, this, [ +maxLines ] );
	},
	
	/** @private */
	setTitleMinSize: function( minSize )
	{
		Core.Proc.appendToCommandString( 0x1510032, this, [ +minSize ] );
	},
	
	/** @private */
	setGradient: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x1510033, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setStringValue: function( value )
	{
		Core.Proc.appendToCommandString( 0x1510034, this, [ Core.Proc.encodeString( value ) ] );
	},
	
	/** @private */
	setFloatValue: function( value )
	{
		Core.Proc.appendToCommandString( 0x1510035, this, [ +value ] );
	},
	
	/** @private */
	setIntValue: function( value )
	{
		Core.Proc.appendToCommandString( 0x1510036, this, [ +value ] );
	},
	
	/** @private */
	setBoolValue: function( value )
	{
		Core.Proc.appendToCommandString( 0x1510037, this, [ ( value ? 1 : 0 ) ] );
	},
	
	/** @private */
	setButtonLayout: function( layoutType )
	{
		Core.Proc.appendToCommandString( 0x1510038, this, [ +layoutType ] );
	},
	
	/** @private */
	setContentInsets: function( t, r, b, l )
	{
		Core.Proc.appendToCommandString( 0x1510039, this, [ +t, +r, +b, +l ] );
	},
	
	/** @private */
	setBarGradient: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x151003a, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setPlaceholderText: function( placeholder )
	{
		Core.Proc.appendToCommandString( 0x151003b, this, [ Core.Proc.encodeString( placeholder ) ] );
	},
	
	/** @private */
	setPlaceholderTextColor: function( color )
	{
		Core.Proc.appendToCommandString( 0x151003c, this, [ Core.Proc.encodeString( color ) ] );
	},
	
	/** @private */
	setPlaceholderTextShadow: function( shadow )
	{
		Core.Proc.appendToCommandString( 0x151003d, this, [ Core.Proc.encodeString( shadow ) ] );
	},
	
	/** @private */
	setEnterKeyType: function( enterKeyType )
	{
		Core.Proc.appendToCommandString( 0x151003e, this, [ +enterKeyType ] );
	},
	
	/** @private */
	setInputType: function( inputType )
	{
		Core.Proc.appendToCommandString( 0x151003f, this, [ +inputType ] );
	},
	
	/** @private */
	setChecked: function( checked )
	{
		Core.Proc.appendToCommandString( 0x1510040, this, [ ( checked ? 1 : 0 ) ] );
	},
	
	/** @private */
	setScrollPosition: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510041, this, [ +x, +y ] );
	},
	
	/** @private */
	setScrollableSize: function( w, h )
	{
		Core.Proc.appendToCommandString( 0x1510042, this, [ +w, +h ] );
	},
	
	/** @private */
	setSections: function( idArray )
	{
		Core.Proc.appendToCommandString( 0x1510043, this, [ Core.Proc.encodeObject( idArray ) ] );
	},
	
	/** @private */
	setTitleView: function( titleObjectID )
	{
		Core.Proc.appendToCommandString( 0x1510044, this, [ +titleObjectID ] );
	},
	
	/** @private */
	setSourceDocument: function( documentURL )
	{
		Core.Proc.appendToCommandString( 0x1510045, this, [ Core.Proc.encodeString( documentURL ) ] );
	},
	
	/** @private */
	setChoices: function( stringArray, defaultChoiceIndex, cancelChoiceIndex )
	{
		Core.Proc.appendToCommandString( 0x1510046, this, [ Core.Proc.encodeObject( stringArray ), +defaultChoiceIndex, +cancelChoiceIndex ] );
	},
	
	/** @private */
	show: function(  )
	{
		Core.Proc.appendToCommandString( 0x1510047, this );
	},
	
	/** @private */
	hide: function(  )
	{
		Core.Proc.appendToCommandString( 0x1510048, this );
	},
	
	/** @private */
	setPostData: function( data )
	{
		Core.Proc.appendToCommandString( 0x1510049, this, [ Core.Proc.encodeString( data ) ] );
	},
	
	/** @private */
	loadPostURL: function( url )
	{
		Core.Proc.appendToCommandString( 0x151004a, this, [ Core.Proc.encodeString( url ) ] );
	},
	
	/** @private */
	loadGetURL: function( url )
	{
		Core.Proc.appendToCommandString( 0x151004b, this, [ Core.Proc.encodeString( url ) ] );
	},
	
	/** @private */
	loadURL: function( url, headers, timeout )
	{
		Core.Proc.appendToCommandString( 0x151004c, this, [ Core.Proc.encodeString( url ), Core.Proc.encodeObject( headers ), +timeout ] );
	},
	
	/** @private */
	stopLoading: function(  )
	{
		Core.Proc.appendToCommandString( 0x151004d, this );
	},
	
	/** @private */
	reload: function(  )
	{
		Core.Proc.appendToCommandString( 0x151004e, this );
	},
	
	/** @private */
	invoke: function( script )
	{
		Core.Proc.appendToCommandString( 0x151004f, this, [ Core.Proc.encodeString( script ) ] );
	},
	
	/** @private */
	goBack: function(  )
	{
		Core.Proc.appendToCommandString( 0x1510050, this );
	},
	
	/** @private */
	goForward: function(  )
	{
		Core.Proc.appendToCommandString( 0x1510051, this );
	},
	
	/** @private */
	setBasicAuthCredentials: function( credentials )
	{
		Core.Proc.appendToCommandString( 0x1510052, this, [ Core.Proc.encodeObject( credentials ) ] );
	},
	
	/** @private */
	setRightImage: function( state, rightImageURL )
	{
		Core.Proc.appendToCommandString( 0x1510053, this, [ +state, Core.Proc.encodeString( rightImageURL ) ] );
	},
	
	/** @private */
	setRightImageBorder: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x1510054, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setRightImageFitMode: function( fitMode )
	{
		Core.Proc.appendToCommandString( 0x1510055, this, [ +fitMode ] );
	},
	
	/** @private */
	setRightImageGravity: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510056, this, [ +x, +y ] );
	},
	
	/** @private */
	setRightImageOrigin: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510057, this, [ +x, +y ] );
	},
	
	/** @private */
	setRightImageAnchor: function( x, y )
	{
		Core.Proc.appendToCommandString( 0x1510058, this, [ +x, +y ] );
	},
	
	/** @private */
	setRightImageSize: function( w, h )
	{
		Core.Proc.appendToCommandString( 0x1510059, this, [ +w, +h ] );
	},
	
	/** @private */
	setRightImageInsets: function( t, r, b, l )
	{
		Core.Proc.appendToCommandString( 0x151005a, this, [ +t, +r, +b, +l ] );
	},
	
	/** @private */
	setRightImageTransform: function( a, b, c, d, tx, ty )
	{
		Core.Proc.appendToCommandString( 0x151005b, this, [ +a, +b, +c, +d, +tx, +ty ] );
	},
	
	/** @private */
	$setStatusBarHidden: function( statusBarStatus )
	{
		Core.Proc.appendToCommandString( 0x151ffa4, [ ( statusBarStatus ? 1 : 0 ) ] );
	},
	
	/** @private */
	pauseAds: function(  )
	{
		Core.Proc.appendToCommandString( 0x151005d, this );
	},
	
	/** @private */
	resumeAds: function(  )
	{
		Core.Proc.appendToCommandString( 0x151005e, this );
	},
	
	/** @private */
	setAdRefreshRate: function( refreshRate )
	{
		Core.Proc.appendToCommandString( 0x151005f, this, [ +refreshRate ] );
	},
	
	/** @private */
	setAdAllowAutoplay: function( autoplay )
	{
		Core.Proc.appendToCommandString( 0x1510060, this, [ ( autoplay ? 1 : 0 ) ] );
	},
	
	/** @private */
	setAlpha: function( alpha )
	{
		Core.Proc.appendToCommandString( 0x1510061, this, [ +alpha ] );
	},
	
	/** @private */
	postURL: function( url, data )
	{
		Core.Proc.appendToCommandString( 0x1510062, this, [ Core.Proc.encodeString( url ), Core.Proc.encodeString( data ) ] );
	},
	
	/** @private */
	setProgressGradient: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x1510063, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setSecondaryGradient: function( state, gradientJSON )
	{
		Core.Proc.appendToCommandString( 0x1510064, this, [ +state, Core.Proc.encodeObject( gradientJSON ) ] );
	},
	
	/** @private */
	setProgress: function( progress, secondaryProgress )
	{
		Core.Proc.appendToCommandString( 0x1510065, this, [ +progress, +secondaryProgress ] );
	},
	
	/** @private */
	useForUpdateProgress: function( use )
	{
		Core.Proc.appendToCommandString( 0x1510066, this, [ ( use ? 1 : 0 ) ] );
	},
	
	/** @private */
	setDarkStyle: function( use )
	{
		Core.Proc.appendToCommandString( 0x1510067, this, [ ( use ? 1 : 0 ) ] );
	},
	
	/** @private */
	$doCompositeImages: function( w, h, filename, infoArray, callbackId )
	{
		Core.Proc.appendToCommandString( 0x151ff98, [ +w, +h, Core.Proc.encodeString( filename ), Core.Proc.encodeObject( infoArray ), Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	$doChooseCamera: function( w, h, filename, options, callbackId )
	{
		Core.Proc.appendToCommandString( 0x151ff96, [ +w, +h, Core.Proc.encodeString( filename ), Core.Proc.encodeObject( options ), Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	setScrollable: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x151006b, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	setZoomable: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x151006c, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	addAnnotation: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x151006d, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	removeAnnotation: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x151006e, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	selectAnnotation: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x151006f, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	setRegion: function( latitude, longitude, latitudeDelta, longitudeDelta, animated )
	{
		Core.Proc.appendToCommandString( 0x1510070, this, [ +latitude, +longitude, +latitudeDelta, +longitudeDelta, ( animated ? 1 : 0 ) ] );
	},
	
	/** @private */
	setView: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x1510071, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	setCoordinate: function( latitude, longitude )
	{
		Core.Proc.appendToCommandString( 0x1510072, this, [ +latitude, +longitude ] );
	},
	
	/** @private */
	setCalloutTitle: function( title )
	{
		Core.Proc.appendToCommandString( 0x1510073, this, [ Core.Proc.encodeString( title ) ] );
	},
	
	/** @private */
	setCalloutSubtitle: function( subTitle )
	{
		Core.Proc.appendToCommandString( 0x1510074, this, [ Core.Proc.encodeString( subTitle ) ] );
	},
	
	/** @private */
	setCalloutEnabled: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x1510075, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	setCalloutLeftView: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x1510076, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	setCalloutRightView: function( __objectRegistryId )
	{
		Core.Proc.appendToCommandString( 0x1510077, this, [ +__objectRegistryId ] );
	},
	
	/** @private */
	setCenterOffset: function( xOffset, yOffset )
	{
		Core.Proc.appendToCommandString( 0x1510078, this, [ +xOffset, +yOffset ] );
	},
	
	/** @private */
	$doChoosePhoto: function( w, h, filename, options, callbackId, invokingView )
	{
		Core.Proc.appendToCommandString( 0x151ff87, [ +w, +h, Core.Proc.encodeString( filename ), Core.Proc.encodeObject( options ), Core.Proc.encodeString( callbackId ), +invokingView ] );
	},
	
	/** @private */
	setScrollIndicatorsVisible: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x151007a, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	$measureText: function( string, w, h, font, fontSize, callbackId )
	{
		Core.Proc.appendToCommandString( 0x151ff85, [ Core.Proc.encodeString( string ), +w, +h, Core.Proc.encodeString( font ), +fontSize, Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	setFocus: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x151007c, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	setViewportEnabled: function( enabled )
	{
		Core.Proc.appendToCommandString( 0x151007d, this, [ ( enabled ? 1 : 0 ) ] );
	},
	
	/** @private */
	clearAnimations: function(  )
	{
		Core.Proc.appendToCommandString( 0x151007e, this );
	},
	
	/** @private */
	setStyle: function( styleID )
	{
		Core.Proc.appendToCommandString( 0x151007f, this, [ +styleID ] );
	},
	
	/** @private */
	setVisibleInOrientations: function( orientationFlags )
	{
		Core.Proc.appendToCommandString( 0x1510080, this, [ +orientationFlags ] );
	},
	
	/** @private */
	setAutodetection: function( type )
	{
		Core.Proc.appendToCommandString( 0x1510081, this, [ +type ] );
	},
	
	/** @private */
	playVideo: function( path, callbackId )
	{
		Core.Proc.appendToCommandString( 0x1510082, this, [ Core.Proc.encodeString( path ), Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	setLineHeight: function( lineHeight )
	{
		Core.Proc.appendToCommandString( 0x1510083, this, [ +lineHeight ] );
	},
	
	/** @private */
	$hideKeyboard: function(  )
	{
		Core.Proc.appendToCommandString( 0x151ff7c );
	},
	
	/** @private */
	$takeScreenshot: function( w, h, filename, options, callbackId )
	{
		Core.Proc.appendToCommandString( 0x151ff7b, [ +w, +h, Core.Proc.encodeString( filename ), Core.Proc.encodeObject( options ), Core.Proc.encodeString( callbackId ) ] );
	},
	
	/** @private */
	setPluginsEnabled: function( enable )
	{
		Core.Proc.appendToCommandString( 0x1510086, this, [ ( enable ? 1 : 0 ) ] );
	},
	

// {{/Wg Generated Code}}







	_eventOccurredRecv: function( cmd ) {
		var str = Core.Proc.parseString( cmd[ 0 ] );
		if(!Commands.Window){
			//Annoying. TODO fix this!
			require("./Window");
		}
		Commands.Window.doCommand(str);
	},
	
	registerTemporaryCallback: function( callback ) {
		if (typeof callback != 'function') return null;
		var regId = (++this._tempCBCount).toString(36);
		Commands._tempCBs[regId] = callback;
		return regId;
	},
	
	takeTemporaryCallback: function( regId ) {
		var cb = Commands._tempCBs[regId];
		delete Commands._tempCBs[regId];
		return cb;
	},
    
	// documented as UI#animate
	/** @ignore */
	animate: function(action, duration, callback) {
		if (typeof action == 'function') {
			var cbFn = (typeof callback == 'function') ? callback : duration;
			var dur = (typeof duration == 'number') ? duration : callback;
			if (typeof dur != 'number') dur = 400;

			Commands.startAnimation( dur, Commands.registerTemporaryCallback(callback));
			var options = new UIAnimationOptions();
			action(options);
			Commands.executeAnimation(options);
		}
	}
});

exports.Commands.instantiate();
