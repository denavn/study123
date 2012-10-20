////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas S
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// ngCore
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Color = require('../../../NGCore/Client/Core/Color').Color;
var Capabilities = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Root = require('../../../NGCore/Client/GL2/Root').Root;
var Primitive = require('../../../NGCore/Client/GL2/Primitive').Primitive;
// ngGo
var Ops = require('../../Foundation/Math/Ops').Ops;
var Util = require('../../GLUI/Util').Util;
var SceneManager = require('../../Service/Display/SceneManager').SceneManager;
exports.Fader = MessageListener.subclass( /** @lends Service.Graphics.Fader.prototype */
{
    classname: "Fader",
    /**
     * @class The <code>Fader</code> class extends Core.Class for Fading
     *
     * @constructs The default constructor.
     * @param {Array or String or Core.Color}color Color of the fader.
     * @param {object} easingFunc Easing function of type Math.Ops or name of Math.Ops functions in form of string.
     * @param {number} duration Duration of fading.
     * @param {string} nodeKey Key against which a node is registered in SceneManager. Default node is GL2.Root.
     * @example var fade = new Fader(color,Ops.linearTween,500,"MainView")
     * @augments Core.Class
     */
    initialize: function (color, easingFunc, duration, nodeKey)
    {
        if (color instanceof Array && color.length === 3)
        {
            this._color = new Color(color[0], color[1], color[2]);
        }
        else if (color instanceof Color)
        {
            this._color = color;
        }
        else if (typeof color === "string")
        {
            color = Util.hexToARGB(color);
            this._color = new Color(color[1], color[2], color[3]);
        }
        else
        {
            throw new Error("Expected color is an Array [r,g,b] or HEX value or Core.Color. Got" + typeof (color) + '.');
        }
        if (typeof easingFunc === "function")
        {
            this._easingFunc = easingFunc;
        }
        else if (typeof easingFunc === "string")
        {
            this._easingFunc = Ops[easingFunc];
            if (this._easingFunc === undefined)
            {
                throw new Error("Provided name not valid name of easingFunction available in Math.Ops");
            }
        }
        else
        {
            this._easingFunc = Ops.linearTween;
        }
        if (typeof (duration) === "number")
        {
            this._duration = duration;
        }
        else
        {
            this._duration = 500;
        }
        if (nodeKey)
        {
            this._node = SceneManager.getNodeForKey(nodeKey);
            if (!this._node)
            {
                throw new Error("No Node registered in SceneManager against key:" + nodeKey);
            }
        }
        else
        {
            this._node = Root;
        }
        this._nodeToFade = null;
        this._callBackFunc = null;
        this._startAlpha = null;
        this._deltaAlpha = null;
        this._status = 0.0;
        this._isEmitter = null;
    },
    /**
     * Starts fading-in process.
     * @param {function} callBackFunc CallBack Function.
     * @example var fader = new Fader(color,Ops.linearTween,1000)
     * ....
     * fader.fadeIn(callBackfunction);
     */
    fadeIn: function (callbackFunc)
    {
        this._startAlpha = 1.0;
        this._deltaAlpha = -1.0;
        this._start(callbackFunc);
    },
    /**
     * Starts fading-ou process.
     * @param {function} callBackFunc CallBack Function.
     * @example var fade = new Fader(color,Ops.linearTween,1000)
     * ....
     * fader.fadeOut(callBackfunction);
     */
    fadeOut: function (callbackFunc)
    {
        this._startAlpha = 0.0;
        this._deltaAlpha = 1.0;
        this._start(callbackFunc);
    },
    /**
     * Aborts the fading process.
     */
    abort: function ()
    {
        if (this._isEmitter)
        {
            UpdateEmitter.removeListener(this);
            this._isEmitter = null;
        }
        if (this._nodeToFade)
        {
            this._nodeToFade.destroy();
            this._nodeToFade = null;
        }
        this._startAlpha = null;
        this._deltaAlpha = null;
        this._status = 0.0;
        this._callBackFunc = null;
    },
    /**Retruns the current status of Fading.
     * @return {number}  Current value of fading.
     */
    getStatus: function ()
    {
        return this._status;
    },
    /**
     * Destroys Fader.
     */
    destroy: function ()
    {
        this.abort();
        this._status = null;
        this._color = null;
        this._easingFunc = null;
        this._duration = null;
        this._node = null;
    },
    /** @private */
    _start: function (callBackFunc)
    {
        if (callBackFunc && typeof (callBackFunc) === "function")
        {
            this._callBackFunc = callBackFunc;
        }
        var screen = new Primitive();
        screen.setType(Primitive.Type.TriangleStrip);
        var size = Math.max(Capabilities.getScreenHeight(), Capabilities.getScreenWidth());
        screen.pushVertex(new Primitive.Vertex([0, 0], [0, 0], this._color));
        screen.pushVertex(new Primitive.Vertex([size, 0], [1, 0], this._color));
        screen.pushVertex(new Primitive.Vertex([0, size], [0, 1], this._color));
        screen.pushVertex(new Primitive.Vertex([size, size], [1, 1], this._color));
        screen.setDepth(99999998); // lower than ScreenManager's letterbox.
        screen.setAlpha(this._startAlpha);
        this._nodeToFade = screen;
        this._node.addChild(screen);
        this._status = 0.0;
        this._progress = 0.0;
        UpdateEmitter.addListener(this, this._fade.bind(this));
        this._isEmitter = true;
    },
    /** @private */
    _fade: function (delta)
    {
        this._progress += delta;
        if (this._progress < this._duration)
        {
            this._nodeToFade.setAlpha(this._easingFunc(this._progress, this._startAlpha, this._deltaAlpha, this._duration));
            this._status = this._progress / this._duration;
        }
        else
        {
            this._status = 1.0;
            var callBackFunc = this._callBackFunc;
            this.abort();
            if (callBackFunc)
            {
                callBackFunc();
            }
        }
    }
});