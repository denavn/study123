///////////////////////////////////////////////////////////////////////////////
/**
 *  @author    Shibukawa Yoshiki
 *  Website    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
//Require Block
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var SceneFactory = require('./SceneFactory').SceneFactory;
var VFXActions = require('../../Service/Graphics/VFXActions').VFXActions;
var ScreenManager = require('../../Service/Display/ScreenManager').ScreenManager;
var Transitions = require('./Transitions').Transitions;
//SceneTransition class
/** @private */
var SceneTransition = Class.singleton(
{
    Type: undefined,
    initialize: function ()
    {
        this.Type = SceneDirector.TransitionType;
        this._resetAll();
        this._enterTransitionDefault = this.Type.Left;
        this._exitTransitionDefault = this.Type.Right;
        this._enterTransitionType = this._enterTransitionDefault;
        this._exitTransitionType = this._exitTransitionDefault;
        this._transitions = [Transitions.LeftTransition, Transitions.RightTransition, Transitions.TopTransition, Transitions.BottomTransition, Transitions.FadeTransition, Transitions.TopLeftTransition, Transitions.TopRightTransition, Transitions.BottomLeftTransition, Transitions.BottomRightTransition, Transitions.ColorTransition];
        this._transitionCount = this._transitions.length;
        this._transitionTime = 2;
        this._completionCallback = null;
    },
    registerScene: function (scene, nodes)
    {
        var Scene = require('./Scene').Scene;
        if(scene instanceof Scene)
        {
            if(nodes instanceof Array)
            {
                var i, len = nodes.length;
                i = len;
                while(i--)
                {
                    if(!nodes[i] instanceof Node)
                    {
                        throw new Error(nodes[i], " should instance of GL2.Node");
                    }
                }
                scene.__nodes = nodes;
            }
            else
            {
                throw new Error(nodes, " should instance of Array");
            }
        }
        else
        {
            throw new Error(scene, " should instance of Scene");
        }
    },
    registerTransition: function (transition)
    {
        if(transition instanceof Transitions.Transition)
        {
            this._transitions.push(transition);
            this._transitionCount = this._transitions.length;
            return this._transitionCount - 1;
        }
        else
        {
            throw new Error(transition, " should instance of Transitions.Transition");
        }
    },
    getTransitionTime: function ()
    {
        return this._transitionTime;
    },
    setTransitionTime: function (transitionTime)
    {
        if(typeof (transitionTime) === "number" && !isNaN(transitionTime))
        {
            this._transitionTime = transitionTime;
        }
        else
        {
            throw new Error("transitionTime should be a number. Got " + typeof (transitionTime));
        }
    },
    isSceneRegistered: function ()
    {
        if(this._enterScene !== null || this._exitScene !== null)
        {
            return true;
        }
        return false;
    },
    start: function (completionCallback, completionCallbackExit, option)
    {
        var i, len, exitTransition, enterTransition, actions;
        var isRunning = false;
        this._completionCallback = completionCallback;
        this._completionCallbackExit = completionCallbackExit;
        if(this._exitScene)
        {
            exitTransition = this._transitions[this._exitTransitionType];
            if(!exitTransition)
            {
                exitTransition = this._transitions[this._exitTransitionDefault];
            }
            actions = exitTransition.outTransition(this._exitScene.__nodes, this._transitionTime, option);
            this._exitSequence = this._makeOutSequence(actions);
            this._exitScene.onExitTransitionStart(option);
            this._exitSequenceCount = this._exitSequence.length;
            i = len = this._exitSequenceCount;
            while(i--)
            {
                this._exitSequence[i].play(this._exitScene.__nodes[i], this._exitSequenceEnd.bind(this, i, option));
                isRunning = true;
            }
            this._runningTransExit = exitTransition;
        }
        else if(this._completionCallbackExit)
        {
            this._completionCallbackExit();
        }
        if(this._enterScene)
        {
            enterTransition = this._transitions[this._enterTransitionType];
            if(!enterTransition)
            {
                enterTransition = this._transitions[this._enterTransitionDefault];
            }
            actions = enterTransition.inTransition(this._enterScene.__nodes, this._transitionTime, option);
            this._enterSequence = this._makeInSequence(actions, enterTransition, exitTransition);
            this._enterScene.onEnterTransitionStart(option);
            this._enterSequenceCount = this._enterSequence.length;
            i = len = this._enterSequenceCount;
            while(i--)
            {
                this._enterSequence[i].play(this._enterScene.__nodes[i], this._enterSequenceEnd.bind(this, i, option));
                isRunning = true;
            }
            this._runningTransEnter = enterTransition;
        }
        if(!isRunning)
        {
            this._resetAll();
            if(this._completionCallback)
            {
                var callback = this._completionCallback;
                this._completionCallback = null;
                callback();
            }
        }
    },
    _register: function (enterScene, exitScene)
    {
        this._enterScene = this._isEligible(enterScene);
        this._exitScene = this._isEligible(exitScene);
    },
    _isEligible: function (scene)
    {
        if(scene)
        {
            if(scene.__nodes instanceof Array)
            {
                this._completionCount++;
                return scene;
            }
            else
            {
                throw new Error("Unregistered Scene found in SceneTransition. Register scene using SceneDirector.register(scene);");
            }
        }
        return null;
    },
    _makeOutSequence: function (actions)
    {
        var seq = [],
            i;
        for(i = 0; i < actions.length; i++)
        {
            seq.push(VFXActions.createSequence(actions));
        }
        return seq;
    },
    _makeInSequence: function (actions, enterTransition, exitTransition)
    {
        var shouldWait = (enterTransition && exitTransition && (enterTransition.getDoesHide() || exitTransition.getDoesHide()));
        var seq = [],
            i, len = actions.length;
        for(i = 0; i < len; i++)
        {
            var wait = null;
            if(shouldWait)
            {
                wait = VFXActions.waitFor(this._transitionTime);
                seq.push(VFXActions.createSequence([wait, actions[i]]));
            }
            else
            {
                seq.push(VFXActions.createSequence([actions[i]]));
            }
        }
        return seq;
    },
    _enterSequenceEnd: function (index, option)
    {
        this._enterSequenceCount--;
        this._enterSequence[index].destroy();
        if(this._enterSequenceCount <= 0)
        {
            if(this._enterScene)
            {
                this._runningTransEnter.restoreFromInTransition(this._enterScene.__nodes, option);
                this._enterScene.onEnterTransitionEnd(option);
            }
            this._transitionCompleted();
        }
    },
    _exitSequenceEnd: function (index, option)
    {
        this._exitSequenceCount--;
        this._exitSequence[index].destroy();
        if(this._exitSequenceCount <= 0)
        {
            if(this._exitScene)
            {
                this._runningTransExit.restoreFromOutTransition(this._exitScene.__nodes, option);
                this._exitScene.onExitTransitionEnd(option);
            }
            if(this._completionCallbackExit)
            {
                this._completionCallbackExit();
            }
            this._transitionCompleted();
        }
    },
    _transitionCompleted: function ()
    {
        this._completionCount--;
        if(this._completionCount === 0)
        {
            this._resetAll();
            if(this._completionCallback)
            {
                var callback = this._completionCallback;
                this._completionCallback = null;
                callback();
            }
        }
    },
    _resetEnterScene: function ()
    {
        this._enterScene = null;
        this._enterSequence = [];
        this._enterSequenceCount = 0;
        this._runningTransEnter = null;
    },
    _resetExitScene: function ()
    {
        this._exitScene = null;
        this._exitSequence = [];
        this._exitSequenceCount = 0;
        this._runningTransExit = null;
    },
    _resetAll: function ()
    {
        this._resetEnterScene();
        this._resetExitScene();
        this._completionCount = 0;
        this._completionCallbackExit = null;
    }
});
var SceneDirector = Class.singleton( /** @lends Framework.Scene.SceneDirector.prototype */
{
    classname: 'SceneDirector',
    /** 
     * Enumeration for Different types of Transitions. 
     * @namespace
     */
    $TransitionType: {
        /** On push, scene enters the screen from left side; On pop, scene exit's the screen from left side.*/
        Left: 0,
        /** On push, scene enters the screen from right side; On pop, scene exit's the screen from right side.*/
        Right: 1,
        /** On push, scene enters the screen from top side; On pop, scene exit's the screen from top side.*/
        Top: 2,
        /** On push, scene enters the screen from bottom side; On pop, scene exit's the screen from bottom side.*/
        Bottom: 3,
        /** On push, fade-in is applied; On pop, fade-out is applied.*/
        Fade: 4,
        /** On push, scene enters the screen from top left side; On pop, scene exit's the screen from top left side.*/
        TopLeft: 5,
        /** On push, scene enters the screen from top right side; On pop, scene exit's the screen from top right side.*/
        TopRight: 6,
        /** On push, scene enters the screen from bottom Left side; On pop, scene exit's the screen from bottom Left side.*/
        BottomLeft: 7,
        /** On push, scene enters the screen from bottom right side; On pop, scene exit's the screen from bottom right side.*/
        BottomRight: 8,
        /** On push, color out is applied; On pop, color in is applied.*/
        ColorTo: 9
    },
    /** @private */
    _Status: {
        Normal: 0,
        Enter: 1,
        Exit: 2,
        PopToRoot: 4,
        InTransition: 5,
        Processing: 6
    },
    /**
     * @class <code>SceneDirector</code> class is the framework of game structure.
     * Each game logic, parts are implemented in each scene, and these scenes are
     * assembled to create game.
     * Following parts become scene:
     * <ul>
     * <li>Full-screen Base Scene: title scene, setting scene, home scene, download screen.</li>
     * <li>Add-on Scene: store on home scene, friend list on social menu.</li>
     * <li>Dialog: confirmation dialog on store scene, result dialog on battle scene.</li>
     * </ul>
     * Scenes are created by extending <code>Scene</code> class, and initialize/destroy
     * codes are implemented in the event handler of the class.
     * Between scenes, you can use following transitions:
     * <ul>
     * <li>push: Adds new scene as child.</li>
     * <li>pop: Removes current scene and returns to parent.</li>
     * <li>transition: Remove current scene and goto new sibling scene.</li>
     * </ul>
     * @constructs Constructor for the object.
     * @name Framework.Scene.SceneDirector
     * @augments Core.Class
     */
    initialize: function ()
    {
        this._sceneStack = [];
        this._reservedScenes = {};
        this._status = this._Status.Normal;
        this._reservedPush = undefined;
        this._deferredQueue = [];
        SceneTransition.instantiate();
    },
    /**
     * Removes current scene and goto new sibling scene.
     * Parent scene is not changed and parent's event handler is not called.
     * Following event handlers are always called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code></li>
     * <li>New scnen's <code><a href="Framework.Scene.Scene.html#onEnter">onEnter()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * and <code><a href="#popToRoot">popToRoot()</a></code>.
     * @param {String|Framework.Scene.Scene} scene Scene object or string key for
     *       <code><a href="Framework.Scene.SceneFactory.html">SceneFactory</a></code>
     * @param {any} [option] This option is passed to event handlers.
     * @param {boolean} [enterTransition] Whether enter transition should be applied.
     * @param {boolean} [exitTransition] Whether exit transition should be applied.
     */
    transition: function (scene, option, enterTransition, exitTransition)
    {
        if(!this._isFree("transition"))
        {
            this._putInDeferredQueue("transition", [].slice.call(arguments));
            return;
        }
        this._status = this._Status.Processing;
        var enterScene = this._getSceneObject(scene);
        var exitScene = this._sceneStack.pop();
        this._sceneStack.push(enterScene);
        var exitFunc = exitScene ? exitScene.onExit.bind(exitScene) : null;
        this._processRequest(enterScene, exitScene, enterTransition, exitTransition, enterScene.onEnter.bind(enterScene), exitFunc, option);
    },
    /**
     * Adds and transits to new child scene.
     * Following event handlers are always called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onPause">onPause()</a></code></li>
     * <li>New scnen's <code><a href="Framework.Scene.Scene.html#onEnter">onEnter()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * and <code><a href="#popToRoot">popToRoot()</a></code>.
     * @param {String|Framework.Scene.Scene} scene Scene object or string key for
     *     <code><a href="Framework.Scene.SceneFactory.html">SceneFactory</a></code>
     * @param {any} [option] This option is passed to event handlers.
     * @param {boolean} [enterTransition] Whether enter transition should be applied.
     * @param {boolean} [exitTransition] Whether exit transition should be applied.
     */
    push: function (scene, option, enterTransition, exitTransition)
    {
        if(!this._isFree("push"))
        {
            this._putInDeferredQueue("push", [].slice.call(arguments));
            return;
        }
        this._status = this._Status.Processing;
        var enterScene = this._getSceneObject(scene);
        var exitScene = this.currentScene;
        this._sceneStack.push(enterScene);
        var exitFunc = exitScene ? exitScene.onPause.bind(exitScene) : null;
        this._processRequest(enterScene, exitScene, enterTransition, exitTransition, enterScene.onEnter.bind(enterScene), exitFunc, option);
    },
    /**
     * Removes current scene and returns to parent's scene.
     * Following event handlers are always called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code></li>
     * <li>New scene's <code><a href="Framework.Scene.Scene.html#onResume">onResume()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>.
     * @param {any} [option] This option is passed to event handlers.
     * @param {boolean} [enterTransition] Whether enter transition should be applied.
     * @param {boolean} [exitTransition] Whether exit transition should be applied.
     */
    pop: function (option, enterTransition, exitTransition)
    {
        if(!this._isFree("pop"))
        {
            this._putInDeferredQueue("pop", [].slice.call(arguments));
            return;
        }
        this._status = this._Status.Processing;
        var depth = this.depth;
        if(depth === 0)
        {
            this._status = this._Status.Normal;
            throw new Error("SceneDirector: No more scene to pop.");
        }
        var scenes = this._continuePop();
        var exitScene = scenes[0];
        var enterScene = undefined;
        var enterFunc = null;
        if(scenes[1])
        {
            enterScene = scenes[1];
            enterFunc = enterScene.onEnter.bind(enterScene);
            option = scenes[2];
        }
        else if(this.currentScene)
        {
            enterScene = this.currentScene;
            enterFunc = enterScene.onResume.bind(enterScene);
        }
        this._processRequest(enterScene, exitScene, enterTransition, exitTransition, enterFunc, exitScene.onExit.bind(exitScene), option, scenes[3]);
    },
    /**
     * Removes stacked scene, but root scene is remained.
     * Following event handlers are always called:
     * <ul>
     * <li>All scene's <a href="Framework.Scene.Scene.html#onExit"><code>onExit()</code></a> except root scene's one</li>
     * <li>All scene's <a href="Framework.Scene.Scene.html#onResume"><code>onResume()</code></a> except first scene's one</li>
     * </ul>
     * @param {Object} [option] This option is passed to event handlers.
     * @param {boolean} [enterTransition] Whether enter transition should be applied.
     * @param {boolean} [exitTransition] Whether exit transition should be applied.     
     */
    popToRoot: function (option, enterTransition)
    {
        if(!this._isFree("popToRoot"))
        {
            this._putInDeferredQueue("popToRoot", [].slice.call(arguments));
            return;
        }
        var currentScene, nextScene;
        if(this._sceneStack.length < 2)
        {
            return;
        }
        this._status = this._Status.Processing;
        while(this._sceneStack.length > 1)
        {
            currentScene = this._sceneStack.pop();
            nextScene = this.currentScene;
            this._status = this._Status.PopToRoot | this._Status.Exit;
            currentScene.onExit(nextScene, option);
            this._status = this._Status.Normal;
            this._checkForDeferredTask();
            this._status = this._Status.PopToRoot | this._Status.Enter;
            nextScene.onResume(currentScene, option);
            this._status = this._Status.Normal;
            this._checkForDeferredTask();
        }
        this._applyTransition(nextScene, undefined, enterTransition, false, null, null, option);
    },
    /**
     * Run several scenes. Until this transitions are ended, parent's <code><a href="Framework.Scene.Scene.html#onResume">onResume()</a></code>
     * is not called. Between these scenes, <code>onEnter()</code> and <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * are called.
     * @param {String|Framework.Scene.Scene[]} scenes This array of Scene objects or scene keys.
     * @param {Object} [option] It is passed to event handlers.
     * @param {Function} [callback] Callback function it is called all scenes are finished.
     * @param {boolean} [enterTransition] Whether enter transition should be applied.
     * @param {boolean} [exitTransition] Whether exit transition should be applied.     
     */
    sequentialTransition: function (scenes, option, callback, enterTransition, exitTransition)
    {
        if(!this._isFree("sequentialTransition"))
        {
            this._putInDeferredQueue("sequentialTransition", [].slice.call(arguments));
            return;
        }
        var firstscene = scenes.shift();
        if(scenes.length > 0)
        {
            this._reservedScenes[this.depth] = [scenes, option, callback];
        }
        if(firstscene)
        {
            this.push(firstscene, option, enterTransition, exitTransition);
        }
    },
    /**
     * Registers current scene object along with specified nodes for transition.
     * @param {Framework.Scene.Scene} scene Scene object.
     * @param {GL2.Node[]} sceneNodes Nodes to be registered with scene for transition.
     * @return {SceneDirector} returns this
     */
    registerScene: function (scene, sceneNodes)
    {
        SceneTransition.registerScene(scene, sceneNodes);
        return this;
    },
    /**
     * Registers a custom Transition.
     * @param {Framework.Scene.Transitions.Transition} transition Singleton Transition Class.
     * @return {number} returns numeric ID for the transition. Use this to specify custom Transition Type.
     */
    registerTransition: function (transition)
    {
        return SceneTransition.registerTransition(transition);
    },
    /**
     * Returns duration of Scene Transition
     * @return {number} returns duration of transition.
     */
    getTransitionTime: function ()
    {
        return SceneTransition.getTransitionTime();
    },
    /**
     * sets duration of Scene Transition.
     * @param {number} transitionTime duration of Scene Transition.
     * @return {SceneDirector} returns this.
     */
    setTransitionTime: function (transitionTime)
    {
        SceneTransition.setTransitionTime(transitionTime);
        return this;
    },
    /**
     * Returns true if SceneDirector is in Normal state. Otherwise false.
     * @return {Boolean} true or false.
     */
    isInTransition: function ()
    {
        return this._status !== this._Status.Normal ? true : false;
    },
    /**
     * It is active scene. If you change it, <code>transition()</code> is called.
     * @fieldOf Framework.Scene.SceneDirector
     * @type Framework.Scene.Scene
     */
    get currentScene()
    {
        return this._sceneStack[this._sceneStack.length - 1];
    },
    set currentScene(value)
    {
        this.transition(value);
    },
    /**
     * @field Current stacked scene number.
     * @type Number
     */
    get depth()
    {
        return this._sceneStack.length;
    },
    /** @private */
    set depth(value)
    {
        throw new Error("depth property is readonly");
    },
    /**
     * @field Enter Transition Type. Use SceneDirector.TransitionType or number returned by SceneDirector.registerTransition(customTransition)
     * @type Number
     */
    get EnterTransitionType()
    {
        return SceneFactory._enterTransitionType;
    },
    /** @private */
    set EnterTransitionType(value)
    {
        if(typeof (value) === "number" && !isNaN(value) && value < SceneTransition._transitionCount)
        {
            SceneTransition._enterTransitionType = value;
        }
        else
        {
            throw new Error('value should be a numeric ID of a registered Transiton');
        }
    },
    /**
     * @field Exit Transition Type. Use SceneDirector.TransitionType or number returned by SceneDirector.registerTransition(customTransition)
     * @type Number
     */
    get ExitTransitionType()
    {
        return SceneFactory._exitTransitionType;
    },
    /** @private */
    set ExitTransitionType(value)
    {
        if(typeof (value) === "number" && !isNaN(value) && value < SceneTransition._transitionCount)
        {
            SceneTransition._exitTransitionType = value;
        }
        else
        {
            throw new Error('value should be a numeric ID of a registered Transiton');
        }
    },
    /** @private
     *  only for unittest.
     */
    _clearAll: function ()
    {
        this._sceneStack = [];
        this._reservedScenes = {};
        this._status = this._Status.Normal;
    },
    _continuePop: function ()
    {
        var depth = this.depth;
        var reservedScenes = this._reservedScenes[depth - 1];
        var currentScene = this._sceneStack.pop();
        var callback;
        var option;
        if(reservedScenes !== undefined)
        {
            var nextReservedScene = this._getSceneObject(reservedScenes[0].shift());
            option = reservedScenes[1];
            if(nextReservedScene !== undefined)
            {
                this._sceneStack.push(nextReservedScene);
                return [currentScene, nextReservedScene, option, undefined];
            }
            else
            {
                callback = reservedScenes[2];
                delete this._reservedScenes[depth - 1];
            }
        }
        return [currentScene, undefined, option, callback];
    },
    _isFree: function (funcName)
    {
        switch(this._status)
        {
        case this._Status.InTransition:
            console.log("SceneDirector: Doesn't support ", funcName, "() during Scene Transition");
            break;
        case this._Status.Processing:
            console.log("SceneDirector: Doesn't support ", funcName, "() while processing an existing Request");
            break;
        case this._Status.Exit:
            console.log("SceneDirector: Doesn't support ", funcName, "() during onExit/OnPause");
            break;
        case this._Status.Enter:
            console.log("SceneDirector: Doesn't support ", funcName, "() during onEnter/onResume");
            break;
        case this._Status.PopToRoot | this._Status.Exit:
        case this._Status.PopToRoot | this._Status.Enter:
            console.log("SceneDirector: Doesn't support ", funcName, "() during popToRoot()");
            break;
        default:
            return true;
        }
        return false;
    },
    _processRequest: function (enterScene, exitScene, enterTransition, exitTransition, enteringSceneFunc, exitingSceneFunc, option, callback)
    {
        enterTransition = !! enterTransition;
        exitTransition = !! exitTransition;
        if((exitTransition && enterTransition) && enteringSceneFunc)
        {
            enteringSceneFunc(exitScene, option);
            enteringSceneFunc = null;
        }
        else if(!exitTransition && enterTransition)
        {
            if(exitingSceneFunc)
            {
                exitingSceneFunc(enterScene, option);
                exitingSceneFunc = null;
            }
            if(enteringSceneFunc)
            {
                enteringSceneFunc(exitScene, option);
                enteringSceneFunc = null;
            }
        }
        this._applyTransition(enterScene, exitScene, enterTransition, exitTransition, enteringSceneFunc, exitingSceneFunc, option, callback);
    },
    _applyTransition: function (enterScene, exitScene, enterTransition, exitTransition, enteringSceneFunc, exitingSceneFunc, option, callback)
    {
        this._status = this._Status.InTransition;
        var scene1 = enterTransition ? enterScene : null;
        var scene2 = exitTransition ? exitScene : null;
        SceneTransition._register(scene1, scene2);
        var completionCBExit = this._completionCallbackExit.bind(this, enterScene, exitingSceneFunc, option);
        var completionCB = this._completionCallback.bind(this, enterScene, exitScene, enterTransition, exitTransition, enteringSceneFunc, option, callback);
        SceneTransition.start(completionCB, completionCBExit, option);
    },
    _completionCallback: function (enterScene, exitScene, enterTransition, exitTransition, enteringSceneFunc, option, callback)
    {
        this._status = this._Status.Processing;
        if(((exitTransition && !enterTransition) || (!exitTransition && !enterTransition)) && enteringSceneFunc)
        {
            this._status = this._Status.Enter;
            enteringSceneFunc(exitScene, option);
            this._status = this._Status.Processing;
        }
        if(callback)
        {
            callback(option);
        }
        this._status = this._Status.Normal;
        this._checkForDeferredTask();
    },
    _completionCallbackExit: function (enterScene, exitingSceneFunc, option)
    {
        if(exitingSceneFunc)
        {
            var oldStatus = this._status;
            this._status = this._Status.Exit;
            exitingSceneFunc(enterScene, option);
            this._status = oldStatus;
        }
    },
    _getSceneObject: function (keyOrObj)
    {
        var scene = SceneFactory.getSceneObject(keyOrObj);
        var Scene = require("./Scene").Scene;
        if(!scene instanceof Scene)
        {
            throw new Error("Expected instanceof Scene found " + typeof (scene));
        }
        return scene;
    },
    _putInDeferredQueue: function (funcName, args)
    {
        console.log("Request Being Put in Deffered Queue.");
        var request = {};
        request.funcName = funcName;
        request.args = args;
        this._deferredQueue.push(request);
    },
    _checkForDeferredTask: function ()
    {
        if(this._deferredQueue.length > 0)
        {
            var request = this._deferredQueue.shift();
            this[request.funcName].apply(this, request.args);
        }
    }
});
exports.SceneDirector = SceneDirector;