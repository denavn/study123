var GL2 = require('../../NGCore/Client/GL2').GL2;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;

exports.Spin = AbstractView.subclass({
    classname: "Spin",

    _value: 0,
    _max: 100,
    _min: 0,
    _x: 0,
    _y: 0,

    _internalGLObject: null,

    initialize: function(properties) {
        var self = this;

        properties = properties || {};
        properties.frame = properties.frame || [0, 0];
        properties.frame[2] = 0;
        properties.frame[3] = 0;

        self._value = properties.value || 0;
        self._max = properties.max || 100;
        self._min = properties.min || 0;
        self._x = properties.frame[0] || 0;
        self._y = properties.frame[1] || 0;

        GUIBuilder.loadConfigFromData(self._json, self, function() {
            self._initGLObject();
            self._internalGLObject.addChild(self.Spin);
            self._update(self._value);
        });
    },

    getValue: function() {
        return this._value;
    },

    setMax: function(max) {
        this._max = max;
    },

    setMin: function(min) {
        this._min = min;
    },

    _initGLObject: function() {
        var node = new GL2.Node();
        node.setPosition(this._x, this._y);
        this._internalGLObject = node;
    },

    _update: function(value) {
        if (this._min <= value && value <= this._max) {
            this._value = value;
            this.SpinNumber.gluiobj.setText("" + this._value);
        }
    },

    action_changeValueClick: function(elem, param) {
        if (param === "up") {
            this._update(this._value + 1);
        }
        else if (param === "down") {
            this._update(this._value - 1);
        }
    },

    _json: [{
        "name":"Spin",
        "attrs":{
            "frame":[0, 0, 105, 37]
        },
        "children":[{
            "name":"DownBtn",
            "type":"button",
            "attrs":{
                "action":{
                    "name":"changeValueClick",
                    "param":"down"
                },
                "frame":[0, 0, 27, 37],
                "normalImage":{
                    "anchor":[0, 0],
                    "url":"Content/image/mypage/btn_countdown.png",
                    "size":[27, 37]
                },
                "pressedImage":{
                    "anchor":[0, 0],
                    "url":"Content/image/mypage/btn_countdown.png",
                    "size":[27, 37]
                }
            }
        }, {
            "attrs":{
                "frame":[27, 0, 50, 37],
                "image":{
                    "anchor":[0, 0],
                    "url":"Content/image/mypage/counter.png",
                    "size":[50, 37]
                },
                "touchable":"false"
            },
            "name":"SpinImg",
            "type":"sprite"
        }, {
            "attrs":{
                "textGravity":[0.5,0.5],
                "textColor":"ffffff",
                "text":1,
                "frame":[27,0,50,37],
                "textSize":12
            },
            "name":"SpinNumber",
            "type":"label"
        }, {
            "attrs":{
                "action":{
                    "name":"changeValueClick",
                    "param":"up"
                },
                "frame":[77,0,27,37],
                "normalImage":{
                    "anchor":[0,0],
                    "url":"Content/image/mypage/btn_countup.png",
                    "size":[27,37]
                },
                "pressedImage":{
                    "anchor":[0,0],
                    "url":"Content/image/mypage/btn_countup.png",
                    "size":[27,37]
                }
            },
            "name":"UpBtn",
            "type":"button"
        }],
        "type":"node"
    }]
});
