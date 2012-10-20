var GLUI = require("../../NGGo/GLUI").GLUI;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;
var GL2 = require("../../NGCore/Client/GL2").GL2;

exports.ImageBarGauge = AbstractView.subclass({

    classname: "ImageBarGauge",

    initialize: function($super, properties) {
        properties = properties || {};
        this._initializeProcess = true;
        $super(properties);
        this._internalGLObject = new GL2.Node();
        this._backgoundImage = null;
        this._validImage   = null;
        this._invalidImage = null;
        this._backgoundImageUrl = properties.backgoundImageUrl || null; // "Content/image/bar/back_black.png";
        this._validImageUrl     = properties.validImageUrl     || null; // "Content/image/bar/front_blue.png";
        this._invalidImageUrl   = properties.invalidImageUrl   || null; // "Content/image/bar/back_gray.png";
        this._value             = properties.value             || 0.5;
        this._validX            = 0;

        //this.setAttributes(properties);
        this.setFrame(properties.frame || [0, 0, 0, 0]);
        this._initializeProcess =false;
        this._updateView();
    },

    /**
     * setImageに相当する画像
     * frameにフィットするサイズで配置されます
     *
     * @return {String} imageUrl
     */
    getBackgoundImageUrl: function () {
        return this._backgoundImageUrl;
    },

    /**
     * setImageに相当する画像
     * frameにフィットするサイズで配置されます
     *
     * @param {String} imageUrl
     */
    setBackgoundImageUrl: function (v) {
        if (this._backgoundImageUrl === v) {
            return;
        }
        this._backgoundImageUrl = v;
    },

    /**
     * ゲージの有効部分に相当する画像
     *
     * @return {String} imageUrl
     */
    getValidImageUrl: function () {
        return this._validImageUrl;
    },

    /**
     * ゲージの有効部分に相当する画像
     *
     * @param {String} imageUrl
     */
    setValidImageUrl: function (v) {
        if (this._validImageUrl === v) {
            return;
        }
        this._validImageUrl = v;
    },

    /**
     * ゲージの無効部分に相当する画像
     *
     * @return {String} imageUrl
     */
    getInvalidImageUrl: function () {
        return this._invalidImageUrl;
    },

    /**
     * ゲージの無効部分に相当する画像
     *
     * @param {String} imageUrl
     */
    setInvalidImageUrl: function (v) {
        if (this._invalidImageUrl === v) {
            return;
        }
        this._invalidImageUrl = v;
    },

    /**
     * ゲージの割合を表す数字 0〜1
     *
     * @return {Number} 0-1 
     */
    getValue: function () {
        return this._value;
    },

    /**
     * ゲージの割合を表す数字 0〜1
     *
     * @param {Number} 0-1 
     */
    setValue: function (v) {
         if (this._value === v) {
            return;
        }
        if (v < 0 || 1 < v) {
            throw new Error("{ImageBarGauge} value must be between 0 to 1");
        }
        this._value = v;
        this._updateView();
    },
    _updateView: function() {
        if (this._initializeProcess
        || this._backgoundImageUrl === null
        || this._validImageUrl === null
        || this._invalidImageUrl === null) {
            return;
        }

        var frame = this.getFrame(),
            sizeX = frame[2],
            sizeY = frame[3],
            validX = this._validX;

        if (!this._backgoundImage) {
            this._backgoundImage = new GL2.Sprite();
            this._backgoundImage.setImage(this._backgoundImageUrl, [sizeX, sizeY], [0, 0]);
            this._backgoundImage.setPosition(0, 0);
            this._internalGLObject.addChild(this._backgoundImage);
        }
        if (!this._invalidImage) {
            this._invalidImage = new GL2.Sprite();
            this._invalidImage.setImage(this._invalidImageUrl, [sizeX - 2, sizeY - 2], [0, 0]);
            this._invalidImage.setPosition(1, 1);
            this._internalGLObject.addChild(this._invalidImage);
        }

        if (this._value === 0) {
            validX = 0;
        } else if (this._value === 1) {
            validX = sizeX - 2;
        } else if (this._value <= 0.5) {
            validX = Math.ceil((sizeX - 2) * this._value);
        } else {
            validX = Math.floor((sizeX - 2) * this._value);
        }

        if (this._validX === validX) {
            return;
        }

        if (this._validImage) {
            this._internalGLObject.removeChild(this._validImage);
            this._validImage.destroy();
            this._validImage = null;
        }
        if (0 < validX) {
            this._validImage = new GL2.Sprite();
            this._validImage.setImage(this._validImageUrl, [validX, sizeY - 2], [0, 0]);
            this._validImage.setPosition(1, 1);
            this._internalGLObject.addChild(this._validImage);
        }

        this._validX = validX;
    }
});
