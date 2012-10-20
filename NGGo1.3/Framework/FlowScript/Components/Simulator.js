////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison 
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class     = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var Core      = require('../../../../NGCore/Client/Core').Core;
var UUID      = require('../Component').UUID;

var _SimulatorUpdate = Core.MessageListener.subclass(
{
    initialize : function(listener)
    {
        this._listener = listener;
        Core.UpdateEmitter.addListener(this, this._OnUpdate);
    },

    _OnUpdate : function(delta)
    {
        this._listener._OnUpdate(delta);
    }
});

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.Simulator = Component.subclass(
/** @lends Framework.FlowScript.Components.Simulator.prototype */
{
    classname : "Simulator",

    outPorts :
    {
        SIMULATOR_TICK : 0,
        SIMULATOR_FIRST_TICK : 1
    },

    _onPostOpen : function()
    {
        this._updater = new _SimulatorUpdate(this);
        this._firstTick = true;
    },

    _OnUpdate : function(delta)
    {
        var ip = {};
        ip.delta = delta;
        if(this._firstTick)
        {
            ip.log = "First Tick of NGGo Simulator Module\n";
            this.send(this.outPorts.SIMULATOR_FIRST_TICK, ip);
            this._firstTick = false;
        }
        ip.log = "Created by NGGo Simulator Module\n";
        this.send(this.outPorts.SIMULATOR_TICK, ip);
    }
}); // end of class Component
exports.Simulator.factoryUUID = UUID.SIMULATOR;
