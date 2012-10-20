////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison 
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../Foundation/Class').Class;

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.Component = Class.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "Component",
    
    /**
     * Constructor
     **/
    initialize : function(iip, network)
    {
        this._iip = iip;
        this._network = network;
        this._isOpen = false;
        this._outPorts = {};
    },

    bind : function(outPort, component, inPort)
    {
        if(undefined === this._outPorts[outPort])
        {
            this._outPorts[outPort] = [];
        }
        var message = {};
        message.port = inPort;
        message.receiver = component;

        this._outPorts[outPort].push(message); 
    },

    send : function(port, ip)
    {
        var receivers = this._outPorts[port];
        if(receivers)
        {
            var len = receivers.length || 0;
            if(len == 1)
            {
                receivers[0].receiver._onReceive(receivers[0].port, ip);
            }
            else
            {
                for(var idx = 0; idx < len; ++idx)
                {
                    var ipCopy = {};
                    // Lets make a shallow copy of the IP.
                    // WARNING.  You many not be happy with this behavior. And may want a deep copy
                    // you can do one of two things.  1) Subclass the Component and then use it as a base class
                    // for your components. 2) Create a new component that will take in an IP and do a deep copy
                    // and split it off
                    for(var property in ip)
                    {
                        ipCopy[property] = ip[property];
                    }
                    receivers[idx].receiver._onReceive(receivers[idx].port, ipCopy);
                }
            }
        }
    },

    preOpen : function()
    {
        this._onPreOpen();
    },

    /**
     * Open
     */
    open : function()
    {
        this._isOpen = true;
        this._onOpen();
    },
    
    postOpen : function()
    {
        this._onPostOpen();
    },

    /**
     * Close
     */
    close : function()
    {
        if(this._network)
        {
            var self = this;
            this._onClose(function()
            {
                self._isOpen = false;
                self._network.onComponentClosed(self);
            });
        }
    },
    
    // Must override
    _onPreOpen : function() {},
    _onOpen : function() {},
    _onPostOpen : function() {},
    _onClose : function(callback) {callback();},
    _onReceive : function(port, ip) {}


}); // end of class Component

exports.UUID = 
{
    COMPONENT_BASE : 0,

    COMPOSITE : 1,
    FILTER : 2,
    LOG : 3,
    MOTION_FACTORY : 4,
    SELECTOR : 5,
    SIMULATOR : 6,
    SPRITE_FACTORY : 7,
    CAMERA : 8,
    BLACKBOARD : 9,
    MOTION_PLAYER : 10,
    SOUND_EFFECT : 11,
    SONG_PLAYER : 12,
    FLOW_FACTORY : 13,
    GATE : 14,
    XHR : 15,
    SPRITE_ANIMATION : 16,
    ON_SCRIPT_START : 17,
    EXIT_SCRIPT : 18,
    SCREEN_MANAGER_COMPONENT : 19,
    PHYSICS_FACTORY : 20,

    NGGO_RESERVED_UUID_RANGE : 1000
};
//PHYSICS_FACTORY : 20,

exports.Component.factoryUUID = 0;
