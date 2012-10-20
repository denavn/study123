var GLUI = require('../../NGGo/GLUI').GLUI;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var URLSprite = require('../../NGGo/GLUI/Sprite').URLSprite;
var DnButton = require('../../DnLib/Dn/GLUI/Button').Button;
var UI = require('../../NGCore/Client/UI').UI;

var STATIC = {
    textSize:  12,
    textColor: 'ffffff',
    textGravity: [0, 0] 
};


exports.BattleListNode = URLSprite.subclass({
    classname: "BattleListNode",

    initialize: function ($super, properties) {
        this._user     = null;
        this._onAction = null;
        
        $super(properties);
    },

    setOnAction: function(onAction) {
        this._onAction = onAction;
        this._buildView();
    },

    setUser: function(user) {
        this._user = user;
        this._buildView();
    },

    getUser: function() {
        return this._user;
    },

    destroy: function($super) {
        $super();
        this._user     = null;
        this._onAction = null;
    },

    addChild: function($super, child) {
        if (child.getGLObject) {
            child = child.getGLObject();
        }
        $super(child);
    },

    removeChild: function($super, child) {
        if (child.getGLObject) {
            child = child.getGLObject();
        }
        $super(child);
    },

    _buildView: function() {
        if (this._user == null || this._onAction == null) {
            return;
        }
        var _self   = this,
            name    = new GLUI.Label(),
            level   = new GLUI.Label(),
            btn     = new DnButton();

        // BG
        this.setImage("./Content/image/fight/bg_listcol.png", [90, 198], [0, 0]);
        this.setPosition(0, 0);

        setTimeout(function() {
            var hero_a  = _self._user.tag.a.getIconSprite(),
                hero_b  = _self._user.tag.b.getIconSprite();
            hero_a.setPosition(13, 82); 
            _self.addChild(hero_a);

            hero_b.setPosition(47, 82); 
            _self.addChild(hero_b);
           
            setTimeout(function(){
                var avatar  = _self._user.getAvatarSprite([64,64]);
                avatar.setPosition(13, 7);
                _self.addChild(avatar);
            }, 0);
        }, 100);

        name.setText(this._user.nickname);
        name.setTextSize(STATIC.textSize);
        name.setTextColor(STATIC.textColor);
        name.setTextGravity(STATIC.textGravity);
        name.setFrame([5, 120, 188, 20]);
        this.addChild(name);

        level.setText("Lv. "+this._user.level);
        level.setTextSize(STATIC.textSize);
        level.setTextColor(STATIC.textColor);
        level.setTextGravity(STATIC.textGravity);
        level.setFrame([5, 140, 188, 20]);
        this.addChild(level);

        btn.setFrame([3, 160, 84, 35]);
        btn.setImage('Content/image/fight/btn_fight2.png');
        
        btn.onclick = function () {
            _self._onAction(btn, _self._user);
        }
        this.addChild(btn);
    }

});
