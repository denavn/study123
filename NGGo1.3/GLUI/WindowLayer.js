////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno T.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Element = require('./Element').Element;
var AbstractView = require('./AbstractView').AbstractView;
var Root = require('../../NGCore/Client/GL2/Root').Root;
var View = require('./View').View;
////////////        UI Components       //////////////
var EditText = require('../../NGCore/Client/UI/EditText').EditText;
var EditTextArea = require('../../NGCore/Client/UI/EditTextArea').EditTextArea;
var WebView = require('../../NGCore/Client/UI/WebView').WebView;
var MapView = require('../../NGCore/Client/UI/MapView').MapView;
var UIWindow = require('../../NGCore/Client/UI/Window').Window;
/** @private
 *  This ENTIRE CLASS is private.
 */
exports.WindowLayer = Element.subclass( /** @lends GLUI.WindowLayer.prototype */
{
    'type': 'WindowLayer',
    initialize: function ($super, props)
    {
        this._children = [];
        this._uiChildren = [];
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
            try
            {
                Root.addChild(childNode.getGLObject());
                childNode._parent = this;
                this._updateDepth();
                childNode._callAppearanceEvent(false);
                var Button = require('./Button').Button;
                if (childNode instanceof View && !(childNode instanceof Button))
                {
                    childNode._addedToParent();
                }
            }
            catch (ex)
            {
                throw new Error(ex);
            }
        }
        else if ((childNode instanceof EditText) || (childNode instanceof EditTextArea) || (childNode instanceof WebView) || (childNode instanceof MapView))
        {
            if (this._uiChildren.indexOf(childNode) === -1)
            {
                this._uiChildren.push(childNode); // maintaining array
                UIWindow.document.addChild(childNode);
                childNode._parent = this;
            }
        }
        else
        {
            throw new Error("message:" + this.type + ".addChild: " + childNode + " is not an Instance of AbstractView!");
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
        var nodeIndex;
        if (childNode instanceof AbstractView)
        {
            try
            {
                nodeIndex = this._children.indexOf(childNode);
                if (nodeIndex !== -1)
                {
                    this._children.splice(nodeIndex, 1);
                }
                childNode._callAppearanceEvent(true);
                Root.removeChild(childNode.getGLObject());
                childNode._parent = null;
                this._updateDepth();
                var Button = require('./Button').Button;
                if (childNode instanceof View && !(childNode instanceof Button))
                {
                    childNode._removedFromParent();
                }
            }
            catch (ex)
            {
                throw new Error(ex);
            }
        }
        else if ((childNode instanceof EditText) || (childNode instanceof EditTextArea) || (childNode instanceof WebView) || (childNode instanceof MapView))
        {
            nodeIndex = this._uiChildren.indexOf(childNode);
            if (nodeIndex !== -1)
            {
                this._uiChildren.splice(nodeIndex, 1);
            }
            UIWindow.document.removeChild(childNode);
        }
        else
        {
            throw new Error("message:" + this.type + ".addChild: " + childNode + " is not an Instance of AbstractView!");
        }
    },
    getChildCount: function ()
    {
        return (this._children.length + this._uiChildren.length);
    },
    getChildren: function ()
    {
        var childrenArray = this._children.slice(); //using slice, it is returning the copy instead of original reference
        childrenArray = childrenArray.concat(this._uiChildren.slice());
        return childrenArray;
    }
});