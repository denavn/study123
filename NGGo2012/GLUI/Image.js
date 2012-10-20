////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Gohar A
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var AbstractView = require('./AbstractView').AbstractView;
var Point = require('../../NGCore/Client/Core/Point').Point;
var GLUIRect = require('./ViewGeometry').Rect;
var UIRect = require('../../NGCore/Client/UI/ViewGeometry').Rect;
var Rect = require('../../NGCore/Client/Core/Rect').Rect;

var Vector = require('../../NGCore/Client/Core/Vector').Vector;
var Sprite = require('./Sprite').URLSprite; //for now using url sprite, when this is fixed, we'll use Sprite - which can convert files on disk to power of two.
var Commands = require('./Commands').Commands;

var Image = AbstractView.subclass(
/** @lends GLUI.Image.prototype */
{
    classname: 'Image',
    /**
     * @name GLUI.Image
     * @class The <code>Image</code> class constructs objects that control the location and size of images used in the user interface.
     * @constructs
     * @augments GLUI.AbstractView
     */
    initialize: function ($super, properties)
    {
        $super();
        this._internalGLObject = new Sprite();
        this._internalGLObject.setScale(1, 1);
        this._imageSpriteSize = [64, 64];
        this._imageGravity = [0.5, 0.5];
        this._imageURL = null;
        this._uvs = null;
        this._fitMode = Commands.FitMode.Inside;
        this._anchor = [0.5, 0.5];
        this.__scaledImageSize = [0, 0];
        if (properties)
        {
            this.setAttributes(properties);
        }
        return this;
    },
    /**
     * @name GLUI.Image#setImage
     * @description Set an image URL for a view state. This property defines a remote image resource to use in arbitrary contexts.
     * <br /><b>Note: </b> Images must be in powers of two and/or mentioned under <code>"textures":</code> key in manifests.
     * <br />URL is also supported, and the image will be converted to power of two.
     * <br />Local image auto conversion will be supported later.
     * <br />UVS is supported in setImage. If you give UVS in setImage, it will disable fit modes (setImageFit). setImageFit will not work in parallel with UVS 
     * @example var someSprite = new GLUI.Image();
     * ...
     * someSprite.setImage('./Content/mySprite.png', GLUI.State.Normal, [w, h], UVS);
     * someSprite.setImage('http://www.example.com/somepicture80x92.png', GLUI.State.Normal, [200, 110], [0, 0, 0.5, 0.5]);
     * @see GLUI.Image#getImage
     * see GLUI.Image#setImageFit
     * @param {String} imageURL The new image URL.
     * @param {GLUI.State} [flags=GLUI.State.Normal] A set of flags describing the view state(s) for using this URL.
     * @param {Array} imageSize an array for the size of image. [w, h]
     * @param {Array} [uvs=[0, 0, 1, 1]] The region within the image to display. Specified in UV
	 *		coordinates ranging from 0 to 1, which represent a percentage of the original image's 
	 *		width and height. The four coordinates represent the U origin, the V origin, the U 
	 *		width, and the V height, in that order. By default, the entire image is displayed.
     *
     * @status iOS, Android, Test
     * @function
     */
    setImage: function (imageURL, flags, imageSize, uvs)
    {

        var errorMsg = null;
        if(typeof(imageURL) === 'object')
        {

            var url = null;
            var size = [0, 0];
            if(imageURL.hasOwnProperty('url'))
            {
                url = imageURL.url;
            }
            else
            {
                errorMsg = "Image URL is not correct in " + this.classname + ".setImage Method";
                throw new Error(errorMsg);
            }
            if(imageURL.hasOwnProperty('size'))
            {
                size = imageURL.size;
            }
            imageURL = url;
            imageSize = size;
        }
        errorMsg = null;
        if (!imageURL || typeof imageURL !== 'string')
        {
            errorMsg = "Image URL is not correct in " + this.classname + ".setImage Method";
            throw new Error(errorMsg);
        }
                var imageUVS = null;
    
        if (uvs instanceof GLUIRect || uvs instanceof UIRect )
        {
            imageUVS = uvs.array();
        }
        else if (uvs instanceof Rect)
        {
            imageUVS = uvs;
        }
        else if (uvs instanceof Array)
        {
            imageUVS = uvs.slice();
        }
        try
        {
            this._imageSpriteSize = (imageSize && imageSize.length === 2) ? imageSize : [0, 0];
            flags = (typeof (flags) === 'number') ? flags : Commands.State.Normal;
            this._images[String(flags)] = [imageURL, this._imageSpriteSize, imageUVS];
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
    /**
     * @name GLUI.Image#setImageFit
     * @description Set the value of the <code>imageFit</code> property.
     * This property defines the scaling of bitmap images to fit within the bounds of a control
     *
     * @example var splashGraphic = new GLUI.Image();
     * ...
     * splashGraphic.setImageFit(GLUI.Commands.FitMode.None);
     * @param {Number} imageFit The new value for <code>imageFit</code>.
     * @see GLUI.Image#getImageFit
     * @function
     * @status Android, Test
     */
    setImageFit: function (FitMode)
    {
        var glObject = this._internalGLObject;
        glObject.setScale(1, 1);
        this._fitMode = FitMode;
        if (!this._uvs)
        {
            switch (FitMode)
            {
            case Commands.FitMode.None:
                this._handleNoneMode(glObject);
                break;
            case Commands.FitMode.Inside:
                this._handleInsideMode(glObject);
                break;
            case Commands.FitMode.Fill:
                this._handleFillMode(glObject);
                break;
            case Commands.FitMode.Stretch:
                this._handleStretchMode(glObject);
                break;
            case Commands.FitMode.AspectWidth:
                this._handleAspectWidthMode(glObject);
                break;
            case Commands.FitMode.AspectHeight:
                this._handleAspectHeightMode(glObject);
                break;
            case Commands.FitMode.InsideNoUpscaling:
                this._handleInsideNoUpscalingMode(glObject);
                break;
            default:
                //setting to none -- which is default UI.Image behavior
                this.setImageFit(Commands.FitMode.None);
                return this;
            }
        }else
        {
            this._handleInsideMode(glObject, this._uvs);
        }
        
        var glPosition = this._getInternalGLObjectPosition();
        var posX = glPosition.getX();
        var posY = glPosition.getY();
        glObject.setPosition([posX, posY]);

        return this;
    },
    /**
     * @name GLUI.Image#getImage
     * @description Retrieve the <code>image</code> URL for a view state.
     * @param {GLUI.Commands.State} [flags=GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {String} The current image URL for the specified view state..
     * @see GLUI.Image#setImage
     * @status Android, Test
     * @function
     */
    getImage: function (flags)
    {
        var state = this._getEffectiveState(flags);
        var value = this._images[String(state)];
        if (value !== null && value !== undefined)
        {
            return value[0];
        }
        else
        {
            return undefined;
        }
    },
    /**
     * @name GLUI.Image#getImageFit
     * @description Retrieve the value of the <code>imageFit</code> property.
     * @returns {Number} The current value of <code>imageFit</code>.
     * @see GLUI.Image#setImageFit
     * @function
     * @status Android, Test
     */
    getImageFit: function ()
    {
        return this._fitMode;
    },
    /**
     * @name GLUI.Image#setImageGravity
     * @description Set the value of the <code>imageGravity</code> property. This property defines how an image is positioned within a viewable area. Gravity values supported are: value-from-[0.0, 0.0] to [1.0, 1.0]
     * @example var splashGraphic = new GLUI.Image();
     * ...
     * splashGraphic.setImageGravity([0.5, 0.0]);
     * @param {Number} imageGravity The new value for <code>imageGravity</code> expressed as two floats.
     * @see GLUI.Image#getImageGravity
     * @function
     * @status Android, Test
     */
    setImageGravity: function(imageGravity)
    {
        if(arguments)
        {
        if(arguments.length >=2)
        {
            imageGravity = [arguments[0], arguments[1]];
        }
        this.__setImageGravity(imageGravity);
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
        imageGravity = (imageGravity && imageGravity.length === 2 && !isNaN(imageGravity[0]) && !isNaN(imageGravity[1])) ? [imageGravity[0], imageGravity[1]] : [0.5, 0.5];
        this._imageGravity = imageGravity;
        this._anchor = imageGravity;
        this._adjustImageGravity();
        this.setImageFit(this.getImageFit());
        return this;
    },
    /**
     * @name GLUI.Image#getImageGravity
     * @description Retrieve the value of the <code>imageGravity</code> property.
     * @returns {Number} The current value of <code>imageGravity</code> expressed as two floats.
     * @see GLUI.Image#setImageGravity
     * @function
     * @status Android, Test
     */
    getImageGravity: function ()
    {
        return [this._imageGravity[0], this._imageGravity[1]];
    },
    __setFrame: function ($super, frame)
    {
        $super(frame);
        if (this._imageSpriteSize)
        {
            this.setImageFit(this.getImageFit());
        }
        this._updateView();
    },
    destroy: function ($super)
    {
        this.__scaledImageSize = null;
        this._imageSpriteSize = null;
        this._imageURL = null;
        this._imageGravity = null;
        this._uvs = null;
        $super();
    },
    /**
     * @private
     */
    _adjustImageGravity: function ()
    {
        if (this.getImageFit() === Commands.FitMode.None || this.getImageFit() === Commands.FitMode.Inside)
        {
            var glObject = this._internalGLObject;
            var currImageGravity = this.getImageGravity();
            currImageGravity = (currImageGravity) ? currImageGravity : [0.5, 0.5];
            var gravityX = currImageGravity[0];
            var gravityY = currImageGravity[1];
            var currScale = glObject.getScale();
            currScale = (currScale) ? currScale : new Point(1, 1);
            var scaleX = currScale.getX();
            var scaleY = currScale.getY();
            var currSize = this._imageSpriteSize;
            currSize = (currSize) ? currSize : [0, 0];
            var sizeX = currSize[0];
            var sizeY = currSize[1];
            var currFrame = this.getFrame();
            currFrame = (currFrame) ? currFrame : [0, 0, 0, 0];
            var frameX = currFrame[2];
            var frameY = currFrame[3];
            var currAnchor = this._anchor;
            currAnchor = (currAnchor) ? currAnchor : [0.5, 0.5];
            var anchorX = currAnchor[0];
            var anchorY = currAnchor[1];
            var pos = [];
            pos[0] = (gravityX * frameX) - (scaleX * sizeX) * (gravityX - anchorX);
            pos[1] = (gravityY * frameY) - (scaleY * sizeY) * (gravityY - anchorY);
            glObject.setPosition(pos);
        }
        else
        {
            return;
        }
    },
    /**
     * @private
     */
    _updateView: function ()
    {
        /*in UI.View, if you do not specify the image for normal state, then Image will not be shown for any state
         * so its better to return from there*/
        if (!this._frame || (this._frame && this._frame.length < 4))
        {
            this._frame = [0, 0, 0, 0];
        }
        if (!this._images[String(Commands.State.Normal)] || !this._frame[2] || !this._frame[3])
        {
            return;
        }
        var currentState = this._state;
        var nextState = this._getEffectiveState(currentState);
        var nextImage = this._images[String(nextState)];
        if (!nextImage || nextImage.length === 0)
        {
            nextImage = this._images[String(Commands.State.Normal)];
        }
        if (nextImage !== null)
        {
            this._imageURL = nextImage[0];
            this._imageSpriteSize = nextImage[1];
            this._uvs = nextImage[2];
            this.setImageFit(this._fitMode);
        }
    },
    /**
     * @private
     */
    _handleNoneMode: function (glObject)
    {
        var currImageGrav = this.getImageGravity();
        var anchor = new Point(currImageGrav);
        var rectX = 0;
        var rectY = 0;
        var x = 0;
        var y = 0;
        if (this._frame[2] >= this._imageSpriteSize[0] && this._frame[3] >= this._imageSpriteSize[1])
        {
            glObject.setImage(this._imageURL, this._imageSpriteSize, anchor);
        }
        else if (this._frame[2] >= this._imageSpriteSize[0] && this._frame[3] <= this._imageSpriteSize[1])
        {
            rectY = this._frame[3] / this._imageSpriteSize[1];
            y = (1 - rectY) * currImageGrav[1];
            glObject.setImage(this._imageURL, [this._imageSpriteSize[0], this._frame[3]], anchor, [0, y, 1, rectY]);
        }
        else if (this._frame[2] <= this._imageSpriteSize[0] && this._frame[3] >= this._imageSpriteSize[1])
        {
            rectX = this._frame[2] / this._imageSpriteSize[0];
            x = (1 - rectX) * currImageGrav[0];
            glObject.setImage(this._imageURL, [this._frame[2], this._imageSpriteSize[1]], anchor, [x, 0, rectX, 1]);
        }
        else
        {
            rectX = this._frame[2] / this._imageSpriteSize[0];
            rectY = this._frame[3] / this._imageSpriteSize[1];
            x = (1 - rectX) * currImageGrav[0];
            y = (1 - rectY) * currImageGrav[1];
            glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], anchor, [x, y, rectX, rectY]);
        }
    },
    /**
     * @private
     */
    _handleInsideMode: function (glObject, uvs)
    {
        var tempSize = new Vector(this._frame[2] / this._imageSpriteSize[0], this._frame[3] / this._imageSpriteSize[1]);
        var x = tempSize.getX();
        var y = tempSize.getY();
        if (uvs)
        {
            glObject.setImage(this._imageURL, this._imageSpriteSize, this._anchor, uvs);
        }else
        {
            glObject.setImage(this._imageURL, this._imageSpriteSize, this._anchor);
   
        }
        if (x <= y)
        {
            glObject.setScale(x, x);
        }
        else
        {
            glObject.setScale(y, y);
        }
    },
    /**
     * @private
     */
    _handleFillMode: function (glObject)
    {
        var diffX = (this._frame[2] - this._imageSpriteSize[0]);
        var diffY = (this._frame[3] - this._imageSpriteSize[1]);
        var currImageGrav = this.getImageGravity();
        if (diffX >= diffY)
        {
            var rectY = this._frame[3] / this._frame[2];
            var y = (1 - rectY) * currImageGrav[1];
            glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor, [0, y, 1, rectY]);
        }
        else
        {
            var rectX = this._frame[2] / this._frame[3];
            var x = (1 - rectX) * currImageGrav[0];
            glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor, [x, 0, rectX, 1]);
        }
    },
    /**
     * @private
     */
    _handleStretchMode: function (glObject)
    {
        glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor);
    },
    /**
     * @private
     */
    _handleAspectWidthMode: function (glObject)
    {
        var diffX = (this._frame[2] - this._imageSpriteSize[0]);
        var diffY = (this._frame[3] - this._imageSpriteSize[1]);
        if (diffX >= diffY)
        {
            var rectY = this._frame[3] / this._frame[2];
            var currImageGrav = this.getImageGravity();
            var y = (1 - rectY) * currImageGrav[1];
            glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor, [0, y, 1, rectY]);
        }
        else
        {
            var scaleX = this._frame[2] / this._imageSpriteSize[0];
            glObject.setImage(this._imageURL, [this._imageSpriteSize[0] * scaleX, this._imageSpriteSize[1] * scaleX], this._anchor);
        }
    },
    /**
     * @private
     */
    _handleAspectHeightMode: function (glObject)
    {
        var diffX = (this._frame[2] - this._imageSpriteSize[0]);
        var diffY = (this._frame[3] - this._imageSpriteSize[1]);
        if (diffY >= diffX)
        {
            var rectX = this._frame[2] / this._frame[3];
            var currImageGrav = this.getImageGravity();
            var x = (1 - rectX) * currImageGrav[0];
            glObject.setImage(this._imageURL, [this._frame[2], this._frame[3]], this._anchor, [x, 0, rectX, 1]);
            this.__scaledImageSize = [this._frame[2], this._frame[3]];
        }
        else
        {
            var scaleY = this._frame[3] / this._imageSpriteSize[1];
            glObject.setImage(this._imageURL, [this._imageSpriteSize[0] * scaleY, this._imageSpriteSize[1] * scaleY], this._anchor);
            this.__scaledImageSize = [this._imageSpriteSize[0] * scaleY, this._imageSpriteSize[1] * scaleY];
        }
    },

    /**
     * @private
     * */
    _handleInsideNoUpscalingMode: function (glObject)
    {
        if (this._frame[2] >= this._imageSpriteSize[0] && this._frame[3] >= this._imageSpriteSize[1])
        {
            this.setImageFit(Commands.FitMode.None);
        }
        else
        {
            this.setImageFit(Commands.FitMode.Inside);

        }
    },
    /**
     * @private
     */
    _getEffectiveState: function (flags)
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
     * @private
     */
    _registerSetters: function ($super)
    {
        $super();
        Commands._registerSettersForImage(this);
    },
    /**
     * @private
     */
    _registerGetters: function ($super)
    {
        $super();
        Commands._registerGettersForImage(this);
    },
    /**
     * @private
     */
    ___getSpriteSizeForCheckBox: function ()
    {
        return this.__scaledImageSize;
    },
    /////////// Empty Functions ////////////
    /**
     * @name GLUI.Image#getImageBorder
     * @description Retrieve the value of the <code>imageBorder</code> property for a view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {GLUI.Commands.State} [ flags Optional, Default: UI.State.Normal] The GLUI view state.
     * @returns {Object} The current value of <code>imageBorder.</code>
     * @see GLUI.Image#setImageBorder
     * @status Android, Test
     * @function
     */
    getImageBorder: function (flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageBorder(flags) in Image');
    },

    /**
     * @name GLUI.Image#getImageTransform
     * @description Retrieve the value of the <code>imageTransform</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Array (Number)} The current value of <code>imageTransform.</code>
     * @see GLUI.Image#setImageTransform
     * @status Android, Test
     * @function
     */
    getImageTransform: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageTransform() in Image');
    },

    /**
     * @name GLUI.Image#setImageBorder
     * @description Set the value of the <code>imageBorder</code> property for a view state. This property defines a border for images used in the specified view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Object} imageBorder The new value for <code>imageBorder.</code>.
     * @param {GLUI.State} [flags Optional, Default: UI.State.Normal] The UI view state.
     * @see GLUI.Image#getImageBorder
     * @status Android, Test
     * @function
     */
    setImageBorder: function (imageBorder, flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageBorder(imageBorder, flags) in Image');
    },

    /**
     * @name GLUI.Image#setImageTransform
     * @description Set the value of the <code>imageTransform</code> property. This property defines data compression for images.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var splashGraphic = new UI.Image();
     * ...
     * splashGraphic.setImageTransform([Math.cos(angle), Math.sin(angle), Math.sin(angle), Math.cos(angle), 0, 0]);
     * @param {Array (Number)} imageTransform The new value for <code>imageTransform.</code> Set as an array of floats (a, b, c, d, tx, ty).
     * @see GLUI.Image#getImageTransform
     * @status Android, Test
     * @function
     */
    setImageTransform: function (imageTransform)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageTransform(imageTransform) in Image');
    }
});

exports.Image = Image;
