////////////////////////////////////////////////////////////////////////////////
/**
 *  @data:      2011-07-24 
 *  @file:      Game.js
 *  @author:    Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:     
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class       = require('../../../Foundation/Class').Class;
var Component   = require('../Component').Component;
var UUID        = require('../Component').UUID;
var Storage     = require('../../../../NGCore/Client/Storage').Storage;

////////////////////////////////////////////////////////////////////////////////
// Class FlowFactory
exports.FlowFactory = Component.subclass(
/** @lends Framework.FlowScript.FlowFactory.prototype */
{
    classname : "FlowFactory",
   
    inPorts :
    {
        OPEN_NETWORK : 0
    },

    outPorts :
    {
        ON_NETWORK_CLOSED : 1,
        ON_ERROR : 2
    },

    _onReceive : function(port, ip)
    {
        var script = this._iip.required.script;
        var self = this;
        // We only have one port for now so no switch
        if((script === "" || !script) && (typeof ip.active) === "string")
        {
            script = ip.active;
        }
        
        if(FlowScriptManager.hasKey(script))
        {
            ip.active = createFlowNetwork(script);
            ip.networkFlow = ip.active;
            ip.active.registerCloseCallback(function()
            {
                self.send(this.outPorts.ON_NETWORK_CLOSED, {});             
            });
            ip.active.Open();
        }
        else
        {
            Storage.FileSystem.readFile(script, false, function(err, data)
            {
                if(err)
                {
                    ip.error = "<Flow Factory> Could not load file";
                    self.send(this.outPorts.ON_ERROR, ip);
                }
                else
                {
                    try
                    {
                        var networkDef = JSON.parse(data);
                        FlowScriptManager.registerFlowNetwork(script, networkDef);
                        ip.active = createFlowNetwork(script);
                        ip.networkFlow = ip.active;
                        ip.active.RegisterCloseListener(function()
                        {
                            self.send(this.outPorts.ON_NETWORK_CLOSED, {});             
                        });
                        ip.active.Open();
                    }
                    catch(ex)
                    {
                        ip.error = "<Flow Factory> Could not parse Script file";
                        self.send(this.outPorts.ON_ERROR, ip);
                    }
                }
            });
        }
    }

}); // end of class FlowFactory

exports.FlowFactory.factoryUUID = UUID.FLOW_FACTORY;


