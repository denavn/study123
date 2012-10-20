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

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.Filter = Component.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "Filter",
    
    outPorts :
    {
        FILTER_YES : 0,
        FILTER_NO : 1
    },

    _onReceive : function(port, ip)
    {
        // Need to add check to make sure we actually have
        // the value defined
        if( this._iip && 
            this._iip.required && 
            ip[this._iip.required.value])
        {
            this.send(this.outPorts.FILTER_YES, ip);
        }
        else
        {
            this.send(this.outPorts.FILTER_NO, ip);
        }
    }

}); // end of class Component

exports.Filter.factoryUUID = UUID.FILTER;
