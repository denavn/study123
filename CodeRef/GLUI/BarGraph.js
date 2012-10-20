var GLUI = require("../../NGGo/GLUI").GLUI;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;
var Sprite = require("../../NGGo/GLUI/Sprite").URLSprite;
var Primitive = require("../../NGCore/Client/GL2/Primitive").Primitive;

var BarGraph = AbstractView.subclass({
    classname: "BarGraph",

    _value: null,           /** グラフの値 */
    _valueMax: null,        /** グラフの最大値 */
    _x: null,
    _y: null,
    _w: null,
    _h: null,
    _backgroundColor: null, /** 背景色 ex. [0, 0, 0] */
    _foregroundColor: null, /** 前景色 ex. [1, 0, 0] */
    _coverURL: null,
    _coverW: null,
    _coverH: null,

    _background: null,
    _foreground: null,
    _cover: null,
    _internalGLObject: null,

    initialize: function($super, params) {
        $super();

        params = params || {};

        this._value = params.value || 0;
        this._valueMax = params.valueMax || 100;
        this._x = params.x;
        this._y = params.y;
        this._w = params.w;
        this._h = params.h;
        this._backgroundColor = params.backgroundColor || [0, 0, 0];
        this._foregroundColor = params.foregroundColor || [1, 0, 0];
        this._coverURL = params.coverURL;
        this._coverW = params.coverW;
        this._coverH = params.coverH;

        this._initGLObject();
        this._initBackground();
        this._initForeground();
        this._initCover();
    },

    update: function(value) {
        this._value = value;
        this._updateForeground();
    },

    _initGLObject: function() {
        var view = new GLUI.View();
        view.setFrame([this._x, this._y, this._w, this._h]);
        this._internalGLObject = view.getGLObject();
    },

    _initBackground: function() {
        var vertexes = [];

        this._background = new Primitive();
        this._background.setType(Primitive.Type.TriangleStrip);
        this._background.setColor(this._backgroundColor);

        vertexes.push(new Primitive.Vertex([this._x,           this._y + this._h], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x,           this._y          ], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x + this._w, this._y + this._h], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x + this._w, this._y          ], [0, 0]));

        this._background.spliceVertexes.apply(
            this._background, ([0, 0]).concat(vertexes)
        );

        this._background.setDepth(BarGraph._DEPTH.BACKGROUND);

        this._internalGLObject.addChild(this._background);
    },

    _initForeground: function() {
        this._updateForeground();
    },

    _initCover: function() {
        if (!this._coverURL) {
            return;
        }

        this._cover = new GLUI.Image();
        this._cover.setFrame([0, 0, this._coverW, this._coverH]);
        this._cover.setImage(this._coverURL, GLUI.State.Normal, [this._coverW, this._coverH]);
        this._cover.getGLObject().setDepth(BarGraph._DEPTH.COVER);

        this._internalGLObject.addChild(this._cover.getGLObject());
    },

    _updateForeground: function() {
        var vertexes = [],
            width = this._w * this._value / this._valueMax;

        if (this._foreground) {
            this._internalGLObject.removeChild(this._foreground);
            this._foreground = null;
        }

        if (this._value === 0) {
            return;
        }

        this._foreground = new Primitive();
        this._foreground.setType(Primitive.Type.TriangleStrip);
        this._foreground.setColor(this._foregroundColor);

        vertexes.push(new Primitive.Vertex([this._x,         this._y + this._h], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x,         this._y          ], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x + width, this._y + this._h], [0, 0]));
        vertexes.push(new Primitive.Vertex([this._x + width, this._y          ], [0, 0]));

        this._foreground.spliceVertexes.apply(
            this._foreground, ([0, 0]).concat(vertexes)
        );

        this._foreground.setDepth(BarGraph._DEPTH.FOREGROUND);

        this._internalGLObject.addChild(this._foreground);
    },

    _toHexColor: function(arrayColor) {
        return "F" +
                (arrayColor[0] * 255).toString(16) +
                (arrayColor[1] * 255).toString(16) +
                (arrayColor[2] * 255).toString(16);
    }
});

BarGraph._DEPTH = {
    BACKGROUND: 0,
    FOREGROUND: 10,
    COVER: 20
};

exports.BarGraph = BarGraph;
