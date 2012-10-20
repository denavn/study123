////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Taha Samad
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class = require('../../../../NGCore/Client/Core/Class').Class;
////////////////////////////////////////////////////////////////////////////////
exports.Transition = Class.subclass( /** @lends Framework.Scene.Transitions.Transition.prototype */
{
    classname: 'Transition',
    /**
     * @class This <code>Transition</code> class is a base class for Scene Transitions.
     * You can implement Transition specific code in the child singleton classes.
     * @constructs Constructor for the object.
     * @name Framework.Scene.Transitions.Transition
     * @augments Core.Class
     */
    initialize: function ()
    {
        this._doesHide = false;
    },
    /**
     * This method returns Actions/Sequence/Spawn array for Entering Transition of this type. 
     * This function is called from SceneDirector.
     * @param {Array} nodes array of nodes on which transition is to be applied.
     * @param {number} time duration of transition.
     * @param {any} [option] Option passed to SceneDirector.
     * @return {Array} Array of Actions/Sequence/Spawn. The length of Array should be equal to the length of nodes input parameter.
     */
    inTransition: function (nodes, time, option)
    {
        throw new Error('This Method Needs to be Implemented.');
    },
    /**
     * This method returns Actions/Sequence/Spawn array for Exiting Transition of this type.
     * This function is called from SceneDirector. 
     * @param {Array} nodes array of nodes on which transition is to be applied.
     * @param {number} time duration of transition.
     * @param {any} [option] Option passed to SceneDirector.
     * @return {Array} Array of Actions/Sequence/Spawn. The length of Array should be equal to the length of nodes input parameter.
     */
    outTransition: function (nodes, time, option)
    {
        throw new Error('This Method Needs to be Implemented.');
    },
    /**
     * This method is called at end of Entering Transition. You can restore defaults of nodes in this function.
     * This function is called from SceneDirector. 
     * @param {Array} nodes array of nodes on which transition was applied.
     * @param {any} [option] Option passed to SceneDirector.
     * @return {Transition} this
     */
    restoreFromInTransition: function (nodes, option)
    {
        return this;
    },
    /**
     * This method is called at end of Exiting Transition. You can restore defaults of nodes in this function.
     * This function is called from SceneDirector. 
     * @param {Array} nodes array of nodes on which transition was applied.
     * @param {any} [option] Option passed to SceneDirector.
     * @return {Transition} this
     */
    restoreFromOutTransition: function (nodes, option)
    {
        return this;
    },
    /**
     * This method is used by SceneDirector to judge whether a Transition can be applied in concurrence with another Transition. 
     * By Default this is false. Set _doesHide true incase your transition hides other transition under it. 
     * e.g ColorTransition is an example of such transition
     * @return {boolean} doesHide(true/false)
     */
    getDoesHide: function ()
    {
        return this._doesHide;
    }
});