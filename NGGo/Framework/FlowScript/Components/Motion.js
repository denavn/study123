////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison 
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var UUID = require('../Component').UUID;
var MotionController = require('../../../Framework/MotionController').MotionController;

var MotionObject = Class.subclass(
{
    classname : "MotionObject",

    setCallbackObj : function(cb)
    {
        this.callbackObj = cb;
    },

    onMotionStateChange : function(controller)
    {
        if(controller.getState() === MotionController.state.COMPLETED && this.callbackObj)
        {
            this.callbackObj.onMotionStateComplete(this);
            console.log("Output");
        }
    }
});

////////////////////////////////////////////////////////////////////////////////
// Class MotionFactory
exports.MotionFactory = Component.subclass(
/** @lends Framework.FlowScript.MotionFactory.prototype */
{
    classname : "MotionFactory",
   
    outPorts : {
        MOTION : 0,
        ERROR : 1
    },

    _onReceive : function(port, ip)
    {
        var motionObj = new MotionObject();

        var motions = [ { src : ip.active, name : this._iip.required.name } ];
        var motion = new MotionController(motions, motionObj);
        
        motionObj.xMotion = motion;
        motionObj.xDef = motions;

        ip.active = motionObj;
        ip.motion = motionObj;

        this.send(this.outPorts.MOTION, ip);
    }
}); // end of class MotionFactory

exports.MotionFactory.factoryUUID = UUID.MOTION_FACTORY;

////////////////////////////////////////////////////////////////////////////////
// Class MotionPlayer
exports.MotionPlayer = Component.subclass(
/** @lends Framework.FlowScript.MotionPlayer.prototype */
{
    classname : "MotionPlayer",

    inPorts : {
        PLAY : 0,
        STOP : 1
    },

    outPorts : {
        OUT : 0,
        ON_MOTION_COMPLETE : 1,
        ERROR : 2
    },
    
    _onReceive : function(port, ip)
    {
        switch(port)
        {
            case this.inPorts.PLAY:
                ip.active.setCallbackObj(this);
                ip.active.xMotion.play(true);
                this.send(this.outPorts.OUT, ip);
                break;
            
            case this.inPorts.STOP:
                // Stop is not working at the moment
                this.send(this.outPorts.OUT, ip);
                break;

            default:
                this.send(this.outPorts.ERROR, ip);
                break;
        }
    },


    onMotionStateComplete : function(motion)
    {
        var ip = {};
        ip.active = motion;
        this.send(this.outPorts.ON_MOTION_COMPLETE, ip);
    }

}); // end of class MotionPlayer

exports.MotionPlayer.factoryUUID = UUID.MOTION_PLAYER;
