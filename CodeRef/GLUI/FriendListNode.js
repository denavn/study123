var GLUI = require('../../NGGo/GLUI').GLUI;
var URLSprite = require('../../NGGo/GLUI/Sprite').URLSprite;
var DnButton = require('../../DnLib/Dn/GLUI/Button').Button;

var STATIC = {
    textSize:  12,
    textColor: 'ffffff',
    textGravity: [0, 0] 
};

exports.FriendListNode = URLSprite.subclass({
    classname: "FriendListNode",

    initialize: function ($super, properties) {
        this._user    = null;
        this._onClick = null;
        this._properties = properties;
        $super(properties);
    },

    destroy: function ($super) {
        $super();
    },

    addChild: function ($super, child) {
        if (child.getGLObject) {
            child = child.getGLObject();
        }
        $super(child);
    },

    removeChild: function ($super, child) {
        if (child.getGLObject) {
            child = child.getGLObject();
        }
        $super(child);
    },

    setUser: function (user) {
        this._user = user;
        this._buildView();
    },

    setOnClick: function (func) {
        this._onClick = func;
    },

    _buildView: function () {
        if (this._user === null) {
            return;
        }

        var _self = this;
        var nameLabel  = new GLUI.Label();
        var levelLabel = new GLUI.Label();

        // background
        this.setImage("./Content/image/shop/bg_col.png", [320, 71], [0, 0]);
        this.setPosition(0, 0);
        // avatar
        var avatar = this._user.getAvatarSprite([64, 64]);
        avatar.setPosition(3, 3);
        this.addChild(avatar);
        // tag
        var tag_a = this._user.tag.a.getIconSprite();
        var tag_b = this._user.tag.b.getIconSprite();
        tag_a.setPosition( 69, 5);
        tag_b.setPosition(101, 5);
        this.addChild(tag_a);
        this.addChild(tag_b);
        // label
        nameLabel.setText(this._user.nickname);
        nameLabel.setTextSize(STATIC.textSize);
        nameLabel.setTextColor(STATIC.textColor);
        nameLabel.setTextGravity(STATIC.textGravity);
        nameLabel.setFrame([135, 10, 165, 20]);
        this.addChild(nameLabel);
        levelLabel.setText('Lv. ' + this._user.level);
        levelLabel.setTextSize(STATIC.textSize);
        levelLabel.setTextColor(STATIC.textColor);
        levelLabel.setTextGravity(STATIC.textGravity);
        levelLabel.setFrame([135, 30, 165, 20]);
        this.addChild(levelLabel);
        // button
        this._button = new DnButton();
        this._button.setFrame(this._properties.button.frame);
        this._button.setImage(this._properties.button.url);
        this._button.onclick = function () {
            _self._onClick(_self._button, _self._user);
        };
        this.addChild(this._button);
    }
});
