var Point = require('../../../NGCore/Client/Core/Point').Point;
var Size = require('../../../NGCore/Client/Core/Size').Size;
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var MessageEmitter = require('../../../NGCore/Client/Core/MessageEmitter').MessageEmitter;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var Sprite = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var TouchTarget = require('../../../NGCore/Client/GL2/TouchTarget').TouchTarget;

var Ops = require('../../Foundation/Math/Ops').Ops;
var VFX = require('../../Service/Graphics/VFX').VFX;


/**
 * @private
 * Private class.
 */
var SliderSprite = Sprite.subclass(
{ /** @lends GLUI.Extra.SliderSprite.prototype */
    initialize: function (callback)
    {
        if (callback)
        {
            if (typeof callback === 'function')
            {
                this._setPositionCB = callback;
            }
            else
            {
                throw new Error('Expecting a callback function');
            }
        }
    },
    destroy: function ()
    {
        this._setPositionCB = null;
    },
    setPosition: function ($super)
    {
        $super.apply(this, Array.prototype.slice.call(arguments, 1));
        if (this._setPositionCB)
        {
            this._setPositionCB();
        }
    }
});


exports.Slider = Node.subclass( /** @lends GLUI.Extra.Slider.prototype */
{
    classname: 'Slider',
    /**
     * @name GLUI.Extra.Slider
     * @class The <code>Slider</code> class constructs objects of a Control that provides a sliding interface between two numeric values.
     * @param {String} fillerPath The path of the image to be used as slider background.
     * @param {Core.Size} fillerSize The size of the slider control.
     * @param {String} sliderPath The path of the image to be used to for the slider knob.
     * @param {Core.Size} sliderSize The size of the slider knob.
     * @property {Number} sliderValue The current value of the slider <br> The default Value is 0.
     * @property {Number} maxLimit The maximum value (Upper Limit) of the slider <br> The default Value is 0.
     * @property {Number} minLimit The minimum value (Lower Limit) of the slider <br> The default Value is 100.
     * @constructs
     * @augments GL2.Node
     * @example var slider = new Slider('./Content/image.png', new Core.Size(80, 10), './Content/slider.png', new Core.Size(10, 30));
     * ...
     */
    initialize: function (fillerPath, fillerSize, sliderPath, sliderSize)
    {
        if (typeof (fillerPath) !== "string")
        {
            throw new Error("fillerPath should be a string in " + this.classname);
        }
        if (typeof (sliderPath) !== "string")
        {
            throw new Error("sliderPath should be a string in " + this.classname);
        }
        this._fillerPath = fillerPath;
        this._sliderPath = sliderPath;
        if (!(fillerSize instanceof Size))
        {
            fillerSize = new Size(0, 0);
            console.log("fillerSize is not a Size, setting fillerSize equal to Size(0,0).");
        }
        if (!(sliderSize instanceof Size))
        {
            sliderSize = new Size(0, 0);
            console.log("sliderSize is not a Size, setting sliderSize equal to Size(0,0).");
        }
        this._fillerWidth = fillerSize.getWidth();
        this._fillerHeight = fillerSize.getHeight();
        this._sliderWidth = sliderSize.getWidth();
        this._sliderHeight = sliderSize.getHeight();
        this._mode = 0;
        this._value = 0;
        this._minLimit = 0;
        this._maxLimit = 100;
        this._duration = 500;
        this._enabled = true;
        this._animated = false;
        this._onSlideListener = null;
        this._lastPoint = null;
        this._trackingId = null;
        this._discreteValue = 1;
        this._isdraging = false;
        this._shouldNeglect = false;
        this._discreteEnabled = false;
        this._easingFunc = Ops.linearTween;
        this._length = this._fillerWidth - this._sliderWidth;
        this._discreteIncrement = this._discreteValue * this._length / (this._maxLimit - this._minLimit);
        // Create UI of Filler
        this._filler = new Sprite();
        this._filler.setImage(this._fillerPath, [this._fillerWidth, this._fillerHeight], [0, 0.5]);
        this._filler.setPosition(0, this._fillerHeight / 2);
        // Create Touch Target for Filler
        this._emitter = new MessageEmitter();
        this._listener = new MessageListener();
        this._touchTarget = new TouchTarget();
        this._touchTarget.setPosition(0, 0);
        this._touchTarget.setAnchor([0, 0.5]);
        this._touchTarget.setSize([this._fillerWidth, this._sliderHeight]);
        this._touchTarget.getTouchEmitter().addListener(this._listener, this._onSlide.bind(this));
        // Create Slider for Filler
        this._slider = new SliderSprite(this._updateValue.bind(this));
        this._slider.setPosition(new Point(this._sliderWidth / 2, 0));
        this._slider.setImage(this._sliderPath, [this._sliderWidth, this._sliderHeight], [0.5, 0.5]);
        // Add Touch Target and Slider in Filler
        this._filler.addChild(this._touchTarget);
        this._filler.addChild(this._slider);
        // Add Filler current Slider Node
        this.addChild(this._filler);
    },
    /**
     * @name GLUI.Extra.Slider#setEnabled
     * @description Sets if the slider control is enabled.
     * @example var slider = new Slider(fillerPath, fillerSize, sliderPath, sliderSize);
     * ...
     * var enabled = slider.setEnabled(false);
     * @see GLUI.Extra.Slider#getEnabled
     * @param {Boolean} enabled [enabled=true] Set as <code>true</code> if Slider is enabled.
     * @function
     */
    setEnabled: function (enabled)
    {
        this._enabled = !! enabled;
    },
    /**
     * @name GLUI.Extra.Slider#getEnabled
     * @description Retrieve if the Slider is enabled or not. The default value is <code>true</code>.  
     * @example var slider = new Slider(fillerPath, fillerSize, sliderPath, sliderSize);
     * ...
     * slider.getEnabled();
     * @see GLUI.Extra.Slider#setEnabled
     * @returns {Boolean} Returns <code>true</code> if Slider is enabled.
     * @function
     */
    getEnabled: function ()
    {
        return this._enabled;
    },
    /**
     * @name GLUI.Extra.Slider#setAnimated
     * @description Sets if the slider should animate during its linear translation. The default value is false.
     * @example var slider = new Slider('./Content/image.png', new Core.Size(80, 10), './Content/slider.png', new Core.Size(10, 30));
     * ...
     * slider.setAnimated(true);
     * @see GLUI.Extra.Slider#getAnimated
     * @param {Boolean} value [animated=true] Set as <code>true</code> if Slider movement is animated.
     * @function
     */
    setAnimated: function (value)
    {
        this._animated = !! value;
    },
    /**
     * @name GLUI.Extra.Slider#getAnimated
     * @description Retrieves if the slider's movement is animated during its linear translation. The default value is false.
     * @example var slider = new Slider('./Content/image.png', new Core.Size(80, 10), './Content/slider.png', new Core.Size(10, 30));
     * ...
     * var animated = slider.getAnimated();
     * @see GLUI.Extra.Slider#setAnimated
     * @returns {Boolean} Returns <code>true</code> if Slider movement is animated.
     * @function
     */
    getAnimated: function ()
    {
        return this._animated;
    },
    /**
     * @name GLUI.Extra.Slider#setAnimation
     * @description Sets if the slider should animate during its linear translation.
     * @example var slider = new Slider('./Content/image.png', new Core.Size(80, 10), './Content/slider.png', new Core.Size(30, 30));
     * ...
     * slider. setAnimation(foundation.Math.Ops.linearTween, 1000);
     * @param {Function | Foundation.Math.Ops} easingFunc Easing function of type Math.Ops or name of Math.Ops functions in form of string.
     * @param {Numbder} duration Duration of animation of slider.
     * @function
     */
    setAnimation: function (easingFunc, duration)
    {
        if (typeof easingFunc === "function")
        {
            this._easingFunc = easingFunc;
        }
        else if (typeof easingFunc === "string")
        {
            this._easingFunc = Ops[easingFunc];
            if (this._easingFunc === undefined)
            {
                throw new Error("Provided name not valid name of easingFunction available in Math.Ops");
            }
        }
        else
        {
            this._easingFunc = Ops.linearTween;
        }
        if (!isNaN(duration))
        {
            this._duration = duration;
        }
        else
        {
            throw new Error("Duration of setAnimation must be number.");
        }
    },
    /**
     * @name GLUI.Extra.Slider#setDiscreteValue
     * @description Sets the length of step for which the slider should move when discrete mode is enabled <br> Its default value is 1.
     * @example var slider = new Slider(fillerPath, fillerSize, sliderPath, sliderSize);
     * ...
     * slider.setDiscreteValue(10);
     * @see GLUI.Extra.Slider#getDiscreteValue
     * @param {Number} value [discrete=10] Sets the discrete step length as <code>10</code> of the Slider's length if movement is discrete.
     * @function
     */
    setDiscreteValue: function (value)
    {
        if (!isNaN(value))
        {
            var mod = this._maxLimit - this._minLimit;
            if (value <= 0 || value > Math.abs(mod))
            {
                value = 1;
                console.log("setDiscreteValue is out of range, setting setDiscreteValue equal to 1.");
            }
            this._discreteValue = value;
            this._discreteIncrement = this._discreteValue * this._length / mod;
        }
        else
        {
            throw new Error("discrete value must number in " + this.classname);
        }
    },
    /**
     * @name GLUI.Extra.Slider#getDiscreteValue
     * @description Return the length of discrete step.
     * @see GLUI.Extra.Slider#setDiscreteValue
     * @returns {Number} Returns the discrete step length.
     * @function
     */
    getDiscreteValue: function ()
    {
        return this._discreteValue;
    },
    /**
     * @name GLUI.Extra.Slider#setDiscreteEnabled
     * @description This enables the discrete movement of slider.
     * @example var slider = new Slider(fillerPath, fillerSize, sliderPath, sliderSize);
     * ...
     * slider.setDiscreteEnabled(true);
     * @see GLUI.Extra.Slider#getDiscreteEnabled
     * @param {Boolean} value [discreteEnabled=true] Set as <code>true</code> if Slider movement is discrete.
     * @function
     */
    setDiscreteEnabled: function (value)
    {
        this._discreteEnabled = !! value;
    },
    /**
     * @name GLUI.Extra.Slider#getDiscreteEnabled
     * @description This returns the state of discrete movement mode of slider.
     * @example var slider = new Slider(fillerPath, fillerSize, sliderPath, sliderSize);
     * ...
     * var discEnabled = slider.getDiscreteEnabled();
     * @see GLUI.Extra.Slider#setDiscreteEnabled
     * @returns {Boolean} <code>true</code> if Slider movement is discrete.
     * @function
     */
    getDiscreteEnabled: function ()
    {
        return this._discreteEnabled;
    },
    /**
     * @name GLUI.Extra.Slider#setOnSlideComplete
     * @description Set a function to call when the Slide event completes. 
     * @param {Function} callback The new callback function.
     * @example slider.setOnSlideComplete(function() { console.log(this.classname + "is complete");});
     * @see GLUI.Extra.Slider#getOnSlideComplete
     * @function
     */
    setOnSlideComplete: function (callback)
    {
        if (typeof callback === "function")
        {
            this._onSlideListener = callback;
        }
        else
        {
            throw new Error("setOnSlideComplete must be a function");
        }
    },
    /**
     * @name  GLUI.Extra.Slider#getOnSlideComplete
     * @description Returns onSlideComplete callback.
     * @returns {Function} The onSlideComplete callback function.
     * @see GLUI.Extra.Slider#setOnSlideComplete
     * @function
     */
    getOnSlideComplete: function ()
    {
        return this._onSlideListener;
    },
    /**
     * @name  GLUI.Extra.Slider#getEmitter
     * @description Emitter to track continuous change in Slider's movement
     * @returns {Object} MessageEmitter.
     * @function
     */
    getEmitter: function ()
    {
        return this._emitter;
    },
    /**
     * @name  GLUI.Extra.Slider#setRange
     * @description Sets the range of minimum and maximum value for the Slider.
     * @param {Number} min [min=10] Set as <code>10</code> Sets the minimum value of Slider.
     * @param {Number} max [max=80] Set as <code>80</code> Sets the maximum value of Slider.
     * @see GLUI.Extra.Slider#getRange
     * @function
     */
    setRange: function (min, max)
    {
        if ((!isNaN(min) || !isNaN(max)) && (min < max))
        {
            this._minLimit = min;
            this._maxLimit = max;
            this.setDiscreteValue(this._discreteValue);
        }
        else
        {
            throw new Error("Invalid arguments in setRange in " + this.classname);
        }
    },
    /**
     * @name  GLUI.Extra.Slider#getRange
     * @description Returns the range of minimum and maximum value for the Slider.
     * @returns {Array} The Array of minimum and maxium value.
     * @see GLUI.Extra.Slider#setRange
     * @function
     */
    getRange: function ()
    {
        return [this._minLimit, this._maxLimit];
    },
    /**
     * @private 
     */
    get sliderValue()
    {
        return this._value;
    },
    /**
     * @private 
     */
    set sliderValue(value)
    {
        var min = this._minLimit;
        var max = this._maxLimit;
        if (!isNaN(value))
        {
            if ((value > max))
            {
                value = max;
                console.log("sliderValue is out of range, setting sliderValue equal to maxLimit of range.");
            }
            else if ((value < min))
            {
                value = min;
                console.log("sliderValue is out of range, setting sliderValue equal to minLimit of range.");
            }
            var posX = (value - min) * this._length / (max - min);
            posX = posX + (this._sliderWidth / 2);
            this._slider.setPosition(posX, 0);
        }
        else
        {
            throw new Error("Slider value must be a number in " + this.classname);
        }
    },
    /**
     * @private 
     */
    get maxLimit()
    {
        return this._maxLimit;
    },
    /**
     * @private 
     */
    set maxLimit(value)
    {
        this.setRange(this._minLimit, value);
    },
    /**
     * @private 
     */
    get minLimit()
    {
        return this._minLimit;
    },
    /**
     * @private 
     */
    set minLimit(value)
    {
        this.setRange(value, this._maxLimit);
    },
    /**
     * @private 
     */
    _onSlide: function (touch)
    {
        switch (touch.getAction())
        {
        case touch.Action.Start:
            if (this._trackingId !== null || !this._enabled)
            {
                return false;
            }
            var pos = this._translateTouchPosition(touch);
            if (!pos)
            {
                return false;
            }
            this._trackingId = touch.getId();
            if (this._animating)
            {
                VFX.sequence().stop(this._slider);
                this._animating = false;
            }
            var isOnSlider = this._isInsideSlider(pos);
            this._isdraging = isOnSlider;
            if (!isOnSlider && !this._animated && !this._discreteEnabled)
            {
                this._setPosition(pos.getX());
                this._isdraging = true;
            }
            this._lastPoint = pos;
            return true;
        case touch.Action.End:
            if (this._trackingId === touch.getId() && this._enabled && !this._shouldNeglect)
            {
                var touchPosX = this._translateTouchPosition(touch);
                if (touchPosX)
                {
                    touchPosX = touchPosX.getX();
                    if (this._discreteEnabled && this._isdraging === false)
                    {
                        this._discreteMovement(touchPosX);
                    }
                    else if (this._animated && this._isdraging === false)
                    {
                        this._animating = true;
                        this._setAnimation(touchPosX);
                    }
                }
                if (this._onSlideListener !== null)
                {
                    if (!this._animating)
                    {
                        this._onSlideListener(this._value);
                    }
                }
            }
            this._trackingId = null;
            this._shouldNeglect = false;
            this._isdraging = false;
            this._lastPoint = null;
            this._mode = 0;
            break;
        case touch.Action.Move:
            if (this._trackingId !== touch.getId() || !this._enabled || this._shouldNeglect)
            {
                return false;
            }
            var touchPos = this._translateTouchPosition(touch);
            if (!touchPos)
            {
                this._shouldNeglect = true;
                return false;
            }
            if (this._discreteEnabled && this._isdraging)
            {
                touchPos = touchPos.getX();
                var firstPos = this._slider.getPosition().getX();
                var deltaX = Math.floor(touchPos - firstPos);
                if (Math.abs(deltaX) < this._discreteIncrement)
                {
                    return;
                }
                var inc = (deltaX < 0) ? -1 : 1;
                var val = this._value + (inc * this._discreteValue);
                if (val < this._minLimit)
                {
                    val = this._minLimit;
                }
                else if (val > this._maxLimit)
                {
                    val = this._maxLimit;
                }
                this.sliderValue = val;
                this._emitter.emit(this._value);
            }
            else if (this._isdraging)
            {
                var xDiff = touchPos.getX() - this._lastPoint.getX();
                var sliderPos = this._slider.getPosition();
                var mode = this._setPosition(sliderPos.getX() + xDiff);
                if (this._mode === 0 || mode === 0)
                {
                    this._lastPoint = touchPos;
                    if (mode !== 0)
                    {
                        var x = this._lastPoint.getX();
                        x = x - mode;
                        this._lastPoint.setX(x);
                    }
                    this._mode = mode;
                }
                this._emitter.emit(this._value);
            }
            break;
        }
    },
    /**
     * @private 
     */
    _translateTouchPosition: function (touch)
    {
        return this._filler.screenToLocal(touch.getPosition());
    },
    /**
     * @private 
     */
    _isInsideSlider: function (localTouchPosition)
    {
        var x = localTouchPosition.getX();
        var y = localTouchPosition.getY();
        var sliderPos = this._slider.getPosition();
        return (x >= sliderPos.getX() - this._sliderWidth / 2 && x <= sliderPos.getX() + this._sliderWidth / 2 && y >= sliderPos.getY() - this._sliderHeight / 2 && y <= sliderPos.getY() + this._sliderHeight / 2);
    },
    /**
     * @private 
     */
    _setPosition: function (xPos)
    {
        var sliderYPos = this._slider.getPosition().getY();
        var retValue = 0;
        var endPosition = null;
        if ((xPos + (this._sliderWidth / 2)) > this._fillerWidth)
        {
            endPosition = new Point((this._fillerWidth - (this._sliderWidth / 2)), sliderYPos);
            retValue = xPos + (this._sliderWidth / 2) - this._fillerWidth; // has hit the right most point;
        }
        else if (xPos - (this._sliderWidth / 2) < 0)
        {
            endPosition = new Point(this._sliderWidth / 2, sliderYPos);
            retValue = xPos - (this._sliderWidth / 2); //has hit the left most point;
        }
        else
        {
            endPosition = new Point(xPos, sliderYPos);
        }
        this._slider.setPosition(endPosition);
        return retValue;
    },
    /**
     * @private 
     */
    _updateValue: function ()
    {
        var position = this._slider.getPosition().getX() - (this._sliderWidth / 2);
        var percentage = position / this._length;
        var magnitude = this._maxLimit - this._minLimit;
        this._value = this._minLimit + (magnitude * percentage);
        this._emitter.emit(this._value);
    },
    /**
     * @private 
     */
    _discreteMovement: function (secondPos)
    {
        var firstPos = this._slider.getPosition().getX();
        var xDiff = secondPos - firstPos;
        var inc = (xDiff < 0) ? -1 : 1;
        var val = this._value + (inc * this._discreteValue);
        if (val < this._minLimit)
        {
            val = this._minLimit;
        }
        else if (val > this._maxLimit)
        {
            val = this._maxLimit;
        }
        this.sliderValue = val;
    },
    /**
     * @private 
     */
    _setAnimation: function (pos)
    {
        if ((pos + (this._sliderWidth / 2)) > this._fillerWidth)
        {
            pos = this._fillerWidth - (this._sliderWidth / 2);
        }
        else if (pos - (this._sliderWidth / 2) < 0)
        {
            pos = this._sliderWidth / 2;
        }
        VFX.sequence().stop(this._slider);
        var sequence = VFX.sequence().moveTo(this._duration / 1000, [pos, this._slider.getPosition().getY()], this._easingFunc);
        sequence.play(this._slider, this._stopAnimation.bind(this));
    },
    /**
     * @private 
     */
    _stopAnimation: function ()
    {
        this._animating = false;
        if (this._onSlideListener !== null)
        {
            this._updateValue();
            this._onSlideListener(this._value);
        }
    },
    /**
     * @private 
     */
    destroy: function ()
    {
        this._slider.destroy();
        this._filler.destroy();
        this._emitter.destroy();
        this._listener.destroy();
        this._touchTarget.destroy();
        delete this._slider;
        delete this._filler;
        delete this._emitter;
        delete this._listener;
        delete this._touchTarget;
        delete this._mode;
        delete this._value;
        delete this._maxLimit;
        delete this._minLimit;
        delete this._duration;
        delete this._enabled;
        delete this._length;
        delete this._animated;
        delete this._lastPoint;
        delete this._isdraging;
        delete this._onSlideListener;
        delete this._easingFunc;
        delete this._trackingId;
        delete this._fillerWidth;
        delete this._fillerHeight;
        delete this._fillerPath;
        delete this._sliderWidth;
        delete this._sliderPath;
        delete this._sliderHeight;
        delete this._discreteValue;
        delete this._shouldNeglect;
        delete this._discreteEnabled;
        delete this._discreteIncrement;
    }
});