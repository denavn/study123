////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Ihsan H.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var Util = require('./Util').Util;
var Text = require('../../NGCore/Client/GL2/Text').Text;

exports.Label = AbstractView.subclass(
{ /** @lends GLUI.Label.prototype */
    classname: 'Label',
    /**
     * @name GLUI.Label
     * @class The <code>Label</code> class constructs objects for managing strings that are used as application labels. 
     * These objects include access to a wide range of attributes for manipulating the look and feel of application labels.
     * @constructs
     * @augments GLUI.AbstractView
     */


    initialize: function (properties)
    {
        this._internalGLObject = new Text();
        this._internalGLObject.setAnchor(0, 0);
        this._internalGLObject.setColor(0, 0, 0);
        this._internalGLObject.setOverflowMode(Text.OverflowMode.Multiline);
        this._textInset = [0, 0, 0, 0];
        this._shadowValues = [];
        this._textSize = null;
        this._colors = [];
        this._texts = [];
        this._fonts = [];
        this._shadow = null;
        this._textGravity = null;
        this._fontLocation = 0;
        if (properties)
        {
            this.setAttributes(properties);
        }
        return this;
    },


    /**
     * @name GLUI.Label#getText
     * @description Retrieve the value of the <code>text</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value for <code>text</code>.
     * @see GLUI.Label#setText
     * @function
     * @status Android, Test
     *
     */
    getText: function (flags)
    {
        var state = this._getFinalState(flags);
        return this._texts[state + ''];
    },
    /**
     * @name GLUI.Label#getTextColor
     * @description Retrieve the value of the <code>textColor</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>textColor</code>.
     * @see GLUI.Label#setTextColor
     * @status Android, Test
     * @function
     */
    getTextColor: function (flags)
    {
        var state = this._getFinalState(flags);
        return this._colors[state + ''];
    },
    /**
     * @name GLUI.Label#getTextFont
     * @description Retrieve the value of the <code>textFont</code> property.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value for <code>textFont</code>.
     * @see GLUI.Label#setTextFont
     * @status Android, Test
     * @function
     */
    getTextFont: function (flags)
    {
        var state = this._getFinalState(flags);
        return this._fonts[state + ''];
    },
    /**
     * @name GLUI.Label#getTextSize
     * @description Retrieve the value of the <code>textSize</code> property for this <code>Label</code>.
     * @returns {Number} The current value of <code>textSize</code>.
     * @see GLUI.Label#setTextSize
     * @status Android, Test
     * @function
     */
    getTextSize: function ()
    {
        return this._textSize;
    },
    /**
     * @name GLUI.Label#setTextInsets
     * @description Set the value of the <code>textInsets</code> property for this <code>Label</code>. This property defines the viewable area of a text string when applying gravity.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextInsets(0, 0, 0, 64);
     * @param {Number, Array (Number)} textInsets The new value for <code>textInsets</code>. Set as individual components or a single array of components.
     * @see GLUI.Label#getTextInsets
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

            this.__setTextInsets(textInsets);
        }
        else
        {
            throw new Error("Too few arguments for setTextInsets in " + this.classname);
        }
    },
    /**
     * @private
     * @status Android
     */
    __setTextInsets: function (textInset)
    {
        if (textInset.length < 4)
        {
            throw new Error('Too few arguments for \'textInset\' in setTextInsets(textInset)');
        }
		if (isNaN(textInset[0]) || isNaN(textInset[1]) || isNaN(textInset[2]) || isNaN(textInset[3]))
        {
            throw new Error('Wrong arguments for \'textInset\' in setTextInsets(textInset)');
        }
        this._textInset = [textInset[0], textInset[1],textInset[2], textInset[3]];
        var bgColor = this.getBackgroundColor();
        if (!bgColor)
        {
            this.setBackgroundColor("00000000");
        }
        this._renderView();
        return this;
    },
    /**
     * @name GLUI.Label#getTextInsets
     * @description Retrieve the value of the <code>textInsets</code> property for this <code>Label</code>.
     * @returns {Number, Array (Number)} The current value of <code>textInsets</code>.
     * @see GLUI.Label#setTextInsets
     * @status Android, Test
     * @function
     */
    getTextInsets: function ()
    {
        return [this._textInset[0], this._textInset[1], this._textInset[2], this._textInset[3]];
    },

    /*
     * @private
     */
    __setFrame: function ($super, frame)
    {
        $super(frame);
        this._renderView();
    },
    /**
     * @name GLUI.Label#setText
     * @description Set the value of the <code>text</code> property for a view state. This property defines a text string to use as a label in the specified view state.
     * @example var label = new GLUI.Label();
     * ...
     * label.setText("Friends List");
     * @param {String} text The new value for <code>text</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.Label#getText
     * @status Android,Test
     * @function
     */
    setText: function (text, flags)
    {
        var state = this._getFinalState(flags);
        this._texts[state + ''] = text;
        var curState = this._getCurrentState();
        var curText = this._texts[curState + ''];
        this._internalGLObject.setText(curText);
        this._updateShadow();
        return this;
    },


    /**
     * @name GLUI.Label#setTextColor
     * @description Set the value of the <code>textColor</code> property for a view state. This property defines the color of a text string for a label in the specified view state.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextColor('FFFF');
     * @param {String} textColor The new value for <code>textColor</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.Label#getTextColor
     * @status Android, Test
     * @function
     */
    setTextColor: function (color, flags)
    {
        var state = this._getFinalState(flags);
        this._colors[state + ''] = color;
        var curState = this._getCurrentState();
        var currentColor = this._colors[curState + ''];
        var rgbValue = Util.hexToARGB(currentColor);
        this.__internalAlpha = rgbValue[0];
        this._internalGLObject.setColor(rgbValue[1], rgbValue[2], rgbValue[3]);
        this._updateAlpha();
        this._updateShadow();
        return this;
    },
    /**
     * @name GLUI.Label#setTextFont
     * @description Set the value of the <code>textFont</code> property. This property defines the font face used with labels in the specified view state.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextFont(myFont);
     * @param {String} textFont The new value for <code>textFont</code>.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.Label#getTextFont
     * @status Android, Test
     * @function
     */
    setTextFont: function (font, flags)
    {
        var state = this._getFinalState(flags);
        this._fonts[state + ''] = font;
        var curState = this._getCurrentState();
        var currentFont = this._fonts[curState + ''];
        this._internalGLObject.setFontFamily(currentFont);
        this._updateShadow();
        return this;
    },
    /**
     * @name GLUI.Label#setFontLocation
     * @description Set the directory path to the location of a font used by this <code>Label</code> node.
     * @example var label = new GLUI.Label();
     * ...
     * label.setFontLocation(0);
     * @param {GLUI.FontLocation} fontLocation The new value for <code>fontLocation</code>.
     * @see GLUI.Label#getFontLocation
     * @status Android, Test
     * @function
     */
    setFontLocation: function (fontLocation)
    {
        if (fontLocation === null || fontLocation === undefined)
        {
            return;
        }
        this._fontLocation = Text.FontLocation.Default;
        switch (fontLocation)
        {
        case 1:
            this._fontLocation = Text.FontLocation.System;
            break;
        case 2:
            this._fontLocation = Text.FontLocation.Bundled;
            break;
        case 3:
            this._fontLocation = Text.FontLocation.Manifest;
            break;
        }
        this._internalGLObject.setFontLocation(this._fontLocation);
        if (this._shadow)
        {
            this._shadow.setFontLocation(this._fontLocation);
        }

    },

    /**
     * @name GLUI.Label#setTextSize
     * @description Set the value of the <code>textSize</code> property for this <code>Label</code>. This property defines the size of text strings for a label.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextSize(24);
     * @param {Number} textSize The new value for <code>textSize</code>.
     * @see GLUI.Label#getTextSize
     * @status Android, Test
     * @function
     */
    setTextSize: function (size)
    {
        if (isNaN(size))
        {
            throw new Error('Expecting number but found ' + typeof (size) + ' for setTextSize(size)');
        }
        this._textSize = size;
        if (this._internalGLObject)
        {
            this._internalGLObject.setFontSize(this._textSize);
        }
        this._updateShadow();
        return this;
    },
    /**
     * @name GLUI.Label#setTextGravity
     * @description Set the value of the <code>textGravity</code> property for this <code>Label</code>. This property defines how a text string is positioned within a viewable area.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextGravity([1, 0.5]);
     * @param {Number, Array (Number)} textGravity The new value for <code>textGravity</code>. Set as individual components or a single array of components.
     * @see GLUI.Label#getTextGravity
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

            this.__setTextGravity(textGravity);
        }
        else
        {
            throw new Error("Too few arguments for setTextGravity in " + this.classname);
        }
    },
    /**
     * @private
     * @status Android
     */
    __setTextGravity: function (textGravity)
    {
        if (textGravity.length < 2)
        {
            throw new Error('Too few arguments for \'textGravity\' in setTextGravity(textGravity)');
        }
        if (isNaN(textGravity[0]) && isNaN(textGravity[1]))
        {
            throw new Error('Wrong arguments for \'textGravity\' in setTextGravity(textGravity)');
        }
        var gravityX = null;
        var gravityY = null;
        if (textGravity[0] < 0.5)
        {
            gravityX = 0;
        }
        else if (textGravity[0] > 0.5)
        {
            gravityX = 2;
        }
        else
        {
            gravityX = 1;
        }
        if (textGravity[1] < 0.5)
        {
            gravityY = 0;
        }
        else if (textGravity[1] > 0.5)
        {
            gravityY = 2;
        }
        else
        {
            gravityY = 1;
        }
        this._textGravity = [textGravity[0], textGravity[1]];
        this._internalGLObject.setHorizontalAlign(gravityX);
        this._internalGLObject.setVerticalAlign(gravityY);
        this._updateShadow();
        return this;
    },
    /**
     * @name GLUI.Label#getTextGravity
     * @description Retrieve the value of the <code>textGravity</code> property for this <code>Label</code>.
     * @returns {Number, Array (Number)} The current value of <code>textGravity</code>.
     * @see GLUI.Label#setTextGravity
     * @status Android, Test
     * @function
     */
    getTextGravity: function ()
    {
        if (this._textGravity === null || this._textGravity === undefined)
        {
            return this._textGravity;
        }
        else
        {
            return [this._textGravity[0], this._textGravity[1]];
        }
    },
    /**
     * @name GLUI.Label#setTextShadow
     * @description Set the value of the <code>textShadow</code> property for a view state. This property defines the amount of text shadowing used on labels in the specified view state.
     * @example var label = new GLUI.Label();
     * ...
     * label.setTextShadow("FF00 0.2");
     * @param {String} textShadow The new value for <code>textShadow</code>.
     * @param {GLUI.Commands.State} [flags=UI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.Label#getTextShadow
     * @status Android, Test
     * @function
     */
    setTextShadow: function (textShadow, flags)
    {
        if (textShadow === undefined || textShadow === null)
        {
            console.log("Wrong number of arguments for shadow");
            return this;
        }
        var params = textShadow.split(" ");
        if (params.length < 2)
        {
            console.log("Wrong number of arguments for shadow");
            return this;
        }
        if (isNaN("0x" + params[0]) || isNaN(params[1]))
        {
            console.log(params[0], params[1]);
            console.log("Invalid Parameters for arguments for setTextShadow()");
            return this;
        }
        var state = this._getFinalState(flags);
        this._shadowValues[state + ''] = textShadow;
        this._updateShadow();
        return this;
    },
    /**
     * @name GLUI.Label#getTextShadow
     * @description Retrieve the value of the <code>textShadow</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>textShadow</code>.
     * @see GLUI.Label#setTextShadow
     * @status Android, Test
     * @function
     */
    getTextShadow: function (flags)
    {
        var state = this._getFinalState(flags);
        return this._shadowValues[state + ''];
    },
    /**
     * @name GLUI.Label#getFontLocation
     * @description Retrieve the directory path to the location of a font used by this <code>Label</code> node.
     * @example var label = new GLUI.Label();
     * ...
     * label.getFontLocation();
    * @see GLUI.Label#setFontLocation
     * @status Android, Test
     * @function
     */
    getFontLocation: function ()
    {
        return this._fontLocation;
    },
    /**
     * @private
     **/
    destroy: function ($super)
    {
        if (this._colors)
        {
            this._colors.length = 0;
            this._colors = null;
        }
        if (this._texts)
        {
            this._texts.length = 0;
            this._texts = null;
        }
        if (this._fonts)
        {
            this._fonts.length = 0;
            this._fonts = null;
        }
        if (this._shadowValues)
        {
            this._shadowValues.length = 0;
            this._shadowValues = null;
        }
        if (this._textGravity)
        {
            this._textGravity.length = 0;
            this._textGravity = null;
        }
        if (this._textInset)
        {
            this._textInset.length = 0;
            this._textInset = null;
        }
        if( this._shadow )
        {
            this._shadow.destroy();
            this._shadow = null;
        }
        this._textSize = null;

        $super();
    },

    /**
     * @private
     * */
    setVisible: function ($super, value)
    {
        $super(value);
        if (this._parentNode)
        {
            this._parentNode.setVisible(value);
        }
        this._internalGLObject.setVisible(value);
    },
    /**
     *
     * @private
     * @status Android
     */
    __fillBackgroundColor: function ($super)
    {
        $super();
        this._internalGLObject.setPosition(0, 0);
    },
    /**
     *
     * @private
     * @status Android
     */
    _registerSetters: function ($super)
    {
        $super();
        Commands._registerSettersForLabel(this);
    },
    /**
     *
     * @private
     * @status Android
     */
    _registerGetters: function ($super)
    {
        $super();
        Commands._registerGettersForLabel(this);
    },
    /**
     *
     * @private
     * @status Android
     */
    _getFinalState: function (flags)
    {
        var currentState = flags;
        var nextState = null;
        if (currentState & Commands.State.Disabled)
        {
            nextState = Commands.State.Disabled;
        }
        else if (currentState & Commands.State.Custom)
        {
            nextState = Commands.State.Custom;
        }
        else if (currentState & Commands.State.Checked)
        {
            nextState = Commands.State.Checked;
        }
        else if (currentState & Commands.State.Pressed)
        {
            nextState = Commands.State.Pressed;
        }
        else if (currentState & Commands.State.Selected)
        {
            nextState = Commands.State.Selected;
        }
        else if (currentState & Commands.State.Focused)
        {
            nextState = Commands.State.Focused;
        }
        else
        {
            nextState = Commands.State.Normal;
        }
        return nextState;
    },
    /**
     *
     * @private
     * @status Android
     */
    _getCurrentState: function ()
    {
        var currentState = this._state;
        var nextState = null;
        if (currentState & Commands.State.Disabled)
        {
            nextState = Commands.State.Disabled;
        }
        else if (currentState & Commands.State.Custom)
        {
            nextState = Commands.State.Custom;
        }
        else if (currentState & Commands.State.Checked)
        {
            nextState = Commands.State.Checked;
        }
        else if (currentState & Commands.State.Pressed)
        {
            nextState = Commands.State.Pressed;
        }
        else if (currentState & Commands.State.Selected)
        {
            nextState = Commands.State.Selected;
        }
        else if (currentState & Commands.State.Focused)
        {
            nextState = Commands.State.Focused;
        }
        else
        {
            nextState = Commands.State.Normal;
        }
        return nextState;
    },
    /**
     *
     * @private
     * @status Android
     */
    _updateView: function ($super)
    {
        $super();
        var curState = this._getCurrentState();
        var currentColor = this._colors[curState + ''];
        if (currentColor === undefined || currentColor === null)
        {
            currentColor = this._colors[Commands.State.Normal + ''];
            var rgbValue = Util.hexToARGB(currentColor);
            if (currentColor === undefined || currentColor === null)
            {
                this.__internalAlpha = 1.0;
                this._internalGLObject.setColor(0, 0, 0);
            }
            else
            {
                this.__internalAlpha = rgbValue[0];
                this._internalGLObject.setColor(rgbValue[1], rgbValue[2], rgbValue[3]);
            }
            this._updateAlpha();
        }
        else
        {
            this.setTextColor(currentColor, curState);
        }
        var currentFont = this._fonts[curState + ''];
        if (currentFont === undefined)
        {
            currentFont = this._fonts[Commands.State.Normal + ''];
            this._internalGLObject.setFontFamily(currentFont);
        }
        else
        {
            this.setTextFont(currentFont, curState);
        }
        var currentText = this._texts[curState + ''];
        if (currentText === undefined)
        {
            currentText = this._texts[Commands.State.Normal + ''];
            this._internalGLObject.setText(currentText);
        }
        else
        {
            this.setText(currentText, curState);
        }
        this._updateShadow();
    },
    /**
     *
     * @private
     * @status Android
     */
    _updateShadow: function ()
    {
        var curState = this._getCurrentState();
        var currentShadow = this._shadowValues[curState + ''];
        if (currentShadow === undefined || currentShadow === null)
        {
            currentShadow = this._shadowValues[Commands.State.Normal + ''];
        }
        if (currentShadow === undefined || currentShadow === null)
        {
            if (this._shadow)
            {
                this.getGLObject().removeChild(this._shadow);
                this._shadow.destroy();
                this._shadow = null;
            }
            return;
        }
        if (!this._shadow)
        {
            var bgColor = this.getBackgroundColor();
            if (bgColor)
            {
                this.setBackgroundColor(bgColor);
            }
            else
            {
                this.setBackgroundColor("00000000");
            }
            this._shadow = new Text();
            this.getGLObject().addChild(this._shadow);
            this._shadow.setAnchor(0, 0);
            this._shadow.setDepth(this._internalGLObject.getDepth() - 1);
        }
        var params = currentShadow.split(" ");
        var opacity = params[1];
        var txt = this.getText(curState);
        if (txt === undefined || currentShadow === null)
        {
            txt = this.getText(Commands.State.Normal);
        }
        var font = this.getTextFont(curState);
        if (font === undefined || currentShadow === null)
        {
            font = this.getTextFont(Commands.State.Normal);
        }
        this._shadow.setText(txt);
        this._shadow.setFontSize(this.getTextSize());
        var rgbValue = Util.hexToARGB(params[0]);
        this._shadow.setColor(rgbValue[1], rgbValue[2], rgbValue[3]);
        this._shadow.setFontLocation(this._fontLocation);
        this._shadow.setFontFamily(font);
        this._shadow.setSize(this._frame[2], this._frame[3]);
        var Position = this._internalGLObject.getPosition();
        var shift    = /\{\s*([\-\d]+)\s*,\s*([\-\d]+)\s*\}/.exec(currentShadow) || [undefined, 3, 3]; // [dummy, shift-x, shift-y]
        this._shadow.setPosition(Position.getX() + ~~shift[1], Position.getY() + ~~shift[2]);
        var gravityX = this._internalGLObject.getHorizontalAlign();
        var gravityY = this._internalGLObject.getVerticalAlign();
        this._shadow.setHorizontalAlign(gravityX);
        this._shadow.setVerticalAlign(gravityY);
        this._shadow.setAlpha(opacity);
    },
    /**
     *
     * @private
     * @status Android
     */
    _renderView: function ()
    {
        var top = this._textInset[0];
        var right = this._textInset[1];
        var bottom = this._textInset[2];
        var left = this._textInset[3];
        var xTop = this._frame[0];
        var yTop = this._frame[1];
        if (this._parentNode)
        {
            xTop = yTop = 0;
        }
        if (right > this._frame[2] / 2)
        {
            right = this._frame[2] / 2;
        }
        this._updateShadow();
        this._internalGLObject.setPosition(xTop + left - right / 4, yTop + top - bottom / 4);
        this._internalGLObject.setSize(this._frame[2] - right - left, this._frame[3] - bottom - top);
    }
});
