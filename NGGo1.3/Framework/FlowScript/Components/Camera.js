////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison 
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var UUID = require('../Component').UUID;
var PreferenceManager = require('../../../Service/Data/PreferenceManager').PreferenceManager;
var AssetManager = require('../../../Service/Data/AssetManager').AssetManager;

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.Camera = Component.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "Selector",
   
    inPorts : 
    {
        ASSIGN_TOUCH_GENERATOR : 0
    },
    
    outPorts : 
    {
        PASS : 0
    },

    _onOpen : function()
    {
        var nodeName = PreferenceManager.get('camera_node');
        var cameraType = PreferenceManager.get('camera_type');
        this._Camera = new Camera(nodeName, cameraType);
    },

    _onReceive : function(port, ip)
    {
        switch(port)
        {
        case this.inPorts.ASSIGN_TOUCH_GENERATOR:
            if(ip && ip.sprite)
            {
                ip.sprite.setTouchCallback(this._Camera.onTouch);
            }
            break;
        default:
            break;
        }

        this.send(this.outPorts.PASS, ip);
    }

}); // end of class Component

exports.Camera.factoryUUID = UUID.CAMERA;
