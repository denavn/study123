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

////////////////////////////////////////////////////////////////////////////////
// Class Component
exports.SongPlayer = Component.subclass(
/** @lends Framework.FlowScript.SongPlayer.prototype */
{
    classname : "SongPlayer",
   
    inPorts :
    {
        PLAY_DEFINED_SONG : 0,
        PLAY_EVENT_SONG : 1
    },

    outPorts :
    {
        OUT : 0,
        ON_SONG_COMPLETE : 1
    },

    _onReceive : function(port, ip)
    {
        switch(port)
        {
            case this.inPorts.PLAY_DEFINED_SONG:
                Audio.Music.setPath(AssetManager.getAssetForKey(this._iip.required.assetKey));
                Audio.Music.play();
                Audio.Music.setVolume(PreferenceManager.get('music_volume'));
                break;

            case this.inPorts.PLAY_EVENT_SONG:
                Audio.Music.setPath(this._iip.required.assetPath);
                Audio.Music.play();
                Audio.Music.setVolume(PreferenceManager.get('music_volume'));
                break;
            default:
                break;
        }

        this.send(this.outPorts.OUT, ip);
    }

}); // end of class SongPlayer

exports.SongPlayer.factoryUUID = UUID.SONG_PLAYER;

