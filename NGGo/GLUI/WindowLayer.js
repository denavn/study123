////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizunou T.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Element = require('./Element').Element;
var AbstractView = require('./AbstractView').AbstractView;
var Root = require('../../NGCore/Client/GL2/Root').Root;

/** @private
 *  This ENTIRE CLASS is private.
 */
exports.WindowLayer = Element.subclass( /** @lends GLUI.WindowLayer.prototype */
{
    'type': 'WindowLayer',
    initialize: function ($super, props)
    {
        this._children = [];
        this._visible = true;
    },
    getRoot: function ()
    {
        return this;
    },
    getParent: function ()
    {
        return undefined;
    },

    getGLObject: function ()
    {
        return Root;
    },
    addChild: function (childNode, index)
    {
        if (childNode instanceof AbstractView)
        {
            if (childNode._parent)
            {
                childNode.removeFromParent();
            }
            if (this._children)
            {

                if ((index === 0 || index > 0) && index < this._children.length)
                {
                    index = +index;
                    this._children.splice(index, 0, childNode);
                }
                else
                {
                    index = this._children.length;
                    this._children.push(childNode);
                }
            }
            childNode._parent = this;
        }
        else
        {
            throw new Error("message:" + this.type + ".addChild: " + childNode + " is not an Instance of AbstractView!");
        }
        try
        {
            Root.addChild(childNode.getGLObject());
            childNode._parent = this;
            this._updateDepth();
        }
        catch (ex)
        {
            throw new Error(ex);
        }
    },
    _updateDepth: function ()
    {
        var i;
        if (this._children)
        {
            for (i = 0; i < this._children.length; i++)
            {
                if (this._children[i])
                {
                    this._children[i].getGLObject().setDepth(i + 1);
                }
            }
        }
    },
    removeChild: function (childNode)
    {
        try
        {
            var nodeIndex = this._children.indexOf(childNode);
            if (nodeIndex !== -1)
            {
                this._children.splice(nodeIndex, 1);
            }
            Root.removeChild(childNode.getGLObject());
            childNode._parent = null;
            this._updateDepth();

        }
        catch (ex)
        {
            throw new Error(ex);
        }
    },
    getChildCount: function ()
    {
        return this._children.length;
    },
    getChildren: function ()
    {
        return this._children.slice();
    }
});
