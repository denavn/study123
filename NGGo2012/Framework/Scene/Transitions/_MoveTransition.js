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
var ScreenManager = require('../../../Service/Display/ScreenManager').ScreenManager;
var Point = require('../../../../NGCore/Client/Core/Point').Point;
var Capabilities = require('../../../../NGCore/Client/Core/Capabilities').Capabilities;
var OrientationEmitter = require('../../../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
////////////////////////////////////////////////////////////////////////////////
exports.MoveTransition = Transition.subclass(
{
    classname: 'MoveTransition',
    initialize: function ()
    {},
    inTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var actions = [];
        for(i = 0; i < len; i++)
        {
            var offset = this._getOffset(nodes[i], option);
            var orgPos = null,
                x, y;
            orgPos = nodes[i].getPosition();
            x = orgPos.getX();
            y = orgPos.getY();
            nodes[i].setPosition(offset.getX() + x, offset.getY() + y);
            actions.push(VFXActions.moveTo(time, [x, y]));
        }
        return actions;
    },
    outTransition: function (nodes, time, option)
    {
        var i, len = nodes.length;
        var actions = [];
        for(i = 0; i < len; i++)
        {
            var offset = this._getOffset(nodes[i], option);
            var orgPos = null;
            orgPos = nodes[i].getPosition();
            var x = orgPos.getX();
            var y = orgPos.getY();
            nodes[i].__orgPos = [x, y];
            actions.push(VFXActions.moveTo(time, [x + offset.getX(), y + offset.getY()]));
        }
        return actions;
    },
    restoreFromOutTransition: function (nodes, option)
    {
        var i, len = nodes.length,
            orgPos;
        for(i = 0; i < len; i++)
        {
            orgPos = nodes[i].__orgPos;
            nodes[i].setPosition(orgPos);
            delete nodes[i].__orgPos;
        }
        return this;
    },
    _getOffset: function (node, option)
    {
        var nodeParent, newPosition, position, isScreenManagerUsed = false,
            result = new Point(0, 0);
        if(option && option.screenName && typeof option.screenName === "string")
        {
            newPosition = position = new Point(ScreenManager.logicalSize);
            isScreenManagerUsed = true;
        }
        else
        {
            var orient = OrientationEmitter.getInterfaceOrientation();
            switch(orient)
            {
            case OrientationEmitter.Orientation.LandscapeLeft:
            case OrientationEmitter.Orientation.LandscapeRight:
                position = new Point(Capabilities.getScreenHeight(), Capabilities.getScreenWidth());
                break;
            case OrientationEmitter.Orientation.Portrait:
            case OrientationEmitter.Orientation.PortraitUpsideDown:
            default:
                position = new Point(Capabilities.getScreenWidth(), Capabilities.getScreenHeight());
                break;
            }
        }
        if(node)
        {
            nodeParent = node.getParent();
            if(nodeParent)
            {
                if(!isScreenManagerUsed)
                {
                    newPosition = nodeParent.screenToLocal(position);
                }
                if(newPosition)
                {
                    this._getNewPosition(newPosition, result);
                }
            }
        }
        return result;
    },
    _getNewPosition: function (newPosition, result)
    {
        throw new Error('This method needs to be implemented.');
    }
});