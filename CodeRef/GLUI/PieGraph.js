var GLUI = require("../../NGGo/GLUI").GLUI;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;
var Sprite = require("../../NGGo/GLUI/Sprite").URLSprite;
var Primitive = require("../../NGCore/Client/GL2/Primitive").Primitive;

var PieGraph = AbstractView.subclass({
    classname: "PieGraph",

    _value: 0, /** グラフの値 */
    _frame: null,
    _pieFrame: null,
    _coverFrame: null,
    _backgroundColor: null, /** 背景色 ex. [0, 0, 0] */
    _foregroundColor: null, /** 前景色 ex. [1, 0, 0] */
    _coverURL: null,

    _background: null,
    _foreground: null,
    _cover: null,
    _internalGLObject: null,

    DIV: 12, /** 分割数 */

    initialize: function($super, params) {
        $super();

        params = params || {};
        params.frame = params.frame || [0, 0, 60, 60];
        params.pieFrame = params.pieFrame || [0, 0, 60, 60];
        params.coverFrame = params.coverFrame || [0, 0, 60, 60],

        this._value = params.value;
        this._frame = params.frame;
        this._pieFrame = params.pieFrame;
        this._coverFrame = params.coverFrame;
        this._backgroundColor = params.backgroundColor || [0, 0, 0];
        this._foregroundColor = params.foregroundColor || [0, 1, 0];
        this._coverURL = params.coverURL || "Content/image/common/kkd_gauge.png";

        this._initGLObject();
        this._initBackground();
        this._initForeground();
        this._initCover();
    },

    setValue: function(value) {
        this.update(value);
    },

    update: function(value) {
        this._value = value;
        this._updateForeground();
    },

    _initGLObject: function() {
        var view = new GLUI.View();
        view.setFrame(this._frame);
        this._internalGLObject = view.getGLObject();
    },

    _initBackground: function() {
        var vertexes = [],
            pos = this._calcPiePosition(),
            radian, i;

        this._background = new Primitive();
        this._background.setType(Primitive.Type.TriangleFan);
        this._background.setColor(this._backgroundColor);

        vertexes.push(new Primitive.Vertex([pos.x, pos.y], [0, 0]));

        for (i = 0; i <= this.DIV; ++i) {
            radian = 2 * Math.PI * i / this.DIV;

            vertexes.push(new Primitive.Vertex([
                pos.x + pos.w * Math.cos(radian),
                pos.y + pos.h * Math.sin(radian)
            ], [0, 0]));
        }

        this._background.spliceVertexes.apply(
            this._background, ([0, 0]).concat(vertexes)
        );

        this._background.setDepth(PieGraph._DEPTH.BACKGROUND);

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
        this._cover.setFrame(this._coverFrame);
        this._cover.setImage(this._coverURL, GLUI.State.Normal, [this._coverFrame[2], this._coverFrame[3]]);
        this._cover.getGLObject().setDepth(PieGraph._DEPTH.COVER);

        this._internalGLObject.addChild(this._cover.getGLObject());
    },

    _updateForeground: function() {
        var vertexes = [],
            pos = this._calcPiePosition();

        if (this._foreground) {
            this._internalGLObject.removeChild(this._foreground);
            this._foreground = null;
        }

        if (this._value === 0) {
            return;
        }

        this._foreground = new Primitive();
        this._foreground.setType(Primitive.Type.TriangleFan);
        this._foreground.setColor(this._foregroundColor);

        vertexes.push(new Primitive.Vertex([pos.x, pos.y], [0, 0]));
        vertexes = vertexes.concat(this._getVertexes(this._getSectionOfValue()));

        this._foreground.spliceVertexes.apply(
            this._foreground, ([0, 0]).concat(vertexes)
        );

        this._foreground.setDepth(PieGraph._DEPTH.FOREGROUND);

        this._internalGLObject.addChild(this._foreground);
    },

    _getSectionOfValue: function() {
        return ((this._value * this.DIV) / 100) | 0; // 0 ~ DIV-1
    },

    _getVertexes: function(targetSection) {
        var vertexes = [], radian, i,
            pos = this._calcPiePosition();

        for (i = 0; i <= targetSection; ++i) {
            radian = (2 * i / this.DIV - 0.5) * Math.PI; // 2 * Math.PI * i / DIV - Math.PI / 2;

            vertexes.push(new Primitive.Vertex([
                pos.x + pos.w * Math.cos(radian),
                pos.y + pos.h * Math.sin(radian)
            ], [0, 0]));
        }

        radian = (this._value - 25) * Math.PI / 50; // 2 * Math.PI * this._value / 100 - Math.PI / 2;

        vertexes.push(new Primitive.Vertex([
            pos.x + pos.w * Math.cos(radian),
            pos.y + pos.h * Math.sin(radian)
        ], [0, 0]));

        return vertexes;
    },

    _calcPiePosition: function() {
        return {
            x: this._pieFrame[0] + this._pieFrame[2] / 2,
            y: this._pieFrame[1] + this._pieFrame[3] / 2,
            w: this._pieFrame[2] / 2,
            h: this._pieFrame[3] / 2
        };
    },

    _toHexColor: function(arrayColor) {
        return "F" +
                (arrayColor[0] * 255).toString(16) +
                (arrayColor[1] * 255).toString(16) +
                (arrayColor[2] * 255).toString(16);
    }
});

PieGraph._DEPTH = {
    BACKGROUND: 0,
    FOREGROUND: 10,
    COVER: 20
};

exports.PieGraph = PieGraph;
