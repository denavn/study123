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
var AssetManager = require('../../../Service/Data/AssetManager').AssetManager;
var SceneManager = require('../../../Service/Display/SceneManager').SceneManager;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.SpriteFactory = Component.subclass(
/** @lends Framework.FlowScript.Component.prototype */
{
    classname : "SpriteFactory",
   
    inPorts : 
    {
        IIP_DEFINED_SPRITE : 0,
        IP_GIVEN_SPRITE : 1
    },

    outPorts :
    {
        SPRITE : 0,
        ERROR : 1
    },

    _onReceive : function(port, ip)
    { 
        var sprite = new GL2.Sprite();

        // Process Optional Arguments
        var assetName = null;

        if(this._iip.optional.assetKey)
        {
            assetName = AssetManager.getAssetForKey(this._iip.optional.assetKey);
        }
        else if(this._iip.optional.assetPath)
        {
            assetName = this._iip.optional.assetPath;
        }

        if(assetName)
        {
            var anchor = [this._iip.optional.anchor_x || 0, this._iip.optional.anchor_x || 0];

            var u_start = this._iip.optional.u_start || 0;
            var u_end = this._iip.optional.u_end || 1;
            var v_start = this._iip.optional.v_start || 0;
            var v_end = this._iip.optional.v_end || 1;

            var size = [this._iip.optional.size_x || 100, this._iip.optional.size_y || 100];
            sprite.setImage(  assetName, size, anchor, [u_start, v_start, u_end, v_end]);
        }

        sprite.setPosition(this._iip.optional.pos_x || 0, this._iip.optional.pos_y || 0);
        sprite.setDepth(this._iip.optional.depth || 0);

        ip.active = sprite;
        
        // Process Required Arguments
        SceneManager.getNodeForKey(this._iip.required.parent).addChild(sprite);


        this.send(this.outPorts.SPRITE, ip);
    }

}); // end of class Component

exports.SpriteFactory.factoryUUID = UUID.SPRITE_FACTORY;
