////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Core               = require('../../../NGCore/Client/Core').Core;
var GL2                = require('../../../NGCore/Client/GL2').GL2;
var OrientationEmitter = require('../../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
var Vector2            = require('../../Foundation/Math/Vector2').Vector2;
var Ops                = require('../../Foundation/Math/Ops').Ops;
var SceneManager       = require('./SceneManager').SceneManager;
var ScreenManager      = require('./ScreenManager').ScreenManager;
var CameraManager      = require('./CameraManager').CameraManager;

////////////////////////////////////////////////////////////////////////////////
// Globals Block
var _gCameraTransNodeName = "_CAMERA_TRANS_ROOT";
var _gCameraScaleNodeName = "_CAMERA_SCALE_ROOT";

////////////////////////////////////////////////////////////////////////////////
// Class Camera
exports.Camera = Core.MessageListener.subclass(
/** @lends Service.Display.Camera.prototype */
{
    classname: "Camera",

    /**
     * @class The <code>Camera</code> object is a basic implementation of the common features that most expect when playing a touchscreen based 2D game.
     * <br><br>
     * Many game use the same standard camera with a few tuning values tweaked.
     * This camera support the following basic features
     * <br><br>
     * <ul>
     * <li>- Drag to move the camera</li>
     * <li>- Pinch to Zoom</li>
     * <li>- Momentum based motion of camera movement</li>
     * <li>- double tap to zoom in or out</li>
     * <li>- Camera stays inside a given bounds</li>
     * </ul>
     * This class works with following classes:
     * <br></br>
     * <ul>
     * <li>This class interposes the scene graph of {@link Serivce.Display.SceneManager}. Camera scrolls over child nodes.</li>
     * <li>Camera settings is stored by {@link Service.Display.CameraManager}.</li>
     * </ul>
     * Both parameters of them are sets by constructor parameter.
     * <br><br>
     * How to connect with this object and <code>GL2.TouchTarget</code> is described at {@link #onTouch}.
     * @constructs The default constructor.
     * @name Service.Display.Camera
     * @augments GL2.Node
     */
    initialize : function(sceneKey, tunableKey, screenKey)
    {
        // Prepare the Scene Graph nodes
        this._scaleRoot = new GL2.Node();
        this._scaleRoot.setScale(1.0, 1.0);
        this._scaleRoot.setPosition(0, 0);
        this._transRoot = new GL2.Node();

        sceneKey = sceneKey || "GL2_ROOT";
        SceneManager.insertNodeForKey(  sceneKey,
                                        this._transRoot,
                                        _gCameraTransNodeName);
        SceneManager.insertNodeForKey(  _gCameraTransNodeName,
                                        this._scaleRoot,
                                        _gCameraScaleNodeName);

        this._tunablesKey =  tunableKey || "__generic";
        this._tunables = CameraManager.getTunableValuesForKey(this._tunablesKey);

        CameraManager.addObserver(this);

        // Setup Camera State Objects
        this._isChanged = false;

        // SingleTouch dragging
        this._delta = new Vector2(0, 0);

        // Momentum
        this._velocity = new Vector2(0, 0);

        // DoubleTap Zooming
        this._desiredZoom = 3.0; // $HOOK UP TO TUNABLES!!!
        this._desiredZoomAnchor = undefined;
        this._desiredZoomPosition = undefined;
        this._startingZoom = 0;
        this._startingZoomTime = 0;

        this._moveToLocation = 0;
        this._startingMoveTime = -1;
        this._moveEndCallBack = undefined;

        this._zoomToLocation = 0;
        this._startingMoveTime = -1;
        this._moveEndCallBack = undefined;

        // MultiTouch Zooming
        this._multiTouchCenter = undefined;
        this._multiTouchRadius = 0;

        // Touch Tracking Vars
        this._touches = [];
        this._touchDelay = 0;
        this._lastTouchTime = 0;
        this._lastTouchLocation = new Vector2(-10000, -10000);

        Core.UpdateEmitter.addListener(this, this._onUpdate);

        this._hardBoundsUL = new Vector2(0, 0);
        this._hardBoundsLR = new Vector2(this._getScreenWidth(), this._getScreenHeight());
        
        // Expose to tunables
        this._softBoundsUL = this._hardBoundsUL.clone();
        this._softBoundsLR = this._hardBoundsLR.clone();
                
        this._rbU = false;
        this._rbL = false;
        this._rbR = false;
        this._rbD = false;
        
        if(this._tunables.camera_starting_zoom !== undefined && this._tunables.camera_starting_zoom !== null)
        {
            this.setScale(this._tunables.camera_starting_zoom);
        }
        
        // Set the defaults if they don't exist. We should probably rectify this by first setting generic followed by setting our custom.
        if(this._tunables.camera_soft_velocity_friction === undefined || this._tunables.camera_soft_velocity_friction === null)
        {
            this._tunables.camera_soft_velocity_friction = CameraManager.getTunableValuesForKey("__generic").camera_soft_velocity_friction;
        }
        
        if(this._tunables.camera_soft_velocity_rebound_friction === undefined || this._tunables.camera_soft_velocity_rebound_friction === null)
        {
            this._tunables.camera_soft_velocity_rebound_friction = CameraManager.getTunableValuesForKey("__generic").camera_soft_velocity_rebound_friction;
        }

        this._screenKey = screenKey || undefined;
    },

    /**
     * Loads and updates latest tunable values from {@link Service.Display.CameraManager}.
     */
    onCameraTunablesUpdated : function(src)
    {
        this._tunables = CameraManager.getTunableValuesForKey(this._tunablesKey);
    },

    /**
     * Sets the hard bind point.
     * <br><br>
     * The camera can never move past a hard bound point.
     * @param {Foundation.Math.Vector2} upperLeft Upper left position.
     * @param {Foundation.Math.Vector2} lowerRight Lower right position.
     */
    setHardBounds : function(upperLeft, lowerRight)
    {
        this._hardBoundsUL = upperLeft;
        this._hardBoundsLR = lowerRight;
    },

    /**
     * Sets the soft bind point.
     * <br><br>
     * The player can move the camera past a softBind point but when they lift their finger the camera will
     * move back to the softBindPoint value.
     * @param {Foundation.Math.Vector2} upperLeft Upper left position.
     * @param {Foundation.Math.Vector2} lowerRight Lower right position.
     */
    setSoftBounds : function(upperLeft, lowerRight)
    {
        this._softBoundsUL = upperLeft;
        this._softBoundsLR = lowerRight;
    },

    /**
     * Gets scale value of camera.
     * @returns {Number} Scale value.
     */
    getScale : function()
    {
        return this._scaleRoot.getScale().getX();
    },

    /**
     * Sets scale value of camera.
     * @param {Number} scale Scale value.
     */
    setScale : function(scale)
    {
        this._scaleRoot.setScale(scale, scale);
        // reset the position to make sure we did not over zoom
        this.setPosition(this.getX(), this.getY());
    },

    /**
     * Returns the value of the <i>x</i> component of this camera's position.
     * @returns The current <i>x</i> coordinate.
     */
    getX : function()
    {
        return this._transRoot.getPosition().getX();
    },

    /**
     * Returns the value of the <i>y</i> component of this camera's position.
     * @returns The current <i>y</i> coordinate.
     */
    getY : function()
    {
        return this._transRoot.getPosition().getY();
    },

    /** @private */
    moveToFocus : function(pos, time, zoom, ease, offset)
    {
        // Move to a given camera location
    },

    /**
     * Sets position of camera.
     * @param {Number} posX <i>x</i> component of new position.
     * @param {Number} posY <i>y</i> component of new position.
     */
    setPosition : function(posX, posY)
    {
        if(this.getX() !== posX || this.getY() !== posY)
        {
            this.mIsChanged=true;
        }

        // Cap the motion to the upper left bounds
        if(posX > this._hardBoundsUL.getX())
        {
            posX = this._hardBoundsUL.getX();
        }

        if(posY > this._hardBoundsUL.getY())
        {
            posY = this._hardBoundsUL.getY();
        }

        this._transRoot.setPosition(posX, posY);

        var screenLR = this.convertGlobalToLocal({ x : this._getScreenWidth(), y : this._getScreenHeight()});
        var screenUL = this.convertGlobalToLocal({ x : 0, y : 0});

        if(screenLR.x > this._hardBoundsLR.x)
        {
            posX = -(screenUL.x - (screenLR.x - this._hardBoundsLR.x));
        }

        if(screenLR.y > this._hardBoundsLR.y)
        {
            posY = -(screenUL.y - (screenLR.y - this._hardBoundsLR.y));
        }

        this._transRoot.setPosition(posX, posY);
    },

    /**
     * This method processes touch event and calculate the zoom and position of Camera.
     *
     * To enable scroll, you have to connect <code>Camera.onTouch()</code> method with <code>GL2.TouchTarget</code>.
     * There are 2 options:<br><br>
     * <b><i>Game uses multiple touch targets under camera:</i></b><br><br>
     * At first create whole screen touch target, then register <code>onTouch()</code>
     * after game's onTouch() (case 1).<br><br>
     * <pre class="code">
     * var UserGameHandler = Core.MessageEmitter.subclass({
     *      initialize: function(rootNode, screenHeight, screenWidth) {
     *          this._camera = new Service.Display.Camera("Field", "fieldCamera");
     *          this._target = new GL2.TouchTarget();
     *          this._target.setSize(screenHeight, screenWidth);
     *          this._target.setAnchor(0, 0);
     *          this._target.getTouchEmitter().addListener(this, this.onTouch);
     *          this._target.getTouchEmitter().addListener(this._camera, this._camera.onTouch);
     *          rootNode.addChild(this._target);
     *      },
     *      onTouch: function(touch) {
     *          // game logic here
     *      }
     * });
     * </pre>
     * <b><i>Game uses only one touch target under camera:</i></b><br><br>
     * If only one touch target is used, call camera's <code>onTouch</code> method from user's <code>onTouch</code> method.
     * <pre class="code">
     * var UserGameHandler = Core.MessageEmitter.subclass({
     *      initialize: function(rootNode, screenHeight, screenWidth) {
     *          this._camera = new Service.Display.Camera("Field", "fieldCamera");
     *          this._target = new GL2.TouchTarget();
     *          this._target.setSize(screenHeight, screenWidth);
     *          this._target.setAnchor(0, 0);
     *          this._target.getTouchEmitter().addListener(this, this.onTouch);
     *          this._cameraEnable = false;
     *          rootNode.addChild(this._target);
     *      },
     *      onTouch: function(touch) {
     *          if (this._cameraEnable) {
     *              return this._camera.onTouch(touch);
     *          }
     *          // game logic here
     *      }
     * });
     * </pre>
     * @param {GL2.Touch} touch Touch object it is passed to touch listener.
     * @returns {Boolean} Accept touch event or not.
     */
    onTouch : function(touch)
    {
        var here = new Vector2( touch.getPosition().getX(),
                                touch.getPosition().getY());
        var now = Core.Time.getFrameTime();
        var count = this._getTouchCount();

        // This camera imple is only designed to handle at most 2 touches.
        // in the future we may support more touches.
        switch(touch.getAction())
        {
            case touch.Action.Start:
                return this._onHandleTouchStart(here, now, count, touch);

            case touch.Action.End:
                this._onHandleTouchEnd(here, now, count, touch);
                break;

            case touch.Action.Move:
                this._onHandleTouchMove(here, now, count, touch);
                break;

            default:
                break;

        }
        return undefined;
    },

    /**
     * Sets camera settings with Object. See parameter description to know detail settings:
     * @param {Number} tunable.camera_starting_zoom Initial zoom scale.
     * @param {Number} tunable.camera_zoom_in Maximum zoom scale.
     * @param {Number} tunable.camera_zoom_out Minimum zoom scale.
     * @param {Number} tunable.camera_double_tap_dist Sensitivity of checking double tap(distance).
     * @param {Number} tunable.camera_double_tap_time Sensitivity of checking double tap(milli seccond).
     * @param {Number} tunable.camera_zoom_time Zoom duration time when double tap.
     * @param {Number} tunable.camera_velocity_friction It is a friction for velocity.
     * @param {Number} tunable.camera_delta_friction It is a friction for single touch dragging.
     * @param {Number} tunable.camera_snap_decay When the camera is moved around there will be a velocity assigned to it
     * based on how fast the user is moving their finger. When they lift their finger off the screen the camera will
     * slow to a halt. Decay will dictate that speed.<br>
     * <code>0</code>: the camera will keep moving until it hits a bind point<br>
     * <code>1</code>: the camera will stop when the finger is lifted<br>
     * <code>0.8</code>: the camera will decay its velocity by 80% each frame until it stops.
     * @param {Number} tunable.camera_max_velocity Max velocity of camera.
     * @param {Number} tunable.camera_friction Friction for camera.
     */
    setTunables : function(tunable)
    {
        this._tunables = tunable;
    },

    /**
     * Converts a game level position into a root level position into.
     * <br><br>
     * For example, this method can be used for clipping.
     * @param {Foundation.Math.Vector2} pos Location to convert.
     * @return {Foundation.Math.Vector2} Position in the root level space.
     */
    convertLocalToGlobal : function(pos)
    {
        ////////////////// First do the transRoot
        var x =  pos.x;
        var y =  pos.y;

        // Undo scale.
        var s = this._transRoot.getScale();
        x *= s.getX();
        y *= s.getY();

        // Undo rotation.
        var r = -this._transRoot.getRotation() * Math.PI / 180;
        var cosr = Math.cos(r);
        var sinr = Math.sin(r);
        var tx = cosr*x + sinr*y;
        var ty = -sinr*x + cosr*y;
        x = tx;
        y = ty;

        // Undo translation.
        var p = this._transRoot.getPosition();
        x += p.getX();
        y += p.getY();

        ////////////////// Next do the scaleRoot
        // Undo scale.
        s = this._scaleRoot.getScale();
        x *= s.getX();
        y *= s.getY();

        // Undo rotation.
        r = -this._scaleRoot.getRotation() * Math.PI / 180;
        cosr = Math.cos(r);
        sinr = Math.sin(r);
        tx = cosr*x + sinr*y;
        ty = -sinr*x + cosr*y;
        x = tx;
        y = ty;

        // Undoe translation.
        p = this._scaleRoot.getPosition();
        x += p.getX();
        y += p.getY();

        return new Vector2(x, y);
    },

    /**
     * Converts a root level position into a game level position.
     * <br><br>
     * For example this method can be used for converting touch position to game world position.
     * @param {Foundation.Math.Vector2} pos Location to convert.
     * @returns {Foundation.Math.Vector2} Position in the local game space.
     */
    convertGlobalToLocal : function(pos)
    {
        var x = pos.x;
        var y = pos.y;

        ////////////////// First do the scaleRoot

        // Undo translation.
        var p = this._scaleRoot.getPosition();
        x -= p.getX();
        y -= p.getY();

        // Undo rotation.
        var r = this._scaleRoot.getRotation() * Math.PI / 180;
        var cosr = Math.cos(r);
        var sinr = Math.sin(r);
        var tx = cosr*x + sinr*y;
        var ty = -sinr*x + cosr*y;
        x = tx;
        y = ty;

        // Undoe scale.
        var s = this._scaleRoot.getScale();
        x /= s.getX();
        y /= s.getY();


        ////////////////// Next do the transRoot

        // Undo translation.
        p = this._transRoot.getPosition();
        x -= p.getX();
        y -= p.getY();

        // Undo rotation.
        r = this._transRoot.getRotation() * Math.PI / 180;
        cosr = Math.cos(r);
        sinr = Math.sin(r);
        tx = cosr*x + sinr*y;
        ty = -sinr*x + cosr*y;
        x = tx;
        y = ty;

        // Undoe scale.
        s = this._transRoot.getScale();
        x /= s.getX();
        y /= s.getY();

        return new Vector2(x, y);
    },

    /**
     * Returns string representation of <code>Camera</code> object.
     * @returns {String}
     */
    toString : function()
    {
        return "Service.Camera State Data \n" +
                "Position : " + this.getX() + " , " + this.getY();
    },

    /** @private */
    _onHandlePinchToZoomUpdate : function()
    {
        var touchCount = this._getTouchCount();
        if(touchCount === 2)
        
        {
            var t = [];
            var idx = 0;
            var key;
            for (key in this._touches)
            {
                if(this._touches.hasOwnProperty(key))
                {
                    t[idx] = this.convertGlobalToLocal(this._touches[key].lastLocation);
                    ++idx;
                }
            }

            // Calculate how var to zoom the camera based on how much the user has moved thier fingers
            var curRad = t[0].distance(t[1]) * 0.5;
            var curZoom = curRad / this._multiTouchRadius;
            var theZoom = curZoom * this.getScale();
            theZoom = Ops.clamp(theZoom, this._tunables.camera_zoom_out, this._tunables.camera_zoom_in);

            this.setScale(theZoom);

            // Calculate how much to translate the camera
            var curCenter = t[0].parametricEval(t[1], 0.5);
            var curScreenCenter = this.convertLocalToGlobal(curCenter);
            var startScreenCenter = this.convertLocalToGlobal(this._multiTouchCenter);
            curScreenCenter.sub(startScreenCenter);

            // Set the delta values
            this._delta.add(curScreenCenter);
        }
    },

    /** @private */
    _onUpdate : function(deltaTime)
    {
        // Handle pinch zoom
        if (this._multiTouchRadius > 0)
        {
            this._onHandlePinchToZoomUpdate();
        }
        else if(this._startingZoomTime > 0)
        {
            var zoomElapsed = (Core.Time.getFrameTime() - this._startingZoomTime) / (this._tunables.camera_zoom_time * 1000);
            var currentZoom = (this._desiredZoom - this._startingZoom) * zoomElapsed + this._startingZoom;
            if (zoomElapsed > 1.0 || (currentZoom < this._tunables.camera_zoom_out || currentZoom > this._tunables.camera_zoom_in))
            {
                // Finished with the zoom operation, stop the camera completely
                zoomElapsed = 1.0;
                this._startingZoomTime = -1;
                this._velocity.initialize(0,0);
            }
            else
            {
                // Zoom the camera
                
                this.setScale(currentZoom);

                // Anchor the zoom point to the screen where the user touched.
                this._desiredZoomAnchor.x -= this._delta.x / currentZoom;
                this._desiredZoomAnchor.y -= this._delta.y / currentZoom;

                var anchor = this._desiredZoomAnchor;
                var screenAnchor = new Vector2(
                        (anchor.x + this.getX()) * currentZoom,
                        (anchor.y + this.getY()) * currentZoom);
                
                this._delta.x += (this._desiredZoomPosition.x - screenAnchor.x);
                this._delta.y += (this._desiredZoomPosition.y - screenAnchor.y);
            }
        }
        
        // Decay of velocity
        this._velocity.scale(this._tunables.camera_velocity_friction);
        
        var tmpDelta = this._delta.clone();
        tmpDelta.scale(this._tunables.camera_delta_friction);
        this._velocity.add(tmpDelta);

        var pos = new Vector2(this.getX(), this.getY());
        var del;
        
        if(this._delta.x !== 0 || this._delta.y !== 0)
        {
            del = new Vector2(this._delta.x, this._delta.y);
            del.scale(1.0/this.getScale());

            pos.add(del);
            this.setPosition(pos.x, pos.y);
            this._delta = new Vector2(0, 0);
        }
        else if (this._getTouchCount() === 0) // Accumulate some momentum
        {
            // Current velocity
            var vSq = this._velocity.lengthSquared;
            
            // Maximum velocity
            var maxVelSq =  this._tunables.camera_max_velocity *
                            this._tunables.camera_max_velocity;
            
            if(vSq > maxVelSq) // Cap to max velocity
            {
                var mag = this._tunables.camera_max_velocity / this._velocity.length;
                this._velocity.scale(mag);
            }
            else if (vSq < 1) // If under 1, kill movement.
            {
                this._velocity.initialize(0, 0);
                vSq = 0;
            }
            
            
            if (vSq > 0)
            {   
                del = new Vector2();
                
                // Prepare to scale velocity
                var scaledVelocity = this._velocity.clone();
                var scale = 1.0 / this.getScale();
                scaledVelocity.scale(scale);
                
                // Set positional difference vector
                del.add(scaledVelocity);
                
                // Set new position using positional difference vector
                pos.add(del);
                this.setPosition(pos.x, pos.y);
                
                // Decay velocity using the set camera friction
                this._velocity.scale(this._tunables.camera_friction);
            }
            
            var localPos = this.convertGlobalToLocal(pos);
            var localSize = this.convertGlobalToLocal({ x : this._getScreenWidth(), y : this._getScreenHeight()});
            
            // Hault rebounding if conditions met
            if (this._rbL === true)
            {   
                this._rbL = false;
                if (localPos.x >= this._softBoundsUL.x)
                {
                    this._velocity.x = 0;
                }
            }
            else if(this._rbR === true)
            {
                this._rbR = false;
                if (localSize.x <= this._softBoundsLR.x)
                {
                    this._velocity.x = 0;
                }
            }
            
            if (this._rbU === true)
            {
                this._rbU = false;
                if (localPos.y >= this._softBoundsUL.y)
                {
                    this._velocity.y = 0;
                }
            }
            else if(this._rbD === true)
            {
                this._rbD = false;
                if (localSize.y <= this._softBoundsLR.y)
                {
                    this._velocity.y = 0;
                }
            }
            
            // Set up rebounding if conditions met
            if(localPos.x < this._softBoundsUL.x)
            {
                this._rbL = true;
                this._reboundUL("x");
            }
            else if(localSize.x > this._softBoundsLR.x)
            {
                this._rbR = true;
                this._reboundLR("x");
            }

            if(localPos.y < this._softBoundsUL.y)
            {
                this._rbU = true;
                this._reboundUL("y");
            }
            else if(localSize.y > this._softBoundsLR.y)
            {
                this._rbD = true;
                this._reboundLR("y");
            }
            
        }
    },
    
    /** @private */
    _reboundUL : function(coord)
    {
        if(this._velocity[coord] === 0)
        {
            this._velocity[coord] = -1;
        }
        
        if (this._velocity[coord] > 0)
        {
            this._velocity[coord] *= this._tunables.camera_soft_velocity_friction;
            if (this._velocity[coord] < 1)
            {
                this._velocity[coord] *= -1;
            }
        }
        else
        {
            this._velocity[coord] *= this._tunables.camera_soft_velocity_rebound_friction;
        }
    },
    
    /** @private */
    _reboundLR : function(coord)
    {
        if(this._velocity[coord] === 0)
        {
            this._velocity[coord] = 1;
        }
        
        if (this._velocity[coord] < 0)
        {
            this._velocity[coord] *= this._tunables.camera_soft_velocity_friction;
            if (this._velocity[coord] > -1)
            {
                this._velocity[coord] *= -1;
            }
        }
        else
        {
            this._velocity[coord] *= this._tunables.camera_soft_velocity_rebound_friction;
        }
    },
    
    /** @private */
    _getTouchCount : function()
    {
        var count = 0;
        var key;
        for(key in this._touches)
        {
            if (this._touches.hasOwnProperty(key))
            {
                ++count;
            }
        }
        return count;
    },

    /** @private */
    _onHandleTouchStart : function(here, now, count, touch)
    {
        var touchResults = false;
        if(count < 2)
        {
            if (count === 0)
            {
                // stop camera movement
                this._velocity.initialize(0, 0);
            }
        
            this._touches["k" + touch.getId()] =
            {
                startLocation : here,
                startTime : now,
                lastLocation : here,
                lastTime : now
            };
            // Check if we are in a pinch state
            if(count === 1)
            {
                var t = [];
                var idx = 0;
                var key;
                for(key in this._touches)
                {
                    if(this._touches.hasOwnProperty(key))
                    {
                        t[idx] = this.convertGlobalToLocal(this._touches[key].lastLocation);
                        ++idx;
                    }
                }

                this._multiTouchRadius = t[0].distance(t[1]) * 0.5;
                this._multiTouchCenter = t[0].parametricEval(t[1], 0.5);
            }

            touchResults = true;
        }
        this._touchDelay = 2; // $TODO SHOULD THIS BE A TUNABLE?
        return touchResults;
    },

    /** @private */
    _onHandleTouchMove : function(here, now, count, touch)
    {
        --this._touchDelay;
        var lastTouch = this._touches["k" + touch.getId()];
        if(lastTouch)
        {
            var delta = here.clone();
            delta.sub(lastTouch.lastLocation);
            // ignore zero moves
            if(delta.lengthSquared === 0)
            {
                return;
            }

            // Accumulate moved touch
            if (count === 1)
            {
                this._delta.add(delta);
            }

            lastTouch.lastLocation = here;
            lastTouch.lastTime = now;
        }
        else
        {
            console.log("<NGGO CAMERA>: ERROR move touch without a start?");
        }
    },

    /** @private */
    _zoomCamera : function(scale, location, anchor)
    {
        if (!location)
        {
            location = new Vector2(this._getScreenWidth() * 0.5, this._getScreenHeight() * 0.5);
        }
        this._desiredZoomPosition = location;

        var nCurrentSclale = this.getScale();

        if (!anchor)
        {
            anchor = new Vector2((location.x) / nCurrentSclale - this.getX(),
                    (location.y) / nCurrentSclale - this.getY());
        }

        this._desiredZoomAnchor = anchor;
        this._desiredZoom = Ops.clamp(scale, this._tunables.camera_zoom_out, this._tunables.camera_zoom_in);

        this._startingZoom = nCurrentSclale;
        this._startingZoomTime = Core.Time.getFrameTime();
    },

    /** @private */
    _onHandleTouchEnd : function(here, now, count, touch)
    {
        var start = this._touches["k" + touch.getId()];
        delete this._touches["k" + touch.getId()];

        var lastTouchUp = this._lastTouchTime;
        this._lastTouchTime = 0;

        // If we're coming down off of a 2-touch, stop tracking pinchzoom.
        if (count === 2)
        {
            this._multiTouchRadius = 0;
            this._multiTouchCenter = new Vector2(0, 0);
        }

        // If not a solo touch, kill the tap and break;
        if (count > 1)
        {
            return;
        }

        // Single touch events
        if (start)
        {
            var deltaTime = now - start.startTime;
            var deltaLocation = here.distanceSquared(start.startLocation);
            if( deltaTime < this._tunables.camera_double_tap_time &&
                deltaLocation < this._tunables.camera_double_tap_dist * this._tunables.camera_double_tap_dist)
            {
                if (now - lastTouchUp < this._tunables.camera_double_tap_time &&
                    here.distanceSquared(this._lastTouchLocation) < this._tunables.camera_double_tap_dist * this._tunables.camera_double_tap_dist)
                {
                    // double tap
                    var currentZoomProgress = (this._desiredZoom - this._tunables.camera_zoom_in) /
                                                (this._tunables.camera_zoom_out - this._tunables.camera_zoom_in);
                    var newZoom = this._tunables.camera_zoom_out;
                    if (currentZoomProgress > 0.5)
                    {
                        newZoom = this._tunables.camera_zoom_in;
                        this._zoomCamera(newZoom, here);
                    }
                    else
                    {
                        this._zoomCamera(newZoom, here);
                    }

                    this._lastTouchTime = 0;
                }
                else
                {
                    // tap
                    this._lastTouchTime = now;
                    this._lastTouchLocation = here;
                }
            }
        }
    },

    /** @private */
    _getScreenWidth: function() {
        if(this._screenKey && ScreenManager.settings[this._screenKey]) {
            return ScreenManager.settings[this._screenKey].logicalSize[0];
        } else {
            switch (OrientationEmitter.getInterfaceOrientation()) {
            case OrientationEmitter.Orientation.LandscapeLeft:
            case OrientationEmitter.Orientation.LandscapeRight:
                return Core.Capabilities.getScreenHeight();
            default:
                return Core.Capabilities.getScreenWidth();
            }
        }
    },

    /** @private */
    _getScreenHeight: function() {
        if(this._screenKey && ScreenManager.settings[this._screenKey]) {
            return ScreenManager.settings[this._screenKey].logicalSize[1];
        } else {
            switch (OrientationEmitter.getInterfaceOrientation()) {
            case OrientationEmitter.Orientation.LandscapeLeft:
            case OrientationEmitter.Orientation.LandscapeRight:
                return Core.Capabilities.getScreenWidth();
            default:
                return Core.Capabilities.getScreenHeight();
            }
        }
    }
});

