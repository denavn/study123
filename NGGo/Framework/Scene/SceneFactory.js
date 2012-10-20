////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class = require('../../../NGCore/Client/Core/Class').Class;

////////////////////////////////////////////////////////////////////////////////
exports.SceneFactory = Class.singleton(
/** @lends Framework.Scene.SceneFactory.prototype */
{
    classname: 'SceneFactory',
    /**
     * @class This <code>SceneFactory</code> class returns Scene objects they are
     * needed in <code>SceneDirector</code>. In <code>SceneDirector</code>, you
     * can use actual instance of subclass of Scene class or string key which is
     * registered in this class.
     * @example // Use by object
     * SceneDirector.push(new TitleScene());
     * // Use by string key with SceneFactory
     * SceneFactory.register(TitleScene, "title");
     * SceneDirector.push("title");
     * @name Framework.Scene.SceneFactory
     * @constructs This is singleton class.
     * @augments Core.Class
     */
    initialize: function()
    {
        this._register = {};
    },
    /**
     * Register scene class. If the scene class has <code>sceneName</code> property,
     * you can omit <code>name</code> argument.
     * @param {Framework.Scene.Scene} scene Subclass of <code>Scene</code> class.
     * @param {String} name Scene name.
     */
    register: function(scene, name)
    {
        name = name || scene.sceneName;
        if(!name)
        {
            throw new Error("SceneDirector: Scene name is not available");
        }
        this._register[name] = scene;
    },
    /**
     * Returns actual Scene instance. if the parameter is string,
     * this method searchs from registered class and creates and returns the instance.
     * Else, this method returns input value.
     * @param {String|Framework.Scene.Scene} keyOrSceneObject Scene object or search key.
     * @returns {Framework.Scene.Scene|undefined} Found scene object. If object is not registered, returns <code>undefined</code>.
     */
    getSceneObject: function(keyOrSceneObject)
    {
        if (keyOrSceneObject instanceof String || typeof keyOrSceneObject === "string")
        {
            var sceneClass = this._register[keyOrSceneObject];
            if (sceneClass) {
                return new sceneClass();
            }
            return undefined;
        }
        return keyOrSceneObject;
    },
    /** @private
     *  only for unittest.
     */
    _clearAll: function()
    {
        this._register = {};
    }
});
