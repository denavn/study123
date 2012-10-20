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
var ScreenManager = require('../../../Service/Display/ScreenManager').ScreenManager;

////////////////////////////////////////////////////////////////////////////////
// Class BlackBoard
exports.ScreenManagerComponent = Component.subclass(
/** @lends Framework.FlowScript.ScreenManagerComponent.prototype */
{
    classname : "ScreenManagerComponent",

    inPorts : 
    {
        ON_SET_LANDSCAPE : 0,
        ON_SET_PORTRAIT : 1
    },

    outPorts :
    {
        OUT : 0,
        ERROR : 1
    },
    
    _onReceive : function(port, ip)
    {
        var self = this;
        switch(port)
        {
            case this.inPorts.ON_SET_LANDSCAPE:
                ScreenManager.setLandscape(function(){
                    self.send(self.outPorts.OUT, ip);
                });
                break;
            case this.inPorts.ON_SET_PORTRAIT:
                ScreenManager.setPortrait(function(){
                    self.send(self.outPorts.OUT, ip);
                });
                break;
            default:
                this.send(this.outPorts.ERROR, ip);
                break;
        }
    }
}); // end of class ScreenManagerComponent

exports.ScreenManagerComponent.factoryUUID = UUID.SCREEN_MANAGER_COMPONENT;
