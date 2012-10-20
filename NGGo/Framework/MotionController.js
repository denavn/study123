////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Core = require('../../NGCore/Client/Core').Core;
var AnimationManager = require('./AnimationManager').AnimationManager;
var Vector2 = require('../Foundation/Math/Vector2').Vector2;
var Ops = require('../Foundation/Math/Ops').Ops;
var GL2 = require('../../NGCore/Client/GL2').GL2;

exports.MotionController = Core.MessageListener.subclass(
/** @lends Framework.MotionController.prototype */
{
    /**
     * @namespace state It is a enumaration of state of <code>MotionController</code> object.
	 */
    state :
	{
		/** */
		INIT : 0,
		/** */
		PLAYING : 1,
		/** */
		HALTED : 2,
		/** */
		PAUSED : 3,
		/** */
		COMPLETED : 4,
		/** */
		ERROR : 5
	},
    
    animationStyle : 
    {
        /** */
        NORMAL : 0,
        /** */ 
        INTERPOLATED : 1,
        /** */
        INTER_FRAME_INTERPOLATED : 2
    },
    
    /**
     * @class The <code>MotionController</code> is a object that actually executes the motion tween animation.
	 * @example
	 * var Dancer = Core.MessageListener.subclass(
	 * {
	 *     initialize: function()
	 *     {
	 *         this.sprite = new GL2.Sprite();
	 *         this.motion = new MotionController(sprite, PreferenceManger.get("motion"), this);
	 *         GL2.Root.addChild(this.sprite);
	 *         this.motion.play(true);
	 *     },
	 *     onMotionStateChange: function(controller)
	 *     {
	 *         if(controller.getState() == MotionController.state.COMPLETED)
	 *         {
	 *             this.motion.play(true);
	 *         }
	 *     }
	 * });
     *
	 * @constructs Constructor for the object.
     * @param {Object} sourceObj Object the source object play the animation on.
     * @param {String} motionName Name of the motion to play.
	 * @param {Object} observer If the state is changed, <code>onMotionStateChange()</code> method of this object is called.
	 * @name Framework.MotionController
	 * @augments Core.MessageListener
     *
     * @constructs Constructor for the the object
     * @param {Array} sourceArray Array of objects defined as { src : {gl2.node}, name : {string} }
     * @param {Object} observer Object that will get the callbacks for the system
	 * @name Framework.MotionController
	 * @augments Core.MessageListener
     */
    initialize : function()
    {
        var state = this.state.INIT;
        var motion;
		var motionIdx;
        var isSkewAnimationError;
        
        if (Object.prototype.toString.apply(arguments[0]) === '[object Array]')
        {   
            this.mMotionData = arguments[0];
            this.mObserver = arguments[1];
        }
        else
        {   
            // If not an array, let's create one from the information we took in
            this.mMotionData = [{ src : arguments[0], name : arguments[1] }];
            this.mObserver = arguments[2]; 
        }
        
        for(motionIdx = 0; motionIdx < this.mMotionData.length; ++motionIdx)
        {
            isSkewAnimationError = false;
            
            motion = AnimationManager.getMotionData(this.mMotionData[motionIdx].name);
            this.mMotionData[motionIdx].motion = motion;
            
            
            // Is the motion valid?
            if(motion)
            {
                this.style = this.animationStyle.INTERPOLATED;
                this.mMotionData[motionIdx].animationStyle = this.animationStyle.INTERPOLATED;
                this.mMotionData[motionIdx].timeBetweenFrames =
                    (1.0 / (1.0 * motion.source[0].frameRate)) * 1000;

                if(undefined === this.frameRate)
                {
                    this.frameRate =   (1.0 / (1.0 * motion.source[0].frameRate)) * 1000;
                }
                else if(this.frameRate != (1.0 / (1.0 * motion.source[0].frameRate)) * 1000)
                {
                    console.log("********** SHIT. you have variable framerates");
                }
                
                // Test for errors on animations that contain skew.
                // In order for skew to work correctly, the source obj must be of type primitive.
                if (this.getIsSkewAnimation(motion))
                {
                    if (this.mMotionData[motionIdx].src.classname === 'Body')
                    {
                        if (this.mMotionData[motionIdx].src.getGL2Node().classname !== 'Primitive')
                        {
                            isSkewAnimationError = true;
                        }
                    }
                    else
                    {
                        if (this.mMotionData[motionIdx].src.classname !== 'Primitive')
                        {
                            isSkewAnimationError = true;
                        }
                    }   
                }
                
                // If error exists, print out message and name of object
                if (isSkewAnimationError)
                {
                    console.log("Motion : " + this.mMotionData[motionIdx].name + " sourceObj is not a primitive. Skew operation will fail.");
                }
            }
            else
            {
                state = this.state.ERROR;
            }
        }
        
        this._setState(state);
    },
    
    /**
     * Returns animation style.
     * @param {Framework.MotionController.animationStyle} animationStyle The animationStyle to set.
     */
    setAnimationStyle : function(animationStyle)
    {
        this.style = animationStyle;
    },
    
    /**
     * Returns animation style.
     * @param {int} motionIdx The specific motion that is being tested.
     * @returns {Framework.MotionController.animationStyle} value
     */
    getAnimationStyle : function()
    {
        return this.style;
    },
    
    /**
     * Returns animation status.
     * @returns {Framework.MotionController.state} value
     */
    getState : function()
    {
        return this.mState;
    },
    
    /**
     * Returns boolean value depicting if the animation has skew changes
     * @param {obj} motion The specific motion that is being tested.
     * @returns bool value
     */
    getIsSkewAnimation : function(motion)
    {
        if (motion.Metadata !== undefined && 
            motion.Metadata[0]['isSkewAnimation'] !== undefined && 
            motion.Metadata[0]['isSkewAnimation'] === true)
        {
            return true;
        }

        return false;
    },
     
    /**
     * @param {int} keyFrame The keyFrame value of the callback that should be added.
     * @param {obj} obj The object that contains the callback function.
     * @param {int} motionIdx The motionIdx of the keyFrame value. Default value is 0.
     */
    addKeyFrameCallback: function(keyFrame, obj, motionIdx)
    {   
        if (motionIdx === undefined)
        {
            motionIdx = 0;
        }
        
        var callbackObj = {keyFrame: keyFrame, obj: obj};
        var motion = this.mMotionData[motionIdx];
        
        if (motion === undefined)
        {
            console.log("mMotionData object for index, " + motionIdx + ", does not exist.");
        }
        else
        {
            if (motion.callbacks === undefined)
                motion.callbacks = [];
        
            motion.callbacks.push(callbackObj);
        }
    },
    
    /**
     * @param {int} keyFrame The keyFrame value of the callback that should be removed.
     * @param {int} motionIdx The motionIdx of the keyFrame value. Default value is 0.
     */
    removeKeyFrameCallback: function(keyFrame, motionIdx)
    {
        if (motionIdx === undefined)
        {
            motionIdx = 0;
        }
            
        var obj = this.mMotionData[motionIdx];
        var callbackIdx;
        
        if (obj === undefined)
        {
            console.log("mMotionData object for index, " + motionIdx + ", does not exist.");
        }
        else
        {
            for (callbackIdx = 0; callbackIdx < obj.callbacks.length; ++callbackIdx)
            {
                if (obj.callbacks[callbackIdx].keyFrame === keyFrame)
                {
                    obj.callbacks.splice(callbackIdx, 1);
                    break;
                }
            }
        }
    },
     
    /**
     * Starts the Motion.  If the motion is already playing then it will do nothing.
     *
     * @param {Boolean} relative If this is true then the motions will be defaults as delta
     *                           movements.  If this is false then the motion will be defined as absolute position
     *                           updates
     */
    play : function(relative)
    {
        if( this.mState === this.state.INIT ||
            this.mState === this.state.HALTED ||
            this.mState ===  this.state.COMPLETED)
        {
            this._hop = false;
            var len = this.mMotionData.length;
			var idx;
            this.currentFrame = 0;

            for(idx = 0; idx < len; ++idx)
            {
                var obj = this.mMotionData[idx];
                if(relative)
                {
                    obj.startData = {};
                    var pos = obj.src.getPosition();
                    obj.startData.x = pos.getX();
                    obj.startData.y = pos.getY();
                }
                else
                {
                    obj.startData = {};
                    obj.startData.x = obj.motion.source[0].x;
                    obj.startData.y = obj.motion.source[0].y;
                }

                obj.startData.rotation = obj.motion.source[0].rotation || 0;
                obj.startData.scaleX = obj.motion.source[0].scaleX || 1;
                obj.startData.scaleY = obj.motion.source[0].scaleY || 1;
                
                // Skew data
                obj.startData.skewX = obj.motion.source[0].skewX || 0;
                obj.startData.skewY = obj.motion.source[0].skewY || 0;
                
                // Figure out if our node is a primitive
                var primitive = null;
                obj.startData.verts = null;
                
                if (obj.src.classname === 'Body')
                {
                    if (obj.src.getGL2Node().classname === 'Primitive')
                    {
                        primitive = obj.src.getGL2Node();
                    }
                }
                else
                {
                    if (obj.src.classname === 'Primitive')
                    {
                        primitive = obj.src;
                    }
                }
            
                // Store primitive vert data if possible
                if (primitive !== null)
                {
                    obj.startData.verts = new Array();
                    for(var i = 0; i < primitive.getVertexCount(); ++i)
                    {
                        obj.startData.verts.push(primitive.getVertex(i));
                    }
                }
            
                obj.startData.alpha = 1.0;

                obj.frameStart = {};
                obj.frameStart.x = obj.startData.x;
                obj.frameStart.y = obj.startData.y;

                
                // Start from the first keyFrame
                obj.keyFrame = 0;
                
                // Start from the first frame
                obj.currentFrame = 0;
                
                // Fire callback if possible
                if (obj.callbacks !== undefined)
                {
                    this._keyFrameCallback(obj.keyFrame, obj);
                }
            
                obj.state = this.state.PLAYING;
            }
            
            // Add this guy as an upate emitter
            Core.UpdateEmitter.addListener(this, this._OnUpdate);

            this._setState(this.state.PLAYING);
            this.mStartTime = Core.Time.getFrameTime();
        }
        else if(this.mState === this.state.PAUSED)
        {
            // Silly Rabbit .. you should have called resume, not play
            this.resume();
        }
    },

    /**
	 * Stops the playback of the motion.  If the motion is not playing the nothing will happen.
     */
    stop : function()
    {
        if(this.mState === this.state.PLAYING)
        {
            Core.UpdateEmitter.removeListener(this);
            this._setState(this.state.HALTED);
        }
    }, 
    
    /** @private */
    _keyFrameCallback: function(keyFrameIdx, obj)
    {
        var callbacksIdx;
        var callbackObj;
        var keyFrame;
        
        for (callbacksIdx = 0; callbacksIdx < obj.callbacks.length; ++callbacksIdx)
        {
            callbackObj = obj.callbacks[callbacksIdx];
            if (keyFrameIdx === callbackObj.keyFrame)
            {
                callbackObj.obj.onKeyFrameCallback(keyFrameIdx, obj.name);
            }
        }
    },
    
	/** @private */
    _setState : function(stateValue)
    {
        this.mState = stateValue;
        if(this.mObserver && this.mObserver.onMotionStateChange)
        {
            this.mObserver.onMotionStateChange(this);
        }
    },
    
    /** @private */
    _setSkew : function(motion, primitive, skewX, skewY)
    {
        var vertexIdx;
        for (vertexIdx = 0; vertexIdx < primitive.getVertexCount(); ++vertexIdx)
        {
			var vertex = primitive.getVertex(vertexIdx);
            var uv = vertex.getUV();
            
            var vertPosX = motion.startData.verts[vertexIdx].getPosition().getX();
            var vertPosY = motion.startData.verts[vertexIdx].getPosition().getY();
            
            var convertToRad = (Math.PI*2/360);
            var skewAngleX = skewX * convertToRad;
            var skewAngleY = skewY * convertToRad;
            
            var newVertPos = this._applyRotationRadians(vertPosX, vertPosY, skewAngleX, skewAngleY);

            var skewedVertex = new GL2.Primitive.Vertex([newVertPos.x, newVertPos.y],[uv.getX(),uv.getY()]);
            primitive.setVertex(vertexIdx, skewedVertex);
        }    
    },
    
    /** @private */
    _applyRotationRadians : function (posX, posY, angleX, angleY)
    {
        var sinX = Math.sin(angleX);
        var sinY = Math.sin(angleY);
        var cosX = Math.cos(angleX);
        var cosY = Math.cos(angleY);
        //
        var max00 = (cosX*cosY) + (sinX*-sinY);
        var max01 = (cosX*sinY) + (sinX*cosY);
        var max10 = (-sinX*cosY) + (cosX*-sinY);
        var max11 = (-sinX*sinY) + (cosX*cosY);
        
        var returnPos = {};
        returnPos.x = (posX*max00) - (posY*max01);
        returnPos.y = (posX*max10) + (posY*max11);

        return returnPos;
    },

    _doMotion : function(obj, frame, timeBetweenFrames)
    {
        var curKeyFrame = obj.motion.Keyframe[obj.keyFrame];
        var nextKeyFrame = obj.motion.Keyframe[obj.keyFrame + 1];
            
        var startX = curKeyFrame.x || 0.0;
        var startY = curKeyFrame.y || 0.0;
        var startFrame = curKeyFrame.index;

        var endX = nextKeyFrame.x || 0.0;
        var endY = nextKeyFrame.y || 0.0;
        var endFrame = nextKeyFrame.index;

        var time = (frame - startFrame) * timeBetweenFrames;
        var duration = (endFrame - startFrame) * timeBetweenFrames;
        var newX = 0;
        var newY = 0;

        var t = ((1.0 * frame) - startFrame) / (1.0 * (endFrame - startFrame));
            
        // Handle the motion delta
        if( curKeyFrame.ease < 0)
        {
            newX = Ops.easeInExpo(time, startX, endX - startX, duration);
            newY = Ops.easeInExpo(time, startY, endY - startY, duration);

            obj.src.setPosition(newX, newY);
        }
        else if(curKeyFrame.ease > 0)
        {
            newX = Ops.easeOutExpo(time, startX, endX - startX, duration);
            newY = Ops.easeOutExpo(time, startY, endY - startY, duration);

            obj.src.setPosition(newX, newY);
        }
        else
        { 
            // Stright linear interpolate
            var startVec = new Vector2(startX, startY);
            var endVec = new Vector2(endX, endY);
            var result = startVec.parametricEval(endVec, t);
            
            obj.pos_x = obj.startData.x + result.x;
            obj.pos_y = obj.startData.y + result.y;
        }
        
        // Now do the same for the rotation data
        var rotStart = curKeyFrame.rotation || 0;
        var rotEnd = nextKeyFrame.rotation || 0;
        var rot = rotStart - rotStart * t + rotEnd * t;
        obj.rot = rot + obj.startData.rotation;

        // Gather information for scaling blends
        var scaleStartX = curKeyFrame.scaleX || 1;
        var scaleEndX = nextKeyFrame.scaleX || 1;

        var scaleStartY = curKeyFrame.scaleY || 1;
        var scaleEndY = nextKeyFrame.scaleY || 1;

        var scaleX = obj.startData.scaleX * (scaleStartX - scaleStartX * t + scaleEndX * t);
        var scaleY = obj.startData.scaleY * (scaleStartY - scaleStartY * t + scaleEndY * t);
        
        // Gather information for alpha blends
        var alphaStart = curKeyFrame.alpha;
        if(undefined === alphaStart){ alphaStart = 1.0; }
        var alphaEnd = nextKeyFrame.alpha;
        if(undefined === alphaEnd){ alphaEnd = 1.0; }
        var alpha = alphaStart - alphaStart * t + alphaEnd * t;
        
        // Gather information for skew blends
        var skewStartX = curKeyFrame.skewX || 0;
        var skewEndX = nextKeyFrame.skewX || 0;

        var skewStartY = curKeyFrame.skewY || 0;
        var skewEndY = nextKeyFrame.skewY || 0;

        var skewX =  (skewStartX - skewStartX * t + skewEndX * t);
        var skewY =  (skewStartY - skewStartY * t + skewEndY * t);
        
        // Use gathered information, try to limit the number of if else cases inside of this loop
        if (obj.src.classname === 'Body')
        {
            obj.scale_x = scaleX;
            obj.scale_y = scaleY;
            obj.alpha = alpha;
            
            if (obj.src.getGL2Node().classname === 'Primitive')
            {
                obj.skewX = skewX;
                obj.skewY = skewY;
            }
        }
        else
        {
            obj.scale_x = scaleX;
            obj.scale_y = scaleY;
            obj.alpha = alpha;

            if (obj.src.classname === 'Primitive')
            {
                obj.skewX = skewX;
                obj.skewY = skewY;
            }
        }
    },
   
    _SetToLastFrame : function(obj)
    {
        var kf = obj.motion.Keyframe[obj.keyFrame];
        // Set any last keyframe position data
        var endOfAnimX = kf.x || 0.0;
        var endOfAnimY = kf.y || 0.0;
        obj.pos_x = obj.startData.x + endOfAnimX;
        obj.pos_y = obj.startData.y + endOfAnimY;

        var rotAnimEnd = kf.rotation || 0;
        obj.rot = rotAnimEnd + obj.startData.rotation;

        // Gather information for scaling blends
        var scaleAnimEndX = kf.scaleX || 1.0;
        var scaleAnimEndY = kf.scaleY || 1.0;
    
        // Gather inforamtion for skew blends
        var skewAnimEndX = kf.skewX || 0;
        var skewAnimEndY = kf.skewY || 0;


        // Gather information for alpha blends
        var frameAlpha = kf.alpha;
        if( frameAlpha === undefined) { frameAlpha = 1.0; }

        // Use gathered information, try to limit the number of if else cases inside the loop
        if (obj.src.classname === 'Body')
        {
            obj.scale_x = obj.startData.scaleX * scaleAnimEndX;
            obj.scale_y = obj.startData.scaleY * scaleAnimEndY;
            obj.alpha = frameAlpha;

            if (obj.src.getGL2Node().classname === 'Primitive')
            {
                obj.skewX = obj.startData.skewX * skewAnimEndX;
                obj.skewY = obj.startData.skewY * skewAnimEndY;
            }
        }
        else
        {
            obj.scale_x = obj.startData.scaleX * scaleAnimEndX;
            obj.scale_y = obj.startData.scaleY * scaleAnimEndY;
            obj.alpha = frameAlpha;

            if (obj.src.classname === 'Primitive')
            {
                obj.skewX = obj.startData.skewX * skewAnimEndX;
                obj.skewY = obj.startData.skewY * skewAnimEndY;
            }
        }
        obj.state = this.state.COMPLETED;
    },

    _OnUpdateFrame : function()
    {
        var len = this.mMotionData.length;
        var shouldExit = true;
        var idx;
            
        for(idx = 0; idx < len; ++idx)
        {
            var obj = this.mMotionData[idx];
            var keyFrameLen = obj.motion.Keyframe.length;
            if(obj.state === this.state.PLAYING)
            {
                shouldExit = false;

                // We Still have some frames to go
                if(obj.keyFrame < (keyFrameLen-1))
                {
                    if(this.currentFrame < obj.motion.Keyframe[obj.keyFrame + 1].index)
                    {
                        this._doMotion(obj, this.currentFrame, this.frameRate);
                    }
                    else
                    {
                        while(obj.keyFrame < (keyFrameLen - 1) && 
                              this.currentFrame > obj.motion.Keyframe[obj.keyFrame].index)
                        {
                            obj.keyFrame++;

                            // Fire callback if possible
                            if (obj.callbacks !== undefined)
                            {
                                this._keyFrameCallback(obj.keyFrame, obj);
                            }
                        }
                        if(obj.keyFrame < (keyFrameLen-1))
                        {
                            this._doMotion(obj, this.currentFrame, this.frameRate);
                        }
                        else
                        {
                            this._SetToLastFrame(obj);
                        }
                    }
                }
                else
                {
                    this._SetToLastFrame(obj);
                }
            }
        }
        if(shouldExit)
        {
            Core.UpdateEmitter.removeListener(this);
            this._setState(this.state.COMPLETED);
        }
    },

	/** @private */
    _OnUpdate : function()
    {
        if(this.mState === this.state.PLAYING)
        {
            var frameSkip = Math.floor((Core.Time.getFrameTime() - this.mStartTime) / this.frameRate ) - this.currentFrame;

            if(this.style === this.animationStyle.NORMAL && frameSkip > 0)
            {
                frameSkip = 1;
            }

            var idx = 0;
            if(0 === frameSkip &&
                this.style === this.animationStyle.INTER_FRAME_INTERPOLATED)
            {
                this._OnUpdateFrame();
            }

            for(idx = 0; idx < frameSkip && this.mState === this.state.PLAYING ; ++idx)
            {
                ++this.currentFrame;
                this._OnUpdateFrame();
            }

            var len = this.mMotionData.length;
            for(idx = 0; idx < len; ++idx)
            {
                var obj = this.mMotionData[idx];
                var pos = obj.src.getPosition();
                if(obj.pos_x !== undefined && obj.pos_y !== undefined &&
                   (obj.pos_x != pos.getX() || obj.pos_y != pos.getY()))
                {
                    obj.src.setPosition(obj.pos_x, obj.pos_y);
                }

                if(obj.rot !== undefined &&
                   obj.src.getRotation() != obj.rot)
                {
                    obj.src.setRotation(obj.rot);
                }

                if (obj.src.classname === 'Body')
                {
                    if(obj.scale_x !== undefined && obj.scale_y !== undefined &&
                        (obj.src.getGL2Node().getScale().getX() != obj.scale_x ||
                         obj.src.getGL2Node().getScale().getY() != obj.scale_y ))
                    {
                        obj.src.getGL2Node().setScale(obj.scale_x, obj.scale_y );
                    } 

                    if(obj.alpha !== undefined && 
                        obj.alpha != obj.src.getGL2Node().getAlpha())
                    {
                        obj.src.getGL2Node().setAlpha(obj.alpha);
                    }

                    if (obj.src.getGL2Node().classname === 'Primitive' && 
                        obj.skewX !== undefined && obj.skewY !== undefined )
                    {
                        this._setSkew(obj, obj.src.getGL2Node(), obj.skewX, obj.skewY);
                        obj.skewX = undefined;
                        obj.skewY = undefined;
                    }
                }
                else
                {
                    if(obj.scale_x !== undefined && obj.scale_y !== undefined &&
                        (obj.src.getScale().getX() != obj.scale_x ||
                         obj.src.getScale().getY() != obj.scale_y ))
                    {
                        obj.src.setScale(obj.scale_x, obj.scale_y );
                    } 
                    
                    if(obj.alpha !== undefined && 
                        obj.alpha != obj.src.getAlpha())
                    {
                        obj.src.setAlpha(obj.alpha);
                    }

                    if (obj.src.classname === 'Primitive' && 
                        obj.skewX !== undefined && obj.skewY !== undefined )
                    {
                        this._setSkew(obj, obj.src, obj.skewX, obj.skewY);
                        obj.skewX = undefined;
                        obj.skewY = undefined;
                    }
                }
            }
        }
    }
}); // end of class MotionController
