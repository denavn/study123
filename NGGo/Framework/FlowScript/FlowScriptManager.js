////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Storage     = require('../../../NGCore/Client/Storage').Storage;
var Network     = require('../../../NGCore/Client/Network').Network;
var ServerSync  = require('../../Service/Data/ServerSync').ServerSync;
var FlowNetwork = require('./FlowNetwork').FlowNetwork;

exports.FlowScriptManager = ServerSync.singleton(
/** @lends Framework.FlowScript.FlowScriptManager.prototype */
{
	/**
	 * Error code of <code>FlowScriptManager</code> class.
	 * @namespace error
	 */
    error:
    {
		/** */
        ERROR_NONE : 0,
		/** */
        ERROR_ARGUMENTS : 1,
		/** */
        ERROR_JSON_PARSE : 2,
		/** */
        ERROR_JSON_FORMAT : 3,
		/** */
        ERROR_ASSET_NOT_FOUND : 4,
        /** */
        ERROR_UNKNOWN_NETWORK_KEY : 5,
        /** */
        ERROR_INVALID_NETWORK : 6
    },

    initialize : function()
    {
        this._networkRecipes = {};
        this._networkComponents = {};
    },

    registerFlowNetwork : function(key, network)
    {
        var error = this.error.ERROR_NONE;
        if(key !== "" && key !== null && network !== null)
        {
            if(this._verifyNetworkRecipe(network))
            {
                if(network.info)
                {
                    delete network.info;
                }
                this._networkRecipes[key] = network;
            }
            else
            {
                error = this.error.ERROR_INVALID_NETWORK; 
            }
        }
        else
        {
            error = this.error.ERROR_ARGUMENTS;
        }
        
        return error;
    },

    registerComponent : function(key, component)
    {
        this._networkComponents[key] = component;
    },

    hasKey : function(key)
    {
        return this._networkComponents[key] !== undefined && this._networkComponents[key] !== null;
    },

    createFlowNetwork : function(key)
    {
        var networkRecipe = this._networkRecipes[key];
        if(networkRecipe)
        {
            return this._buildNetworkRecipe(networkRecipe);
        }

        return this.error.ERROR_UNKNOWN_NETWORK_KEY;
    },

    _verifyNetworkRecipe : function(networkRecipe)
    {
        return true;
    },

    _buildNetworkRecipe : function(networkRecipe)
    {
        // the recipe can hold visual data so we only care about the 
        var net = new FlowNetwork();
        
        // First, Construct all the components
        var components = networkRecipe.network.components;
        if(components)
        {
            for(var component in components)
            {
                if(components.hasOwnProperty(component))
                {
                    var numComp = parseInt(component, 10);
                    var comp = new this._networkComponents[components[component].type];
                    comp._iip = components[component].iip;
                    net._components[numComp] = comp;  
                }
            }

            // Now lets link up all objects
            var links = networkRecipe.network.links;
            if(links)
            {
                var len = links.length;
                for(var idx = 0; idx < len; ++idx)
                {
                    var link = links[idx];

                    var headID = parseInt(link.head.uuid, 10);
                    var tailID = parseInt(link.tail.uuid, 10);
                    
                    net._components[tailID].bind(   link.tail.port, 
                                                    net._components[headID],
                                                    link.head.port);
                }
            }
        }
        
        // The network is now ready!!!
        return net;
    }
});
