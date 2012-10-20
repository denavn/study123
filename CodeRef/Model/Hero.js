var ModelBase = require('./ModelBase').ModelBase;
var URLSprite = require('../../NGGo/GLUI/Sprite').URLSprite;
var JSONData  = require('../../NGGo/Service/Data/JSONData').JSONData;
var Util      = require('../Common/Util').Util;
var FileSystem = require('../../NGCore/Client/Storage/FileSystem').FileSystem;

var STYLE_NAME = {
    1: "力",
    2: "根性",
    3: "技",
};

var SELECT_STYLE = {
    ALL:   0,
    POWER: 1,
    GUTS:  2,
    TECH:  3,
};

var Hero = ModelBase.subclass({
    classname: 'Hero',

    _setParams: function (d) {
        var status = this.status || {},
            hero   = d.superman  || d || {},
            user   = d.user      || undefined,
            exp_info = d.exp_info || undefined;

        this.type_life           = ~~hero.type_life           || this.type_life            || 0;
        this.release_level       = ~~hero.release_level       || this.release_level        || 0;
        this.base_defence        = ~~hero.base_defence        || this.base_defence         || 0;
        this.category_id         = ~~hero.category_id         || this.category_id          || 0;
        this.sell_price          = ~~hero.sell_price          || this.sell_price           || 0;
        this.weight              = ~~hero.weight              || this.weight               || 0;
        this.id                  = ~~hero.id                  || this.id                   || 0;
        this.base_exp            = ~~hero.base_exp            || this.base_exp             || 0;
        this.type_offence        = ~~hero.type_offence        || this.type_offence         || 0;
        this.max_defence         = ~~hero.max_defence         || this.max_defence          || 0;
        this.max_offence         = ~~hero.max_offence         || this.max_offence          || 0;
        this.style               = ~~hero.style               || this.style                || 0;
        this.type_defence        = ~~hero.type_defence        || this.type_defence         || 0;
        this.name                = hero.name                  || this.name                 || 0;
        this.base_combined_point = ~~hero.base_combined_point || this.base_combined_point  || 0;
        this.max_level           = ~~hero.max_level           || this.max_level            || 0;
        this.power               = ~~hero.super_man_power     || this.power                || 0;
        this.description         = hero.description           || this.description          || 0;
        this.height              = ~~hero.height              || this.height               || 0;
        this.max_life            = ~~hero.max_life            || this.max_life             || 0;
        this.kana                = hero.kana                  || this.kana                 || 0;
        this.special_move        = hero.special_move          || this.special_move         || 0;
        this.base_life           = ~~hero.base_life           || this.base_life            || 0;
        this.rarity              = ~~hero.rarity              || this.rarity               || 0;
        this.base_offence        = ~~hero.base_offence        || this.base_offence         || 0;
        this.buy_price           = ~~hero.buy_price           || this.buy_price            || 0;

        if (user) {
            status.cost          = ~~user.cost                || status.cost               || 0;
            status.exp           = ~~user.exp                 || status.exp                || 0;
            status.is_trunk      = ~~user.is_trunk            || status.is_trunk           || 0;
            status.is_able       = ~~user.is_able             || status.is_able            || 0;
            status.defence       = ~~user.defence             || status.defence            || 0;
            status.seq_id        = ~~user.seq_id              || status.seq_id             || 0;
            status.level         = ~~user.level               || status.level              || 0;
            status.offence       = ~~user.offence             || status.offence            || 0;
            status.user_id       = ~~user.user_id             || status.user_id            || 0;
            status.life          = ~~user.life                || status.life               || 0;
        }

        if (exp_info) {
            status.level_up_exp = ~~exp_info.require_exp      || status.level_up_exp || 0;
            status.exp_rate     = ~~exp_info.require_exp_rate || status.exp_rate     || 0;
        }
        this.status = status;
    },

    getIconSprite: function() {
        var sprite = new URLSprite();
        sprite.setImage('Content/image/common/icn_npc_30x40.png', [30, 40], [0,0]);
        return sprite;
    },

    getNameSprite: function(size, anchor) {
        var sprite = new URLSprite();
        size   = size   || [100, 24];
        anchor = anchor || [0,0];
        
        // Fix for image not found
        var fname = 'Content/image/npc/name/belt/'+this.id+'.png';
        var fname2 = 'Content/image/npc/name/belt/1.png';
        FileSystem.readFile(fname, true, function(err, data) {
        	if (data) {
        		sprite.setImage(fname, size, anchor);
        	} else {
        		sprite.setImage(fname2, size, anchor);
        	}
        });
        
        return sprite;
    },

    /**
     * [512,Y] の切り出しサイズのSpriteを返します。
     *
     * @param {Array} size   [width, heigt] (default: [512, 512])
     * @param {Array} anchor [anchorX, anchorY]
     * @return {Sprite} URLSpriteを返します(画像は遅延ロードされます)
     */
    getFullSprite: function(size, anchor) {
        return this.getHeroSprite('full', size || [512, 512], anchor);
    },

    /**
     * 顔を拡大した大きさの画像を返します
     *
     * @param {Array} size   [width, heigt]
     * @param {Array} anchor [anchorX, anchorY]
     * @return {Sprite} URLSpriteを返します(画像は遅延ロードされます)
     */
    getFaceSprite: function(size, anchor) {
        return this.getHeroSprite('face', size, anchor);
    },

    /**
     * 上半身を切り出します。
     * getFaceSpriteよりも横幅の比率が広いです
     *
     * @param {Array} size   [width, heigt]
     * @param {Array} anchor [anchorX, anchorY]
     * @return {Sprite} URLSpriteを返します(画像は遅延ロードされます)
     */
    getUpperSprite: function(size, anchor) {
        return this.getHeroSprite('upper', size, anchor);
    },
    
    /**
     * 目を切り出します。
     * 目を中心に切り出します。
     * 細長く切り出したい場合以外は、faceやupperをつかうことをおすすめします
     *
     * @param {Array} size   [width, heigt]
     * @param {Array} anchor [anchorX, anchorY]
     * @return {Sprite} URLSpriteを返します(画像は遅延ロードされます)
     */
    getEyeSprite: function(size, anchor) {
        return this.getHeroSprite('eye', size, anchor);
    },

    /**
     * 全身の超人画像からtypeに指定した要素を切り出しSpriteを返します.
     *
     * <p>
     * Yの切り出しサイズは
     * 切り出しの高さ比率が出力の比率よりも大きい場合は上下をカットし中心を残し
     * 切り出しの高さ比率が出力の比率よりも小さい場合は下に大きく切り出します
     * </p>
     *
     * @param {Sprite} type  (full, face, upper, eye) 
     * @param {Array} size   [width, heigt]
     * @param {Array} anchor [anchorX, anchorY]
     * @return {Sprite} URLSpriteを返します(画像は遅延ロードされます)
     */
    getHeroSprite: function(type, size, anchor) {
        var sprite = new URLSprite();
        this._loadImageData(function(data) {
            var _frame  = data[type] || [0,0,512,10],     // 切り出しフレーム
                _anchor = anchor || [0,0],                // イメージanchor
                _size   = size || [_frame[2], _frame[3]], // 出力サイズ
                _height = _frame[2] / (_size[0] / _size[1]) | 0; // 出力サイズを考慮した高さ

            if (_height < _frame[3]) {
                // 高さを削るので始点の位置を下げる
                _frame[1] = _frame[1] + (_frame[3] - _height) / 2 | 0;
            }
            // 高さを更新
            _frame[3] = _height;

            sprite.setImage(data.image, 
                            _size, 
                            _anchor, 
                            Util.toUVSfromFrame(_frame, [512, 512]));
        });
        return sprite;
    },

    _loadImageData: function(callback) {
        if (this.imageData) {
            callback(this.imageData);
            return;
        }
        var _self = this,
            jsondata = new JSONData();

        jsondata.load("./Content/heros/json/"+_self.id+".json", function(err, obj) {
            _self.imageData = obj.data;
            callback(_self.imageData);
        });
    },
    
    ///////////////////////////////////////////////////////////////////////////////////////
    // SonNN add three functions
    
    getStyleSprite: function(size, anchor) {
    	var sprite = new GL2.Sprite();
    	var img = './Content/image/tag/tag_choice_style';
    	switch(this.style) {
    		case 1:
    			img += '1.png';
    			break;
			case 2:
				img += '2.png';
				break;
			case 3:
				img += '3.png';
				break;
			default:
				img += '1.png';
    	}
    	sprite.setImage(img, size, anchor, [0, 0, 1, 1]);
    	
    	return sprite;
    },

	getRaritySprite: function(size, anchor) {
		var sprite = new GL2.Sprite();
    	var img = './Content/image/tag/tag_choice_rarity.png';
    	sprite.setImage(img, size, anchor, [0, 0, 1, 1]);
    	
    	return sprite;
	},
	
	getRankSprite: function(size, anchor) {
		var sprite = new GL2.Sprite();
    	var img = './Content/image/tag/tag_choice_rank.png';
    	sprite.setImage(img, size, anchor, [0, 0, 1, 1]);
    	
    	return sprite;
	},
	
	getExpRateSprite: function() {
		var sprite = new GL2.Sprite();
    	var img = './Content/image/tag/tag_change_exp_rate.png';
    	var maxWidth = 54;
    	var height = 9;
    	sprite.setImage(img, [(this.status.exp_rate / 100) * maxWidth, height], [0, 0], [0, 0, 1, 1]);
    	
    	return sprite;
	},
	
	getBgSprite: function(size, anchor) {
		var sprite = new GL2.Sprite();
    	var img = './Content/image/tag/tag_choice_bg_style';
    	switch(this.style) {
    		case 1:
    			img += '1.png';
    			break;
			case 2:
				img += '2.png';
				break;
			case 3:
				img += '3.png';
				break;
			default:
				img += '1.png';
    	}
    	sprite.setImage(img, size, anchor, [0, 0, 1, 1]);
    	
    	return sprite;
	}
});

Hero.STYLE_NAME = STYLE_NAME;
Hero.SELECT_STYLE = SELECT_STYLE;
exports.Hero = Hero;
