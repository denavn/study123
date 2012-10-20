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

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.Log = Component.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "Log",

    _onReceive : function(port, ip)
    {
        // Need to add check to make sure we actually have
        // the value defined
        if(ip.log)
        {
            console.log(ip.log);
        }

        this.send(0, ip);
    }

}); // end of class Component

exports.Log.factoryUUID = UUID.LOG;
