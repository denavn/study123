////////////////////////////////////////////////////////////////////////////////
/**
*  @data:      2011-07-24 
*  @file:      Game.js
*  @author:    Chris Jimison
*  Website:    http://www.ngmoco.com
*  Copyright:  2010, by ngmoco:) llc
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
var PreferenceManager = require('../../../Service/Data/PreferenceManager').PreferenceManager;
var AssetManager = require('../../../Service/Data/AssetManager').AssetManager;
var Audio = require('../../../../NGCore/Client/Audio').Audio;

var SoundEffectAdapter = Core.MessageListener.subclass(
{
    classname : "SoundEffectAdapter",

	onComplete: function(callback)
	{
        callback();
	}
});

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.SoundEffect = Component.subclass(
/** @lends Framework.FlowScript.SoundEffect.prototype */
{
    classname : "SoundEffect",
   
    inPorts :
    {
        PLAY_DEFINED_SONG : 0,
        PLAY_EVENT_SONG : 1
    },

    outPorts :
    {
        OUT : 0
    },

    _onReceive : function(port, ip)
    {
        
        switch(port)
        {
            case this.inPorts.PLAY_DEFINED_SONG:
            
                this._playEffect(AssetManager.getAssetForKey(this._iip.required.assetKey));
                
                break;
            case this.inPorts.PLAY_EVENT_SONG:
                
                this._playEffect(this._iip.required.assetPath);
                
                break;
            default:
                break;
        }

        this.send(this.outPorts.OUT, ip);
    },
    
    _playEffect : function(assetPath)
    {
        var self = this;
        this._activeEffect = new Audio.ActiveEffect(new Audio.Effect(assetPath));
        this._effectAdapter = new SoundEffectAdapter();
        
        this._activeEffect.getPlayCompleteEmitter().addListener(this._effectAdapter, 
            function()
            {
                return this.onComplete(self.playCompleteCallback);
            });
        
        this._activeEffect.play();
    },
    
    playCompleteCallback : function()
    {
        if (this._activeEffect)
        {
            this._activeEffect.destroy();
        }
    }

}); // end of class SoundEffect

exports.SoundEffect.factoryUUID = UUID.SOUND_EFFECT;

