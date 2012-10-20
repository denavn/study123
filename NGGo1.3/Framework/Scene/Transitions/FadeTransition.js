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
////////////////////////////////////////////////////////////////////////////////
exports.FadeTransition = Transition.singleton(
{
    classname: 'FadeTransition',
    initialize: function ()
    {},
    inTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var actions = [];
        for(i = 0; i < len; i++)
        {
            var orgAlpha = nodes[i].getAlpha();
            nodes[i].setAlpha(0);
            actions.push(VFXActions.alphaTo(time, orgAlpha));
        }
        return actions;
    },
    outTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var actions = [];
        for(i = 0; i < len; i++)
        {
            nodes[i].__orgAlpha = nodes[i].getAlpha();
            actions.push(VFXActions.alphaTo(time, 0));
        }
        return actions;
    },
    restoreFromOutTransition: function (nodes, option)
    {
        var i, len = nodes.length;
        for(i = 0; i < len; i++)
        {
            nodes[i].setAlpha(nodes[i].__orgAlpha);
            delete nodes[i].__orgAlpha;
        }
        return this;
    }
});