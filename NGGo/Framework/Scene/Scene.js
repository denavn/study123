////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class         = require('../../../NGCore/Client/Core/Class').Class;
var SceneDirector = require('./SceneDirector').SceneDirector;

////////////////////////////////////////////////////////////////////////////////
exports.Scene = Class.subclass(
/** @lends Framework.Scene.Scene.prototype */
{
    classname: 'Scene',
    sceneName: undefined,
    /**
     * @class This <code>Scene</code> class is a base class of scene object.
     * You can implement scene specific code into these sub classes.
     * It has 4 event handlers. they are called in the transition between scenes.
     * In these event handlers, load or destroy assets which is needed in the scene,
     * create/destroy UI/GL2 scene graph and so on.
     * @constructs Constructor for the object.
     * @name Framework.Scene.Scene
     * @augments Core.Class
     */
    initialize: function() {},
    /**
     * Closes current scene and transits to the parent scene.
     * @param {Object} [option] This is passed to current scene's <code>onExit()</code> and parent's <code>onResume()</code>.
     */
    exit: function(option)
    {
        SceneDirector.pop(option);
    },
    /**
     * If this scene is pushed as new scene, this event handler is called.
     * @param {Framework.Scene.Scene} prevScene parent scene object.
     * @param {any} option This is option value passed at pop() and push() method.
     */
    onEnter: function(prevScene, option) {},
    /**
     * If child scene is closed and return to this scene, this event handler is called.
     * @param {Framework.Scene.Scene} prevScene child scene object.
     * @param {any} option This is option value passed at pop() and push() method.
     */
    onResume: function(prevScene, option) {},
    /**
     * If child scene is pushed and transit to next scene, this event handler is called.
     * In this method, you can't use <code>SceneDirector.push()</code> and
     * <code>SceneDirector.pop()</code> and <code>SceneDirector.transition()</code>
     * @param {Framework.Scene.Scene} nextScene child scene object.
     * @param {any} option This is option value passed at pop() and push() method.
     */
    onPause: function(nextScene, option) {},
    /**
     * If current scene is closed and return to parent scene, this event handler is called.
     * In this method, you can't use <code>SceneDirector.push()</code> and
     * <code>SceneDirector.pop()</code> and <code>SceneDirector.transition()</code>
     * @param {Framework.Scene.Scene} nextScene parent scene object.
     * @param {any} option This is option value passed at pop() and push() method.
     */
    onExit: function(nextScene, option) {}
});
