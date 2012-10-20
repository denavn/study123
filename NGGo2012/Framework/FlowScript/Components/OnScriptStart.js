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
// Class BlackBoard
exports.OnScriptStart = Component.subclass(
/** @lends Framework.FlowScript.OnScriptStart.prototype */
{
    classname : "OnScriptStart",

    outPorts :
    {
        OUT : 0,
        ERROR : 1
    },
    
    _onPostOpen : function() 
    {
        var ip = {};
        ip.log = "<OnScriptStart> : IP Created on Post Open\n";
        this.send(this.outPorts.OUT, ip);    
    }
}); // end of class OnScriptStart

exports.OnScriptStart.factoryUUID = UUID.ON_SCRIPT_START;
