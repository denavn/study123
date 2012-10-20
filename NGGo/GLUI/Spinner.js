////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Muzammil M.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Node = require('../../NGCore/Client/GL2/Node').Node;
var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var Sprite = require('./Sprite').URLSprite;
var UpdateEmitter = require('../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;

exports.Spinner = AbstractView.subclass(
{
    classname: 'Spinner',
    initialize: function ($super, properties)
    {
        $super();
        this._internalGLObject = new Sprite();
        this._internalGLObject.setScale(1, 1);
        this._imageSpriteSize = [32, 32];
        this._imageURL = null;
        this._fitMode = Commands.FitMode.Stretch;
        this._anchor = [0.5, 0.5];

        if(properties)
        {
            if(properties.hasOwnProperty('imageURL'))
            {
                this._imageURL = properties.imageURL;
            }

            this.setAttributes(properties);
        }

        if(this._imageURL)
        {
            this.setImage(this._imageURL);
            this._setImageFit();
        }

        this._angle = 30;
        this._flag = 0;
        this._listener = new Core.MessageListener();
        UpdateEmitter.addListener(this._listener, this._onUpdate.bind(this));

        return this;
    },

    setFrame: function ($super, frame)
    {
        $super(frame);
        if (this._imageSpriteSize)
        {
            this._setImageFit();
        }
        this._updateView();
    },

    setImage: function (imageURL) //size is imageSize
    {
        var errorMsg;
        if (!imageURL || typeof imageURL !== 'string')
        {
            errorMsg = "Image URL is not correct in " + this.classname + "setImage Method";
            throw new Error(errorMsg);
        }

        try
        {
            this._images[Commands.State.Normal + ''] = [imageURL, this._imageSpriteSize];
            this._updateView();
        }
        catch (exception)
        {
            errorMsg = [];
            errorMsg.push("Exception: setImage()");
            errorMsg.push(exception);
            errorMsg.push(this.classname);
            errorMsg.join();

            throw new Error(errorMsg);
        }
        return this;
    },

    _setImageFit: function ()
    {
        this._fitMode = Commands.FitMode.Stretch;
        var glObject = this._internalGLObject;
        glObject.setScale(1, 1);

        glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor);

        var glPosition = this._getInternalGLObjectPosition();

        var posX = glPosition.getX();
        var posY = glPosition.getY();

        glObject.setPosition([posX, posY]);
        return this;
    },

    _updateView: function ()
    {

        /*in UI.View, if you do not specify the image for normal state, then Image will not be shown for any state
         * so its better to return from there*/
        if (!this._frame || (this._frame && this._frame.length < 4))
        {
            this._frame = [0, 0, 0, 0];
        }

        if (!this._images[Commands.State.Normal + ''] || !this._frame[2] || !this._frame[3])
        {
            return;
        }

        var nextState = (this._state)?this._state:Commands.State.Normal;

        var nextImage = this._images[nextState + ''];
        if (!nextImage || nextImage.length === 0)
        {
            nextImage = this._images[Commands.State.Normal + ''];
        }

        if (nextImage !== null)
        {
            this._imageURL = nextImage[0];
            this._imageSpriteSize = nextImage[1];
            this._setImageFit();
        }
    },

    _onUpdate: function ()
    {
        if(this._flag === 0)
        {
            this._internalGLObject.setRotation(this._angle);
            this._angle = (this._angle + 30)%360;
        }
        this._flag = (this._flag+1)%4;
    },

    destroy: function ($super)
    {
        UpdateEmitter.removeListener(this._listener);
        this._listener.destroy();
        this._imageSpriteSize.length = 0;
        this._imageSpriteSize = null;
        this._imageURL = null;
        $super();
    }
});
