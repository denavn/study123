////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas Shahid
 *  @co-author: Suleman Naeem
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// ngCore
var Size               = require('../../../NGCore/Client/Core/Size').Size;
var MessageListener    = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter      = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Capabilities       = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Node               = require('../../../NGCore/Client/GL2/Node').Node;
var Sprite             = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var OrientationEmitter = require('../../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;

// ngGo
var ScreenManager      = require('../Display/ScreenManager').ScreenManager;


exports.ScrollingLayers = Node.subclass(
/** @lends Service.Graphics.ScrollingLayers.prototype*/
{
    classname: 'ScrollingLayers',

    ScrollDirection:
    {
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
     * @augments GL2.Noe
     * @status Android, Flash
     */
    initialize: function(imagesArrayObjects, screenName)
    {
        if (!(imagesArrayObjects && typeof (imagesArrayObjects) === 'object' && imagesArrayObjects.layers && imagesArrayObjects.layers instanceof Array))
        {
            throw new Error("Invalid arguments in initialize of ScrollingLayers");
        }
        if(screenName && (typeof (screenName) !== 'string'))
        {
            throw new Error("Screen name must be string for ScrollingLayers");
        }
        var arrayLength = imagesArrayObjects.layers.length;
        for(var i = 0 ; i < arrayLength ; i++)
        {
            if(! (imagesArrayObjects.layers[i].path && typeof(imagesArrayObjects.layers[i].path) === "string" && 
                    imagesArrayObjects.layers[i].size && ( imagesArrayObjects.layers[i].size instanceof Size || 
                    (imagesArrayObjects.layers[i].size instanceof Array && imagesArrayObjects.layers[i].size.length === 2 )) && 
                    !isNaN(imagesArrayObjects.layers[i].offset) && typeof(imagesArrayObjects.layers[i].offset) === "number" && 
                    !isNaN(imagesArrayObjects.layers[i].speed) && typeof(imagesArrayObjects.layers[i].speed) === "number"))
            {
                throw new Error("Invalid arguments in initialize of ScrollingLayers");
            }
        }

        this._speed = 1;
        this._scrollDirection = this.ScrollDirection.Horizontal;
        this._arrayImageObjects = imagesArrayObjects.layers;
        this._imagesArray = [];
        this._scrollPosition=0;
        this._listener = new MessageListener();
        this._screen = ScreenManager.settings[screenName];
        this._isScrolling = false;
        this._height = this._getScreenHeight();
        this._setupDisplay();
       },
    /**
     * Destroys images objects
     * @status Android, Flash ,iOS
     */
    destroy: function()
    {
        UpdateEmitter.removeListener(this._listener);
        this._screen = null;
        this._isScrolling = null;
        this._height = null;
        this._scrollDirection = null;
        this._scrollPosition=null;
        this._listener = null;
        var i, j;
        if (this._imagesArray)
        {
            var length = this._imagesArray.length;
            for (i = 0; i < length; i++)
            {
                if (this._imagesArray[i])
                {
                    var spritesArray = this._imagesArray[i];
                    var spritesArrayLenth = spritesArray.length;
                    for (j = 0; j < spritesArrayLenth; j++)
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
        if (this._arrayImageObjects)
        {
            var imageObjectsArrayLength = this._arrayImageObjects.length;
            for (i = 0; i < imageObjectsArrayLength; i++)
            {
                this._arrayImageObjects[i].path = null;
                this._arrayImageObjects[i].offset = null;
                this._arrayImageObjects[i].size = null;
                this._arrayImageObjects[i].speed = null;
                this._arrayImageObjects[i] = null;
            }
            this._arrayImageObjects.length = 0;
        }
        this._arrayImageObjects = null;
        this._speed = null;
    },
    /**
     * This function pauses scrolling.
     * @status Android, Flash ,iOS
     */
    pause: function()
    {
        if(this._isScrolling === true)
        {
            UpdateEmitter.removeListener( this._listener);
            this._isScrolling = false;
        }
    },
    /**
     * This function starts scrolling.
     * @status Android, Flash ,iOS
     */
    start: function()
    {
        this.reset();
        if(this._isScrolling === true)
        {
            UpdateEmitter.removeListener( this._listener);
            this._isScrolling = false;
        }
        this._isScrolling = true;
        UpdateEmitter.addListener( this._listener, this._updateFunction.bind(this));
    },
    /**
     * This function resumes the paused scrolling.
     * @status Android, Flash ,iOS
     */
    resume: function()
    {
        if(this._isScrolling === false)
        {
            UpdateEmitter.addListener( this._listener, this._updateFunction.bind(this));
            this._isScrolling = true;
        }
    },
    /**
     * Function to reset the scrolling. Usually called after game is over and restart of the game is required.
     * @status Android, Flash ,iOS
     */
    reset: function()
    {
        var length = this._imagesArray.length;
        var i, j;
        for (j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for (i = 0; i < imagesArrayLength; i++)
            {
                var imageSprite = imagesArray[i];
                var size = imageObject.size;
                var position = imageSprite.getPosition();
                if (this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                     imageSprite.setPosition(size.getWidth()*i,position.getY());
                }
                else
                {
                     imageSprite.setPosition(position.getX(), size.getHeight()* (imagesArrayLength - (i+2)));
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
        if(isNaN(value) || typeof(value) !== "number" )
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
        if(isNaN(value) || typeof(value) !== "number")
        {
            throw new Error("Position must be number for ScrollingLayers");
        }
        var position = value;
        var length = this._imagesArray.length;
        var i, j;
        this._scrollPosition = position;

        for (j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for (i = 0; i < imagesArrayLength; i++)
            {
                position = this._scrollPosition * imageObject.speed;
                var imageSprite = imagesArray[i];

                if (this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    if( imageObject.size.getWidth() < position)
                    {
                        position = position % imageObject.size.getWidth();
                    }
                    else if(position < 0)
                    {
                        if(position < -1 * imageObject.size.getWidth())
                        {
                            position = position % imageObject.size.getWidth();
                        }
                        position =  imageObject.size.getWidth() + position;
                    }

                    imageSprite.setPosition(imageObject.size.getWidth()*i-position, imageSprite.getPosition().getY());
                }
                else
                {
                    if(imageObject.size.getHeight() < position )
                    {
                        position = position % imageObject.size.getHeight();
                    }
                    else if(position < 0)
                    {
                        if(position < -1 * imageObject.size.getHeight())
                        {
                            position = position % imageObject.size.getHeight();
                        }
                        position =  imageObject.size.getHeight() + position;
                    }
                    imageSprite.setPosition(imageSprite.getPosition().getX() , imageObject.size.getHeight()* (imagesArrayLength - (i+2)) + position);
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
        if(isNaN(value) || typeof(value) !== "number" || !(value === 2 || value === 1))
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
    _setupDisplay: function()
    {
        var i, j, k;
        if(this._imagesArray)
        {
            var imagesLength = this._imagesArray.length;
            for (k = 0; k < imagesLength; k++)
            {
                if (this._imagesArray[k])
                {
                    var spritesArray = this._imagesArray[k];
                    var spritesArrayLenth = spritesArray.length;
                    for (j = 0; j < spritesArrayLenth; j++)
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

        for (j = 0; j < length; j++)
        {
            var imageObject = this._arrayImageObjects[j];
            var imageSize = new Core.Size(imageObject.size);
            imageObject.size = imageSize;
            var totalCount = 0 ;
            if (this._scrollDirection === this.ScrollDirection.Horizontal)
            {
                var width = this._getScreenWidth();

                totalCount = Math.ceil(width / imageSize.getWidth()) + 1;
            }
            else
            {
                
                totalCount = Math.ceil(this._height / imageSize.getHeight()) + 1;
            }

            var imagesArray = [];
            for (i = 0; i < totalCount; i++)
            {
                var imageSprite = new Sprite();
                imageSprite.setImage(imageObject.path, imageSize, [0, 0]);
                if (this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    imageSprite.setPosition(i * imageSize.getWidth(), imageObject.offset);
                    
                }
                else
                {
                    imageSprite.setPosition(imageObject.offset,  (totalCount - (i+2)) * imageSize.getHeight());
                }
                imageSprite.setDepth(-1);
                this.addChild(imageSprite);
                imagesArray[imagesArray.length] = imageSprite;
            }
            this._imagesArray[this._imagesArray.length] = imagesArray;
        }
    },
    /**
     * This function updates images in scrolling.
     * @private
     */
    _updateFunction: function(delta)
    {
   
        var length = this._imagesArray.length;
        var speed = this._speed * 60 * delta / 1000;
        var i, j;
        this._scrollPosition += speed;
        for (j = 0; j < length; j++)
        {
            var shouldMoveToLast = false;
            var imageObject = this._arrayImageObjects[j];
            var imagesArray = this._imagesArray[j];
            var imagesArrayLength = imagesArray.length;
            for (i = 0; i < imagesArrayLength; i++)
            {
                var imageSprite = imagesArray[i];
                var prevPosition = imageSprite.getPosition();

                if (this._scrollDirection === this.ScrollDirection.Horizontal)
                {
             
                    imageSprite.setPosition(prevPosition.getX() - speed * imageObject.speed, prevPosition.getY());
                }
                else
                {
                    imageSprite.setPosition(prevPosition.getX() , prevPosition.getY() + speed * imageObject.speed);
                }
                if (i === 0)
                {
                   
                    var position = imageSprite.getPosition();
                
                    if (this._scrollDirection === this.ScrollDirection.Horizontal)
                    {
                        if (position.getX() < -(imageObject.size.getWidth() ))
                        {
                            shouldMoveToLast = true;
                        }
                    }
                    else
                    {
                        if (position.getY() > (this._height ))
                        {
                            shouldMoveToLast = true;
                        }
                    }
                }
            }
            if (shouldMoveToLast)
            {
                var firstObject = imagesArray[0];
                var lastImage = imagesArray[imagesArray.length - 1];
                if (this._scrollDirection === this.ScrollDirection.Horizontal)
                {
                    firstObject.setPosition(lastImage.getPosition().getX() + imageObject.size.getWidth(), lastImage.getPosition().getY());
                }
                else
                {
                    firstObject.setPosition(lastImage.getPosition().getX(), lastImage.getPosition().getY() - imageObject.size.getHeight());
                }

                imagesArray.splice(0, 1);
                imagesArray[imagesArray.length] = firstObject;
            }
        }
    },

    /**
     * @private
     */

    /**
     * @private
     */
    _getScreenWidth: function()
    {
        if (this._screen)
        {
            return this._screen.logicalSize[0];
        }
 
        switch (OrientationEmitter.getInterfaceOrientation())
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
    _getScreenHeight: function()
    {
        if (this._screen)
        {
            return this._screen.logicalSize[1];
        }
        switch (OrientationEmitter.getInterfaceOrientation())
        {
            case OrientationEmitter.Orientation.LandscapeLeft:
            case OrientationEmitter.Orientation.LandscapeRight:
                return Capabilities.getScreenWidth();
            default:
                return Capabilities.getScreenHeight();
        }
    }
});
