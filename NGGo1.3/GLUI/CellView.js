////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Ihsan H
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Size = require('../../NGCore/Client/Core/Size').Size;
var Rect = require('../../NGCore/Client/Core/Rect').Rect;
var Commands = require('./Commands').Commands;
var View = require('./View').View;
var Label = require('./Label').Label;
var Image = require('./Image').Image;

exports.CellView = View.subclass( /** @lends GLUI.CellView.prototype */
{
    classname: "CellView",
    /**
     * @class The <code>CellView</code> class constructs objects that handle cell views in an application. For example, a cell in a scrolling list.
     * These objects are rendered with images on the left and right, and two text areas (title and text) stacked vertically in the middle.
     * @name GLUI.CellView
     * @augments GLUI.View
     */
    initialize: function ($super, properties)
    {
        $super();
        this._rightImage = null;
        this._text = new Label();
        this._text._setClickable(false);
        this._text.setTextGravity([0, 0.5]);
        this.addChild(this._text);
        this._text.setBackgroundColor("00000000");
        this._spriteSize = [64, 64];
        this._title = null;
        if (properties)
        {
            this.setAttributes(properties);
        }
        return this;
    },
    destroy: function ($super)
    {
        if (this._rightImage)
        {
            this._rightImage.destroy();
            this._rightImage = null;
        }
        if (this._title)
        {
            this._title.destroy();
            this._title = null;
        }
        this._spriteSize = null;
        if (this._text)
        {
            this._text.destroy();
            this._text = null;
        }
        $super();
    },
/**
    @private
    */
    __setFrame: function ($super, frame)
    {
        this._text.setFrame([0, 0, this._frame[2], this._frame[3]]);
        if (!this.getOnClick())
        {
            this.setOnClick(function ()
            {});
        }
        $super(frame);
        this._updateDepth();
        this._renderView();
    },
    /**
     * @name GLUI.CellView#setFontLocation
     * @description Set the directory path to the location of a font used by this <code>CellView</code> node.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setFontLocation(0);
     * @param {GLUI.Commands.FontLocation} fontLocation The new value for <code>fontLocation</code>.
     * @see GLUI.CellView#getFontLocation
     * @status Android, Test
     * @function
     */
    setFontLocation: function (aFontLocation)
    {
        this._text.setFontLocation(aFontLocation);
        if (this._title)
        {
            this._title.setFontLocation(aFontLocation);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#getFontLocation
     * @description Retrieve the directory path to the location of a font used by this <code>CellView</code> node.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.getFontLocation();
     * @see GLUI.CellView#setFontLocation
     * @status Android, Test
     * @function
     */
    getFontLocation: function ()
    {
        return this._text.getFontLocation();
    },
    /** 
     * @name GLUI.CellView#setImage
     * @description Set an image URL for a view state. This property defines how an image appears for specific conditions. For example,
     * set one image for the default view state and another image for a view state with focus.
     * @example var splashGraphic = new GLUI.CellView();
     * ...
     * splashGraphic.setImage('./Content/DisabledButton.png', GLUI.Commands.State.Disabled, [100,100]);
     * @see GLUI.CellView#getImage
     * @param {String} imageURL The new image URL.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] A set of flags describing the view state(s) for using this URL.
     * @param {imageSize} dimension of the GLTexture - this is important as GL requires dimension while applying imageFit properties.
     * @status  Android, Test
     * @function
     */
    setImage: function ($super, imageURL, flags, imageSize)
    {
        this.__setterCalledForImageObject();
        if (!imageSize || imageSize.length < 2)
        {
            if (this._frame[3] > 0)
            {
                var x = this._frame[2];
                var y = this._frame[3];
                imageSize = [x, y];
            }
            else
            {
                imageSize = this._spriteSize;
            }
        }
        this._imageObject.setImage(imageURL, flags, imageSize);
        this._renderView();
    },
    /**
     * @name GLUI.CellView#setImageFit
     * @description Set the value of the <code>imageFit</code> property. This property defines the scaling of bitmap images to fit within the bounds of a control
     * @example background.setImageFit(GLUI.Commands.FitMode.None);
     * @param {Number} imageFit The new value for <code>imageFit</code>.
     * @see GLUI.CellView#getImageFit
     * @status Android, Test
     * @function
     */
    setImageFit: function (FitMode)
    {
        this.__setterCalledForImageObject();
        if (this._imageObject)
        {
            this._imageObject.setImageFit(FitMode);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#setImageGravity
     * @description Set the value of the <code>imageGravity</code> property. This property defines how an image is positioned within a viewable area.
     * @example background.setImageGravity([0.5, 0.0]);
     * @param {Array(Number)} imageGravity The new value for <code>imageGravity</code> (expressed as two floats).
     * @see GLUI.CellView#getImageGravity
     * @function
     * @status Android, Test
     */
    setImageGravity: function (imageGravity)
    {
        if (arguments)
        {
            if (arguments.length >= 2)
            {
                imageGravity = [arguments[0], arguments[1]];
            }
            this._imageObject.__setImageGravity(imageGravity);
        }
        else
        {
            throw new Error("Too few arguments for setImageGravity in " + this.classname);
        }
    },
    /**
    @private
    */
    __setImageGravity: function (imageGravity)
    {
        this.__setterCalledForImageObject();
        if (this._imageObject)
        {
            this._imageObject.setImageFit(this.getImageFit());
        }
        return this;
    },
    /**
     * @name GLUI.CellView#getImageFit
     * @description Retrieve the value of the <code>imageFit</code> property.
     * @returns {Number} The current value of <code>imageFit</code>.
     * @see GLUI.CellView#setImageFit
     * @status Android, Test
     * @function
     */
    getImageFit: function ()
    {
        if (this._imageObject)
        {
            return this._imageObject.getImageFit();
        }
        return Commands.FitMode.Inside;
    },
    /**
     * @name GLUI.CellView#getImageGravity
     * @description Retrieve the value of the <code>imageGravity</code> property.
     * @returns {Number} The current value of <code>imageGravity</code>
     * @see GLUI.CellView#setImageGravity
     * @status Android, Test
     * @function
     */
    getImageGravity: function ()
    {
        if (this._imageObject)
        {
            return this._imageObject.getImageGravity();
        }

        return [0.5, 0.5];
    },
    setState: function ($super, flags)
    {
        $super(flags);
        this._text.setState(flags);
        if (this._title)
        {
            this._title.setState(this.getState());
        }
        if (this._rightImage)
        {
            this._rightImage.setState(this.getState());
        }
    },
    /**
     * @name GLUI.CellView#getRightImage
     * @description Retrieve the value of the <code>rightImage</code> property in the specified view state.
     * @returns {String} The current value of <code>rightImage</code>.
     * @function
     * @see GLUI.CellView#setRightImage
     * @status Android, Test
     */
    getRightImage: function (flags)
    {
        if (this._rightImage)
        {
            return this._rightImage.getImage(flags);
        }

        return undefined;
    },
    /**
     * @name GLUI.CellView#getRightImageFit
     * @description Retrieve the value of the <code>rightImageFit</code> property.
     * @returns {Number} The current value of <code>rightImageFit</code>.
     * @status Android, Test
     * @see GLUI.CellView#setRightImageFit
     * @function
     */
    getRightImageFit: function ()
    {
        if (this._rightImage)
        {
            return this._rightImage.getImageFit();
        }

        return Commands.FitMode.Inside;
    },
    /**
     * @name GLUI.CellView#getRightImageGravity
     * @description Retrieve the value of the <code>rightImageGravity</code> property.
     * @returns {Number} The current value of <code>rightImageGravity</code>.
     * @function
     * @status Android, Test
     * @see GLUI.CellView#setRightImageGravity
     */
    getRightImageGravity: function ()
    {
        if (this._rightImage)
        {
            return this._rightImage.getImageGravity();
        }

        return [0.5, 0.5];
    },
    /**
     * @name GLUI.CellView#getTitle
     * @description Retrieve the value of the <code>title</code> property in a view state.
     * @returns {String} The current value of <code>title</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status Android, Test
     * @function
     * @see GLUI.CellView#setTitle
     */
    getTitle: function (flags)
    {
        if (this._title)
        {
            return this._title.getText(flags);
        }
        return undefined;
    },
    /**
     * @name GLUI.CellView#getTitleColor
     * @description Retrieve the value of the <code>titleColor</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>titleColor</code>.
     * @see GLUI.CellView#setTitleColor
     * @status Android, Test
     * @function
     */
    getTitleColor: function (flags)
    {
        if (this._title)
        {
            return this._title.getTextColor(flags);
        }
        
        return undefined;
    },
    /**
     * @name GLUI.CellView#getTitleFont  
     * @description Retrieve the value of the <code>titleFont</code> property in a view state. 
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The UI view state.
     * @returns {String} The current value of <code>titleFont</code>.
     * @function
     * @see GLUI.CellView#setTitleFont
     * @status Android, Test
     */
    getTitleFont: function (flags)
    {
        if (this._title)
        {
            return this._title.getTextFont(flags);
        }
        
        return undefined;
    },
    /**
     * @name GLUI.CellView#getTitleGravity
     * @description Retrieve the value of the <code>titleGravity</code> property. 
     * @returns {Array (Number)} The current value of <code>titleGravity</code>.
     * @see GLUI.CellView#setTitleGravity
     * @function
     * @status Android, Test
     */
    getTitleGravity: function ()
    {
        if (this._title)
        {
            return this._title.getTextGravity();
        }

        return [0.5, 0.5];
    },
    /**
     * @name GLUI.CellView#getTitleInsets
     * @description Retrieve the value of the <code>titleInsets</code> property.
     * @returns {Array (Number)} The current value of <code>titleInsets</code>.
     * @see GLUI.CellView#setTitleInsets
     * @status Android, Test
     * @function
     */
    getTitleInsets: function ()
    {
        if (this._title)
        {
            return this._title.getTextInsets();
        }

        return [0, 0, 0, 0];
    },
    /**
     * @name GLUI.CellView#getTitleShadow
     * @description Retrieve the value of the <code>titleShadow</code> property in a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>titleShadow</code>.
     * @see GLUI.CellView#setTitleShadow
     * @function
     * @status Android, Test
     */
    getTitleShadow: function (flags)
    {
        if (this._title)
        {
            return this._title.getTextShadow(flags);
        }

        return undefined;
    },
    /**
     * @name GLUI.CellView#getTitleSize
     * @description Retrieve the value of the <code>titleSize</code> property.
     * @returns {Number} The current value of <code>titleSize</code>.
     * @see GLUI.CellView#setTitleSize
     * @function
     * @status Android, Test
     */
    getTitleSize: function ()
    {
        if (this._title)
        {
            return this._title.getTextSize();
        }
        return undefined;
    },
    /**
     * @name GLUI.CellView#setRightImage
     * @description Set an image URL for a view state. This property defines how an image appears for specific conditions. For example,
     * set one image for the default view state and another image for a view state with focus.
     * @example var splashGraphic = new GLUI.CellView();
     * ...
     * splashGraphic.setRightImage('./Content/DisabledButton.png', GLUI.Commands.State.Disabled, [100,100]);
     * @see GLUI.CellView#getRightImage
     * @param {String} imageURL The new image URL.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] A set of flags describing the view state(s) for using this URL.
     * @param {imageSize} dimension of the GLTexture - this is important as GL requires dimension while applying imageFit properties.
     * @status  Android, Test
     * @function
     */
    setRightImage: function (imageURL, flags, imageSize)
    {
        if (this._rightImage === null || this._rightImage === undefined)
        {
            this._makeRightImage();
        }
        this._rightImage.setImage(imageURL, flags, imageSize);
        this._renderView();
        return this;
    },
    /**
     * @name GLUI.CellView#setRightImageFit
     * @description Set the value of the <code>rightImageFit</code> property. This property defines the scaling of bitmap images to fit within the bounds of a control
     * @example closureIcon = new GLUI.CellView();
     * ...
     * closureIcon.setRightImageFit(GLUI.Commands.FitMode.None);
     * @param {Number} rightImageFit The new value for <code>rightImageFit</code>.
     * @status Android, Test
     * @see GLUI.CellView#getRightImageFit
     * @function
     */
    setRightImageFit: function (rightImageFit)
    {
        if (this._rightImage === null || this._rightImage === undefined)
        {
            this._makeRightImage();
        }
        this._rightImage.setImageFit(rightImageFit);
        return this;
    },
    /**
     * @name GLUI.CellView#setRightImageGravity
     * @description Set the value of the <code>rightImageGravity</code> property. This property defines how a image for a control is positioned within a viewable area.
     * @example var closureIcon = new GLUI.CellView();
     * ...
     * closureIcon.setRightImageGravity([0.5, 0]);
     * @param {Number} rightImageGravity The new value for <code>rightImageGravity</code>.
     * @function
     * @status Android, Test
     * @see GLUI.CellView#getRightImageGravity
     */
    setRightImageGravity: function (rightImageGravity)
    {
        if (this._rightImage === null || this._rightImage === undefined)
        {
            this._makeRightImage();
        }
        if (arguments)
        {
            if (arguments.length >= 2)
            {
                rightImageGravity = [arguments[0], arguments[1]];
            }
            this._rightImage.__setImageGravity(rightImageGravity);
        }
        else
        {
            throw new Error("Too few arguments for setRightImageGravity in " + this.classname);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#setTitle
     * @description Set the value of the <code>title</code> property for a view state. This property defines the title string for a view in the specified view state.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitle('Game of Foo');
     * @param {String} title The new value for <code>title</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status Android, Test
     * @see GLUI.CellView#getTitle
     * @function
     */
    setTitle: function (title, flags)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        this._title.setText(title, flags);
        this._title.setTextGravity([0, 0.5]);
        this._renderView();
        return this;
    },
    /**
     * @name GLUI.CellView#setText
     * @description Set the value of the <code>text</code> property for a view state. This property defines a text string to use as a label in the specified view state.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setText("Friends List");
     * @param {String} text The new value for <code>text</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getText
     * @status Android,Test
     * @function
     */
    setText: function (text, flags)
    {
        this._text.setText(text, flags || Commands.State.Normal);
        return this;
    },
    /**
     * @name GLUI.CellView#setTextColor
     * @description Set the value of the <code>textColor</code> property for a view state. This property defines the color of a text string for a label in the specified view state.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setTextColor('FFFF');
     * @param {String} textColor The new value for <code>textColor</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getTextColor
     * @status Android, Test
     * @function
     */
    setTextColor: function (textColor, flags)
    {
        this._text.setTextColor(textColor, flags);
        return this;
    },
    /**
     * @name GLUI.CellView#setTextFont
     * @description Set the value of the <code>textFont</code> property. This property defines the font face used with labels for a cellView.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setTextFont(myFont);
     * @param {String} textFont The new value for <code>textFont</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getTextFont
     * @status Android, Test
     * @function
     */
    setTextFont: function (textFont, flags)
    {
        this._text.setTextFont(textFont, flags);
        return this;
    },
    /**
     * @name GLUI.CellView#setTextSize
     * @description Set the value of the <code>textSize</code> property for this <code>CellView</code>. This property defines the size of text strings for a view.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setTextGravity([1, 0.5]);
     * @param {Number} textSize The new value for <code>textSize</code>.
     * @see GLUI.CellView#getTextSize
     * @status Android, Test
     * @function
     */
    setTextSize: function (textSize)
    {
        this._text.setTextSize(textSize);
        return this;
    },
    /**
     * @name GLUI.CellView#setTextGravity
     * @description Set the value of the <code>textGravity</code> property for this <code>CellView</code>. This property defines how a text string is positioned within a viewable area.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setTextGravity([0.1, 0.5]);
     * @param {Number, Array (Number)} textGravity The new value for <code>textGravity</code>. Set as individual components or a single array of components.
     * @see GLUI.CellView#getTextGravity
     * @status Android, Test
     * @function
     */
    setTextGravity: function (textGravity)
    {
        if (arguments)
        {
            if (arguments.length >= 2)
            {
                textGravity = [arguments[0], arguments[1]];
            }
            this._text.__setTextGravity(textGravity);
        }
        else
        {
            throw new Error("Too few arguments for setTextGravity in " + this.classname);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#setTextShadow
     * @description Set the value of the <code>textShadow</code> property for a view state. This property defines the amount of text shadowing used on on text strings in this view.
     * @example var cell = new GLUI.CellView();
     * ...
     * cell.setTextShadow("FF00 0.2");
     * @param {String} textShadow The new value for <code>textShadow</code>.
     * @param {GLUI.Commands.State} [flags=UI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getTextShadow
     * @status Android, Test
     * @function
     */
    setTextShadow: function (textShadow, flags)
    {
        this._text.setTextShadow(textShadow, flags);
    },
    /**
     * @name GLUI.CellView#getText
     * @description Retrieve the value of the <code>text</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value for <code>text</code>.
     * @see GLUI.CellView#setText
     * @status Android, Test
     * @function
     */
    getText: function (flags)
    {
        return this._text.getText(flags);
    },
    /**
     * @name GLUI.CellView#getTextColor
     * @description Retrieve the value of the <code>textColor</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>textColor</code>.
     * @see GLUI.CellView#setTextColor
     * @status Android, Test
     * @function
     */
    getTextColor: function (flags)
    {
        return this._text.getTextColor(flags);
    },
    /**
     * @name GLUI.CellView#getTextSize
     * @description Retrieve the value of the <code>textSize</code> property for this <code>CellView</code>.
     * @returns {Number} The current value of <code>textSize</code>.
     * @see GLUI.CellView#setTextSize
     * @status Android, Test
     * @function
     */
    getTextSize: function ()
    {
        return this._text.getTextSize();
    },
    /**
     * @name GLUI.CellView#getTextFont
     * @description Retrieve the value of the <code>textFont</code> property.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value for <code>textFont</code>.
     * @see GLUI.CellView#setTextFont
     * @status Android, Test
     * @function
     */
    getTextFont: function (flags)
    {
        return this._text.getTextFont(flags);
    },
    /**
     * @name GLUI.CellView#getTextGravity
     * @description Retrieve the value of the <code>textGravity</code> property for this <code>CellView</code>.
     * @returns {Array (Number)} The current value of <code>textGravity</code>.
     * @see GLUI.CellView#setTextGravity
     * @status Android, Test
     * @function
     */
    getTextGravity: function ()
    {
        return this._text.getTextGravity();
    },
    /**
     * @name GLUI.CellView#getTextShadow
     * @description Retrieve the value of the <code>textShadow</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>textShadow</code>.
     * @see GLUI.CellView#setTextShadow
     * @status Android, Test
     * @function
     */
    getTextShadow: function (flags)
    {
        return this._text.getTextShadow(flags);
    },
    /**
     * @name GLUI.CellView#setTitleColor
     * @description Set the value of the <code>titleColor</code> property for a view state. This property defines the title string color for the <code>CellView</code> object in the specified view state.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleColor("FFFF0000");
     * @param {String} titleColor The new value for <code>titleColor</code>.
     * @param {UI.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getTitleColor
     * @function 
     * @status Android, Test
     */
    setTitleColor: function (titleColor, flags)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        this._title.setTextColor(titleColor, flags);
        return this;
    },
    /**
     * @name GLUI.CellView#setTitleFont
     * @description Set the value of the <code>titleFont</code> property in a view state. This property defines the title string font for cell view labels in the specified view state.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleFont(myFont);
     * @param {String} titleFont The new value for <code>titleFont</code>.
     * @param {UI.State} [flags=UI.State.Normal] The UI view state.
     * @function
     * @see UI.CellView#getTitleFont
     * @status iOS, Android, Test
     */
    setTitleFont: function (titleFont, flags)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        this._title.setTextFont(titleFont, flags);
        return this;
    },
    /**
     * @name GLUI.CellView#setTitleGravity
     * @description Set the value of the <code>titleGravity</code> property. This property defines how a title string is positioned within a viewable area.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleGravity([0.5, 0.0]);
     * @param {Array (Number)} titleGravity The new value for <code>titleGravity</code>.
     * @see GLUI.CellView#getTitleGravity
     * @status Android, Test
     * @function
     */
    setTitleGravity: function (titleGravity)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        if (arguments)
        {
            if (arguments.length >= 2)
            {
                titleGravity = [arguments[0], arguments[1]];
            }
            this._title.__setTextGravity(titleGravity);
        }
        else
        {
            throw new Error("Too few arguments for setTitleGravity in " + this.classname);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#setTitleInsets
     * @description Set the value of the <code>titleInsets</code> property. This property defines the viewable area of a title string when applying gravity.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleInsets([10,10,10,10]);
     * @param {Array (Number)} titleInsets The new value for <code>textInsets</code>.
     * @function
     * @see GLUI.CellView#getTitleInsets
     * @status Android, Test
     */
    setTitleInsets: function (titleInsets)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        if (arguments)
        {
            if (arguments.length >= 4)
            {
                titleInsets = [arguments[0], arguments[1], arguments[2], arguments[3]];
            }
            this._title.__setTextInsets(titleInsets);
        }
        else
        {
            throw new Error("Too few arguments for setTitleInsets in " + this.classname);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#setTextInsets
     * @description Set the value of the <code>textInsets</code> property. This property defines the viewable area of a text string when applying gravity.
     * @example var cellText = new GLUI.CellView()
     * ...
     * cellText.setTextInsets([10,10,10,10]);
     * @param {Array (Number)} textInsets The new value for <code>textInsets</code>.
     * @see GLUI.CellView#getTextInsets
     * @status Android, Test
     * @function
     */
    setTextInsets: function (textInsets)
    {
        if (arguments)
        {
            if (arguments.length >= 4)
            {
                textInsets = [arguments[0], arguments[1], arguments[2], arguments[3]];
            }
            this._text.__setTextInsets(textInsets);
        }
        else
        {
            throw new Error("Too few arguments for setTextInsets in " + this.classname);
        }
        return this;
    },
    /**
     * @name GLUI.CellView#getTextInsets
     * @description Retrieve the value of the <code>textInsets</code> property.
     * @returns {Array (Number)} The curent value for <code>textInsets</code>.
     * @see GLUI.CellView#setTextInsets
     * @status Android, Test
     * @function
     */
    getTextInsets: function ()
    {
        return this._text.getTextInsets();
    },
    /**
     * @name GLUI.CellView#setTitleShadow
     * @description Set the value of the <code>titleShadow</code> property in a view state. This property defines the amount of text shadowing used for title strings in a cell view.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleShadow('FFCCCCFF 0.2');
     * @param {String} titleShadow The new value for <code>titleShadow</code>.
     * @param {UI.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status Android, Test
     * @see GLUI.CellView#getTitleShadow
     * @function
     */
    setTitleShadow: function (titleShadow, flags)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        this._title.setTextShadow(titleShadow, flags);
        return this;
    },
    /**
     * @name GLUI.CellView#setTitleSize
     * @description Set the value of the <code>titleSize</code> property. This property defines the text size of title strings in the specified view state.
     * @example var cellTitle = new GLUI.CellView()
     * ...
     * cellTitle.setTitleSize(32);
     * @param {Number} titleSize The new value for <code>textSize</code>.
     * @function
     * @see GLUI.CellView#getTitleSize
     * @status Android, Test
     */
    setTitleSize: function (titleSize)
    {
        if (this._title === null || this._title === undefined)
        {
            this._makeTitle();
        }
        this._title.setTextSize(titleSize);
        return this;
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _makeTitle: function ()
    {
        this._title = new Label();
        this._title.setFontLocation(this._text.getFontLocation());
        this._title._clickable = false;
        this.addChild(this._title);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _makeRightImage: function ()
    {
        this._rightImage = new Image();
        this._rightImage._clickable = false;
        this.addChild(this._rightImage);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _registerSetters: function ($super)
    {
        $super();
        this._setters.visible = this.setVisible.bind(this);
        Commands._registerSettersForLabel(this);
        Commands._registerSettersForCellView(this);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _registerGetters: function ($super)
    {
        $super();
        Commands._registerGettersForLabel(this);
        this._getters.visible = this.getVisible.bind(this);
        Commands._registerGettersForCellView(this);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    __setterCalledForImageObject: function ()
    {
        if (!this._imageObject)
        {
            this._imageObject = new Image();
            this._internalGLObject.addChild(this._imageObject.getGLObject());
            this._imageObject._clickable = false;
            this._imageObject.getGLObject().setDepth(0);
            this._imageObject.setImageFit(Commands.FitMode.AspectHeight);
            this._imageObject.setImageGravity([0, 0.5]);
        }
        return this._imageObject;
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _adjustFrameForText: function ()
    {
        var imageWidth = 0;
        if (!this._frame)
        {
            return;
        }
        if (this._imageObject)
        {
            var size = this.__getImageSize();
            imageWidth = size.getWidth();
        }
        var x = imageWidth;
        var w = this._frame[2] - imageWidth;
        var h = this._frame[3] / 2;
        var frame = [x, h, w, h];
        this._text.setFrame(frame);
        if (w < 1)
        {
            this._text.setVisible(false);
            return; //text will not be visible
        }
        else
        {
            this._text.setVisible(true);
        }
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _adjustFrameForRightImage: function ()
    {
        if (this._rightImage === null || this._rightImage === undefined)
        {
            return;
        }
        var frame = [this._frame[2] - 50, 0, 50, this._frame[3]];
        this._rightImage.setFrame(frame);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _adjustFrameForBgImage: function ()
    {
        if (this._imageObject)
        {
            var frameForBgImage = [0, 0, this._frame[2], this._frame[3]]; //hence it is a child node of view, its position should be 0, 0 locally as this is a background.
            this._imageObject.setFrame(frameForBgImage);
        }
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _adjustFrameForTitle: function ()
    {
        var imageWidth = 0;
        if (!this._frame || !this._title)
        {
            return;
        }
        if (this._imageObject)
        {
            var size = this.__getImageSize();
            imageWidth = size.getWidth();
        }
        var x = imageWidth;
        var y = 0;
        var w = this._frame[2] - imageWidth;
        var h = this._frame[3] / 2;
        var frame = [x, y, w, h];
        this._title.setFrame(frame);
        if (w < 1)
        {
            this._title.setVisible(false);
            return; //text will not be visible
        }
        else
        {
            this._title.setVisible(true);
        }
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    __getImageSize: function ()
    {
        var w = 1;
        var h = 1;
        if (this._imageObject)
        {
            var size = this._imageObject.___getSpriteSizeForCheckBox();
            w = size[0];
            h = size[1];
        }
        return new Size(w, h);
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _updateView: function ($super)
    {
        $super();
        this._renderView();
    },
    /**
     * @function
     * @private
     * @status Android, Flash
     */
    _renderView: function ()
    {
        this._text.setState(this.getState());
        this._adjustFrameForBgImage();
        this._adjustFrameForText();
        this._adjustFrameForTitle();
        this._adjustFrameForRightImage();
        if (this._title)
        {
            this._title.setState(this.getState());
        }
        if (this._rightImage)
        {
            this._rightImage.setState(this.getState());
        }
    },
    ////////////Empty Functions /////////////
    /**
     * @name GLUI.CellView#setImageInsets
     * @description Set the value of the <code>imageInsets</code> property. This property defines the viewable area of an image when applying gravity.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example background.setImageInsets([10,10,10,10]);
     * @param {Number|Array (Number)} imageInsets The new value for <code>imageInsets.</code>. Set as insets or an array of insets (float).
     * @see GLUI.CellView#getImageInsets
     * @status Android, Test
     * @function
     */
    setImageInsets: function (imageInsets)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageInsets(imageInsets) in ' + this.classname);
    },

    /**
     * @name GLUI.CellView#getImageInsets
     * @description Retrieve the value of the <code>imageInsets</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Number|Array (Number)} The current value of <code>imageInsets.</code>.
     * @see GLUI.CellView#setImageInsets
     * @status Android, Test
     * @function
     */
    getImageInsets: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageInsets() in ' + this.classname);
    },

    /**
     * @name GLUI.CellView#setRightImageInsets
     * @description Set the value of the <code>rightImageInsets</code> property. This property defines the viewable area of an image when applying gravity.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example closureIcon.setRightImageInsets([10,10,10,10]);
     * @param {Array (Number)} rightImageInsets The new value for <code>rightImageInsets.</code>. Set as floats (t, r, b, l).
     * @see GLUI.CellView#getRightImageInsets
     * @status Android, Test
     * @function
     */
    setRightImageInsets: function (rightImageInsets)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setRightImageInsets(rightImageInsets) in ' + this.classname);
    },

    /**
     * @name GLUI.CellView#getRightImageInsets
     * @description Retrieve the value of the <code>rightImageInsets</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Array (Number)} The current value of <code>rightImageInsets.</code>.
     * @see GLUI.CellView#setRightImageInsets
     * @status Android, Test
     * @function
     */
    getRightImageInsets: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getRightImageInsets() in ' + this.classname);
    },

    /**
     * @name GLUI.CellView#setImageBorder
     * @description Set the value of the <code>imageBorder</code> property. This property defines a border for images used in the specified view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Object} imageBorder The new value for <code>imageBorder.</code>.
     * @param {GLUI.State} [flags Optional, Default: GLUI.State.Normal] The GLUI view state.
     * @see GLUI.CellView#getImageBorder
     * @status Android, Test
     * @function
     */
    setImageBorder: function (imageBorder, flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageBorder(imageBorder, flags) in ' + this.classname);
    },


    /**
     * @name GLUI.CellView#setImageTransform
     * @description Set the value of the <code>imageTransform</code> property. This property defines data compression for images used with a cell view.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example background.setImageTransform([Math.cos(angle), Math.sin(angle), Math.sin(angle), Math.cos(angle), 0, 0]);
     * @param {Array (Number)} imageTransform The new value for <code>imageTransform.</code> Set as an array of floats (a, b, c, d, tx, ty).
     * @see GLUI.CellView#getImageTransform
     * @status Android, Test
     * @function
     */
    setImageTransform: function (imageTransform)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageTransform(imageTransform) in ' + this.classname);
    },


    /**
     * @name GLUI.CellView#setRightImageBorder
     * @description Set the value of the <code>rightImageBorder</code> property in the specified view state. This property defines a border for images used in the specified view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Object} rightImageBorder The new value for <code>rightImageBorder.</code>
     * @param {GLUI.State} [flags Optional, Default: GLUI.State.Normal] The GLUI View state.
     * @see GLUI.CellView#getRightImageBorder
     * @status Android, Test
     * @function
     */
    setRightImageBorder: function (rightImageBorder, flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setRightImageBorder(rightImageBorder, flags) ' + this.classname);
    },


    /**
     * @name GLUI.CellView#setRightImageTransform
     * @description Set the value of the <code>rightImageTransform</code> property. This property defines data compression for images used with right image objects.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var closureIcon = new UI.CellView();
     * ...
     * closureIcon.setRightImageTransform([Math.cos(angle), Math.sin(angle), Math.sin(angle), Math.cos(angle), 0, 0]);
     * @param {Array (Number)} rightImageTransform The new value for <code>rightImageTransform.</code> Set as six floats (a, b, c, d, tx, ty).
     * @see GLUI.CellView#getRightImageTransform
     * @status Android, Test
     * @function
     */
    setRightImageTransform: function (rightImageTransform)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setRightImageTransform(rightImageTransform) ' + this.classname);
    },


    /**
     * @name GLUI.CellView#getImageBorder
     * @description Retrieve the value of the <code>imageBorder</code> property for a view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {GLUI.State} [flags Optional, Default: UI.State.Normal] The GLUI view state.
     * @returns {Object} The current value of <code>imageBorder.</code>.
     * @see GLUI.CellView#setImageBorder
     * @status Android, Test
     * @function
     */
    getImageBorder: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageBorder() ' + this.classname);
    },


    /**
     * @name GLUI.CellView#getImageTransform
     * @description Retrieve the value of the <code>imageTransform</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Array (Number)} The current value of <code>imageTransform.</code>.
     * @see GLUI.CellView#setImageTransform
     * @status Android, Test
     * @function
     */
    getImageTransform: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageTransform() ' + this.classname);
    },


    /**
     * @name GLUI.CellView#getRightImageBorder
     * @description Retrieve the value of the <code>rightImageBorder</code> property in the specified view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {GLUI.State} [flags Optional, Default: GLUI.State.Normal] The GLUI view state.
     * @returns {Object} The current value of <code>rightImageBorder.</code>.
     * @see GLUI.CellView#setRightImageBorder
     * @status Android, Test
     * @function
     */
    getRightImageBorder: function (flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getRightImageBorder(flags) ' + this.classname);
    },


    /**
     * @name GLUI.CellView#getRightImageTransform
     * @description Retrieve the value of the <code>rightImageTransform</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Array (Number)} The current value of <code>rightImageTransform.</code>.
     * @see GLUI.CellView#setRightImageTransform
     * @status Android, Test
     * @function
     */
    getRightImageTransform: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getRightImageTransform() ' + this.classname);
    }

});
