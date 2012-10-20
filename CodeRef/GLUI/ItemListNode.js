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


exports.ItemListNode = URLSprite.subclass({
    classname: "ItemListNode",

    initialize: function ($super, properties) {
        this._item      = null;
        this._commitImage = null;
        this._commitFunc = null;
        
        $super(properties);
    },

    setCommitImage: function(imageURL, flags, imageSize) {
        imageSize = imageSize || [63, 24];
        if (!this._commitImage) {
            this._commitImage = new DnButton();
            this._commitImage.setFrame([245, 23, imageSize[0], imageSize[1]]);
        }
        this._commitImage.setImage(imageURL, flags || UI.State.Normal);
        this._buildView();
    },

    setCommitFunc: function(func) {
        this._commitFunc = func;
        this._buildView();
    },

    setItem: function(item) {
        this._item = item;
        this._buildView();
    },

    getItem: function() {
        return this._item;
    },

    destroy: function($super) {
        $super();
        this._item       = null;
        this._commitImage  = null;
        this._commitFunc = null;
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
        if (this._item == null || this._commitImage == null || this._commitFunc == null) {
            return;
        }
        var _self            = this,
            itemImage         = new GLUI.Image(),
            //nameImage         = new GLUI.Image(),
            nameLabel         = new GLUI.Label(),
            descriptionLabel = new GLUI.Label(),
            coinIcon          = new GLUI.Image(),
            coinLabel         = new GLUI.Label(),
            numIcon           = new GLUI.Image(),
            numLabel          = new GLUI.Label();
        // BG
        this.setImage("./Content/image/shop/bg_col.png", [320, 71], [0, 0]);
        this.setPosition(0, 0);
        //this.setAnchor([0, 0]);

        // item
        itemImage.setImage(this._item.getImagePath(), GLUI.State.Normal, [60, 60]);
        itemImage.setFrame([5, 5, 60, 60]);
        this.addChild(itemImage);

        coinIcon.setImage("./Content/image/mypage/icon_coin.png", GLUI.State.Normal, [15, 15]);
        coinIcon.setFrame([70, 45, 15, 15])
        this.addChild(coinIcon);

        numIcon.setImage("./Content/image/mypage/icon_heart.png", GLUI.State.Normal, [15, 15]);
        numIcon.setFrame([142, 45, 15, 15]);
        this.addChild(numIcon);

        nameLabel.setText(this._item.name);
        nameLabel.setTextSize(STATIC.textSize);
        nameLabel.setTextColor(STATIC.textColor);
        nameLabel.setTextGravity(STATIC.textGravity);
        nameLabel.setFrame([70, 5, 200, 20]);
        this.addChild(nameLabel);

        descriptionLabel.setText(this._item.description);
        descriptionLabel.setTextSize(STATIC.textSize);
        descriptionLabel.setTextColor(STATIC.textColor);
        descriptionLabel.setTextGravity(STATIC.textGravity);
        descriptionLabel.setFrame([70, 22, 200, 20]);
        this.addChild(descriptionLabel);
        
        coinLabel.setText(this._item.price + "ﾓﾊﾞｺｲﾝ");
        coinLabel.setTextSize(STATIC.textSize);
        coinLabel.setTextColor(STATIC.textColor);
        coinLabel.setTextGravity(STATIC.textGravity);
        coinLabel.setFrame([87, 45, 200, 20]);
        this.addChild(coinLabel);
        
        numLabel.setText(this._item.has_count + "個所有");
        numLabel.setTextSize(STATIC.textSize);
        numLabel.setTextColor(STATIC.textColor);
        numLabel.setTextGravity(STATIC.textGravity);
        numLabel.setFrame([165, 45, 200, 20]);
        this.addChild(numLabel);
        
        this._commitImage.onclick = function () {
            _self._commitFunc(_self._commitImage, _self._item);
        }
        this.addChild(this._commitImage);
    }

});
