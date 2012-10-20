///////////////////////////////////////////////////////////////////////////////
/**
 *  @author    Shibukawa Yoshiki
 *  Website    https://developer.mobage.com/
 *  Copyright  2011, by DeNA Co., Ltd
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class = require('../../../NGCore/Client/Core/Class').Class;
var SceneFactory = require('./SceneFactory').SceneFactory;


exports.SceneDirector = Class.singleton(
/** @lends Framework.Scene.SceneDirector.prototype */
{
    classname: 'SceneDirector',
    /** @private */
    _Status:
    {
        Normal: 0,
        Enter: 1,
        Exit: 2,
        PopToRoot: 4
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
    initialize: function()
    {
        this._sceneStack = [];
        this._reservedScenes = {};
        this._status = this._Status.Normal;
        this._reservedPush = undefined;
    },
    /**
     * Removes current scene and goto new sibling scene.
     * Parent scene is not changed and parent's event handler is not called.
     * Following event handler is called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code></li>
     * <li>New scnen's <code><a href="Framework.Scene.Scene.html#onEnter">onEnter()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * and <code><a href="#popToRoot">popToRoot()</a></code>.
     * @param {String|Framework.Scene.Scene} scene Scene object or string key for
     *       <code><a href="Framework.Scene.SceneFactory.html">SceneFactory</a></code>
     * @param {any} [option] This option is passed to event handlers.
     */
    transition: function(scene, option)
    {
        switch(this._status)
        {
        case this._Status.Exit:
            throw new Error("SceneDirector: Doesn't support transition() during onExit");
        case this._Status.PopToRoot | this._Status.Exit:
        case this._Status.PopToRoot | this._Status.Enter:
            throw new Error("SceneDirector: Doesn't support transition() during popToRoot()");
        }
        var sceneObj = SceneFactory.getSceneObject(scene);
        if (this._sceneStack.length === 0)
        {
            this.runScene(sceneObj, option);
            return;
        }
        var currentScene = this._sceneStack.pop();
        this._sceneStack.push(sceneObj);

        currentScene.onExit(sceneObj, option);
        sceneObj.onEnter(currentScene, option);
    },
    /**
     * Adds and transits to new child scene.
     * Following event handler is called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onPause">onPause()</a></code></li>
     * <li>New scnen's <code><a href="Framework.Scene.Scene.html#onEnter">onEnter()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * and <code><a href="#popToRoot">popToRoot()</a></code>.
     * @param {String|Framework.Scene.Scene} scene Scene object or string key for
     *     <code><a href="Framework.Scene.SceneFactory.html">SceneFactory</a></code>
     * @param {any} [option] This option is passed to event handlers.
     */
    push: function(scene, option)
    {
        switch(this._status)
        {
        case this._Status.Exit:
            throw new Error("SceneDirector: Doesn't support push() during onExit");
        case this._Status.PopToRoot | this._Status.Exit:
        case this._Status.PopToRoot | this._Status.Enter:
            throw new Error("SceneDirector: Doesn't support push() during popToRoot()");
        }
        var sceneObj = SceneFactory.getSceneObject(scene);
        var currentScene = this.currentScene;
        this._sceneStack.push(sceneObj);
        if(currentScene)
        {
            this._status = this._Status.Exit;
            currentScene.onPause(sceneObj, option);
            this._status = this._Status.Normal;
            sceneObj.onEnter(currentScene, option);
        }
        else
        {
            sceneObj.onEnter(null, option);
        }
    },
    /**
     * Removes current scene and returns to parent's scene.
     * Following event handler is called:
     * <ul>
     * <li>Old scene's <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code></li>
     * <li>New scnen's <code><a href="Framework.Scene.Scene.html#onResume">onResume()</a></code></li>
     * </ul>
     * This method is not available in <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>.
     * @param {any} [option] This option is passed to event handlers.
     */
    pop: function(option)
    {
        var depth = this.depth;
        if (depth === 0)
        {
            throw new Error("SceneDirector: No more scene to pop is not exit.");
        }
        switch(this._status)
        {
        case this._Status.Exit:
        case this._Status.PopToRoot | this._Status.Exit:
            throw new Error("SceneDirector: Doesn't support pop() during onExit");
        }
        var reservedScenes = this._reservedScenes[depth-1];
        var currentScene = this._sceneStack.pop();
        var callback;
        if (reservedScenes !== undefined)
        {
            var nextReservedScene = reservedScenes[0].shift();
            option = reservedScenes[1];
            if (nextReservedScene !== undefined)
            {
                this._sceneStack.push(nextReservedScene);
                this._status = this._Status.Exit;
                currentScene.onExit(nextReservedScene, option);
                this._status = this._Status.Normal;
                nextReservedScene.onEnter(currentScene, option);
                return;
            }
            else
            {
                callback = reservedScenes[2];
                delete this._reservedScenes[depth-1];
            }
        }
        var nextScene = this.currentScene || null;
        this._status = this._Status.Exit;
        currentScene.onExit(nextScene, option);
        this._status = this._Status.Normal;
        if(nextScene)
        {
            nextScene.onResume(currentScene, option);
        }
        if(callback)
        {
            callback(option);
        }
    },
    /**
     * Removes stacked scene, but root scene is remained.
     * Following event handler is called:
     * <ul>
     * <li>All scene's <a href="Framework.Scene.Scene.html#onExit"><code>onExit()</code></a> except root scene's one</li>
     * <li>All scnen's <a href="Framework.Scene.Scene.html#onResume"><code>onResume()</code></a> except first scene's one</li>
     * </ul>
     * @param {Object} [option] This option is passed to event handlers.
     */
    popToRoot: function(option) {
        if (this._sceneStack.length < 2)
        {
            return;
        }
        while(this._sceneStack.length > 1)
        {
            var currentScene = this._sceneStack.pop();
            var nextScene    = this.currentScene;
            this._status = this._Status.PopToRoot | this._Status.Exit;
            currentScene.onExit(nextScene, option);
            this._status = this._Status.PopToRoot | this._Status.Enter;
            nextScene.onResume(currentScene, option);
        }
        this._status = this._Status.Normal;
    },
    /**
     * Run several scenes. Until this transitions are ended, parent's <code><a href="Framework.Scene.Scene.html#onResume">onResume()</a></code>
     * is not called. Between these scenes, <code>onEnter()</code> and <code><a href="Framework.Scene.Scene.html#onExit">onExit()</a></code>
     * are called.
     * @param {String|Framework.Scene.Scene[]} scenes This array of Scene objects or scene keys.
     * @param {Object} [option] It is passed to event handlers.
     * @param {Function} [callback] Callback function it is called all scenes are finished.
     */
    sequentialTransition: function(scenes, option, callback)
    {
        var firstscene = scenes.shift();
        if (scenes.length > 0)
        {
            this._reservedScenes[this.depth] = [scenes, option, callback];
        }
        if (firstscene)
        {
            this.push(firstscene, option);
        }
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
    /** @private
     *  only for unittest.
     */
    _clearAll: function()
    {
        this._sceneStack = [];
        this._reservedScenes = {};
        this._status = this._Status.Normal;
    }
});

