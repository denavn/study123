///////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Core                = require('../../NGCore/Client/Core').Core;
var Storage             = require('../../NGCore/Client/Storage').Storage;

var AssetManager        = require('../Service/Data/AssetManager').AssetManager;
var SceneManager        = require('../Service/Display/SceneManager').SceneManager;
var AnimationManager    = require('../Framework/AnimationManager').AnimationManager;
var CameraManager       = require('../Service/Display/CameraManager').CameraManager;
var ScreenManager       = require('../Service/Display/ScreenManager').ScreenManager;
var PreferenceManager   = require('../Service/Data/PreferenceManager').PreferenceManager;
var MultiManifestManager= require('../Service/Network/MultiManifestManager').MultiManifestManager;

var Class               = require('../Foundation/Class').Class;
var Observable          = require('../Foundation/Observable').Observable;
var NGGoComponents      = require('../Framework/FlowScript/Components/NGGoComponents').NGGoComponents;
var FlowScriptManager   = require('../Framework/FlowScript/FlowScriptManager').FlowScriptManager;

/** @private */
var KeyListenerForBack = Core.MessageListener.singleton(
{
    initialize: function()
    {
        Device.KeyEmitter.addListener(this, this.onUpdate);
    },

    onUpdate : function(keyEvent)
    {
        if (keyEvent.code === Device.KeyEmitter.Keycode.back && this.backCommand)
        {
            this.backCommand();
            return true;
        }
    }
});

////////////////////////////////////////////////////////////////////////////////

exports.ConfigurationManager = Class.singleton(
/** @lends Framework.ConfigurationManager.prototype */
{
    /**
     * @class The <code>ConfigurationManagement</code> defines how the ngGo engine will be initialized.
     * <br><br>
     * Given that some systems have interdependencies on other system things like order of initialization/execution become very important.
     * <ul>
     * <li><b>-</b> System initialization</li>
     * <li><b>-</b> ngGo server interaction</li>
     * </ul>
     * @constructs Constructor for the object.
     * @name Framework.ConfigurationManager
     * @augments Core.Class
     */
    initialize : function()
    {
        this.mConfigFile = './Config/default.json';
        this.mAssetManagerLoaded = false;
        this.mSceneManagerLoaded = false;
        this.mCameraManagerLoaded = false;
        this.mAnimationManagerLoaded = false;
    },

    /**
     * Sets config file name. This is used when <code>begin()</code> is called.
     * @param {String} filename Config file name.
     */
    setConfigFile : function(filename)
    {
        this.mConfigFile = filename;
    },

    /**
     * Starts up the Configuration Manager.
     * @param {Function} [callback] Callback funciton for when the setup is complete. function(err) is expected.
     */
    begin : function(callback)
    {
        var self = this;

        callback = callback || function(err){};

        var fs = Storage.FileSystem;
        // Step 1
        // Load the default.json file.  This will trigger off any additional updates required
        fs.readFile(this.mConfigFile, false, function(err, data)
        {
            if(err)
            {
                // Log the fact that we have a problem
                console.log("<NGGO> Error: Could not read the file " + this.mConfigFile);
                callback("Could not read file");
            }
            else
            {
                var config = null;
                // Lets try and parse the json
                try
                {
                    config = JSON.parse(data);
                }
                catch(ex)
                {
                    console.log("<NGGO> Error: Could not parse the JSON file " + this.mConfigFile);
                    callback("Could not parse the JSON file");
                }
                self.mConfig = config;
                self._loadScreen(callback);
            }
        });
    },

    /**
     * Sets callback function for <code>Back</code> key.
     * @param {Function} callback Callback function.
     */
    onBack : function(callback)
    {
        this.mOnBackCallback = callback;
    },

    /**
     * Calls the onBack callback handler externally.  This is good for things like buttons
     * that overload the on back behavior
     */
    callOnBack : function()
    {
        if(this.mOnBackCallback)
        {
            this.mOnBackCallback();
        }
    },

    /** @private */
    _loadScreen : function(callback)
    {
        var self = this;
        if(this.mConfig.Screen)
        {
            ScreenManager.loadConfigFromFile(this.mConfig.Screen, function(error)
            {
                if(error)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the ScreenManager");
                    self.notify("onConfigurationManagaerFailed", "ScreenManager");
                    callback("error loading screen");
                }
                else
                {
                    // $TODO this should be in the SceneDirector not the configuration manager
                    KeyListenerForBack.instantiate();
                    KeyListenerForBack.backCommand = this.mOnBackCallback;
                    self.mScreenLoaded = true;
                    
                    //setup development handling for ScreenManager
                    if (self.mConfig.development){
                        ScreenManager.setupDevelopment(self.mConfig.development, callback);
                    }
                    
                    self._loadMultiManifestManager(callback);
                }
            });
        }
        else
        {
            self._loadMultiManifestManager(callback);
        }
    },

    /** @private */
    _loadMultiManifestManager : function(callback)
    {
        var self = this;
        if(this.mConfig.MultiManifestManager)
        {
            MultiManifestManager.start(this.mConfig.MultiManifestManager,
                function(manifestIdx, inProgress, stillToGo, total, name)
                {
                    self.notify("onMultiManifestManagerProgress", manifestIdx, inProgress, stillToGo, total, name);
                },
                function(err, downloadList, deletedList)
                {
                    self.notify("onMultiManifestMangerProgress", err, downloadList, deletedList);
                }
            );
            self.mMultiManifestManagerLoaded = true;
            //setup development handling for MultiManifestManager
            if (self.mConfig.development){
                MultiManifestManager.setupDevelopment(self.mConfig.development, callback);
            }
            self._loadAssetMap(callback);
        }
        else
        {
            self._loadAssetMap(callback);
        }
    },

    /** @private */
    _loadAssetMap : function(callback)
    {
        var self = this;
        if(this.mConfig.AssetManager)
        {
            AssetManager.loadConfigFromFile(this.mConfig.AssetManager, function(err)
            {
                if(err)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the AssetManager");
                    self.notify("onConfigurationManagaerFailed", "AssetManager");
                    callback(err);
                }
                else
                {
                    self.mAssetManagerLoaded = true;
                    //setup development handling for AssetManager
                    if (self.mConfig.development){
                        AssetManager.setupDevelopment(self.mConfig.development, callback);
                    }
                    // Start up the scene manager if it exists
                    self._loadSceneManager(callback);
                }
            });
        }
        else
        {
            this._loadSceneManager(callback);
        }
    },

    /** @private */
    _loadSceneManager : function(callback)
    {
        var self = this;
        if(this.mConfig.SceneManager)
        {
            SceneManager.loadConfigFromFile(this.mConfig.SceneManager, function(err)
            {
                if(err)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the SceneManager");
                    self.notify("onConfigurationManagaerFailed", "SceneManager");
                    callback(err);
                }
                else
                {
                    self.mSceneManagerLoaded = true;
                    //setup development handling for SceneManager
                    if (self.mConfig.development){
                        SceneManager.setupDevelopment(self.mConfig.development, callback);
                    }
                    // Start up the scene manager if it exists
                    self._loadPreferenceManager(callback);
                }
            });
        }
        else
        {
            this._loadPreferenceManager(callback);
        }
    },

    /** @private */
    _loadPreferenceManager : function(callback)
    {
        var self = this;
        if(this.mConfig.PreferenceManager)
        {
            PreferenceManager.loadConfigFromFile(this.mConfig.PreferenceManager, function(err)
            {
                if(err)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the PreferenceManager");
                    self.notify("onConfigurationManagaerFailed", "PreferenceManager");
                    callback(err);
                }
                else
                {
                    self.mPreferenceManagerLoaded = true;
                    
                    //setup development handling for PreferenceManager
                    if (self.mConfig.development){
                        PreferenceManager.setupDevelopment(self.mConfig.development, callback);
                    }
                    
                    self._loadAnimationManager(callback);
                }
            });
        }
        else
        {
            self._loadAnimationManager(callback);
        }
    },

    /** @private */
    _loadAnimationManager : function(callback)
    {
        var self = this;
        if(this.mConfig.AnimationManager)
        {
            AnimationManager.loadConfigFromFile(this.mConfig.AnimationManager, function(err)
            {
                if(err)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the AnimationManager");
                    self.notify("onConfigurationManagaerFailed", "AnimationManager");
                    callback(err);
                }
                else
                {
                    self.mAnimationManagerLoaded = true; 
                    self._loadCameraManager(callback);
                }
            });
        }
        else
        {
            self._loadCameraManager(callback);
        }
    },

    /** @private */
    _loadCameraManager : function(callback)
    {
        var self = this;
        if(this.mConfig.CameraManager)
        {
            CameraManager.loadConfigFromFile(this.mConfig.CameraManager, function(err)
            {
                if(err)
                {
                    console.log("<NGGO> Error: ConfigurationManager could not load the CameraManager");
                    self.notify("onConfigurationManagaerFailed", "CameraManager");
                    callback(err);
                }
                else
                {
                    self.mCameraManagerLoaded = true;
                    
                    //setup development handling for CameraManager
                    if (self.mConfig.development){
                        CameraManager.setupDevelopment(self.mConfig.development, callback);
                    }
 
                    self.notify("onConfigurationManagaerSuccess", self);
                    self._loadFlowManager(callback);
                }
            });
        }
        else
        {
            self.notify("onConfigurationManagaerSuccess", self);
            self._loadFlowManager(callback);
        }
    },

    /** @private */
    _loadFlowManager : function(callback)
    {
        var self = this;
        if(this.mConfig.FlowManager)
        {

            Storage.FileSystem.readFile(this.mConfig.FlowManager, false, function(err, data)
            {
                if(err)
                {
                    console.log("<NGGO> Error: FlowManager failed to read file");
                    self.notify("onConfigurationManagaerFailed", "FlowManager");
                    callback(err);
                }
                else
                {
                    var networkDef = JSON.parse(data);
                    NGGoComponents.RegisterComponents();
                    FlowScriptManager.registerFlowNetwork("Main", networkDef);

                    FlowScriptManager.mainNetwork = FlowScriptManager.createFlowNetwork("Main");
                    FlowScriptManager.mainNetwork.open(); 
                    callback();
                }
            });
        }
        else
        {
            callback();
        }
    }
}, [Observable]);
