////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K.
 *  @co-author: Ihsan H.
 *  @co-author: Copied from NGCore - Command.js
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;
var ObjectRegistry = require('../../NGCore/Client/Core/ObjectRegistry').ObjectRegistry;

var Commands = Class.singleton( /** @lends GLUI.Commands.prototype */
{
    /**
     * @name GLUI.Commands
     * @class 
     * @augments Core.Class
     */
    /** 
     * @field
     */
    classname: 'Commands',

    /**
     * @constructs
     */
    initialize: function ()
    {
    },

    // Enums.
    /** 
     * Enumeration for image fit modes.
     * Image Fit is always applied relative to view bounds *after* content insets are applied.
     * @namespace
     */
    FitMode:
    { /** The image content is not scaled at all. */
        None: 0,
        /** The image will be aspect-scaled to fit completely within the view. */
        Inside: 1,
        /** The image will be aspect-scaled to cover the entire view bounds. Clipping may occur. */
        Fill: 2,
        /** The image will be distorted to cover the exact view bounds. */
        Stretch: 3,
        /** The image will be aspect-scaled so its width matches the view bounds. Clipping may occur. */
        AspectWidth: 5,
        /** The image will be aspect-scaled so its height matches the view bounds. Clipping may occur. */
        AspectHeight: 6,
        /** The image will be scaled down to fit completely within the view, but not upscaled. */
        InsideNoUpscaling: 7
    },

    /** 
     * Enumeration for fontLocation
     * @namespace
     */
    FontLocation: { /** Use Default fonts. */
        Default: 0,
        /** Use System fonts. */
        System: 1,
        /** Use bundled fonts that ship with engine and available to all apps. */
        Bundled: 2,
        /** Use custom fonts that are loaded with app manifest. */
        Manifest: 3
    },

    /** 
     * Enumeration for supported units for dimensions.
     * Math.round() is your friend. Sending decimal pixel coordinates can result in unpredictable behavior on various platforms, but half- and quarter-pixels can be useful tools on iOS.
     * @namespace
     */
    Scaling:
    { 
        /** The native format, and the default for view bounds. No conversion will be performed. */
        Pixels: 0,
        /** Adjusted to roughly one typesetting point, downscaled from 72 to 160 dpi. */
        Points: 1,
        /** 1.0 represents 100% of the provided or implied size (usually a view width or height). */
        Unit: 2,
        /** A percentage of the provided or implied size (typically from 0 to 100). */
        Percent: 3,
        /** At this scale, the device's screen is always 320 units wide. */
        iPhone: 4
    },

    /** 
     * Enumeration for text font styles.
     * @namespace
     */
    FontStyle:
    { 
        /** * */
        Normal: 0,
        /** * */
        Bold: 1,
        /** * */
        Italic: 2,
        /** * */
        BoldItalic: 3
    },

    /** 
     * Flags for control / view states. Used in View and its subclasses.
     * When setting content and properties for states, the value with the highest id when AND'ed with the current state, but no additional bits, will be used.
     * @namespace
     */
    State:
    { 
        /** The view is in an unexceptional state. */
        Normal: 0x00,
        /** * */
        Focused: 0x01,
        /** * */
        Selected: 0x02,
        /** * */
        Pressed: 0x04,
        /** * */
        Checked: 0x08,
        /** * */
        Custom: 0x00FF0000,
        /** * */
        Disabled: 0x40000000
    },

    /** 
     * Enumeration for Enter Key Behavior in editable text fields.
     * @private
     */
    EnterKeyType:
    {
        /** * */
        Return: 0,
        /** * */
        Done: 1,
        /** * */
        Next: 2,
        /** * */
        Submit: 3,
        /** * */
        Go: 4,
        /** * */
        Search: 5,
        /** * */
        Send: 6
    },

    /** 
     * Enumeration for Input Types for editable text fields.
     * @private
     */
    InputType:
    {
        /** * */
        None: 0,
        /** * */
        TextWithCorrection: 1,
        /** * */
        Password: 2,
        /** * */
        Numeric: 4,
        /** * */
        Email: 5,
        /** * */
        URL: 6,
        /** * */
        Date: 7,
        /** * */
        ANDROID_LANDSCAPE_FULLSCREEN: 8
    },

    /** 
     * Arrangement of combinations of text and images for buttons. When stacked, the button rect will be divided proportionally into two rects that completely cover the button. Gravity will apply to the image and text within their rects.
     * @private
     */
    ButtonLayout:
    {
        /** The view is in an unexceptional state. */
        CenterTextOver: 0,
        /** * */
        StackImageLeft: 1,
        /** * */
        StackImageTop: 2,
        /** * */
        StackImageRight: 3,
        /** * */
        StackImageBottom: 4,
        /** * */
        CenterImageOver: 5
    },

    /** 
     * Describes what direction a user swiped during a swipe callback.
     * @see UI.AbstractView#setOnSwipe
     * @private
     */
    SwipeDirection:
    {
        /** * */
        Left: 1,
        /** * */
        Right: 2,
        /** * */
        Up: 3,
        /** * */
        Down: 4
    },

    _registerSettersForImage: function (callee)
    {
        if (!callee)
        {
            return;
        }
        callee._setters['image'] = this._setImageProperty.bind("Normal");
        callee._setters['normalImage'] = this._setImageProperty.bind("Normal");
        callee._setters['focusedImage'] = this._setImageProperty.bind("Focused");
        callee._setters['selectedImage'] = this._setImageProperty.bind("Selected");
        callee._setters['pressedImage'] = this._setImageProperty.bind("Pressed");
        callee._setters['checkedImage'] = this._setImageProperty.bind("Checked");
        callee._setters['customImage'] = this._setImageProperty.bind("Custom");
        callee._setters['disabledImage'] = this._setImageProperty.bind("Disabled");

        callee._setters['imageFit'] = this._setImageFit;
        callee._setters['imageGravity'] = this._setImageGravity;

    },
    _registerGettersForImage: function (callee)
    {
        if (!callee)
        {
            return;
        }
        callee._getters['image'] = this._getImageProperty.bind("Normal");
        callee._getters['normalImage'] = this._getImageProperty.bind("Normal");
        callee._getters['focusedImage'] = this._getImageProperty.bind("Focused");
        callee._getters['selectedImage'] = this._getImageProperty.bind("Selected");
        callee._getters['pressedImage'] = this._getImageProperty.bind("Pressed");
        callee._getters['checkedImage'] = this._getImageProperty.bind("Checked");
        callee._getters['customImage'] = this._getImageProperty.bind("Custom");
        callee._getters['disabledImage'] = this._getImageProperty.bind("Disabled");

        callee._getters['imageFit'] = this._getImageFit.bind(callee);
        callee._getters['imageGravity'] = this._getImageGravity.bind(callee);

    },
    _registerSettersForLabel: function (callee)
    {
        if (!callee)
        {
            return;
        }

        callee._setters['text'] = this._setTextProperty.bind("Normal");
        callee._setters['normalText'] = this._setTextProperty.bind("Normal");
        callee._setters['focusedText'] = this._setTextProperty.bind("Focused");
        callee._setters['selectedText'] = this._setTextProperty.bind("Selected");
        callee._setters['pressedText'] = this._setTextProperty.bind("Pressed");
        callee._setters['checkedText'] = this._setTextProperty.bind("Checked");
        callee._setters['customText'] = this._setTextProperty.bind("Custom");
        callee._setters['disabledText'] = this._setTextProperty.bind("Disabled");

        callee._setters['textColor'] = this._setColorProperty.bind("Normal");
        callee._setters['normalTextColor'] = this._setColorProperty.bind("Normal");
        callee._setters['focusedTextColor'] = this._setColorProperty.bind("Focused");
        callee._setters['selectedTextColor'] = this._setColorProperty.bind("Selected");
        callee._setters['pressedTextColor'] = this._setColorProperty.bind("Pressed");
        callee._setters['checkedTextColor'] = this._setColorProperty.bind("Checked");
        callee._setters['customTextColor'] = this._setColorProperty.bind("Custom");
        callee._setters['disabledTextColor'] = this._setColorProperty.bind("Disabled");

        callee._setters['textShadow'] = this._setShadowProperty.bind("Normal");
        callee._setters['normalTextShadow'] = this._setShadowProperty.bind("Normal");
        callee._setters['focusedTextShadow'] = this._setShadowProperty.bind("Focused");
        callee._setters['selectedTextShadow'] = this._setShadowProperty.bind("Selected");
        callee._setters['pressedTextShadow'] = this._setShadowProperty.bind("Pressed");
        callee._setters['checkedTextShadow'] = this._setShadowProperty.bind("Checked");
        callee._setters['customTextShadow'] = this._setShadowProperty.bind("Custom");
        callee._setters['disabledTextShadow'] = this._setShadowProperty.bind("Disabled");

        callee._setters['textFont'] = this._setFontProperty.bind("Normal");
        callee._setters['normalTextFont'] = this._setFontProperty.bind("Normal");
        callee._setters['focusedTextFont'] = this._setFontProperty.bind("Focused");
        callee._setters['selectedTextFont'] = this._setFontProperty.bind("Selected");
        callee._setters['pressedTextFont'] = this._setFontProperty.bind("Pressed");
        callee._setters['checkedTextFont'] = this._setFontProperty.bind("Checked");
        callee._setters['customTextFont'] = this._setFontProperty.bind("Custom");
        callee._setters['disabledTextFont'] = this._setFontProperty.bind("Disabled");

        callee._setters['textSize'] = this._setTextSize.bind(callee);
        callee._setters['textGravity'] = this._setTextGravity.bind(callee);
        callee._setters['textInsets'] = this._setTextInsets.bind(callee);
        callee._setters['fontLocation'] = this._setFontLocation.bind(callee);

    },
    _registerGettersForLabel: function (callee)
    {
        if (!callee)
        {
            return;
        }

        callee._getters['text'] = this._getTextProperty.bind("Normal");
        callee._getters['normalText'] = this._getTextProperty.bind("Normal");
        callee._getters['focusedText'] = this._getTextProperty.bind("Focused");
        callee._getters['selectedText'] = this._getTextProperty.bind("Selected");
        callee._getters['pressedText'] = this._getTextProperty.bind("Pressed");
        callee._getters['checkedText'] = this._getTextProperty.bind("Checked");
        callee._getters['customText'] = this._getTextProperty.bind("Custom");
        callee._getters['disabledText'] = this._getTextProperty.bind("Disabled");

        callee._getters['textColor'] = this._getColorProperty.bind("Normal");
        callee._getters['normalTextColor'] = this._getColorProperty.bind("Normal");
        callee._getters['focusedTextColor'] = this._getColorProperty.bind("Focused");
        callee._getters['selectedTextColor'] = this._getColorProperty.bind("Selected");
        callee._getters['pressedTextColor'] = this._getColorProperty.bind("Pressed");
        callee._getters['checkedTextColor'] = this._getColorProperty.bind("Checked");
        callee._getters['customTextColor'] = this._getColorProperty.bind("Custom");
        callee._getters['disabledTextColor'] = this._getColorProperty.bind("Disabled");

        callee._getters['textShadow'] = this._getShadowProperty.bind("Normal");
        callee._getters['normalTextShadow'] = this._getShadowProperty.bind("Normal");
        callee._getters['focusedTextShadow'] = this._getShadowProperty.bind("Focused");
        callee._getters['selectedTextShadow'] = this._getShadowProperty.bind("Selected");
        callee._getters['pressedTextShadow'] = this._getShadowProperty.bind("Pressed");
        callee._getters['checkedTextShadow'] = this._getShadowProperty.bind("Checked");
        callee._getters['customTextShadow'] = this._getShadowProperty.bind("Custom");
        callee._getters['disabledTextShadow'] = this._getShadowProperty.bind("Disabled");

        callee._getters['textFont'] = this._getFontProperty.bind("Normal");
        callee._getters['normalTextFont'] = this._getFontProperty.bind("Normal");
        callee._getters['focusedTextFont'] = this._getFontProperty.bind("Focused");
        callee._getters['selectedTextFont'] = this._getFontProperty.bind("Selected");
        callee._getters['pressedTextFont'] = this._getFontProperty.bind("Pressed");
        callee._getters['checkedTextFont'] = this._getFontProperty.bind("Checked");
        callee._getters['customTextFont'] = this._getFontProperty.bind("Custom");
        callee._getters['disabledTextFont'] = this._getFontProperty.bind("Disabled");

        callee._getters['textSize'] = this._getTextSize.bind(callee);
        callee._getters['textGravity'] = this._getTextGravity.bind(callee);
        callee._getters['textInsets'] = this._getTextInsets.bind(callee);
        callee._getters['fontLocation'] = this._getFontLocation.bind(callee);


    },

    _registerSettersForCellView: function (callee)
    {
        if (!callee)
        {
            return;
        }
        callee._setters['title'] = this._setTitleProperty.bind("Normal");
        callee._setters['normalTitle'] = this._setTitleProperty.bind("Normal");
        callee._setters['focusedTitle'] = this._setTitleProperty.bind("Focused");
        callee._setters['selectedTitle'] = this._setTitleProperty.bind("Selected");
        callee._setters['pressedTitle'] = this._setTitleProperty.bind("Pressed");
        callee._setters['checkedTitle'] = this._setTitleProperty.bind("Checked");
        callee._setters['customTitle'] = this._setTitleProperty.bind("Custom");
        callee._setters['disabledTitle'] = this._setTitleProperty.bind("Disabled");

        callee._setters['titleColor'] = this._setTitleColorProperty.bind("Normal");
        callee._setters['normalTitleColor'] = this._setTitleColorProperty.bind("Normal");
        callee._setters['focusedTitleColor'] = this._setTitleColorProperty.bind("Focused");
        callee._setters['selectedTitleColor'] = this._setTitleColorProperty.bind("Selected");
        callee._setters['pressedTitleColor'] = this._setTitleColorProperty.bind("Pressed");
        callee._setters['checkedTitleColor'] = this._setTitleColorProperty.bind("Checked");
        callee._setters['customTitleColor'] = this._setTitleColorProperty.bind("Custom");
        callee._setters['disabledTitleColor'] = this._setTitleColorProperty.bind("Disabled");

        callee._setters['titleShadow'] = this._setTitleShadowProperty.bind("Normal");
        callee._setters['normalTitleShadow'] = this._setTitleShadowProperty.bind("Normal");
        callee._setters['focusedTitleShadow'] = this._setTitleShadowProperty.bind("Focused");
        callee._setters['selectedTitleShadow'] = this._setTitleShadowProperty.bind("Selected");
        callee._setters['pressedTitleShadow'] = this._setTitleShadowProperty.bind("Pressed");
        callee._setters['checkedTitleShadow'] = this._setTitleShadowProperty.bind("Checked");
        callee._setters['customTitleShadow'] = this._setTitleShadowProperty.bind("Custom");
        callee._setters['disabledTitleShadow'] = this._setTitleShadowProperty.bind("Disabled");

        callee._setters['titleFont'] = this._setTitleFontProperty.bind("Normal");
        callee._setters['normalTitleFont'] = this._setTitleFontProperty.bind("Normal");
        callee._setters['focusedTitleFont'] = this._setTitleFontProperty.bind("Focused");
        callee._setters['selectedTitleFont'] = this._setTitleFontProperty.bind("Selected");
        callee._setters['pressedTitleFont'] = this._setTitleFontProperty.bind("Pressed");
        callee._setters['checkedTitleFont'] = this._setTitleFontProperty.bind("Checked");
        callee._setters['customTitleFont'] = this._setTitleFontProperty.bind("Custom");
        callee._setters['disabledTitleFont'] = this._setTitleFontProperty.bind("Disabled");

        callee._setters['titleSize'] = this._setTitleSize.bind(callee);
        callee._setters['titleGravity'] = this._setTitleGravity.bind(callee);


        callee._setters['rightImage'] = this._setRightImageProperty.bind("Normal");
        callee._setters['normalRightImage'] = this._setRightImageProperty.bind("Normal");
        callee._setters['focusedRightImage'] = this._setRightImageProperty.bind("Focused");
        callee._setters['selectedRightImage'] = this._setRightImageProperty.bind("Selected");
        callee._setters['pressedRightImage'] = this._setRightImageProperty.bind("Pressed");
        callee._setters['checkedRightImage'] = this._setRightImageProperty.bind("Checked");
        callee._setters['customRightImage'] = this._setRightImageProperty.bind("Custom");
        callee._setters['disabledRightImage'] = this._setRightImageProperty.bind("Disabled");

        callee._setters['rightImageFit'] = this._setRightImageFit.bind(callee);
        callee._setters['rightImageGravity'] = this._setRightImageGravity.bind(callee);


    },
    _registerGettersForCellView: function (callee)
    {
        if (!callee)
        {
            return;
        }

        callee._getters['title'] = this._getTitleProperty.bind("Normal");
        callee._getters['normalTitle'] = this._getTitleProperty.bind("Normal");
        callee._getters['focusedTitle'] = this._getTitleProperty.bind("Focused");
        callee._getters['selectedTitle'] = this._getTitleProperty.bind("Selected");
        callee._getters['pressedTitle'] = this._getTitleProperty.bind("Pressed");
        callee._getters['checkedTitle'] = this._getTitleProperty.bind("Checked");
        callee._getters['customTitle'] = this._getTitleProperty.bind("Custom");
        callee._getters['disabledTitle'] = this._getTitleProperty.bind("Disabled");

        callee._getters['titleColor'] = this._getTitleColorProperty.bind("Normal");
        callee._getters['normalTitleColor'] = this._getTitleColorProperty.bind("Normal");
        callee._getters['focusedTitleColor'] = this._getTitleColorProperty.bind("Focused");
        callee._getters['selectedTitleColor'] = this._getTitleColorProperty.bind("Selected");
        callee._getters['pressedTitleColor'] = this._getTitleColorProperty.bind("Pressed");
        callee._getters['checkedTitleColor'] = this._getTitleColorProperty.bind("Checked");
        callee._getters['customTitleColor'] = this._getTitleColorProperty.bind("Custom");
        callee._getters['disabledTitleColor'] = this._getTitleColorProperty.bind("Disabled");

        callee._getters['titleShadow'] = this._getTitleShadowProperty.bind("Normal");
        callee._getters['normalTitleShadow'] = this._getTitleShadowProperty.bind("Normal");
        callee._getters['focusedTitleShadow'] = this._getTitleShadowProperty.bind("Focused");
        callee._getters['selectedTitleShadow'] = this._getTitleShadowProperty.bind("Selected");
        callee._getters['pressedTitleShadow'] = this._getTitleShadowProperty.bind("Pressed");
        callee._getters['checkedTitleShadow'] = this._getTitleShadowProperty.bind("Checked");
        callee._getters['customTitleShadow'] = this._getTitleShadowProperty.bind("Custom");
        callee._getters['disabledTitleShadow'] = this._getTitleShadowProperty.bind("Disabled");

        callee._getters['titleFont'] = this._getTitleFontProperty.bind("Normal");
        callee._getters['normalTitleFont'] = this._getTitleFontProperty.bind("Normal");
        callee._getters['focusedTitleFont'] = this._getTitleFontProperty.bind("Focused");
        callee._getters['selectedTitleFont'] = this._getTitleFontProperty.bind("Selected");
        callee._getters['pressedTitleFont'] = this._getTitleFontProperty.bind("Pressed");
        callee._getters['checkedTitleFont'] = this._getTitleFontProperty.bind("Checked");
        callee._getters['customTitleFont'] = this._getTitleFontProperty.bind("Custom");
        callee._getters['disabledTitleFont'] = this._getTitleFontProperty.bind("Disabled");

        callee._getters['titleSize'] = this._getTitleSize.bind(callee);
        callee._getters['titleGravity'] = this._getTitleGravity.bind(callee);


        callee._getters['rightImage'] = this._getRightImageProperty.bind("Normal");
        callee._getters['normalRightImage'] = this._getRightImageProperty.bind("Normal");
        callee._getters['focusedRightImage'] = this._getRightImageProperty.bind("Focused");
        callee._getters['selectedRightImage'] = this._getRightImageProperty.bind("Selected");
        callee._getters['pressedRightImage'] = this._getRightImageProperty.bind("Pressed");
        callee._getters['checkedRightImage'] = this._getRightImageProperty.bind("Checked");
        callee._getters['customRightImage'] = this._getRightImageProperty.bind("Custom");
        callee._getters['disabledRightImage'] = this._getRightImageProperty.bind("Disabled");

        callee._getters['rightImageFit'] = this._getRightImageFit.bind(callee);
        callee._getters['rightImageGravity'] = this._getRightImageGravity.bind(callee);
    },

    _setImageProperty: function (callee, args)
    {
        var state = this;
        if (typeof args === 'string')
        {
            var url = args;
            args = {
                url: url,
                size: undefined
            };
        }
        else if (!args || !(args.hasOwnProperty("url")))
        {
            throw new Error("Too few arguments for " + state + "Image ");
        }
        if (!(args.size instanceof Array && args.size.length > 1))
        {
            args.size = [1, 1];
        }

        if (typeof args.url === 'string' && args.url.length > 1)
        {
            return callee.setImage(args.url, Commands.State[state], args.size);
        }
        else
        {
            throw new Error("Invalid arguments for image in setImage | _setNormalImage");
        }
    },
    _getImageProperty: function (callee)
    {
        var state = this;
        return callee.getImage(Commands.State[state] || 0);
    },

    _setTextProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "Text ");
        }
        return callee.setText(args, Commands.State[state]);
    },
    _setFontLocation: function (callee, args)
    {
        callee.setFontLocation(args);
    },
    _getTextProperty: function (callee)
    {
        var state = this;
        return callee.getText(Commands.State[state] || 0);
    },

    _setFontProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TextFont ");
        }

        return callee.setTextFont(args, Commands.State[state]);
    },

    _getFontProperty: function (callee)
    {
        var state = this;
        return callee.getTextFont(Commands.State[state] || 0);
    },

    _setColorProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TextColor ");
        }
        return callee.setTextColor(args, Commands.State[state]);
    },

    _getColorProperty: function (callee)
    {
        var state = this;
        return callee.getTextColor(Commands.State[state] || 0);
    },

    _setShadowProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TextShadow");
        }

        return callee.setTextShadow(args, Commands.State[state]);
    },
    _getShadowProperty: function (callee, state)
    {
        return callee.getTextShadow(Commands.State[state] || 0);
    },

    _setRightImageProperty: function (callee, args)
    {
        var state = this;
        if (!args || !(args.hasOwnProperty("url") && args.hasOwnProperty("size")))
        {
            throw new Error("Too few arguments for " + state + "RightImage ");
        }

        if (typeof args.url === 'string' && args.url.length > 1 && args.size instanceof Array && args.size.length > 1)
        {
            return callee.setRightImage(args.url, Commands.State[state], args.size);
        }
        else
        {
            throw new Error("Invalid arguments for image in setImage | _setNormalRightImage");
        }
    },
    _getRightImageProperty: function (callee)
    {
        var state = this;
        return callee.getRightImage(Commands.State[state] || 0);
    },

    _setImageFit: function (callee, args)
    {
        if (callee.setImageFit)
        {
            return callee.setImageFit(args);
        }
        return undefined;
    },
    _setImageGravity: function (callee, args)
    {
        if (callee.setImageGravity)
        {
            return callee.setImageGravity(args);
        }
        return undefined;
    },

    _getImageFit: function (callee, args)
    {
        if (callee.getImageFit)
        {
            return callee.getImageFit(args);
        }
        return undefined;
    },
    _getImageGravity: function (callee, args)
    {
        if (callee.getImageGravity)
        {
            return callee.getImageGravity(args);
        }
        return undefined;
    },


    _setTextSize: function (callee, args)
    {
        if (callee.setTextSize)
        {
            return callee.setTextSize(args);
        }
        return undefined;
    },

    _setTextGravity: function (callee, args)
    {
        if (callee.setTextGravity)
        {
            return callee.setTextGravity(args);
        }
        return undefined;
    },

    _setTextInsets: function (callee, args)
    {
        if (callee.setTextInsets)
        {
            return callee.setTextInsets(args);
        }
        return undefined;
    },

    _getTextSize: function (callee, args)
    {
        if (callee.getTextSize)
        {
            return callee.getTextSize(args);
        }
        return undefined;
    },
    _getTextGravity: function (callee, args)
    {
        if (callee.getTextGravity)
        {
            return callee.getTextGravity(args);
        }
        return undefined;
    },
    _getTextInsets: function (callee)
    {
        if (callee.getTextInsets)
        {
            return callee.getTextInsets();
        }
        return undefined;
    },
    _getFontLocation: function (callee)
    {
        if (callee.getFontLocation)
        {
            return callee.getFontLocation();
        }
        return undefined;
    },
    _setTitleSize: function (callee, args)
    {
        if (callee.setTitleSize)
        {
            return callee.setTitleSize(args);
        }
        return undefined;
    },
    _setTitleGravity: function (callee, args)
    {
        if (callee.setTitleGravity)
        {
            return callee.setTitleGravity(args);
        }
        return undefined;
    },

    _setRightImageFit: function (callee, args)
    {
        if (callee.setRightImageFit)
        {
            return callee.setRightImageFit(args);
        }
        return undefined;
    },
    _setRightImageGravity: function (callee, args)
    {
        if (callee.setRightImageGravity)
        {
            return callee.setRightImageGravity(args);
        }
        return undefined;
    },

    _getTitleSize: function (callee, args)
    {
        if (callee.setTitleSize)
        {
            return callee.setTitleSize(args);
        }
        return undefined;
    },
    _getTitleGravity: function (callee, args)
    {
        if (callee.getTitleGavity)
        {
            return callee.getTitleGavity(args);
        }
        return undefined;
    },

    _getRightImageFit: function (callee, args)
    {
        if (callee.getRightImageFit)
        {
            return callee.getRightImageFit(args);
        }
        return undefined;
    },
    _getRightImageGravity: function (callee, args)
    {
        if (callee.getRightImageGravity)
        {
            return callee.getRightImageGravity(args);
        }
        return undefined;
    },

    _setTitleProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "Title ");
        }
        return callee.setTitle(args, Commands.State[state]);
    },
    _getTitleProperty: function (callee)
    {
        var state = this;
        return callee.getTitle(Commands.State[state] || 0);
    },

    _setTitleFontProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TitleFont ");
        }

        return callee.setTitleFont(args, Commands.State[state]);
    },

    _getTitleFontProperty: function (callee)
    {
        var state = this;
        return callee.getTitleFont(Commands.State[state] || 0);
    },

    _setTitleColorProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TitleColor ");
        }
        return callee.setTitleColor(args, Commands.State[state]);
    },

    _getTitleColorProperty: function (callee)
    {
        var state = this;
        return callee.getTitleColor(Commands.State[state] || 0);
    },

    _setTitleShadowProperty: function (callee, args)
    {
        var state = this;
        if (!args)
        {
            throw new Error("Too few arguments for " + state + "TitleShadow");
        }

        return callee.setTitleShadow(args, Commands.State[state]);
    },
    _getTitleShadowProperty: function (callee)
    {
        var state = this;
        return callee.getTitleShadow(Commands.State[state] || Commands.State.Normal);
    }


});

exports.Commands = Commands;
