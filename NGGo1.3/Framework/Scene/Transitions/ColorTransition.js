////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Taha Samad
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// Require Block
var Transition = require('./Transition').Transition;
var VFXActions = require('../../../Service/Graphics/VFXActions').VFXActions;
var Color = require('../../../../NGCore/Client/Core/Color').Color;
////////////////////////////////////////////////////////////////////////////////
exports.ColorTransition = Transition.singleton( /** @lends Framework.Scene.Transitions.ColorTransition.prototype */
{
    classname: 'ColorTransition',
    /**
     * @class This <code>ColorTransition</code> class provides Color In/Out Scene Transition.
     * @name Framework.Scene.Transitions.ColorTransition
     * @augments Framework.Scene.Transitions
     */
    initialize: function ()
    {
        this._doesHide = true;
        this._color = new Color(1, 0, 0);
    },
    inTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var seq = [];
        for(i = 0; i < len; i++)
        {
            var actions = [];
            var color = nodes[i].getColor();
            var orgColor = [color.getRed(), color.getGreen(), color.getBlue()];
            nodes[i].setColor([this._color.getRed(), this._color.getGreen(), this._color.getBlue()]);
            var orgAlpha = nodes[i].getAlpha();
            nodes[i].setAlpha(0);
            actions.push(VFXActions.alphaTo(0, orgAlpha));
            actions.push(VFXActions.colorTo(time, orgColor[0], orgColor[1], orgColor[2]));
            seq.push(VFXActions.createSequence(actions));
        }
        return seq;
    },
    outTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var actions = [];
        for(i = 0; i < len; i++)
        {
            var color = nodes[i].getColor();
            nodes[i].__orgColor = [color.getRed(), color.getGreen(), color.getBlue()];
            actions.push(VFXActions.colorTo(time, this._color.getRed(), this._color.getGreen(), this._color.getBlue()));
        }
        return actions;
    },
    restoreFromOutTransition: function (nodes, option)
    {
        var i, len = nodes.length;
        for(i = 0; i < len; i++)
        {
            nodes[i].setColor(nodes.__orgColor);
            delete nodes[i].__orgColor;
        }
        return this;
    },
    /**
     * get the color which is used for Transition.
     * @return {Core.Color} color used for Transition.
     */
    getTransitionColor: function ()
    {
        return this._color;
    },
    /**
     * set the color used for Transition. This function accepts all overloadings that Core.Color provides.
     * @param {Core.Color} color Color object.
     * @return {ColorTransition} returns this.
     */
    setTransitionColor: function (color)
    {
        var args = arguments;
        this._color.setAll.apply(this._color, args);
        return this;
    }
});