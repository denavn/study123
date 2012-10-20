var GLUI = require('../../NGGo/GLUI').GLUI;
var AbstractView = require('../../NGGo/GLUI/AbstractView').AbstractView;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var ImageFontFactory = require('../../DnLib/Dn/GL2/ImageFontFactory').ImageFontFactory;

/**
 * DnLibをカプセル化するためのイニシャライザ
 */
exports.ImageTextIniter = {
    init: function(callback) {
        ImageFontFactory.setBasePath('./Content/fonts/');
        ImageFontFactory.loadFontInfo('fonts.json', function () {
            callback();
        });
    }
};

/**
 * DnLibをカプセル化し、setTextで更新する
 */
exports.ImageText = AbstractView.subclass({

    classname: "ImageText",

    initialize: function ($super, properties)
    {
        $super();
        var _self = this,
            _internalGLObject = new GL2.Node();
        // GUIBuilder要に,GL2.Nodeから操作したい関数を定義しておく > 他のGLUI系に習ってやめた
        //_internalGLObject.setText = function(text) {
        //    _self.setText(text);
        //};
        //_internalGLObject.getText = function() {
        //    return _self.getText();
        //};
        _self._initializeProcess = true;
        _self._internalGLObject = _internalGLObject;
        _self._imageFont  = null;
        properties = properties || {};
        _self._fontName    = properties.fontName    || "";
        _self._text        = properties.text        || "";
        _self._textSize    = properties.textSize    || 0;
        _self._space       = properties.space       || 0;
        _self._colorTop    = properties.colorTop    || [1,1,1];
        _self._colorBottom = properties.colorBottom || [0.5,0.5,0.5];
        _self._textGravity = properties.textGravity || [0, 0];
        if (properties)
        {
            _self.setAttributes(properties);
        }
        _self._initializeProcess =false;
        _self._updateView();
    },

    setFontName: function(fontName) {
        if (this._fontName === fontName) {
            return;
        }
        this._fontName = fontName;
        this._updateView();
    },

    getFontName: function() {
        return this._fontName;
    },

    setText: function(text) {
        text += "";
        if (this._text === text) {
            return;
        }
        this._text = text;
        this._updateView();
    },

    getText: function() {
        return this._text;
    },

    setTextSize: function(textSize) {
        if (this._textSize === textSize) {
            return;
        }
        this._textSize = textSize;
        this._updateView();
    },

    getTextSize: function() {
        return this._textSize;
    },

    setSpace: function(space) {
        if (this._space === space) {
            return;
        }
        this._space = space;
        this._updateView();
    },

    getSpace: function() {
        return this._space;
    },

    setColorTop: function(colorTop) {
        if (this._colorTop === colorTop) {
            return;
        }
        this._colorTop = colorTop;
        this._updateView();
    },

    getColorTop: function() {
        return this._colorTop;
    },

    setColorBottom: function(colorBottom) {
        if (this._colorBottom === colorBottom) {
            return;
        }
        this._colorBottom = colorBottom;
        this._updateView();
    },

    getColorBottom: function() {
        return this._colorBottom;
    },

    setTextGravity: function(textGravity) {
        if (this._textGravity === textGravity) {
            return;
        }
        this._textGravity = textGravity;
        this._updateView();
    },

    setTextGravity: function() {
        return this._textGravity;
    },

    _updateView: function() {
        // 要素が整うまではupdateをスキップする
        if (this._initializeProcess 
        || this._fontName === ""
        || this._text === ""
        || this._textSize === 0) {
            return;
        }

        var positionX = 0,
            positionY = 0,
            gravityX  = this._textGravity[0] || 0,
            gravityY  = this._textGravity[1] || 0,
            frame     = this.getFrame() || [0, 0, 320, 320];

        if (this._imageFont) {
            this._internalGLObject.removeChild(this._imageFont);
            this._imageFont.destroy();
        }

        this._imageFont = ImageFontFactory.create(this._fontName, 
                                                this._text, 
                                                this._textSize, 
                                                this._space, 
                                                this._colorTop, 
                                                this._colorBottom);

        positionX = (frame[2] - this._imageFont.width)  * gravityX;
        positionY = (frame[3] - this._imageFont.height) * gravityY;

        this._imageFont.setPosition(positionX, positionY);
        this._internalGLObject.addChild(this._imageFont);
    }

});
