////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Ihsan S.
 *  @co-author: Shamas S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Node = require('../../NGCore/Client/GL2/Node').Node;
var Primitive = require('../../NGCore/Client/GL2/Primitive').Primitive;
var TouchTarget = require('../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var Root = require('../../NGCore/Client/GL2/Root').Root;
var Core = require('../../NGCore/Client/Core').Core;
var OrientationEmitter = require('../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
var Capabilities = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var Util = {
    getAnchor: function (sprite)
    {
        return sprite._animation.getFrame(0).getAnchor();
    },
    TouchFilter: Core.MessageListener.subclass(
    {
        classname: 'TouchFilter',
        initialize: function (touchId)
        {
            this.target = new TouchTarget();
            this.target.setAnchor([0, 0]);
            this.trackingId = touchId;
            this.ignoreFingers = [];
            this.shouldDestroy = false;
            var orientation = OrientationEmitter.getInterfaceOrientation();
            var w = Core.Capabilities.getScreenWidth();
            var h = Core.Capabilities.getScreenHeight();
            if ((orientation === OrientationEmitter.Orientation.Portrait) || (orientation === OrientationEmitter.Orientation.PortraitUpsideDown))
            {
                this.target.setSize(w, h);
            }
            else
            {
                this.target.setSize(h, w);
            }
            this.target.getTouchEmitter().addListener(this, this.onTouch);
            this.target.setDepth(65535);
            Root.addChild(this.target);
        },
        destroy: function ($super)
        {
            Root.removeChild(this.target);
            this.target.destroy();
            $super();
        },
        setDestroyFlag: function ()
        {
            this.shouldDestroy = true;
            if (this.isValidTouch())
            {
                this.destroy();
            }
        },
        onTouch: function (touch)
        {
            var touchId = touch.getId();
            if (touchId === this.trackingId)
            {
                console.log("<NGGo> Error: Invalid input at GLUIUtil.TouchFilter.onTouch()");
                console.log("<NGGo> touchId: " + touchId);
                console.log("<NGGo> this.trackingId: " + this.trackingId);
                this.destroy();
                return true;
            }
            switch (touch.getAction())
            {
            case touch.Action.Start:
                if (!this.shouldDestroy)
                {
                    this.ignoreFingers.push(touch.getId());
                }
                break;
            case touch.Action.End:
                var index = this.ignoreFingers.indexOf(touch.getId());
                if (index !== -1)
                {
                    this.ignoreFingers.splice(index, 1);
                }
                if (this.shouldDestroy)
                {
                    this.destroy();
                }
                break;
            default:
                break;
            }
            return true;
        },
        isValidTouch: function ()
        {
            if (this.ignoreFingers.length === 0)
            {
                return true;
            }
            return false;
        }
    }),
    Rectangle: Node.subclass(
    {
        classname: 'Rectangle',
        initialize: function ()
        {
            this.setChildrenDepthGrouped(true);
            this._color = null;
            this._size = null;
            this._primitive = null;
        },
        setFrame: function (frame)
        {
            frame = new Core.Rect(frame);
            this.setPosition(frame.getOrigin());
            this._size = frame.getSize();
            this._updateBox();
        },
        destroy: function ()
        {
            if (this._primitive)
            {
                this._primitive.destroy();
                this._primitive = null;
            }
            this._color = null;
            this._size = null;
        },
        setColor: function (color)
        {
            this._color = new Core.Color(color);
            this._updateBox();
        },
        _updateBox: function ()
        {
            if (!this._size || !this._color)
            {
                return;
            }
            if (this._primitive !== null)
            {
                this.removeChild(this._primitive);
                this._primitive.destroy();
            }
            var p = new Primitive();
            p.setColor(this._color);
            var w = this._size.getWidth();
            var h = this._size.getHeight();
            p.setType(Primitive.Type.TriangleFan);
            var v = [];
            v.push(new Primitive.Vertex([0, 0], [0, 0]));
            v.push(new Primitive.Vertex([w, 0], [0, 0]));
            v.push(new Primitive.Vertex([w, h], [0, 0]));
            v.push(new Primitive.Vertex([0, h], [0, 0]));
            p.spliceVertexes.apply(p, ([0, 0]).concat(v));
            this._primitive = p;
            this.addChild(this._primitive);
        }
    }),
    makePrimitive: function (x, y, w, h, color1, color2, color3, color4)
    {
        if (arguments.length <= 6)
        {
            color3 = color2 || color1;
            color4 = color2 || color1;
            color2 = color1;
        }
        var p = new Primitive();
        p.setType(Primitive.Type.TriangleStrip);
        p.pushVertex(new Primitive.Vertex([0, 0], [0, 0], color1));
        p.pushVertex(new Primitive.Vertex([w, 0], [1, 0], color2));
        p.pushVertex(new Primitive.Vertex([0, h], [0, 1], color3));
        p.pushVertex(new Primitive.Vertex([w, h], [1, 1], color4));
        p.setPosition(x, y);
        return p;
    },
    hexToARGB: function (color)
    {
        if (color === null || color === undefined)
        {
            // empty color string
            return [0, 0, 0, 0];
        }
        if ((isNaN("0x" + color)))
        {
            throw new Error('Expecting a color value but found ' + typeof (color));
        }
        var n = color.length;
        var A = 1,
            R = 0,
            G = 0,
            B = 0;
        switch (n)
        {
        case 2:
            A = 1;
            R = color.charAt(0);
            R = R + color.charAt(1);
            B = R;
            G = R;
            R = parseInt(R, 16) / 255.0;
            G = parseInt(G, 16) / 255.0;
            B = parseInt(B, 16) / 255.0;
            break;
        case 3:
            A = 1;
            R = color.charAt(0);
            G = color.charAt(1);
            B = color.charAt(2);
            R = R + R;
            G = G + G;
            B = B + B;
            R = parseInt(R, 16) / 255.0;
            G = parseInt(G, 16) / 255.0;
            B = parseInt(B, 16) / 255.0;
            break;
        case 4:
            A = color.charAt(0);
            R = color.charAt(1);
            G = color.charAt(2);
            B = color.charAt(3);
            A = A + A;
            R = R + R;
            G = G + G;
            B = B + B;
            A = parseInt(A, 16) / 255.0;
            R = parseInt(R, 16) / 255.0;
            G = parseInt(G, 16) / 255.0;
            B = parseInt(B, 16) / 255.0;
            break;
        case 6:
            A = 1;
            R = color.substring(0, 2);
            G = color.substring(2, 4);
            B = color.substring(4, 6);
            R = parseInt(R, 16) / 255.0;
            G = parseInt(G, 16) / 255.0;
            B = parseInt(B, 16) / 255.0;
            break;
        case 8:
            A = color.substring(0, 2);
            R = color.substring(2, 4);
            G = color.substring(4, 6);
            B = color.substring(6, 8);
            A = parseInt(A, 16) / 255.0;
            R = parseInt(R, 16) / 255.0;
            G = parseInt(G, 16) / 255.0;
            B = parseInt(B, 16) / 255.0;
            break;
        default:
            if (n > 8)
            {
                console.log('Exception: Hex String exceeds allowed precision');
            }
            A = 1;
            R = 0;
            G = 0;
            B = 0;
            break;
        }
        return [A, R, G, B];
    },
    getOrientationSreenHeight: function ()
    {
        if (OrientationEmitter.getInterfaceOrientation() === OrientationEmitter.Orientation.Portrait || OrientationEmitter.getInterfaceOrientation() === OrientationEmitter.Orientation.PortraitUpsideDown)
        {
            return Capabilities.getScreenHeight();
        }
        else
        {
            return Capabilities.getScreenWidth();
        }
    },
    getOrientationSreenWidth: function ()
    {
        if (OrientationEmitter.getInterfaceOrientation() === OrientationEmitter.Orientation.LandscapeLeft || OrientationEmitter.getInterfaceOrientation() === OrientationEmitter.Orientation.LandscapeRight)
        {
            return Capabilities.getScreenWidth();
        }
        else
        {
            return Capabilities.getScreenHeight();
        }
    }
};
exports.Util = Util;