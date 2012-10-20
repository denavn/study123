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
// Class BlackBoard
exports.ExitScript = Component.subclass(
/** @lends Framework.FlowScript.ExitScript.prototype */
{
    classname : "ExitScript",
    
    _onReceive : function(port, ip)
    {
        this._network.close();
    }
}); // end of class BlackBoard

exports.ExitScript.factoryUUID = UUID.EXIT_SCRIPT;
