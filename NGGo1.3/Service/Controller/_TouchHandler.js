////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Amjad Aziz
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Vector = require('../../../NGCore/Client/Core/Vector').Vector;
var Class = require('../../../NGCore/Client/Core/Class').Class;
var AdvanceTouch = Class.subclass(
{ /** @lends AdvanceTouch.prototype */
    classname: 'AdvanceTouch',
    /**
     * @class The AdvanceTouch class constructs objects that identify and track the life cycle of multiple touch events in the system.
     * @arguments  Core.Class
     * @constructs Init AdvanceTouch class.
     */
    initialize: function ()
    {
        this._initialPos = null;
        this._startTime = null;
        this._position = null;
        this._previousPosition = null;
        this._currentTime = null;
        this._pinchRatio = null;
        this._secondTouchPos = null;
        this._secondTouchPreviousPosition = null;
        this._swipeDirection = null;
        this._isMovedCheck = false;
        this._isLongTappedCheck = false;
        this._isPinchedCheck = false;
        this._longTappedRatio = 0;
    },
    /**
     * Returns the start position of first touch.
     * @return {Core.Point} position. Initial position of first touch.
     */
    getStartPosition: function ()
    {
        return this._initialPos;
    },
    /**
     * Returns relative position of initial position and current position of first touch.
     * @return {Core.Point} deltaPosition relative position of initial position and current position of first touch.
     */
    getRelativePositionFromStart: function ()
    {
        return new Vector(this._position.getX() - this._initialPos.getX(), this._position.getY() - this._initialPos.getY());
    },
    /**
     * Returns the total time passed for first event start in milliseconds.
     * @return {Number} milliseconds. Total time passed for first event start in miliseconds.
     */
    getTimeFromStart: function ()
    {
        return (this._currentTime - this._startTime);
    },
    /**
     * Returns current time for current event.
     * @return {Number} time. Current time in milliseconds.
     */
    getCurrentTime: function ()
    {
        return this._currentTime;
    },
    /**
     * Returns pinching ratio for pinch event. From pinching ratio we can determine pinching or panning and speed of movement of touches.
     * @return {Number} pinching ratio for pinch event. 
     */
    getPinchRatio: function ()
    {
        return this._pinchRatio;
    },
    /**
     * Returns swipe direction of swipe event.
     * @return {}
     */
    getSwipeDirection: function ()
    {
        return this._swipeDirection;
    },
    /**
     * Returns position of second touch.  
     * @return {Core.Point} position of second touch.
     */
    getSecondTouchPosition: function ()
    {
        return this._secondTouchPos;
    },
    /**
     * Returns true if swipe event occurs otherwise false.
     * @return {boolean} true if swipe event occurs otherwise false.
     */
    isMoved: function ()
    {
        return this._isMovedCheck;
    },
    /**
     * Returns true if LongTapped event occurs otherwise false.
     * @return {boolean} true if LongTapped event occurs otherwise false.
     */
    isLongTapped: function ()
    {
        return this._isLongTappedCheck;
    },
    /**
     * Returns true if Pinch event occurs otherwise false.
     * @return {boolean} true if Pinch event occurs otherwise false.
     */
    isPinched: function ()
    {
        return this._isPinchedCheck;
    },
    /**
     * Returns current position for first touch.
     * @return {Core.Point} position. Current position for first touch.
     */
    getCurrentPosition: function ()
    {
        return this._position;
    },
    /**
     * Returns initial time in milliseconds of first event.
     * @return {Number} time in milliseconds of first event.
     */
    getInitialTime: function ()
    {
        return this._startTime;
    },
    /**
     * Returns previous position of first touch.
     * @return {Core.Point} position. Previous position of first touch.
     */
    getPreviousPosition: function ()
    {
        return this._previousPosition;
    },
    /**
     * Returns previous position of second touch.
     * @return {Core.Point} position. Previous position of second touch.
     */
    getSecondTouchPreviousPosition: function ()
    {
        return this._secondTouchPreviousPosition;
    },
    /**
     * Returns LongTapped event ratio/progress. For Example 0 when LongTap starts and 1 when LongTapped called.  
     * @return {Number} ratio. Returns LongTapped event ratio/progress.
     */
    getLongTappedRatio: function ()
    {
        return this._longTappedRatio;
    },
    /**
     * Destroy this instance and release resources on the backend.
     */
    destroy: function ()
    {
        if (this._initialPos)
        {
            delete this._initialPos;
        }
        if (this._startTime)
        {
            delete this._startTime;
        }
        if (this._currentTime)
        {
            delete this._currentTime;
        }
        if (this._isMovedCheck)
        {
            delete this._isMovedCheck;
        }
        if (this._isLongTappedCheck)
        {
            delete this._isLongTappedCheck;
        }
        if (this._isPinchedCheck)
        {
            delete this._isPinchedCheck;
        }
        if (this._pinchRatio)
        {
            delete this._pinchRatio;
        }
        if (this.pinchCentre)
        {
            delete this.pinchCentre;
        }
        if (this._swipeDirection)
        {
            delete this._swipeDirection;
        }
        if (this._previousPosition)
        {
            delete this._previousPosition;
        }
        if (this._secondTouchPreviousPosition)
        {
            delete this._secondTouchPreviousPosition;
        }
        if (this._position)
        {
            delete this._position;
        }
        delete this._longTappedRatio;
    },
    /*Private Method*/
    _setStartPosition: function (position)
    {
        this._initialPos = position;
    },
    /*Private Method*/
    _setInitialTime: function (time)
    {
        this._startTime = time;
    },
    /*Private Method*/
    _setCurrentPos: function (position)
    {
        this._position = position;
    },
    /*Private Method*/
    _setIsMoved: function (moved)
    {
        this._isMovedCheck = moved;
    },
    /*Private Method*/
    _setIsLongTapped: function (moved)
    {
        this._isLongTappedCheck = moved;
    },
    /*Private Method*/
    _setIsPinched: function (moved)
    {
        this._isPinchedCheck = moved;
    },
    /*Private Method*/
    _setPinchRatio: function (ratio)
    {
        this._pinchRatio = ratio;
    },
    /*Private Method*/
    _setSecondTouchPos: function (position)
    {
        this._secondTouchPos = position;
    },
    /*Private Method*/
    _setSwipeDirection: function (direction)
    {
        this._swipeDirection = direction;
    },
    /*Private Method*/
    _setCurrentTime: function (time)
    {
        this._currentTime = time;
    },
    /*Private Method*/
    _setPreviousPosition: function (position)
    {
        this._previousPosition = position;
    },
    /*Private Method*/
    _setSecondTouchPreviousPosition: function (position)
    {
        this._secondTouchPreviousPosition = position;
    },
    /*Private Method*/
    _setLongTappedRatio: function (longTapDuration)
    {
        this._longTappedRatio = (this._currentTime - this._startTime) / longTapDuration;
        if (this._longTappedRatio > 1)
        {
            this._longTappedRatio = 1;
        }
    }
});
exports.AdvanceTouch = AdvanceTouch;