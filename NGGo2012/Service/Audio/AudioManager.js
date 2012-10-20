////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris Khurram
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Audio = require('../../../NGCore/Client/Audio').Audio;
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var ServerSync = require('../Data/ServerSync').ServerSync;
var Ops = require('../../Foundation/Math/Ops').Ops; /* IMPORTANT */
var KeyValueCache = require('../../../NGCore/Client/Storage/KeyValue').KeyValueCache;
//Please update require statements which are written insid other methods.
var AudioManagerImpl = ServerSync.subclass( /** @lends Service.Audio.AudioManager.prototype */
{
    classname: 'AudioManager',
    /*_effectIndex attribute will store sound effect objects
     *  Format:
     *  {
     *      key: {
     *          path: 'path_of_resource',
     *          isCached: boolean,
     *          _sound: 'audioObject for cached resource', //for cached objects
     *          _sfx: sfx // for cached objects
     *      }
     *  };
     */
    _effectIndex: null,
    _musicIndex: null,
    /* _musicIndex attribute will store background music objects
     *   Format:
     *   {
     *       key: {
     *           path:'path_of_resource'
     *       }
     *   };
     */
    /**
     * @class <code>AudioManager</code> class is an efficient Audio Asset Manager and Controller class.<br><br>
     * User preferences are saved for volume and mute status.
     * @constructs The default constructor.
     * @name Service.Audio.AudioManager
     * @arguments Data.ServerSync
     */
    initialize: function ()
    {
        /* to initialize with dictionary use AudioManager.loadConfigFromData(dictionary)
         */
        this._effectIndex = {};
        this._musicIndex = {};
        this._effectIndex.length = 0;
        this._musicIndex.length = 0;
        this._volume = {
            master: 1.0,
            effect: 1.0,
            music: 1.0,
            effectMute: false,
            musicMute: false
        };
        this._isLoadUserPreferences = false;
        this._loadedBgm = null;
        this._loadUserPreferences();
        return this;
    },
    destroy: function ()
    {
        var key;
        for(key in this._effectIndex)
        {
            if(this._effectIndex.hasOwnProperty(key))
            {
                this._removeAudioEffect(key);
                delete this._effectIndex[key];
            }
        }
        for(key in this._musicIndex)
        {
            if(this._musicIndex.hasOwnProperty(key))
            {
                delete this._musicIndex[key];
            }
        }
    },
    /**
     * Sets the property values for each specified key. Property values are passed in as key/value pairs.
     * 'masterVolume', 'effectVolume', 'musicVolume' of user preferences are higher priority than
     * this data.
     * @param {Object|String} json A dictionary of property key/value pairs or JSON string.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @example <code>AudioManager.loadConfigFromData(
     *     {
     *         masterVolume: 10,
     *         effectVolume: 50,
     *         musicVolume: 50,
     *         audioEffects: {
     *             'explode': {path:'Content/Audio/explodelow.wav', isCached:true},
     *             'shoot': {path:'Content/Audio/shoot.wav', isCached:true},
     *             'waterfall': {path:'Content/Audio/waterfall.wav', isCached:true}
     *         },
     *         musics: {
     *            'music1': 'Content/Audio/explodelow.wav',
     *            'music2': 'Content/Audio/shoot.wav'}
     *         }
     *     });</code>
     * @name Service.Audio.AudioManager.loadConfigFromData
     */
    /**
     * Sets the property values for each specified key. Property values are passed in as key/value pairs.
     * 'masterVolume', 'effectVolume', 'musicVolume' of user preferences are higher priority than
     * this data.
     * @param {String|Service.Network.URI} path Local file path or URL of JSON data.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @example <code>AudioManager.loadConfigFromFile("http://gameserver/audio_data.json");</code>
     * @name Service.Audio.AudioManager.loadConfigFromFile
     */
    /**
     * Add a background Music path to AudioManager.
     * @param {String} aKey string key.
     * @param {Boolean} [shallLoop] (Optional Parameter) if true, the Background Music will loop. To stop a looping see AudioManager.stopMusic(). Default value is true.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playAudioEffect
     * @example <code>AudioManager.addMusic('keyname', './Content/Audio.wav');
     * AudioManager.playMusic('keyname');</code>
     * @status iOS, Android, Test
     */
    playMusic: function (aKey, shallLoop)
    {
        //change :: If the music is mute, load the path, but do not play
        var musicPath = this._musicIndex[aKey];
        if(musicPath === undefined)
        {
            throw new Error('Key is not defined for audio effect in playMusic ' + this.classname);
        }
        this._loadedBgm = musicPath;
        shallLoop = shallLoop === undefined ? true : !! shallLoop;
        this._playMusic(shallLoop);
        return this;
    },
    /**
     * Pauses a currently playing track.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#resumeMusic,
     * @see AudioManager#stopMusic
     * @example <code>AudioManager.addMusic('keyname', './Content/Audio.wav');
     * AudioManager.playMusic('keyname');
     * AudioManager.pauseMusic();</code>
     * @status Android, Test
     */
    pauseMusic: function ()
    {
        Audio.Music.pause();
        return this;
    },
    /**
     * Resumes a paused background music track.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#pauseMusic,
     * @see AudioManager#playAudioEffect
     * @example <code>AudioManager.addMusic('keyname', './Content/Audio.wav');
     * AudioManager.playMusic('keyname');
     * AudioManager.pauseMusic();
     * AudioManager.resumeMusic();</code>
     * @status Android, Test
     */
    resumeMusic: function ()
    {
        if(Audio.Music.getIsPaused())
        {
            Audio.Music.play();
        }
        return this;
    },
    /**
     * Stops background music track.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#pauseMusic,
     * @see AudioManager#playAudioEffect
     * @example <code>AudioManager.addMusic('keyname', './Content/Audio.wav');
     * AudioManager.playMusic('keyname');
     * AudioManager.stopMusic();</code>
     * @status Android, Test
     */
    stopMusic: function ()
    {
        this._loadedBgm = null;
        Audio.Music.stop();
        return this;
    },
    /**
     * Status of background music track.
     * @returns {Boolean} This function returns <code>true</code> if the background Music is paused, <code>false</code> otherwise.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#pauseMusic,
     * @see AudioManager#getIsMusicPlaying
     * @example <code>AudioManager.getIsMusicPlaying();</code>
     * @status Android, Test
     */
    getIsMusicPaused: function ()
    {
        return Audio.Music.getIsPaused();
    },
    /**
     * Status of background music track.
     * @returns {Boolean} This function returns <code>true</code> if the background Music is being played, <code>false</code> otherwise.
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#pauseMusic,
     * @see AudioManager#getIsMusicPlaying
     * @example <code>AudioManager.getIsMusicPaused();</code>
     * @status Android, Test
     */
    getIsMusicPlaying: function ()
    {
        return Audio.Music.getIsPlaying();
    },
    /**
     * Retrieves the background Music path that is currently being played by AudioManager.
     * @returns {String} This function returns path of music file present against current key
     * @example <code>var aPath = AudioManager.getCurrentMusic();</code>
     * @status Android, Test
     */
    getCurrentMusic: function ()
    {
        if(this._loadedBgm)
        {
            var currentMusic = [this._loadedBgm];
            return currentMusic[0];
        }
        return null;
    },
    /**
     * Plays an Audio Effect previously added to AudioManager. For non-cached Audio Effects the resource will be released when the playback finishes, and if the non-cached AudioEffect is played in loop its resource will be released as soon as AudioManager.stopAudioEffect is called on that key.
     * @param {String} aKey string key.
     * @param {Boolean} [shallLoop] (Optional Parameter) if true, the sound will loop. To stop a looping AudioEffect see AudioManager.stopAudioEffect()
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#addAudioEffect
     * @see AudioManager#stopAudioEffect
     * @example <code>AudioManager.addAudioEffect('keyname', './Contents/Audio.wav', true);
     * AudioManager.playAudioEffect('keyname');
     * AudioManager.playAudioEffect('keyname', true); //second parameter is optional, if provided 'true' the sound will loop.
     * AudioManager.stopAudioEffect('keyname');</code>
     * @status iOS, Android, Test
     */
    playAudioEffect: function (aKey, shallLoop)
    {
        this._playAudioEffect(aKey, Boolean(shallLoop));
    },
    /**
     * Stops Audio Effect. For non-cached Audio Effects the resource will be released when the playback finishes, and if the non-cached AudioEffect is played in loop its resource will be released as soon as AudioManager.stopAudioEffect is called on that key.
     * @param {String} aKey string key.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#pauseAudioEffect,
     * @see AudioManager#playMusic,
     * @see AudioManager#playAudioEffect
     * @example <code>AudioManager.addAudioEffect('keyname', './Content/Audio.wav');
     * AudioManager.playAudioEffect('keyname');
     * AudioManager.stopAudioEffect('keyname');</code>
     * @status Android, Test
     */
    stopAudioEffect: function (aKey)
    {
        var soundPath = this._effectIndex[aKey];
        if(soundPath && soundPath._sound)
        {
            soundPath._sound.setLoops(false);
            // set the looping to false, the user must send second parameter
            // as TRUE in playAudioEffect('key', true) to make it loop again.
            soundPath._sound.stop();
            // for non-cached object STOP emitter will be called and memory for
            // sound object will be released. For Cached Object only the sound will stop.
        }
    },
    /**
     * Pauses a currently playing Audio Effect.
     * @param {String} aKey string key.
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#playMusic,
     * @see AudioManager#resumeMusic,
     * @see AudioManager#stopMusic
     * @example <code>AudioManager.addAudioEffect('keyname', './Content/Audio.wav');
     * AudioManager.playAudioEffect('keyname');
     * AudioManager.pauseAudioEffect('keyname');</code>
     * @status Android, Test
     */
    pauseAudioEffect: function (aKey)
    {
        var soundPath = this._effectIndex[aKey];
        if(soundPath && soundPath._sound)
        {
            soundPath._sound.pause();
        }
    },
    /**
     * Caches specific AudioManager's sounds
     * @param {Array|string} anArray array of string keys.
     * @see AudioManager#uncacheAudioEffect
     * @example <code>
     *  AudioManager.addAudioEffect('stage1_boom','./Content/boom.wav', false);
     *  AudioManager.addAudioEffect('stage1_kick','./Content/kick.wav', false);
     *  AudioManager.addAudioEffect('stage1_kill','./Content/kill.wav', false);
     *  AudioManager.addAudioEffect('stage1_hit','./Content/hit.wav', false);
     *  AudioManager.addAudioEffect('stage2_win','./Content/win.wav', false);
     *
     *  AudioManager.cacheAudioEffect(['stage1_*', 'stage2_win']) # Only these files will be cached. </code>
     * @status Android, Test
     */
    cacheAudioEffect: function (anArray)
    {
        //when we wish to cache Specific sounds, we can use AudioManager.cacheAudioEffect(['stage1_kick', 'stage1_kill', 'stage2_win']) ;
        var keyPrefix;
        var soundManObj;
        if(anArray instanceof Array)
        {
            var len = anArray.length;
            var i;
            for(i = 0; i < len; i++)
            {
                if(anArray[i].charAt(anArray[i].length - 1) === "*")
                {
                    keyPrefix = anArray[i].substring(0, anArray[i].length - 1);
                    this._activate(keyPrefix);
                }
                else
                {
                    soundManObj = this._effectIndex[anArray[i]];
                    if(soundManObj)
                    {
                        this._cacheSound(soundManObj);
                    }
                }
            }
        }
        else if(typeof (anArray) === 'string')
        {
            this._activate(anArray);
            if(anArray.charAt(anArray.length - 1) === "*")
            {
                keyPrefix = anArray.substring(0, anArray.length - 1);
                this._activate(keyPrefix);
            }
            else
            {
                soundManObj = this._effectIndex[anArray];
                if(soundManObj)
                {
                    this._cacheSound(soundManObj);
                }
            }
        }
        else
        {
            throw new Error(this.classname + ' Exception: cacheAudioEffect() expects an array of format [{key:} ...');
        }
    },
    /**
     * Uncaches specific AudioManager's sounds
     * @param {Array} anArray array of string keys.
     * @see AudioManager#uncacheAudioEffect
     * @example <code>
     *  AudioManager.addAudioEffect('stage1_boom','./Content/boom.wav', false);
     *  AudioManager.addAudioEffect('stage1_kick','./Content/kick.wav', false);
     *  AudioManager.addAudioEffect('stage1_kill','./Content/kill.wav', false);
     *  AudioManager.addAudioEffect('stage1_hit','./Content/hit.wav', false);
     *  AudioManager.addAudioEffect('stage2_win','./Content/win.wav', false);
     *
     *  AudioManager.cacheAudioEffect(['stage1_*', 'stage2_win']);
     *  AudioManager.uncacheAudioEffect(['stage1_*', 'stage2_win']);</code>
     * @status Android, Test
     */
    uncacheAudioEffect: function (anArray)
    {
        //when we wish to un-cache Specific sounds, we can use AudioManager.uncacheAudioEffect(['stage1_kick', 'stage1_kill', 'stage2_win'])   this will un-cache these sounds only.
        var soundManObj;
        var keyPrefix;
        if(anArray instanceof Array)
        {
            var len = anArray.length;
            var i;
            for(i = 0; i < len; i++)
            {
                if(anArray[i].charAt(anArray[i].length - 1) === "*")
                {
                    keyPrefix = anArray[i].substring(0, anArray[i].length - 1);
                    this._deactivate(keyPrefix);
                }
                else
                {
                    soundManObj = this._effectIndex[anArray[i]];
                    if(soundManObj)
                    {
                        this._unCacheSound(soundManObj);
                    }
                }
            }
        }
        else if(typeof (anArray) === 'string')
        {
            if(anArray.charAt(anArray.length - 1) === "*")
            {
                keyPrefix = anArray.substring(0, anArray.length - 1);
                this._deactivate(keyPrefix);
            }
            else
            {
                soundManObj = this._effectIndex[anArray];
                if(soundManObj)
                {
                    this._unCacheSound(soundManObj);
                }
            }
        }
        else
        {
            throw new Error(this.classname + ' Exception: cacheAudioEffect() expects an array of format [{key:} ...');
        }
    },
    /**
     * Adds background Music to AudioManager using an Object.
     * @param {Object or (key,path)} anObject with keys and paths or (key , path).
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#removeMusic,
     * @example <code>
     * AudioManager.addMusic({
     *     'sample1': './Content/bgMusic1.mp3',
     *     'sample2': './Content/bgMusic2.mp3', ... });
     * or
     * AudioManager.addMusic('sample1','./Content/bgMusic1.mp3');
     * AudioManager.playMusic('sample1');</code>
     * @status Android, Test
     */
    addMusic: function (anObject, path)
    {
        //Add music using an array
        if(anObject instanceof Object)
        {
            var key;
            for(key in anObject)
            {
                if(anObject.hasOwnProperty(key))
                {
                    this._addMusic(key, anObject[key]);
                }
            }
        }
        else
        {
            this._addMusic(anObject, path);
        }
    },
    /**
     * Removes background Music from AudioManager using an Array of keys or String key.
     * @param {Array or String} anArray Array of key or String key.
     * @see AudioManager#removeAudioEffect,
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#removeMusic,
     * @example <code>AudioManager.removeMusic(['sample1', 'sample2', 'sample3', ...]); 
     * or
     * AudioManager.removeMusic('sample1'); 
     * </code>
     * @status Android, Test
     */
    removeMusic: function (anArray)
    {
        //remove audio effects using an array.
        if(anArray instanceof Array)
        {
            var len = anArray.length;
            var i;
            for(i = 0; i < len; i++)
            {
                this._removeMusic(anArray[i]);
            }
        }
        else
        {
            this._removeMusic(anArray);
        }
    },
    /**
     * Adds Audio Effects to AudioManager using an Object or (key, path, isCached).
     * @param {Object} anObject object of audio effects
     * @see AudioManager#removeAudioEffect,
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @example <code>
     * AudioManager.addAudioEffect({'sample1': {path:'./Content/Sample.wav', isCached:true}, {key:'sample2', path:'./Content/Sample.wav', isCached:true}, ... });
     * or
     * AudioManager.addAudioEffect('sample1','./Content/Sample.wav',true);
     * AudioManager.playAudioEffect('sample1');</code>
     * @status Android, Test
     */
    addAudioEffect: function (anObject, path, isCached)
    {
        //Add audio effects using an array.
        if(anObject instanceof Object)
        {
            var key;
            for(key in anObject)
            {
                if(anObject.hasOwnProperty(key))
                {
                    this._addAudioEffectSingle(key, anObject[key].path, anObject[key].isCached);
                }
            }
        }
        else
        {
            this._addAudioEffectSingle(anObject, path, isCached);
        }
    },
    /**
     * Removes Audio Effects from AudioManager using an Array or String key.
     * @param {Array or String} anArray Array of Audio Effects or String key
     * @see AudioManager#addAudioEffect,
     * @see AudioManager#addMusic,
     * @see AudioManager#removeMusic,
     * @example <code>
     * AudioManager.addAudioEffect([{key:'sample1', path:'./Content/Sample.wav', isCached:true}, {key:'sample2', path:'./Content/Sample.wav', isCached:true}, ...]);
     * AudioManager.removeAudioEffect(['sample1', 'sample2']);</code>
     * or
     * AudioManager.removeAudioEffect('sample1');</code>
     * @status Android, Test
     */
    removeAudioEffect: function (anArray)
    {
        //remove audio effects using an array.
        if(anArray instanceof Array)
        {
            var len = anArray.length;
            var i;
            for(i = 0; i < len; i++)
            {
                this._removeAudioEffectSingle(anArray[i]);
            }
        }
        else
        {
            this._removeAudioEffectSingle(anArray);
        }
    },
    /**
     * Mutes all playing sounds.
     * @see AudioManager#muteMusic,
     * @see AudioManager#muteAudioEffect,
     * @see AudioManager#unMuteAll,
     * @see AudioManager#unMuteMusic,
     * @see AudioManager#unMuteAudioEffect
     * @see AudioManager#toggleMute
     * @example <code>
     * ...
     * AudioManager.muteAll();
     * ...
     * </code>
     * @status Android, Test
     */
    muteAll: function ()
    {
        this.muteMusic(true); //tell the method that it is delegated from ALL method.
        this.muteAudioEffect(true); //tell the method that it is delegated from ALL method.
        this._saveUserPreferences();
    },
    /**
     * Mutes only music sounds.
     * @see AudioManager#muteAll,
     * @see AudioManager#muteAudioEffect,
     * @see AudioManager#unMuteAll,
     * @see AudioManager#unMuteMusic,
     * @see AudioManager#unMuteAudioEffect
     * @param {Boolean} skipSave Don't save user preference to KeyValue.
     * @example <code>
     * ...
     * AudioManager.muteMusic();
     * ...
     * </code>
     * @status Android, Test
     */
    muteMusic: function (skipSave)
    {
        this._volume.musicMute = true;
        this._setMusicVolume(true);
        if(!skipSave)
        {
            //if a delegated call, do not save preferences here. save in muteAll method.
            this._saveUserPreferences();
        }
    },
    /**
     * Mutes only Audio effect sounds.
     * @see AudioManager#muteAll,
     * @see AudioManager#muteMusic,
     * @see AudioManager#unMuteAll,
     * @see AudioManager#unMuteMusic,
     * @see AudioManager#unMuteAudioEffect
     * @param {Boolean} skipSave Don't save user preference to KeyValue.
     * @example <code>
     * ...
     * AudioManager.muteAudioEffect(true);
     * ...
     * </code>
     * @status Android, Test
     */
    muteAudioEffect: function (skipSave)
    {
        this._volume.effectMute = true;
        this._setAudioEffectVolume(true);
        if(!skipSave)
        {
            //if a delegated call, do not save preferences here. save in muteAll method.
            this._saveUserPreferences();
        }
    },
    /**
     * UnMutes all sounds.
     * @see AudioManager#muteAll,
     * @see AudioManager#muteMusic,
     * @see AudioManager#muteAudioEffect,
     * @see AudioManager#unMuteMusic,
     * @see AudioManager#unMuteAudioEffect
     * @example <code>
     * ...
     * AudioManager.unMuteAll();
     * ...
     * </code>
     * @status Android, Test
     */
    unMuteAll: function ()
    {
        this.unMuteMusic(true); //tell the method that it is delegated from ALL method.
        this.unMuteAudioEffect(true); //tell the method that it is delegated from ALL method.
        this._saveUserPreferences();
    },
    /**
     * UnMutes Music sounds.
     * @see AudioManager#muteAll,
     * @see AudioManager#muteMusic,
     * @see AudioManager#muteAudioEffect,
     * @see AudioManager#unMuteAll,
     * @see AudioManager#unMuteAudioEffect
     * @param {Boolean} skipSave Don't save user preference to KeyValue.
     * @example <code>
     * ...
     * AudioManager.unMuteMusic();
     * ...
     * </code>
     * @status Android, Test
     */
    unMuteMusic: function (skipSave)
    {
        this._volume.musicMute = false;
        this._setMusicVolume(true);
        if(!skipSave) //if a delegated call, do not save preferences here. save in unMuteAll method.
        {
            this._saveUserPreferences();
        }
    },
    /**
     * UnMutes Audio Effects sounds.
     * @see AudioManager#muteAll,
     * @see AudioManager#muteMusic,
     * @see AudioManager#muteAudioEffect,
     * @see AudioManager#unMuteAll,
     * @see AudioManager#unMuteMusic
     * @param {Boolean} skipSave Don't save user preference to KeyValue.
     * @example <code>
     * ...
     * AudioManager.unMuteAudioEffect();
     * ...
     * </code>
     * @status Android, Test
     */
    unMuteAudioEffect: function (skipSave)
    {
        this._volume.effectMute = false;
        this._setAudioEffectVolume(true);
        if(!skipSave) //if a delegated call, do not save preferences here. save in unMuteAll method.
        {
            this._saveUserPreferences();
        }
    },
    /**
     * Mute status of Sounds. true When all are mute.
     * @returns {Boolean} This function returns <code>true</code> if both background Music and Audio Effect are muted, <code>false</code> otherwise.
     * @see AudioManager#isMuteAudioEffect,
     * @see AudioManager#isMuteMusic,
     * @see AudioManager#toggleMuteMusic,
     * @see AudioManager#toggleMute,
     * @see AudioManager#toggleMuteAudioEffect
     * @example <code>var mute = AudioManager.isMute();</code>
     * @status Android, Test
     */
    isMute: function ()
    {
        return(this.isMuteAudioEffect() && this.isMuteMusic());
    },
    /**
     * Mute status of Audio effects.
     * @returns {Boolean} This function returns <code>true</code> if Audio Effect is muted, <code>false</code> otherwise.
     * @see AudioManager#isMute,
     * @see AudioManager#isMuteMusic,
     * @see AudioManager#toggleMuteMusic,
     * @see AudioManager#toggleMute,
     * @see AudioManager#toggleMuteAudioEffect
     * @example <code>var mute = AudioManager.isMuteAudioEffect();</code>
     * @status Android, Test
     */
    isMuteAudioEffect: function ()
    {
        return this._volume.effectMute;
    },
    /**
     * Mute status of Music.
     * @returns {Boolean} This function returns <code>true</code> if background Music is muted, <code>false</code> otherwise.
     * @see AudioManager#isMuteAudioEffect,
     * @see AudioManager#isMute,
     * @see AudioManager#toggleMuteMusic,
     * @see AudioManager#toggleMute,
     * @see AudioManager#toggleMuteAudioEffect
     * @example <code>AudioManager.isMuteMusic();</code>
     * @status Android, Test
     */
    isMuteMusic: function ()
    {
        return this._volume.musicMute;
    },
    /**
     * Toggles Mute status of all Sounds.
     * @see AudioManager#isMuteAudioEffect,
     * @see AudioManager#isMuteMusic,
     * @see AudioManager#toggleMuteMusic,
     * @see AudioManager#isMute,
     * @see AudioManager#toggleMuteAudioEffect
     * @example <code>AudioManager.toggleMute();</code>
     * @status Android, Test
     */
    toggleMute: function ()
    {
        if(this.isMute())
        {
            this.unMuteAll();
        }
        else
        {
            this.muteAll();
        }
    },
    /**
     * Toggles Mute status of Audio Effects.
     * @see AudioManager#isMuteAudioEffect,
     * @see AudioManager#isMuteMusic,
     * @see AudioManager#toggleMuteMusic,
     * @see AudioManager#isMute,
     * @see AudioManager#toggleMute
     * @example <code>AudioManager.toggleMuteAudioEffect();</code>
     * @status Android, Test
     */
    toggleMuteAudioEffect: function ()
    {
        if(this.isMuteAudioEffect())
        {
            this.unMuteAudioEffect();
        }
        else
        {
            this.muteAudioEffect();
        }
    },
    /**
     * Toggles Mute status of Music.
     * @see AudioManager#isMuteAudioEffect,
     * @see AudioManager#isMuteMusic,
     * @see AudioManager#toggleMute,
     * @see AudioManager#isMute,
     * @see AudioManager#toggleMuteAudioEffect
     * @example <code>AudioManager.toggleMuteMusic();</code>
     * @status Android, Test
     */
    toggleMuteMusic: function ()
    {
        if(this.isMuteMusic())
        {
            this.unMuteMusic();
        }
        else
        {
            this.muteMusic();
        }
    },
    /**
     * Sets the volume for all Sounds.
     * @param {Number} aDecimal volume value from 0 to 100
     * @see AudioManager#setAudioEffectVolume,
     * @see AudioManager#setMusicVolume,
     * @see AudioManager#getMasterVolume,
     * @see AudioManager#getAudioEffectVolume,
     * @example <code>
     * ...
     * AudioManager.setMasterVolume(70);
     * ...</code>
     * @status Android, Test
     */
    setMasterVolume: function (aDecimalValue) //value (0 ~ 100)
    {
        this._volume.master = Ops.clamp(aDecimalValue, 0, 100) / 100;
        this._setVolume();
    },
    /**
     * Sets the volume for Audio Effects.
     * @param {Number} aDecimal volume value from 0 to 100
     * @see AudioManager#setMasterVolume,
     * @see AudioManager#setMusicVolume,
     * @see AudioManager#getAudioEffectVolume,
     * @example <code>
     * ...
     * AudioManager.setAudioEffectVolume(70);
     * ...</code>
     * @status Android, Test
     */
    setAudioEffectVolume: function (aDecimalValue) //value (0 ~ 100)
    {
        this._volume.effect = Ops.clamp(aDecimalValue, 0, 100) / 100;
        this._setAudioEffectVolume();
    },
    /**
     * Sets the volume for Music.
     * @param {Number} aDecimal volume value from 0 to 100
     * @see AudioManager#setMasterVolume,
     * @see AudioManager#getMasterVolume,
     * @see AudioManager#setAudioEffectVolume,
     * @see AudioManager#getAudioEffectVolume,
     * @see AudioManager#getMusicVolume
     * @example <code>
     * ...
     * AudioManager.setMusicVolume(70);
     * ...</code>
     * @status Android, Test
     */
    setMusicVolume: function (aDecimalValue) //value (0 ~ 100)
    {
        this._volume.music = Ops.clamp(aDecimalValue, 0, 100) / 100;
        this._setMusicVolume();
    },
    /**
     * Retrieves the volume value for all Sounds.
     * @returns {Number} volume value for all Sounds
     * @see AudioManager#setAudioEffectVolume,
     * @see AudioManager#setMusicVolume,
     * @see AudioManager#setMasterVolume,
     * @see AudioManager#getAudioEffectVolume,
     * @see AudioManager#getMusicVolume
     * @example <code>
     * ...
     * var volume = AudioManager.getVolume();
     * ...</code>
     * @status Android, Test
     */
    getMasterVolume: function ()
    {
        return ~~ (this._volume.master * 100);
    },
    /**
     * Retrieves the volume value of Audio Effects.
     * @returns {Number} volume value of Audio Effects
     * @see AudioManager#setAudioEffectVolume,
     * @see AudioManager#setMusicVolume,
     * @see AudioManager#setMasterVolume,
     * @see AudioManager#getMasterVolume,
     * @see AudioManager#getMusicVolume
     * @example <code>
     * ...
     * var volume = AudioManager.getAudioEffectVolume();
     * ...</code>
     * @status Android, Test
     */
    getAudioEffectVolume: function ()
    {
        return ~~ (this._volume.effect * 100);
    },
    /**
     * Retrieves the volume value of Music.
     * @returns {Number} volume value of Music
     * @see AudioManager#setAudioEffectVolume,
     * @see AudioManager#setMusicVolume,
     * @see AudioManager#setVolume,
     * @see AudioManager#getAudioEffectVolume,
     * @see AudioManager#getVolume
     * @example <code>
     * ...
     * AudioManager.getMusicVolume();
     * ...</code>
     * @status Android, Test
     */
    getMusicVolume: function ()
    {
        return ~~ (this._volume.music * 100);
    },
    /**
     * @private
     */
    _getAllMusicKeys: function ()
    {
        //useful for getting all the defined Music keys.
        var key;
        var keys = [];
        for(key in this._musicIndex)
        {
            if(this._musicIndex.hasOwnProperty(key))
            {
                if(key !== 'length')
                {
                    keys.push(key);
                }
            }
        }
        return keys;
    },
    /**
     * @private
     */
    _getAllAudioEffectKeys: function ()
    {
        //useful for getting all the defined audioEffect keys.
        var key;
        var keys = [];
        for(key in this._effectIndex)
        {
            if(this._effectIndex.hasOwnProperty(key))
            {
                if(key !== 'length')
                {
                    keys.push(key);
                }
            }
        }
        return keys;
    },
    /**
     * @private
     */
    _getMusicObject: function (aKey)
    {
        return this._musicIndex[aKey];
    },
    /**
     * @private
     */
    _getAudioEffectObject: function (aKey)
    {
        return this._effectIndex[aKey];
    },
    /**
     * @param {string|{key: string, path: string, isCached: boolean}} aKey .
     * @private
     */
    _addAudioEffectSingle: function (aKey, aPath, aIsCached)
    {
        //Two supported formats for invocating this method
        //1) addAudioEffect('keyname', './Content/Audio.wav', true)
        //2) addAudioEffect({key: 'keyname', path: './Content/Audio.wav', isCached: true});
        //third parameter is optional and if it is not provided, then __DEFAULT_CACHE_BEHAVIOR is used.
        //extract the arguments
        if(!aKey)
        {
            throw new Error('Too few arguments : Key is not defined for audio effect in addAudioEffect ' + this.classname);
        }
        if(!aPath)
        {
            throw new Error('Too few arguments : Path is not defined for resource in addAudioEffect ' + this.classname);
        }
        if(aIsCached === undefined || aIsCached === null)
        {
            aIsCached = this.__DEFAULT_CACHE_BEHAVIOR;
        }
        var theKey = aKey;
        if(typeof theKey !== 'string')
        {
            throw new Error('Too few arguments : Key is not defined for audio effect in addAudioEffect ' + this.classname);
        }
        //at this point we have, [key, path, isCached]
        this._removeAudioEffect(theKey);
        this._addAudioEffect(
        {
            key: theKey,
            path: aPath,
            isCached: aIsCached
        });
        return this;
    },
    /** @private */
    _removeAudioEffectSingle: function (aKey)
    {
        if(!this._effectIndex[aKey])
        {
            throw new Error('Too few arguments : Key is not defined for audio effect in removeAudioEffect ' + this.classname);
        }
        this._removeAudioEffect(aKey);
        delete(this._effectIndex[aKey]);
        return this;
    },
    /** @private */
    _addMusic: function (aKey, aPath)
    {
        if(!aKey)
        {
            throw new Error('Too few arguments : Key is not defined for audio effect in addMusic ' + this.classname);
        }
        if(typeof aKey !== 'string')
        {
            throw new Error('Too few arguments : Key is not defined for audio effect in addMusic ' + this.classname);
        }
        this._musicIndex[aKey] = aPath;
        return this;
    },
    /** @private */
    _removeMusic: function (aKey)
    {
        if(!this._musicIndex[aKey])
        {
            throw new Error('Key is not defined for audio effect in removeMusic ' + this.classname);
        }
        if(this._musicIndex[aKey] === this._loadedBgm)
        {
            this._loadedBgm = null;
            Audio.Music.stop();
        }
        this._musicIndex[aKey] = null;
        delete(this._musicIndex[aKey]);
        return this;
    },
    /**
     * @private
     */
    _activate: function (aPrefix)
    {
        //as Nobutaka suggested for stage level caching,
        var key;
        for(key in this._effectIndex)
        {
            if(this._effectIndex.hasOwnProperty(key))
            {
                if(key.indexOf(aPrefix) === 0)
                {
                    var soundObj = this._effectIndex[key];
                    if(soundObj.isCached === false)
                    {
                        this._cacheSound(soundObj);
                    }
                }
            }
        }
    },
    /**
     * @private
     */
    _deactivate: function (aPrefix)
    {
        //Similar to AudioManager.activate, deactivate will uncache those sounds.
        var key;
        for(key in this._effectIndex)
        {
            if(this._effectIndex.hasOwnProperty(key))
            {
                if(key.indexOf(aPrefix) === 0)
                {
                    var soundObj = this._effectIndex[key];
                    if(soundObj.isCached === true)
                    {
                        this._unCacheSound(soundObj);
                    }
                }
            }
        }
    },
    /** @private */
    _playAudioEffect: function (aKey, shallLoop)
    {
        if(this._volume.effectMute)
        {
            return; //sound effects are muted
        }
        var soundPath = this._effectIndex[aKey];
        if(soundPath)
        {
            if(!soundPath.isCached)
            {
                //if not cached, create an object, play it and destroy when play completes.
                //create sound object for uncached effect
                var sfx = new Audio.Effect(soundPath.path);
                var activeFX = new Audio.ActiveEffect(sfx);
                activeFX.setVolume(this._volume.master * this._volume.effect);
                activeFX._sfx = sfx;
                activeFX._listener = new MessageListener();
                var emitter = activeFX.getPlayCompleteEmitter();
                emitter.addListener(activeFX._listener, function ()
                {
                    //TODO: xxx not called when call stopAudioEffect() on Android
                    //destroying a non-cached sound.
                    //for non-looping sound, this method will be called at the end of playback.
                    //for looping sounds, this method will be called once .stop() has been called.
                    activeFX.getPlayCompleteEmitter().removeListener(this);
                    activeFX._listener.destroy();
                    activeFX.destroy(); //destroy Audio.ActiveEffect
                    activeFX._sfx.destroy(); //destroy Audio.Effect
                    activeFX._sfx = null;
                    activeFX = null;
                });
                if(shallLoop)
                {
                    activeFX.setLoops(shallLoop);
                }
                activeFX.play();
            }
            else
            {
                //TODO: Crached on Android. Maybe not release Audio or someone??
                if(shallLoop)
                {
                    soundPath._sound.setLoops(shallLoop);
                }
                soundPath._sound.play();
            }
        }
    },
    /** @private */
    _setVolume: function ()
    {
        this._setAudioEffectVolume(true);
        this._setMusicVolume(true);
        this._saveUserPreferences();
    },
    /** @private */
    _setAudioEffectVolume: function ()
    {
        var key, args = arguments;
        var muteFactor = this._volume.effectMute ? 0 : 1;
        for(key in this._effectIndex)
        {
            if(this._effectIndex.hasOwnProperty(key))
            {
                if(this._effectIndex[key]._sound)
                {
                    this._effectIndex[key]._sound.setVolume(this._volume.effect * this._volume.master * muteFactor);
                }
            }
        }
        if(!args[0]) //if a delegated call, do not save preferences here. save in _setVolume method.
        {
            this._saveUserPreferences();
        }
    },
    /** @private */
    _setMusicVolume: function ()
    {
        var muteFactor = this._volume.musicMute ? 0 : 1;
        var args = arguments;
        Audio.Music.setVolume(this._volume.master * this._volume.music * muteFactor);
        if(!args[0]) //if a delegated call, do not save preferences here. save in muteAll method.
        {
            this._saveUserPreferences();
        }
    },
    /** @private */
    _playMusic: function (shallLoop)
    {
        if(!this._loadedBgm)
        {
            return;
        }
        Audio.Music.setPath(this._loadedBgm);
        Audio.Music.setLoop(shallLoop);
        Audio.Music.play();
    },
    /** @private */
    _addAudioEffect: function (audioEffect)
    {
        //private method, do not put overhead of parameter checking here.
        //if the sound is cached, pre-load it in the memory
        if(audioEffect.isCached)
        {
            this._cacheSound(audioEffect);
        }
        //save it against the key
        this._effectIndex[audioEffect.key] = {
            path: audioEffect.path,
            isCached: audioEffect.isCached,
            _sound: audioEffect._sound,
            //for cached sound only
            _sfx: audioEffect._sfx //for cached sound only
        };
    },
    /** @private */
    _cacheSound: function (audioEffect)
    {
        audioEffect.isCached = true;
        var sfx = new Audio.Effect(audioEffect.path);
        var activeFX = new Audio.ActiveEffect(sfx);
        audioEffect._sfx = sfx;
        activeFX.setVolume(this._volume.master * this._volume.effect);
        audioEffect._sound = activeFX;
    },
    /** @private */
    _unCacheSound: function (audioEffect)
    {
        if(audioEffect._sound !== undefined && audioEffect._sound !== null)
        {
            audioEffect._sound.destroy();
            audioEffect._sound = null;
        }
        if(audioEffect._sfx !== undefined && audioEffect._sfx !== null)
        {
            audioEffect._sfx.destroy();
            audioEffect._sfx = null;
        }
        audioEffect.isCached = false;
    },
    /** @private */
    _initSoundSystem: function ()
    {
        //this method will be called after the user preferences are read from the storage
        //load the files from dictionary sent in initialize method
        this._setVolume();
    },
    /** @private */
    _loadUserPreferences: function ()
    {
        //load user-preferred volume settings from the storage
        KeyValueCache.local.getItem("com.nggo.audiomanager.volume", function (err, data)
        {
            if(!err)
            {
                var dataObj = JSON.parse(data);
                if(dataObj.hasOwnProperty('master'))
                {
                    this._volume.master = dataObj.master;
                    this._volume.effect = dataObj.effect;
                    this._volume.music = dataObj.music;
                    this._volume.effectMute = dataObj.effectMute;
                    this._volume.musicMute = dataObj.musicMute;
                    this._isLoadUserPreferences = true;
                }
            }
            this._initSoundSystem(); //send all these values to the sound system.
        }.bind(this));
    },
    /** @private */
    _saveUserPreferences: function ()
    {
        var volumeObj = JSON.stringify(this._volume);
        KeyValueCache.local.setItem("com.nggo.audiomanager.volume", volumeObj);
    },
    /** @private */
    _removeAudioEffect: function (aKey)
    {
        var objectForKey = this._effectIndex[aKey];
        if(objectForKey)
        {
            this._unCacheSound(objectForKey);
            objectForKey.path = null;
            objectForKey.isCached = this.__DEFAULT_CACHE_BEHAVIOR;
        }
    },
    /** @private */
    __onLoadData: function (data)
    {
        if(!this._isLoadUserPreferences)
        {
            var keys = ["master", "effect", "music"];
            var len = keys.length;
            var i;
            for(i = 0; i < len; ++i)
            {
                if(data[keys[i] + "Volume"])
                {
                    this._volume[keys[i]] = Number(data[keys[i] + "Volume"]) / 100;
                }
            }
        }
        if(data.musics)
        {
            this.addMusic(data.musics);
        }
        if(data.audioEffects)
        {
            this.addAudioEffect(data.audioEffects);
        }
    },
    __DEFAULT_CACHE_BEHAVIOR: true //default sound effect cache behavior -- true = sound will be cached.
});
exports.AudioManagerImpl = AudioManagerImpl;
exports.AudioManager = AudioManagerImpl.singleton(
{});