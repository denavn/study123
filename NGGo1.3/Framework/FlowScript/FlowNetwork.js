////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison 
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../Foundation/Class').Class;

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.FlowNetwork = Class.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "FlowNetwork",

    initialize : function()
    {
        this._components = {};
        this._networkOpen = false;
    },

    registerCloseCallback : function(callback)
    {
        this._callbackClose = callback;
    },

    registerOpenCallback : function(callback)
    {
        this._callbackOpen = callback;
    },

    open : function()
    {
        var component;
        this._openComponents = 0;
        this._networkOpen = true;
        for(component in this._components)
        {
            this._components[component].preOpen();
        }

        for(component in this._components)
        {
            this._components[component].open();
        }
        
        for(component in this._components)
        {
            this._components[component].postOpen();
            ++this._openComponents;
        }

        if(this._callbackOpen)
        {
            this._callbackOpen();
        }
    },

    close : function()
    {
        var component;
        for(component in this._components)
        {
            this._components[component].close();
        }
    },

    onComponentClosed : function(component)
    {
        --this._openComponents;
        if(0 === this._openComponents)
        {
            // We could add an observer here.  Could be cool....
            this._networkOpen = false;
            if(this._callbackClose)
            {
                this._callbackClose();
            }
        }
    }

}); // end of class Component
