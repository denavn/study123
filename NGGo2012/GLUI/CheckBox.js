////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K, Ihsan H
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
var Button = require('./Button').Button;

exports.CheckBox = Button.subclass( /** @lends GLUI.CheckBox.prototype */
{
    classname: "CheckBox",
    /**
     * @class The <code>CheckBox</code> class constructs objects that handle the state of application checkboxes.
     * @constructs The default constructor.
     * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
     * @param {String} properties Object properties.
     * @augments GLUI.Button
     */
    initialize: function ($super, properties)
    {
        $super();
        this._text.setTextGravity([0.5, 0.5]);
        this._spriteSize = [64, 64];
        this._unregisterProperties();
        if (properties)
        {
            this.setAttributes(properties);
        }
    },
    destroy: function ($super)
    {
        this._spriteSize = null;
        $super();
    },
    __setFrame: function ($super, frame)
    {
        frame = [frame[0] + 4, frame[1] + 4, frame[2] - 4, frame[3] - 4]; //adding default insets for checkbox;
        $super(frame);
        this._renderView();
    },
    /**
     * @name GLUI.CheckBox#setImage
     * @description Set an image URL for a view state. This defines how a checkbox appears for specific conditions. For example,
     * set different images for a checkbox in the default state and when the checkbox is checked.
     * @example var gameCheck = new GLUI.CheckBox();
     * ...
     * gameCheck.setImage('./Content/DisabledButton.png', GLUI.Commands.State.Disabled, [0,0,1,1]);
     * @see GLUI.CheckBox#getImage
     * @param {String} imageURL The new image URL. Note:please make sure that the textures are in powers of two (square powers recommended)
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @status Android, Test
     * @function
     */
    setImage: function ($super, imageURL, flags, imageSize)
    {
        if (!this._imageObject)
        {
            this._imageObject = new Image();
            this._internalGLObject.addChild(this._imageObject.getGLObject());
            this._imageObject.getGLObject().setDepth(0);
            this._imageObject._setClickable(false);
            this._imageObject.setImageFit(Commands.FitMode.AspectHeight);
            this._imageObject.setImageGravity([0, 0]);
        }
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
        this._imageObject.setImage(imageURL, flags, [imageSize[0], imageSize[1]]);
        this._adjustFrameForText();
        this._renderView();
    },
    /**
     * @name GLUI.CheckBox#setChecked
     * @description Set whether this <code>CheckBox</code> is "checked".
     * @example var gameCheck = new GLUI.CheckBox();
     * ...
     * gameCheck.setChecked(true);
     * @param {Boolean} checked Set as <code>true</code> if this <code>CheckBox</code> is "checked".
     * @see GLUI.CheckBox#getChecked
     * @status  Android
     * @function
     */
    setChecked: function (checked)
    {
        if (checked)
        {
            this.addState(Commands.State.Checked);
        }
        else
        {
            this.clearState(Commands.State.Checked);
        }
    },
    /**
     * @name GLUI.CheckBox#getChecked
     * @description Retrieve whether this <code>CheckBox</code> is currently "checked".
     * @returns {Boolean} Returns <code>true</code> if this <code>CheckBox</code> is currently "checked".
     * @see GLUI.CheckBox#setChecked
     * @status  Android
     * @function
     */
    getChecked: function ()
    {
        return (this._state & Commands.State.Checked) ? true : false;
    },
    /**
     * @name GLUI.CheckBox#setFontLocation
     * @description Set the directory path to the location of a font used by this <code>CheckBox</code> node.
     * @example var box = new GLUI.CheckBox();
     * ...
     * box.setFontLocation(0);
     * @param {GLUI.Commands.FontLocation} fontLocation The new value for <code>fontLocation</code>.
     * @see GLUI.CheckBox#getFontLocation
     * @status Android, Test
     * @function
     */
    setFontLocation: function(fontLocation){
        this._text.setFontLocation(fontLocation);
        return this;
    },
     /**
     * @name GLUI.CheckBox#getFontLocation
     * @description Retrieve the directory path to the location of a font used by this <code>CheckBox</code> node.
     * @example var box = new GLUI.CheckBox();
     * ...
     * box.getFontLocation();
     * @see GLUI.CheckBox#setFontLocation
     * @status Android, Test
     * @function
     */
    getFontLocation: function(){
        return this._text.getFontLocation();
    },

    /**
     * @private
     * */
    _unregisterProperties: function ()
    {
        var i;
        var unsupportedProperties = ['imageFit', 'imageGravity'];
        for (i = 0; i < unsupportedProperties.length; i++)
        {
            var propertyName = unsupportedProperties[i];
            var methodName = propertyName.slice();
            methodName[0] = propertyName[0].toUpperCase();
            var setterName = 'set' + methodName;
            var getterName = 'get' + methodName;
            //deleting setter method
            if (this[setterName] !== null)
            {
                delete this[setterName];
                this[setterName] = null;
            }
            //deleting getter method
            if (this[getterName] !== null)
            {
                delete this[getterName];
                this[getterName] = null;
            }
            //deleting setters property
            if (this._setters[propertyName])
            {
                this._setters[propertyName] = null;
                delete this._setters[propertyName];
            }
            //deleting getter property
            if (this._getters[propertyName])
            {
                this._getters[propertyName] = null;
                delete this._getters[propertyName];
            }
        }
        if (this.getChildrenCount)
        {
            delete this.getChildrenCount;
            this.getChildrenCount = undefined;
        }
    },
    /**
     * @private
     * */
    _registerSetters: function ($super)
    {
        $super();
        this._setters.checked = this.setChecked.bind(this);
    },
    /**
     * @private
     * */
    _registerGetters: function ($super)
    {
        $super();
        this._getters.checked = this.getChecked.bind(this);
    },
    /**
     * @private
     * */
    _adjustFrameForText: function ()
    {
        var size = this.__getImageSize();
        var w = size.getWidth();
        var h = size.getHeight();
        //      var h = this._frame[3] || this._spriteSize[1];
        this._spriteSize = [w, h];
        var x = w + 5;
        var y = this._text.getGLObject().getPosition().getY();
        w = (this._frame[2] > x) ? this._frame[2] - x : 0;
        var frame = [x, y, w, h];
        if (w < 1)
        {
            this._text.setVisible(false);
            return; //text will not be visible
        }
        else
        {
            this._text.setVisible(true);
        }
        this._text.setFrame(frame);
    },
    /**
     * @private
     * */
    __getImageSize: function ()
    {
        var w = 64;
        var h = 64;
        if (this._imageObject)
        {
            var size = this._imageObject.___getSpriteSizeForCheckBox();
            w = size[0];
            h = size[1];
        }
        return new Size(w, h);
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
    _renderView: function ($super)
    {
        $super();
        this._text.setState(this.getState());
        this._adjustFrameForBgImage();
        this._adjustFrameForText();
    },
    /**
     * @private
     * */
    _endTap: function ($super)
    {
        $super();
        if (this._state & Commands.State.Checked)
        {
            this.clearState(Commands.State.Checked);
        }
        else
        {
            this.addState(Commands.State.Checked);
        }
    }
});
