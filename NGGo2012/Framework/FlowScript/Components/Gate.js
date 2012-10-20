////////////////////////////////////////////////////////////////////////////////
/**
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
var Class = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var UUID = require('../Component').UUID;

////////////////////////////////////////////////////////////////////////////////
// Class FlowFactory
exports.Gate = Component.subclass(
/** @lends Framework.FlowScript.Gate.prototype */
{
    classname : "Gate",
    
    inPorts : {
        IN : 0,
        ACTIVE_IN : 1
    },
    
    outPorts : {
        OUT : 0
    },

    _onPreOpen : function()
    {
        this._messageCount = 0;
    },

    _onReceive : function(port, ip)
    {
        if(this.inPorts.ACTIVE_IN == port)
        {
            this.head = ip.active;
        }

        ++this._messageCount;
        if(this._messageCount == this._iip.required.count)
        {
            if(this.head)
            {
                ip.active = this.head;
                delete this.head;
            }

            this.messageCount = 0;
            this.send(this.outPorts.OUT, ip);
        }
    }

}); // end of class Gate

exports.Gate.factoryUUID = UUID.GATE;

