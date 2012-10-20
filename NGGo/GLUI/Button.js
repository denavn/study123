////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K.
 *  @co-author: Taha S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Size = require('../../NGCore/Client/Core/Size').Size;
var Commands = require('./Commands').Commands;
var View = require('./View').View;
var Label = require('./Label').Label;
var Util = require('./Util').Util;

exports._unbindButtons = [];
exports._activeButton = undefined;
var Button = View.subclass(
/** @lends GLUI.Button.prototype */
{
    classname: "Button",
    /**
     * @name GLUI.Button
     * @class The <code>Button</code> class constructs objects that are used as application buttons.
     * @augments GLUI.View
     */
    initialize: function ($super, properties, cleanView)
    {
        $super();
        this._text = new Label();
        this._text._setClickable(false);
        this._text.setTextGravity([0.5, 0.5]);
        this.addChild(this._text);
        this.setAttributes(properties);
        if (this.addChild && !cleanView)
        {
            delete this.addChild;
            this.addChild = undefined;
        }
        if (this.removeChild && !cleanView)
        {
            delete this.removeChild;
            this.removeChild = undefined;
        }
        if (this.getChildren && !cleanView)
        {
            delete this.getChildren;
            this.getChildren = undefined;
        }
        if (this.getChildrenCount && !cleanView)
        {
            delete this.getChildrenCount;
            this.getChildrenCount = undefined;
        }
        return this;
    },
    /**
     * @name GLUI.Button#setTextInsets
     * @description Set the value of the <code>textInsets</code> property.
     * This property defines the viewable area of a text string when applying gravity.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setTextInsets([0, 0, 0, 64]);
     * @param {Array (Number)} textInsets The new value for <code>textInsets</code>.
     * @see GLUI.Button#getTextInsets
     * @status Android, Test
     * @function
     */
    setTextInsets: function (insets)
    {
        return this._text.setTextInsets(insets);
    },
    /**
     * @name GLUI.Button#getTextInsets
     * @description Retrieve the value of the <code>textInsets</code> property.
     * @returns {Array (Number)} The curent value for <code>textInsets</code>.
     * @see GLUI.Button#setTextInsets
     * @status Android, Test
     * @function
     */
    getTextInsets: function ()
    {
        return this._text.getTextInsets();
    },
    /**
     * @name GLUI.Button#setText
     * @description Set the value of the <code>text</code> property for a view state.
     * This property defines a text string to use as a label for a button in different
     * view states.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setText("More information");
     * @see GLUI.Button#getText
     * @param {String} text The new value for <code>text</code> in the specified view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status iOS, Android, Flash, Test
     * @function
     */
    setText: function (text, flags)
    {
        this._text.setText(text, flags || Commands.State.Normal);
        return this;
    },
    /**
     * @name GLUI.Button#setTextColor
     * @description Set the value of the <code>textColor</code> property for a view state.
     *  This property defines the color of a text string used as a label on a
     * button in different view states.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setTextColor('FFFFFF');
     * @see GLUI.Button#getTextColor
     * @param {String} textColor The new value for <code>textColor</code> in the specified view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commonds.State.Normal] The GLUI view state.
     * @status  Android, Test
     * @function
     */
    setTextColor: function (textColor, flags)
    {
        this._text.setTextColor(textColor, flags);
        return this;
    },
    /**
     * @name GLUI.Button#setTextFont
     * @description Set the value of the <code>textFont</code> property. This property defines the font face used with labels for a button in different view states.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setTextFont(myFont);
     * @param {String} textFont The new value for <code>textFont</code> in the specified view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @see GLUI.Button#getTextFont
     * @status Android, Test
     * @function
     */
    setTextFont: function (textFont, flags)
    {
        this._text.setTextFont(textFont, flags);
        return this;
    },
    /**
     * @name GLUI.Button#setFontLocation
     * @description Set the directory path to the location of a font used by this <code>Button</code> node.
     * @example var button = new GLUI.Button();
     * ...
     * button.setFontLocation(0);
     * @param {GLUI.Commands.FontLocation} fontLocation The new value for <code>fontLocation</code>.
     * @see GLUI.Button#getFontLocation
     * @status Android, Test
     * @function
     */
    setFontLocation: function(fontLocation){
        this._text.setFontLocation(fontLocation);
        return this;
    },
     /**
     * @name GLUI.Button#getFontLocation
     * @description Retrieve the directory path to the location of a font used by this <code>Button</code> node.
     * @example var button = new GLUI.Button();
     * ...
     * button.getFontLocation();
     * @see GLUI.Button#setFontLocation
     * @status Android, Test
     * @function
     */
    getFontLocation: function(){
        return this._text.getFontLocation();
    },
    /**
     * @name GLUI.Button#setTextSize
     * @description Set the value of the <code>textSize</code> property. This property defines the text size of labels for a button.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setTextSize(24);
     * @param {Number} textSize The new value for <code>textSize</code>.
     * @see GLUI.Button#getTextSize
     * @status Android, Test
     * @function
     */
    setTextSize: function (textSize)
    {
        this._text.setTextSize(textSize);
        return this;
    },
    /**
     * @name GLUI.Button#setTextGravity
     * @description Set the value of the <code>textGravity</code> property. This property defines how a text string for a button is positioned within a viewable area.
     * @example var infoButton = new UI.Button();
     * ...
     * infoButton.setTextGravity([0.1, 0.5]);
     * @param {Number, Array (Number)} textGravity The new value for <code>textGravity</code>. Set as individual components or a single array of components.
     * @see GLUI.Button#getTextGravity
     * @status Android, Test
     * @function
     */
    setTextGravity: function (textGravity)
    {
        this._text.setTextGravity(textGravity);
        return this;
    },
    /**
     * @name GLUI.Button#setTextShadow
     * @description Set the value of the <code>textShadow</code> property for a view state. This property defines the amount of text shadowing used on text strings for a button in different view states.
     * @example var infoButton = new GLUI.Button();
     * ...
     * infoButton.setTextShadow("FF00 0.2");
     * @see GLUI.Button#getTextShadow
     * @param {String} textShadow The new value for <code>textShadow</code> in the specified view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status Android, Test
     * @function
     */
    setTextShadow: function (textShadow, flags)
    {
        this._text.setTextShadow(textShadow, flags);
    },
    /**
     * @name GLUI.Button#getText
     * @description Retrieve the value of the <code>text</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>text</code> in the specified view state..
     * @see GLUI.Button#setText
     * @status Android, Test
     * @function
     */
    getText: function (flags)
    {
        return this._text.getText(flags);
    },
    /**
     * @name UI.Button#getTextColor
     * @description Retrieve the value of the <code>textColor</code> property for a view state.
     * @param {UI.State} [flags=UI.State.Normal] The UI view state.
     * @returns {String} The current value of <code>textColor</code> in the specified view state..
     * @see UI.Button#setTextColor
     * @status  Android, Test
     * @function
     */
    getTextColor: function (flags)
    {
        return this._text.getTextColor(flags);
    },
    /**
     * @name GLUI.Button#getTextSize
     * @description Retrieve the value of the <code>textSize</code> property.
     * @returns {Number} The current value for <code>textSize</code>.
     * @see GLUI.Button#setTextSize
     * @status Android, Test
     * @function
     */
    getTextSize: function ()
    {
        return this._text.getTextSize();
    },
    /**
     * @name GLUI.Button#getTextFont
     * @description Retrieve the value of the <code>textFont</code> property.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value for <code>textFont</code> in the specified view state.
     * @see GLUI.Button#setTextFont
     * @status  Android, Test
     * @function
     */
    getTextFont: function (flags)
    {
        return this._text.getTextFont(flags);
    },
    /**
     * @name GLUI.Button#getTextGravity
     * @description Retrieve the value of the <code>textGravity</code> property.
     * @returns {Number, Array (Number)} The current value of <code>textGravity</code>.
     * @see GLUI.Button#setTextGravity
     * @status Android, Test
     * @function
     */
    getTextGravity: function ()
    {
        return this._text.getTextGravity();
    },
    /**
     * @name GLUI.Button#getTextShadow
     * @description Retrieve the value of the <code>textShadow</code> property for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current value of <code>textShadow</code> in the specified view state..
     * @see GLUI.Button#setTextShadow
     * @status Android, Test
     * @function
     */
    getTextShadow: function (flags)
    {
        return this._text.getTextShadow(flags);
    },
    setState: function ($super, flags)
    {
        $super(flags);
        this._text.setState(flags);
    },
    __setFrame: function ($super, frame)
    {
        $super(frame);
        this._text.setFrame([0, 0, this._frame[2], this._frame[3]]);
        if (!this.getOnClick())
        {
            this.setOnClick(function ()
            {});
        }
        this._updateDepth();
    },
    destroy: function ($super)
    {
        if (this._text)
        {
            this._text.destroy();
            this._text = null;
        }
        $super();
    },
    /**
     * @private
     * */
    _updateView: function ($super)
    {
        $super();
        this._renderView();
    },
    /**
     * @private
     * */
    _renderView: function ()
    {
        this._text.setState(this.getState());
    },
    /**
     * @private
     * */
    _registerSetters: function ($super)
    {
        $super();
        Commands._registerSettersForLabel(this);
        this._setters.visible = this.setVisible.bind(this);
    },
    /**
     * @private
     * */
    _registerGetters: function ($super)
    {
        $super();
        Commands._registerGettersForLabel(this);
        this._getters.visible = this.getVisible.bind(this);
    },
    /////////// Empty Functions /////////////////
    /**
     * @name GLUI.Button#setImageInsets
     * @description Set the value of the <code>imageInsets</code> property. This property defines the viewable area of an image when applying gravity.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var backButton = new UI.Button();
     * ...
     * backButton.setImageInset([10,10,10,10]);
     * @param {Number|Array (Number)} imageInsets The new value for <code>imageInsets.</code> Set as insets or an array of insets (expressed as floats).
     * @see GLUI.Button#getImageInsets
     * @status  Android, Test
     * @function
     */
    setImageInsets: function (imageInsets)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageInsets(imageInsets) in ' + this.classname);
    },

    /**
     * @name GLUI.Button#getImageInsets
     * @description Retrieve the value of the <code>imageInsets</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Number|Array (Number)} The current value of <code>imageInsets.</code>
     * @see GLUI.Button#setImageInsets
     * @status  Android, Test
     * @function
     */
    getImageInsets: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageInsets() in Button');
    },

    /**
     * @name GLUI.Button#setImageTransform
     * @description Set the value of the <code>imageTransform</code> property. This property defines data compression for an image used as a button.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var button = new UI.Button()
     * ...
     * button.setImageTransform([Math.cos(angle), Math.sin(angle), Math.sin(angle), Math.cos(angle), 0, 0]);
     * @param {Array (Number)} imageTransform The new value for <code>imageTransform.</code> Set as an array of floats (a, b, c, d, tx, ty).
     * @see GLUI.Button#getImageTransform
     * @status  Android, Test
     * @function
     */
    setImageTransform: function (imageTransform)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageTransform(imageTransform) in ' + this.classname);
    },

    /**
     * @name GLUI.Button#getImageTransform
     * @description Retrieve the value of the <code>imageTransform</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Array (Number)} The current value of <code>imageTransform.</code>
     * @see GLUI.Button#setImageTransform
     * @status  Android, Test
     * @function
     */
    getImageTransform: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageTransform() in ' + this.classname);
    }
});

exports.Button = Button;
