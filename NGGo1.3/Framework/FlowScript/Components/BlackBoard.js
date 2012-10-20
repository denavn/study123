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
// Globals
var _globalBlackBoard = {};

////////////////////////////////////////////////////////////////////////////////
// Class BlackBoard
exports.BlackBoard = Component.subclass(
/** @lends Framework.FlowScript.BlackBoard.prototype */
{
    classname : "BlackBoard",

    inPorts : 
    {
        STORE : 0,
        FETCH : 1,
        ERASE : 2,
        ERASE_ALL : 3,
        PRINT :4
    },

    outPorts :
    {
        OUT : 0,
        ERROR : 1
    },
    
    _onReceive : function(port, ip)
    {
        switch(port)
        {
            case this.inPorts.STORE:
                _globalBlackBoard[this._iip.required.write_property] = ip.active;
                this.send(this.outPorts.OUT, ip);
                break;
            case this.inPorts.FETCH:
                ip.active = _globalBlackBoard[this._iip.required.read_property];
                this.send(this.outPorts.OUT, ip);
                break;
            case this.inPorts.ERASE:
                ip.errors = ip.errors || "";
                ip.errors += "<ngGo BlackBoard> Erase not yet implemented";
                this.send(this.outPorts.ERROR, ip);
                break;
            case this.inPorts.ERASE_ALL:
                _globalBlackBoard = {};
                this.send(this.outPorts.OUT, ip);
                break;
            default:
                this.send(this.outPorts.ERROR, ip);
                break;
        }
    }
}); // end of class BlackBoard

exports.BlackBoard.factoryUUID = UUID.BLACKBOARD;
