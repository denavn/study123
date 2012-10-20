////////////////////////////////////////////////////////////////////////////////
/**
 *  @author: Amjad Aziz.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var Capabilities = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Point = require('../../../NGCore/Client/Core/Point').Point;
var TouchTarget = require('../../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var Touch = require('../../../NGCore/Client/GL2/Touch').Touch;
var AdvanceTouch = require('./_TouchHandler').AdvanceTouch;
var Class = require('../../Foundation/Class').Class;
var Observable = require('../../Foundation/Observable').Observable;
var TouchHandler = Class.subclass( /** @lends TouchHandler.prototype */
{
    classname: 'TouchHandler',
    // Enums.
    /** 
     * Enumeration for swipe directions.
     * @namespace
     */
    SwipeDirection: { /** Upward Swipe. */
        Up: 0,
        /** Downward Swip. */
        Down: 1,
        /** Left Swipe. */
        Right: 2,
        /** Right Swipe.*/
        Left: 3
    },
    /**
     * @class Creates a touch target having default anchor [0.5,0.5] and position [0,0]. By default all events ( Tap, LongTap, Pinch and Swipe) are enabled and sets Tapping and LongTapping  events to four times per second.
     * Default long tap time is one second and recognizable move distance is 5% of Screen Width.
     *@arguments Class
     *@param {Number} w width of touch target.
     *@param {Number} h height of touch target.
     *@param {Number} z priority of touch target.
     *@param {Object} eventTypes events to enable or disable.
     *@constructs Init TouchHandler class.
     *@example 
     * var touchHandler = new TouchHandler(320,480,1,{Tap:true,LongTap: false, Swipe: true, Pinch: false});
     * touchHandler.addObserver("TapStart",function(touch, touchHandler) {
     * console.log("Tap Position: ["+ touch.getStartPosition().getX()+","+touch.getStartPosition().getY()+"]");
     * });
     * touchHandler.addObserver("Tapping",function(touch,touchHandler){
     * console.log("Tapping : Time from start : " +touch.getTimeFromStart());
     * });
     * touchHandler.addObserver("TapAbort",function(touch,touchHandler){
     * console.log("Tap Aborted : Time from start : " +touch.getTimeFromStart());
     * });
     * touchHandler.addObserver("SwipeStart",function(touch,touchHandler){
     * console.log("Swipe Started : Swipe direction : " +touch.getSwipeDirection());
     * });
     * touchHandler.addObserver("SwipeMoving",function(touch,touchHandler){
     * console.log("Swipe Moving : Swipe direction : " +touch.getSwipeDirection());
     * });
     * touchHandler.addObserver("SwipeEnd",function(touch,touchHandler){
     * console.log("Swipe End : Swipe direction : " +touch.getSwipeDirection());
     * });
     * touchHandler.setRecogMoveDistance((ScreenManager.width*0.08));
     * touchHandler.setEventDuration("Tap",300);
     * GL2.Root.addChild(touchHandler.getTarget());
     * 
     */
    initialize: function (w, h, z, eventTypes)
    {
        if(!isNaN(w) && !isNaN(h) && !isNaN(z))
        {
            this._listener = new MessageListener();
            this.EventTypes = {
                Tap: true,
                Swipe: true,
                LongTap: true,
                Pinch: true
            };
            if(this._isValidEventTypes(eventTypes))
            {
                this._assignEventTypes(eventTypes);
            }
            else
            {
                throw new Error("Invalid Events Object. ");
            }
            if(this.EventTypes.Tap || this.EventTypes.Swipe || this.EventTypes.LongTap || this.EventTypes.Pinch)
            {
                this._touch = new AdvanceTouch();
            }
            this._target = new TouchTarget();
            this._target.setPosition(0, 0);
            this._target.setAnchor(0.5, 0.5);
            this._target.setSize(w, h);
            this._target.setDepth(z);
            this._target.getTouchEmitter().addListener(this._listener, this.onTouch.bind(this), z);
            this._trackingId = [];
            this._touchLast = [];
            this._touchNew = [];
            this._isMove = [];
            this._swipeCalled = false;
            this._timeOutId = null;
            this._initialTouchPosition = null;
            this._tappingIntervalId = null;
            this._tapInterval = 250;
            this._longTappingIntervalId = null;
            this._longTapInterval = 250;
            this._recogLongTapTime = 1000;
            this._recogDist = Capabilities.getScreenWidth() * 0.05;
        }
        else
        {
            throw new Error("Width , height and priority must be number.");
        }
    },
    /**
     * Sets the interval for given event type to call repeatedly.
     * @param {String} eventType event name i.e. "Tap" or "LongTap"
     * @param {Number} duration time interval to call provided event repeatedly in milliseconds.
     */
    setEventDuration: function (eventType, duration)
    {
        if(duration && !isNaN(duration) && duration > 0)
        {
            if(eventType === "Tap")
            {
                this._tapInterval = duration;
            }
            else if(eventType === "LongTap")
            {
                this._longTapInterval = duration;
            }
            else
            {
                throw new Error("Invalid event type. Only Tap or LongTap is acceptable.");
            }
        }
        else
        {
            throw new Error("Duration must be a positive number.");
        }
    },
    /**
     * Returns the update duration for provided event. 
     * @param {String} eventType event name i.e. Tap or LongTap
     * @return {Number} update duration for given event.
     */
    getEventDuration: function (eventType)
    {
        if(eventType === "Tap")
        {
            return this._tapInterval;
        }
        else if(eventType === "LongTap")
        {
            return this._longTapInterval;
        }
        else
        {
            throw new Error("Invalid event type. Only Tap or LongTap is acceptable.");
        }
    },
    /**
     * Sets time to recognize LongTapped event.
     * @param {Number} time duration to detect LongTapped. 
     */
    setRecogLongTapTime: function (time)
    {
        if(!isNaN(time) && time > 0)
        {
            this._recogLongTapTime = time;
        }
        else
        {
            throw new Error("Time must be a positive number.");
        }
    },
    /**
     * Returns recognized LongTapped time.
     * @return {Number} duration to detect LongTapped.
     */
    getRecogLongTapTime: function ()
    {
        return this._recogLongTapTime;
    },
    /**
     * Sets the distance to recognize swipe event.
     * @param {Number} distance  Distance to recognize swipe event.
     */
    setRecogMoveDistance: function (distance)
    {
        if(!isNaN(distance) && distance > 0)
        {
            this._recogDist = distance;
        }
        else
        {
            throw new Error("Distance must be positive number.");
        }
    },
    /**
     * Returns the distance to recognize swipe event.
     * @return {Number} distance to recognize swipe event.
     */
    getRecogMoveDistance: function ()
    {
        return this._recogDist;
    },
    /**
     * Enable or disable the events.
     * @param {String} eventSet event name  i.e. "Swipe" , "Tap" , "LongTap" or "Pinch"
     * @param {Boolean} flag to enable or disable provided event. i.e. true to enable and false to disable.
     */
    setEventEnabled: function (eventSet, flag)
    {
        if(typeof (flag) === "boolean")
        {
            if(typeof (eventSet) === "string" && (eventSet === "Tap" || eventSet === "LongTap" || eventSet === "Pinch" || eventSet === "Swipe"))
            {
                this.EventTypes[eventSet] = flag;
            }
            else
            {
                throw new Error("Invalid Event Type. Only Tap, LongTap, Swipe and Pinch are acceptable.");
            }
        }
        else
        {
            throw new Error("flag must be boolean value. i.e. true/flase");
        }
    },
    /**
     * Returns if given event is enabled or not.
     * @param {String} eventSet event name i.e. "Tap", "LongTap" , "Swipe" or "Pinch"
     * @return {Boolean} returns true if given event is enabled else false.
     */
    getEventEnabled: function (eventSet)
    {
        if(typeof (eventSet) === "string" && (eventSet === "Tap" || eventSet === "LongTap" || eventSet === "Pinch" || eventSet === "Swipe"))
        {
            return this.EventTypes[eventSet];
        }
        else
        {
            throw new Error("Invalid Event Type. Only Tap, LongTap, Swipe and Pinch are acceptable.");
        }
    },
    /**
     * TouchHandler creates a TouchTarget internally. If you want to create your own TouchTarget and don't want to use TouchHandler's TouchTarget then you can delegate touch events of your own TouchTarget to TouchHandler.
     * Now TouchHandler will notify all registered observers on behalf of TouchTarget created by you.
     * @example
     * this._target = new TouchTarget();
     *    this._touchHandler = new TouchHandler(0, 0, 1, { 
     *          Tap: true,
     *          LongTap: false,
     *          Swipe: false,
     *          Pinch: false
     *    });
     *    this._touchHandler.addObserver("TapStart", function (touch, touchHandler)
     *    {
     *          console.log("Tap Started on Custom TouchTarget.");
     *    });
     *    this._target.getTouchEmitter().addListener(this, this.onTouch.bind(this), 1);
     *    onTouch: function (touch)
     *    {
     *          this._touchHandler.delegate(touch);
     *    }
     * @param {Touch} touch to process the currnet touch.
     */
    delegate: function (touch)
    {
        if(touch && touch instanceof Touch)
        {
            if(this._target)
            {
                this.onTouch(touch);
            }
        }
        else
        {
            throw new Error("Only instance of GL2.Touch is accepted.");
        }
    },
    /**
     * Sets the position of TouchTarget. 
     * @param {Number} x xPosition of TouchTarget.
     * @param {Number} y yPosition of TouchTarget.
     * @example
     * touchHandler.setPosition(0,0);
     * or
     * touchHandler.setPosition(new Core.Point(0,0));
     */
    setPosition: function (x, y)
    {
        var p = new Point();
        if(arguments.length === 2)
        {
            p.setAll.apply(p, [x, y]);
        }
        else if(arguments.length === 1)
        {
            p.setAll.apply(p, [x]);
        }
        if(this._isNumber(p))
        {
            this._target.setPosition(p);
        }
        else
        {
            throw new Error("Invalid position. \nFor Example: touchHandler.setPosition(new Core.Point(100,100)); ");
        }
    },
    /**
     * Returns the position of touch target of current touch handler.
     * @return {Core.Point} position of touch target.
     */
    getPosition: function ()
    {
        return this._target.getPosition();
    },
    /**
     * Set the anchor point used to rotate and scale the TouchTarget area.
     * @param {Number} anchorX The new anchor x point for the TouchTarget area.
     * @param {Number} anchorY The new anchor y point for the TouchTarget area.
     * @example
     * touchHandler.setAnchor(0.5,0.5);
     * or
     * touchHandler.setAnchor(new Core.Vector(0.5,0.5));
     */
    setAnchor: function (anchorX, anchorY)
    {
        var p = new Point();
        if(arguments.length === 2)
        {
            p.setAll.apply(p, [anchorX, anchorY]);
        }
        else if(arguments.length === 1)
        {
            p.setAll.apply(p, [anchorX]);
        }
        if(this._isNumber(p))
        {
            this._target.setAnchor(p);
        }
        else
        {
            throw new Error("Invalid anchor. \nFor Example: touchHandler.setAnchor([0.5,0.5]); ");
        }
    },
    /**
     * Return the offset values used for scaling and rotating the TouchTarget area.
     * @return {Core.Point} anchor of touch target of current touch handler.
     */
    getAnchor: function ()
    {
        return this._target.getAnchor();
    },
    /**
     * Sets the depth of TouchTarget.
     * @param {Number} z depth of touch target.
     */
    setDepth: function (z)
    {
        if(z && !isNaN(z))
        {
            this._target.setDepth(z);
        }
        else
        {
            throw new Error("Depth must be a number.");
        }
    },
    /**
     * Returns the depth of touch target of current touch handler.
     * @return {Number} depth of touch target.
     */
    getDepth: function ()
    {
        return this._target.getDepth();
    },
    /**
     * Returns touch target of current touch handler.
     * @return {TouchTarget} touch target for current touch handler.
     */
    getTarget: function ()
    {
        return this._target;
    },
    /**
     * Destroy this instance and release resources on the backend.
     */
    destroy: function ()
    {
        if(this._target)
        {
            this._target.getTouchEmitter().removeListener(this._listener, this.onTouch.bind(this));
            this._target.destroy();
            this._target = null;
            delete this._target;
        }
        if(this._listener)
        {
            this._listener.destroy();
            this._listener = null;
            delete this._listener;
        }
        this._clearLongTapped();
        this._clearLongTapping();
        this._clearTapping();
        this.deleteObservers();
        delete this._longTapInterval;
        delete this._recogDist;
        delete this._tapInterval;
        this.EventTypes = null;
        delete this.EventTypes;
        delete this._initialTouchPosition;
        if(this._isMove)
        {
            this._isMove = null;
            delete this._isMove;
        }
        delete this._recogLongTapTime;
        if(this._touchLast)
        {
            this._touchLast = null;
            delete this._touchLast;
        }
        if(this._touchNew)
        {
            this._touchNew = null;
            delete this._touchNew;
        }
        if(this._trackingId)
        {
            this._trackingId = null;
            delete this._trackingId;
        }
        if(this._touch)
        {
            this._touch.destroy();
            this._touch = null;
            delete this._touch;
        }
        delete this._swipeCalled;
        delete this._longTappingIntervalId;
        delete this._timeOutId;
        delete this._tappingIntervalId;
    },
    /**
     * @return {Boolean} 
     * @event
     */
    onTouch: function (touch)
    {
        if(!this._target)
        {
            /** If TouchTarget is already destroyed then return false.*/
            return false;
        }
        var p = touch.getPosition();
        switch(touch.getAction())
        {
        case touch.Action.Start:
            if(this._trackingId[1] && this._trackingId[0])
            {
                return false;
            }
            else if(this._trackingId[0] || this._trackingId[1])
            {
                //2nd Finger
                if(this._trackingId[0])
                {
                    this._trackingId[1] = touch.getId();
                    this._touchLast[1] = p;
                }
                else
                {
                    this._trackingId[0] = touch.getId();
                    this._touchLast[0] = p;
                }
                this._abortSwipe(this._touch);
                this._abortTapAndLongTap(this._touch);
                if(this.EventTypes && this.EventTypes.Pinch)
                {
                    this._touch._setSecondTouchPos(p);
                    this._touch._setIsPinched(true);
                    this._touch._setCurrentTime(new Date().getTime());
                    this.notify("PinchStart", this._touch, this);
                }
            }
            else
            {
                // 1st Finger
                this._resetTouch();
                this._trackingId[0] = touch.getId();
                this._touchLast[0] = this._initialTouchPosition = p;
                this._touch._setStartPosition(p);
                this._touch._setInitialTime(new Date().getTime());
                this._isMove[0] = false;
                this._touch._setCurrentPos(p);
                this._touch._setIsMoved(false);
                this._touch._setCurrentTime(new Date().getTime());
                if(this.EventTypes && this.EventTypes.Tap)
                {
                    this._tappingIntervalId = setInterval(function ()
                    {
                        this._touch._setCurrentTime(new Date().getTime());
                        this.notify("Tapping", this._touch, this);
                    }.bind(this), this._tapInterval);
                    this.notify("TapStart", this._touch, this);
                }
                if(this.EventTypes && this.EventTypes.LongTap)
                {
                    this._touch._setLongTappedRatio(this._recogLongTapTime);
                    this._timeOutId = setTimeout(function ()
                    {
                        this._touch._setCurrentTime(new Date().getTime());
                        this._touch._setIsLongTapped(true);
                        this._touch._setLongTappedRatio(this._recogLongTapTime);
                        this._clearLongTapping();
                        this.notify("LongTapped", this._touch, this);
                    }.bind(this), this._recogLongTapTime);
                    this._longTappingIntervalId = setInterval(function ()
                    {
                        this._touch._setCurrentTime(new Date().getTime());
                        this._touch._setLongTappedRatio(this._recogLongTapTime);
                        this.notify("LongTapping", this._touch, this);
                    }.bind(this), this._longTapInterval);
                    this.notify("LongTapStart", this._touch, this);
                }
            }
            return true;
        case touch.Action.End:
            if(touch.getId() !== this._trackingId[0] && touch.getId() !== this._trackingId[1])
            {
                return false;
            }
            if(touch.getId() === this._trackingId[1])
            {
                this._touch._setCurrentPos(p);
                this._touch._setCurrentTime(new Date().getTime());
                if(this._trackingId[0])
                {
                    if(this.EventTypes && this.EventTypes.Pinch)
                    {
                        this.notify("PinchEnd", this._touch, this);
                    }
                    this._pinchDistN = null;
                    this._pinchDist = null;
                }
                else
                {
                    if(this.EventTypes && this._isMove[1] && !this._swipeAborted && this.EventTypes.Swipe)
                    {
                        this.notify("SwipeEnd", this._touch, this);
                    }
                    else
                    {
                        if(this.EventTypes && this.EventTypes.Tap && !this._tapAborted)
                        {
                            this.notify("TapEnd", this._touch, this);
                        }
                        if(this.EventTypes && this.EventTypes.LongTap && !this._longTapAborted)
                        {
                            this.notify("LongTapEnd", this._touch, this);
                        }
                    }
                }
                if(this._trackingId)
                {
                    this._trackingId[1] = null;
                    this._touchLast[1] = null;
                    this._touchNew[1] = null;
                    this._isMove[1] = null;
                    if(this._trackingId[0] === null || this._trackingId[0] === undefined)
                    {
                        this._longTapAborted = false;
                        this._tapAborted = false;
                        this._swipeAborted = false;
                    }
                }
            }
            else if(touch.getId() === this._trackingId[0])
            {
                this._touch._setCurrentTime(new Date().getTime());
                this._touch._setCurrentPos(p);
                this._clearLongTapped();
                this._clearTapping();
                this._clearLongTapping();
                if(this._trackingId[1])
                {
                    if(this.EventTypes && this.EventTypes.Pinch)
                    {
                        this.notify("PinchEnd", this._touch, this);
                    }
                    this._pinchDistN = null;
                    this._pinchDist = null;
                }
                else
                {
                    if(this.EventTypes && this.EventTypes.Swipe && this._isMove[0] && !this._swipeAborted)
                    {
                        this.notify("SwipeEnd", this._touch, this);
                    }
                    else
                    {
                        if(this.EventTypes && this.EventTypes.Tap && !this._tapAborted)
                        {
                            this.notify("TapEnd", this._touch, this);
                        }
                        if(this.EventTypes && this.EventTypes.LongTap && !this._longTapAborted)
                        {
                            this.notify("LongTapEnd", this._touch, this);
                        }
                    }
                }
                if(this._trackingId)
                {
                    this._trackingId[0] = null;
                    this._touchLast[0] = null;
                    this._touchNew[0] = null;
                    this._isMove[0] = null;
                    if(this._trackingId[1] === null || this._trackingId[1] === undefined)
                    {
                        this._longTapAborted = false;
                        this._tapAborted = false;
                        this._swipeAborted = false;
                    }
                }
            }
            this._recogChkFlg = false;
            this._swipeCalled = false;
            return true;
        case touch.Action.Move:
            if(touch.getId() === this._trackingId[0])
            {
                this._touchNew[0] = p;
            }
            else if(touch.getId() === this._trackingId[1])
            {
                this._touchNew[1] = p;
            }
            else
            {
                return false;
            }
            if(!this._touchNew[0] && !this._touchNew[1])
            {
                // Irregular move
                return false;
            }
            else if(this._touchNew[1] && this._touchNew[0])
            {
                this._touch._setCurrentTime(new Date().getTime());
                this._abortSwipe(this._touch);
                this._abortTapAndLongTap(this._touch);
                if(this.EventTypes && this.EventTypes.Pinch)
                {
                    this._pinchDistN = this._calcDist(this._touchLast[0], this._touchLast[1]);
                    this._pinchDist = this._calcDist(this._touchNew[0], this._touchNew[1]);
                    this._touch._setSecondTouchPos(this._touchLast[1]);
                    this._touch._setCurrentPos(this._touchLast[0]);
                    var pinchRatio = this._pinchDist / this._pinchDistN;
                    this._touch._setPinchRatio(pinchRatio);
                    this.notify("Pinching", this._touch, this);
                }
                // Remember last location.
                if(this._touch)
                {
                    this._touch._setPreviousPosition(this._touchLast[0]);
                    this._touch._setSecondTouchPreviousPosition(this._touchLast[1]);
                    this._touchLast[0] = this._touchNew[0];
                    this._touchLast[1] = this._touchNew[1];
                    this._pinchDistN = null;
                    this._pinchDist = null;
                }
            }
            else if(this._touchNew[1] || this._touchNew[0])
            {
                this._touch._setCurrentPos(p);
                this._touch._setCurrentTime(new Date().getTime());
                // One Finger moved
                var lastP, newP;
                if(this._touchNew[0])
                {
                    lastP = this._touchLast[0];
                    newP = this._touchNew[0];
                }
                else if(this._touchNew[1])
                {
                    lastP = this._touchLast[1];
                    newP = this._touchNew[1];
                }
                this._touch._setPreviousPosition(lastP);
                var dist = this._calcDist(lastP, newP);
                if(!this._recogChkFlg)
                {
                    if(dist < this._recogDist)
                    {
                        return false;
                    }
                    else
                    {
                        this._recogChkFlg = true;
                    }
                }
                this._abortTapAndLongTap(this._touch);
                if(this.EventTypes && this.EventTypes.Swipe && !this._swipeAborted)
                {
                    this._touch._setIsMoved(true);
                    var theta = this._calcAngle(this._initialTouchPosition, newP);
                    if(theta <= 45)
                    {
                        if((newP.getX() - this._initialTouchPosition.getX()) < -this._recogDist)
                        {
                            this._touch._setSwipeDirection(TouchHandler.SwipeDirection.Left);
                        }
                        else if((newP.getX() - this._initialTouchPosition.getX()) > this._recogDist)
                        {
                            this._touch._setSwipeDirection(TouchHandler.SwipeDirection.Right);
                        }
                    }
                    else
                    {
                        if((newP.getY() - this._initialTouchPosition.getY()) < -this._recogDist)
                        {
                            this._touch._setSwipeDirection(TouchHandler.SwipeDirection.Up);
                        }
                        else if((newP.getY() - this._initialTouchPosition.getY()) > this._recogDist)
                        {
                            this._touch._setSwipeDirection(TouchHandler.SwipeDirection.Down);
                        }
                    }
                    if(!this._swipeCalled)
                    {
                        this._swipeCalled = true;
                        this.notify("SwipeStart", this._touch, this);
                    }
                    else
                    {
                        this.notify("SwipeMoving", this._touch, this);
                    }
                }
                if(this._touchNew && this._touchNew[0])
                {
                    this._isMove[0] = true;
                    this._touchLast[0] = this._touchNew[0];
                }
                else if(this._touchNew && this._touchNew[1])
                {
                    this._isMove[1] = true;
                    this._touchLast[1] = this._touchNew[1];
                }
            }
            return true;
        }
    },
    /**
     * Calculate the distance between to points.
     * @param {Core.Vector | Core.Point} p1 first point.
     * @param {Core.Vector | Core.Point} p2 second point
     * @return {Number} distance between two points.
     */
    _calcDist: function (p1, p2)
    {
        var distX = p1.getX() - p2.getX();
        var distY = p1.getY() - p2.getY();
        var dist = distX * distX + distY * distY;
        return Math.sqrt(dist);
    },
    /**
     * Calculate angle of line made by two end points passed as arguments.
     * @param {Core.Vector | Core.Point} p1 first point for line.
     * @param {Core.Vector | Core.Point} p2 second point for line.
     * @return {Number} angle of line.
     */
    _calcAngle: function (p1, p2)
    {
        var dx = Math.abs(p1.getX() - p2.getX());
        var dy = Math.abs(p1.getY() - p2.getY());
        return Math.atan(dy / dx) * 57.2;
    },
    /**
     * private method.
     */
    _isValidEventTypes: function (eventTypes)
    {
        var isValid = false;
        if(eventTypes)
        {
            if(!eventTypes.Tap || typeof (eventTypes.Tap) === "boolean")
            {
                isValid = true;
                if(!eventTypes.LongTap || typeof (eventTypes.LongTap) === "boolean")
                {
                    isValid = true;
                    if(!eventTypes.Swipe || typeof (eventTypes.Swipe) === "boolean")
                    {
                        isValid = true;
                        if(!eventTypes.Pinch || typeof (eventTypes.Pinch) === "boolean")
                        {
                            isValid = true;
                        }
                        else
                        {
                            isValid = false;
                        }
                    }
                    else
                    {
                        isValid = false;
                    }
                }
                else
                {
                    isValid = false;
                }
            }
        }
        else
        {
            isValid = false;
        }
        return isValid;
    },
    /**
     * private method.
     */
    _clearLongTapped: function ()
    {
        if(this._timeOutId)
        {
            clearTimeout(this._timeOutId);
        }
    },
    /**
     * private method.
     */
    _clearLongTapping: function ()
    {
        if(this._longTappingIntervalId)
        {
            clearInterval(this._longTappingIntervalId);
        }
    },
    /**
     * private method.
     */
    _clearTapping: function ()
    {
        if(this._tappingIntervalId)
        {
            clearInterval(this._tappingIntervalId);
        }
    },
    /**
     * private method.
     */
    _abortTapAndLongTap: function (touch)
    {
        if(this.EventTypes.Tap && !this._tapAborted)
        {
            this.notify("TapAbort", touch, this);
            this._tapAborted = true;
            this._clearTapping();
        }
        if(this.EventTypes.LongTap && !this._longTapAborted)
        {
            this.notify("LongTapAbort", touch, this);
            this._longTapAborted = true;
            this._clearLongTapping();
            this._clearLongTapped();
        }
    },
    /**
     * private method.
     */
    _abortSwipe: function (touch)
    {
        if((this._isMove[0] || this._isMove[1]) && this.EventTypes.Swipe && !this._swipeAborted)
        {
            this.notify("SwipeAbort", touch, this);
            this._swipeAborted = true;
        }
    },
    /**
     * private method.
     */
    _resetTouch: function ()
    {
        if(this._touch)
        {
            this._touch.destroy();
        }
        this._touch = null;
        this._touch = new AdvanceTouch();
    },
    /**
     * Checks if input Point  has valid number or not. 
     * @private
     * */
    _isNumber: function (input)
    {
        if(typeof (input.getX()) === "number" && typeof (input.getY()) === "number")
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    /**
     * private method.
     */
    _assignEventTypes: function (events)
    {
        if(events)
        {
            if(events.Tap !== undefined)
            {
                this.EventTypes.Tap = events.Tap;
            }
            if(events.LongTap !== undefined)
            {
                this.EventTypes.LongTap = events.LongTap;
            }
            if(events.Swipe !== undefined)
            {
                this.EventTypes.Swipe = events.Swipe;
            }
            if(events.Pinch !== undefined)
            {
                this.EventTypes.Pinch = events.Pinch;
            }
        }
    }
}, [Observable]);
exports.TouchHandler = TouchHandler;