////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Suleman Naeem, Shamas Shahid
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// ngCore
var Vector = require('../../../NGCore/Client/Core/Vector').Vector;
var Size = require('../../../NGCore/Client/Core/Size').Size;
var Rect = require('../../../NGCore/Client/Core/Rect').Rect;
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Capabilities = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
//var Sprite = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var Sprite = require('./_ScrollingLayers').Sprite;
var OrientationEmitter = require('../../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
// ngGo
var ScreenManager = require('../Display/ScreenManager').ScreenManager;
exports.ScrollingLayers = Node.subclass( /** @lends Service.Graphics.ScrollingLayers.prototype*/
{
    classname: 'ScrollingLayers',
    ScrollDirection: {
        /**
         * @name Service.Graphics.ScrollingLayers.ScrollDirection
         * @class Enumeration for scroll direction.
         */
        /**
         * @fieldof ScrollingLayers.ScrollDirection.prototype
         * @constant
         */
        Horizontal: 1,
        /**
         * @fieldOf ScrollingLayers.ScrollDirection.prototype
         * @constant
         */
        Vertical: 2
    },
    /**
     * @class The <code>ScrollingLayers</code> class is a base class for manage scrolling.
     *
     * @constructs The default constructor.
     * @augments GL2.Node
     * @param {Object} imagesArrayObjects Object containing information about Layers.
     * @param {string} screenName (Optional)The name of setting registered in ScreenManager to be used for ScrollingLayers.
     * @param {Array/Core.Size} size (Optional)An Array/Size defining size of ScrollingLayers. ClipRect will automatically be applied only if size is defined.
     * @status Android, Flash
     */
    initialize: function (imagesArrayObjects, screenName, size)
    {
        this._validateParams(imagesArrayObjects, screenName, size);
        this._speed = 1;
        this._scrollDirection = this.ScrollDirection.Horizontal;
        this._arrayImageObjects = imagesArrayObjects.layers;
        this._imagesArray = [];
        this._scrollPosition = 0;
        this._listener = new MessageListener();
        if(size)
        {
            this._size = new Size(size);
            this._applyClipRect = true;
            this._lastClipRectFrame = [0, 0, 0, 0];
            this.setClipRectEnabled(true);
            this.start = this._start;
            this.pause = this._pasue;
            this.resume = this._resume;
            UpdateEmitter.addListener(this._listener, this._updateFuncForEnabledClip.bind(this));
        }
        this._screen = screenName ? ScreenManager.settings[screenName] : null;
        this._isScrolling = false;
        this._width = this._getScreenWidth();
        this._height = this._getScreenHeight();
        this._setupDisplay();
    },
    /**
     * Destroys images objects
     * @status Android, Flash ,iOS
     */
    destroy: function ()
    {
        if(this._isScrolling || this._applyClipRect)
        {
            UpdateEmitter.removeListener(this._listener);
        }
        this._listener.destroy();
        this._screen = null;
        this._isScrolling = null;
        this._width = null;
        this._height = null;
        this._scrollDirection = null;
        this._scrollPosition = null;
        this._listener = null;
        var i, j;
        if(this._imagesArray)
        {
            var length = this._imagesArray.length;
            for(i = 0; i < length; i++)
            {
                if(this._imagesArray[i])
                {
                    var spritesArray = this._imagesArray[i];
                    var spritesArrayLenth = spritesArray.length;
                    for(j = 0; j < spritesArrayLenth; j++)
                    {
                        spritesArray[j].destroy();
                        spritesArray[j] = null;
                    }
                    spritesArray.length = 0;
                }
                this._imagesArray[i] = null;
            }
            this._imagesArray.length = 0;
        }
        this._imagesArray = null;
        if(this._arrayImageObjects)
        {
            var imageObjectsArrayLength = this._arrayImageObjects.length;
            for(i = 0; i < imageObjectsArrayLength; i++)
            {
                this._arrayImageObjects[i].path = null;
                this._arrayImageObjects[i].offset = null;
                this._arrayImageObjects[i].size = null;
                this._arrayImageObjects[i].uvs = null;
                this._arrayImageObjects[i].speed = null;
                this._arrayImageObjects[i] = null;
            }
            this._arrayImageObjects.length = 0;
        }
        this._arrayImageObjects = null;
        this._speed = null;
        if(this._applyClipRect)
        {
            this._applyClipRect = null;
            this._lastClipRectFrame.length = 0;
            this._lastClipRectFrame = null;
            this._size = null;
        }
    },
    /**
     * This function pauses scrolling.
     * @status Android, Flash ,iOS
     */
    pause: function ()
    {
        if(this._isScrolling === true)
        {
            UpdateEmitter.removeListener(this._listener);
            this._isScrolling = false;
        }
    },
    /**
     * This function starts scrolling.
     * @status Android, Flash ,iOS
     */
    start: function ()
    {
        this.reset();
        if(this._isScrolling === false)
        {
            this._isScrolling = true;
            UpdateEmitter.addListener(this._listener, this._updateFunction.bind(this));
        }
    },
    /**
     * This function resumes the paused scrolling.
     * @status Android, Flash ,iOS
     */
    resume: function ()
    {
        if(this._isScrolling === false)
        {
            UpdateEmitter.addListener(this._listener, this._updateFunction.bind(this));
            this._isScrolling = true;
        }
    },
    /**
     * Function to reset the scrolling. Usually called after game is over and restart of the game is required.
     * @status Android, Flash ,iOS
     */
    reset: function ()
    {
        var length = this._imagesArray.length;
        var i, j;
        for(j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for(i = 0; i < imagesArrayLength; i++)
            {
                var imageSprite = imagesArray[i];
                var size = imageObject.size;
                var position = imageSprite.getPosition();
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    imageSprite.setPosition(size.getWidth() * i, position.getY());
                }
                else
                {
                    imageSprite.setPosition(position.getX(), size.getHeight() * i);
                }
            }
        }
        this._scrollPosition = 0;
    },
    /**
     * Returns speed of the ScrollingLayer.
     * @returns {Number} The current speed of scrollingLayer.
     * @status Android, Flash ,iOS
     */
    get speed()
    {
        return this._speed;
    },
    /**
     * This function sets speed of the ScrollingLayer.
     * @param {Number} value Speed with which scrollingLayer should scroll.
     * This function sets scrolling speed of the ScrollingLayer.
     * @status Android, Flash ,iOS
     */
    set speed(value)
    {
        if(isNaN(value) || typeof (value) !== "number")
        {
            throw new Error("Speed must be number for ScrollingLayers");
        }
        this._speed = value;
    },
    /**
     * Returns scrolling Position of the ScrollingLayer.
     * @returns {Number} The current node position relative to the parent.
     * @status Android, Flash ,iOS
     */
    get scrollPosition()
    {
        return this._scrollPosition;
    },
    /**
     * Sets scrolling Position of the ScrollingLayer. This function is called if scrolling is to be supported in both directions.
     * The function has to be called each time the position is to be changed.
     * @param {Number} value New position to set position of scrollLayers.
     * @status Android, Flash ,iOS
     */
    set scrollPosition(value)
    {
        if(isNaN(value) || typeof (value) !== "number")
        {
            throw new Error("Position must be number for ScrollingLayers");
        }
        var position = value;
        var length = this._imagesArray.length;
        var i, j;
        this._scrollPosition = position;
        for(j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for(i = 0; i < imagesArrayLength; i++)
            {
                position = this._scrollPosition * imageObject.speed;
                var imageSprite = imagesArray[i];
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    if(imageObject.size.getWidth() < position)
                    {
                        position = position % imageObject.size.getWidth();
                    }
                    else if(position < 0)
                    {
                        if(position < -1 * imageObject.size.getWidth())
                        {
                            position = position % imageObject.size.getWidth();
                        }
                        position = imageObject.size.getWidth() + position;
                    }
                    imageSprite.setPosition(imageObject.size.getWidth() * i - position, imageSprite.getPosition().getY());
                }
                else
                {
                    position = -position;
                    if(imageObject.size.getHeight() < position)
                    {
                        position = position % imageObject.size.getHeight();
                    }
                    else if(position < 0)
                    {
                        if(position < -1 * imageObject.size.getHeight())
                        {
                            position = position % imageObject.size.getHeight();
                        }
                        position = imageObject.size.getHeight() + position;
                    }
                    imageSprite.setPosition(imageSprite.getPosition().getX(), imageObject.size.getHeight() * i - position);
                }
            }
        }
    },
    /**
     * Returns scrolling Direction of the ScrollingLayer.
     * @returns {ScrollingLayers.ScrollDirection} Returns the scroll direction from scrollingLayers.ScrollDirection.
     * @status Android, Flash ,iOS
     */
    get direction()
    {
        return this._scrollDirection;
    },
    /**
     * sets scrolling Direction of the ScrollingLayer.
     * @status Android, Flash ,iOS
     */
    set direction(value)
    {
        if(isNaN(value) || typeof (value) !== "number" || !(value === 2 || value === 1))
        {
            throw new Error("Direction must be a either ScrollDirection.Vertical or ScrollDirection.Horizontal");
        }
        this._scrollDirection = value;
        this._setupDisplay();
    },
    /**
     * This function displays all the images.
     * @private
     */
    _setupDisplay: function ()
    {
        var i, j, k;
        if(this._imagesArray)
        {
            var imagesLength = this._imagesArray.length;
            for(k = 0; k < imagesLength; k++)
            {
                if(this._imagesArray[k])
                {
                    var spritesArray = this._imagesArray[k];
                    var spritesArrayLenth = spritesArray.length;
                    for(j = 0; j < spritesArrayLenth; j++)
                    {
                        spritesArray[j].destroy();
                        spritesArray[j] = null;
                    }
                    spritesArray.length = 0;
                }
                this._imagesArray[k] = null;
            }
            this._imagesArray.length = 0;
        }
        var length = this._arrayImageObjects.length;
        for(j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imageSize = new Size(imageObject.size); //IF array it will convert to object
            imageObject.size = imageSize;
            var totalCount = 0;
            if(this._scrollDirection === this.ScrollDirection.Horizontal)
            {
                totalCount = Math.ceil(this._width / imageSize.getWidth()) + 1;
            }
            else
            {
                totalCount = Math.ceil(this._height / imageSize.getHeight()) + 1;
            }
            var imagesArray = [];
            for(i = 0; i < totalCount; i++)
            {
                var imageSprite = new Sprite();
                var uvs = null;
                if(imageObject.uvs)
                {
                    uvs = new Rect(imageObject.uvs);
                }
                imageSprite.setImage(imageObject.path, imageSize, [0, 0], uvs);
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    imageSprite.setPosition(i * imageSize.getWidth(), imageObject.offset);
                }
                else
                {
                    imageSprite.setPosition(imageObject.offset, i * imageSize.getHeight());
                }
                imageSprite.setDepth(-1);
                this.addChild(imageSprite);
                imagesArray.push(imageSprite);
            }
            this._imagesArray.push(imagesArray);
        }
    },
    /**
     * This function updates images in scrolling.
     * @private
     */
    _updateFunction: function (delta)
    {
        var length = this._imagesArray.length;
        var speed = this._speed * 60 * delta / 1000;
        var i, j;
        this._scrollPosition += speed;
        for(j = 0; j < length; j++)
        {
            var shouldMoveToLast = false;
            var shouldMoveToFirst = false;
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for(i = 0; i < imagesArrayLength; i++)
            {
                var imageSprite = imagesArray[i];
                var prevPosition = imageSprite.getPosition();
                var imageSpriteSpeed = speed * imageObject.speed;
                var position;
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    imageSprite.setPosition(prevPosition.getX() - imageSpriteSpeed, prevPosition.getY());
                    if(i === 0 && imageSpriteSpeed > 0)
                    {
                        position = imageSprite.getPosition();
                        if(position.getX() < -(imageObject.size.getWidth()))
                        {
                            shouldMoveToLast = true;
                        }
                    }
                    else if((i === imagesArrayLength - 1) && (imageSpriteSpeed < 0))
                    {
                        position = imageSprite.getPosition();
                        if(position.getX() > this._width)
                        {
                            shouldMoveToFirst = true;
                        }
                    }
                }
                else
                {
                    imageSprite.setPosition(prevPosition.getX(), prevPosition.getY() + imageSpriteSpeed);
                    if((i === imagesArrayLength - 1) && (imageSpriteSpeed > 0))
                    {
                        position = imageSprite.getPosition();
                        if(position.getY() > this._height)
                        {
                            shouldMoveToFirst = true;
                        }
                    }
                    else if(i === 0 && imageSpriteSpeed < 0)
                    {
                        position = imageSprite.getPosition();
                        if(position.getY() < -(imageObject.size.getHeight()))
                        {
                            shouldMoveToLast = true;
                        }
                    }
                }
            }
            if(shouldMoveToLast)
            {
                var firstObject = imagesArray[0];
                var lastImage = imagesArray[imagesArray.length - 1];
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    firstObject.setPosition(lastImage.getPosition().getX() + imageObject.size.getWidth(), lastImage.getPosition().getY());
                }
                else
                {
                    firstObject.setPosition(lastImage.getPosition().getX(), lastImage.getPosition().getY() + imageObject.size.getHeight());
                }
                imagesArray.splice(0, 1);
                imagesArray.push(firstObject);
            }
            if(shouldMoveToFirst)
            {
                var lastObject = imagesArray[imagesArray.length - 1];
                var firstImage = imagesArray[0];
                if(this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    lastObject.setPosition(firstImage.getPosition().getX() - imageObject.size.getWidth(), firstImage.getPosition().getY());
                }
                else
                {
                    lastObject.setPosition(firstImage.getPosition().getX(), firstImage.getPosition().getY() - imageObject.size.getHeight());
                }
                imagesArray.splice(imagesArray.length - 1, 1);
                imagesArray.splice(0, 0, lastObject);
            }
        }
    },
    /**
     * This function updates images in scrolling and clip rect.
     * @private
     */
    _updateFuncForEnabledClip: function (delta)
    {
        if(this._isScrolling)
        {
            this._updateFunction(delta);
        }
        this._updateClipRect();
    },
    /**
     * @private
     */
    _getScreenWidth: function ()
    {
        if(this._screen)
        {
            return this._screen.logicalSize[0];
        }
        switch(OrientationEmitter.getInterfaceOrientation())
        {
        case OrientationEmitter.Orientation.LandscapeLeft:
        case OrientationEmitter.Orientation.LandscapeRight:
            return Capabilities.getScreenHeight();
        default:
            return Capabilities.getScreenWidth();
        }
    },
    /**
     * @private
     */
    _getScreenHeight: function ()
    {
        if(this._screen)
        {
            return this._screen.logicalSize[1];
        }
        switch(OrientationEmitter.getInterfaceOrientation())
        {
        case OrientationEmitter.Orientation.LandscapeLeft:
        case OrientationEmitter.Orientation.LandscapeRight:
            return Capabilities.getScreenWidth();
        default:
            return Capabilities.getScreenHeight();
        }
    },
    /**
     * @private
     */
    _validateParams: function (imagesArrayObjects, screenName, size)
    {
        if(!(imagesArrayObjects && typeof (imagesArrayObjects) === 'object' && imagesArrayObjects.layers && imagesArrayObjects.layers instanceof Array))
        {
            throw new Error("Invalid arguments in initialize of ScrollingLayers");
        }
        if(screenName && (typeof (screenName) !== 'string'))
        {
            throw new Error("Screen name must be string for ScrollingLayers");
        }
        if(!(size === null || size === undefined || (size && (size instanceof Size || (size instanceof Array && size.length === 2)))))
        {
            throw new Error("Invalid size of ScrollingLayers");
        }
        var arrayLength = imagesArrayObjects.layers.length;
        var i;
        for(i = 0; i < arrayLength; i++)
        {
            if(!(imagesArrayObjects.layers[i].path && typeof (imagesArrayObjects.layers[i].path) === "string"))
            {
                throw new Error("Invalid path in layer: " + imagesArrayObjects.layers[i] + " in initialize of ScrollingLayers");
            }
            if(!(imagesArrayObjects.layers[i].size && (imagesArrayObjects.layers[i].size instanceof Size || (imagesArrayObjects.layers[i].size instanceof Array && imagesArrayObjects.layers[i].size.length === 2))))
            {
                throw new Error("Invalid size in layer: " + imagesArrayObjects.layers[i] + " in initialize of ScrollingLayers");
            }
            if(!(imagesArrayObjects.layers[i].uvs === null || imagesArrayObjects.layers[i].uvs === undefined || (imagesArrayObjects.layers[i].uvs && (imagesArrayObjects.layers[i].uvs instanceof Rect || (imagesArrayObjects.layers[i].uvs instanceof Array && imagesArrayObjects.layers[i].uvs.length === 4)))))
            {
                throw new Error("Invalid uvs in layer: " + imagesArrayObjects.layers[i] + " in initialize of ScrollingLayers");
            }
            if(!(!isNaN(imagesArrayObjects.layers[i].offset) && typeof (imagesArrayObjects.layers[i].offset) === "number"))
            {
                throw new Error("Invalid offset in layer: " + imagesArrayObjects.layers[i] + " in initialize of ScrollingLayers");
            }
            if(!(!isNaN(imagesArrayObjects.layers[i].speed) && typeof (imagesArrayObjects.layers[i].speed) === "number"))
            {
                throw new Error("Invalid speed in layer: " + imagesArrayObjects.layers[i] + " in initialize of ScrollingLayers");
            }
        }
    },
    /** @private */
    _updateClipRect: function ()
    {
        var pos = this.localToScreen(new Vector(0, 0));
        var adjustedSize = this.localToScreen(new Vector(this._size.getWidth(), this._size.getHeight()));
        if(pos && adjustedSize)
        {
            var x = pos.getX();
            var y = pos.getY();
            var w = (adjustedSize.getX() - x);
            var h = (adjustedSize.getY() - y);
            if(x === this._lastClipRectFrame[0] && y === this._lastClipRectFrame[1] && w === this._lastClipRectFrame[2] && h === this._lastClipRectFrame[3])
            {
                return true;
            }
            this._lastClipRectFrame = [x, y, w, h];
            this.setClipRect(this._lastClipRectFrame);
            return true;
        }
        else
        {
            return false;
        }
    },
    /** @private */
    _pause: function ()
    {
        this._isScrolling = false;
    },
    /** @private */
    _start: function ()
    {
        this.reset();
        this._isScrolling = true;
    },
    /** @private */
    _resume: function ()
    {
        this._isScrolling = true;
    }
});