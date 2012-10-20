// Commented out components were removed for 1.1 release.  Will be in 1.2

var FlowScriptManager       = require('../FlowScriptManager').FlowScriptManager;
var Camera                  = require('./Camera').Camera;
//var Composite               = require('./Composite').Composite;
var Filter                  = require('./Filter').Filter;
var Log                     = require('./Log').Log;
var MotionFactory           = require('./Motion').MotionFactory;
var MotionPlayer            = require('./Motion').MotionPlayer;
//var Selector                = require('./Selector').Selector;
var Simulator               = require('./Simulator').Simulator;
var SoundEffect             = require('./SoundEffect').SoundEffect;
var SongPlayer              = require('./SongPlayer').SongPlayer;
var SpriteFactory           = require('./SpriteFactory').SpriteFactory;
var BlackBoard              = require('./BlackBoard').BlackBoard;
var FlowFactory             = require('./FlowFactory').FlowFactory;
var Gate                    = require('./Gate').Gate;
var XHR                     = require('./XHR').XHR;
var SpriteAnimation         = require('./SpriteAnimation').SpriteAnimation;

var OnScriptStart           = require('./OnScriptStart').OnScriptStart;
var ExitScript              = require('./ExitScript').ExitScript;
var ScreenManagerComponent  = require('./ScreenManagerComponent').ScreenManagerComponent;
//var PhysicsFactory          = require('./PhysicsFactory').PhysicsFactory;

exports.NGGoComponents = {
    RegisterComponents : function()
    {
        //FlowScriptManager.registerComponent(Composite.factoryUUID, Composite);
        FlowScriptManager.registerComponent(Filter.factoryUUID, Filter);
        FlowScriptManager.registerComponent(Log.factoryUUID, Log);
        FlowScriptManager.registerComponent(MotionFactory.factoryUUID, MotionFactory);
        //FlowScriptManager.registerComponent(Selector.factoryUUID, Selector);
        FlowScriptManager.registerComponent(Simulator.factoryUUID, Simulator);
        FlowScriptManager.registerComponent(SpriteFactory.factoryUUID, SpriteFactory);
        FlowScriptManager.registerComponent(Camera.factoryUUID, Camera);
        FlowScriptManager.registerComponent(BlackBoard.factoryUUID, BlackBoard);
        FlowScriptManager.registerComponent(MotionPlayer.factoryUUID, MotionPlayer);
        FlowScriptManager.registerComponent(SoundEffect.factoryUUID, SoundEffect);
        FlowScriptManager.registerComponent(SongPlayer.factoryUUID, SongPlayer);
        FlowScriptManager.registerComponent(FlowFactory.factoryUUID, FlowFactory);
        FlowScriptManager.registerComponent(Gate.factoryUUID, Gate);
        FlowScriptManager.registerComponent(XHR.factoryUUID, XHR);
        FlowScriptManager.registerComponent(SpriteAnimation.factoryUUID, SpriteAnimation);
        
        FlowScriptManager.registerComponent(OnScriptStart.factoryUUID, OnScriptStart);
        FlowScriptManager.registerComponent(ExitScript.factoryUUID, ExitScript);
        FlowScriptManager.registerComponent(ScreenManagerComponent.factoryUUID, ScreenManagerComponent);
        //FlowScriptManager.registerComponent(PhysicsFactory.factoryUUID, PhysicsFactory);
    }
};
