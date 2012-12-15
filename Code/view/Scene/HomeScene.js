/*
 *
 * 
 * 
 * 
 * 
 */
var ImageListView        = require('../../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2                  = require('../../../NGCore/Client/GL2').GL2;
var Core                 = require('../../../NGCore/Client/Core').Core;
var UI                   = require('../../../NGCore/Client/UI').UI;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory         = require('../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var GUIBuilder           = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX                  = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var GLUI                 = require('../../../NGGo1.3/GLUI').GLUI;
var DebugView            = require('../../utils/DebugView').DebugView;
var Builder              = require('../../utils/Builder').Builder;
var eff                  = require('../../utils/eff').eff;
var VietScene            = require('./VietScene').VietScene;

exports.HomeScene = VietScene.subclass({
    classname: "HomeScene",
    sceneName: "HOME_SCENE",
    /*
     * type = 0 means display opening story
     * type = 1 means display boss story,...
     * conf is an array that contains stories for each type
     */
    initialize: function($super, type) {
        $super();
        
    },
    defineConfig: function(controller,def) {
          var conf = {};
            conf.description = def.attrs.description;
            conf.debug = def.attrs.debug || false;
            conf.debugAttrs = def.attrs.debugAttrs || [];
            conf.maps = def.attrs.maps || [];
            return conf;
    },
    onEnter: function($super, preScene,option) {
        $super();
        //Log("option in tutor scene is : " + option);
        this.preScene = preScene;
       // this._data = option;
    },
    onSuccessConfig: function() {
        Log("call onSuccessConfig");
        
        // this._addClan();
        this._addVietConfig();
        
        this._addChooseSumoning();
        this._createSumonerLand();
        this._createSumoningLand(this.CONF.maps);
        this._addHelp();
    },
    
    _createSumonerLand: function(data) {
        var land = Builder.makeSprite(this.node, 'Content/stone/frame.png', [200,90,110,80], [0,0]);
        Builder.makeTouch(land, [110,80], {func: function() {SceneDirector.push("ALL_SCENE");}, args: 0});
    },
    _createSumoningLand: function(maps) {
    	 Log("createmSumoningLand");
        /*
     * args is map_id
     */
        var onSelectLand = function(args) {
            Log(" Select a sumoning land: index is =====" + args);
            this.node.setTouchable(false);
            SceneDirector.push("MAP_SELECTION_SCENE");
        };
        for (var i = 0; i < maps.length; i++) {
            Log("var i = " + i);
            var map = maps[i];
            map.node = Builder.makeSprite(this.node, 'Content/stone/frame.png', map.frame, [0,0]);
            //Log("map.frame = " + map.frame);
           // map.node.setPosition(map.frame[0], map.frame[1]);
            Builder.makeTouch(map.node,[map.frame[2], map.frame[3]], {func: this.bind(onSelectLand), args: map.id});
        }
        
       
        var x_icon = new GL2.Node();
        x_icon.setPosition(430,255);
        Builder.makeSprite(this.node, 'Content/stone/frame.png', [430,255,50,50], [0,0]);
        Builder.makeTouch(x_icon, [50,50], {func: function() {eff.warn("NOT IMPLEMENTED!!");}, args: 0});
        this.node.addChild(x_icon);
       // this.node.addChild(Builder.makeSprite(this.node, "Content/fire.png", [430,255,50,50], [0,0]));
    },
    createMapButtons: function(maps) {
       
    },
    _addClan: function() {
        var txt = "It's amazing how you, can speak right to my heart, without saying a word, you can light up the dark, try aas i may, i colud never define, what's been said betwwen ou";
        var text = Builder.makeText(GL2.Root, [50,20], [300,220], txt, 16, new Core.Color(1,0,0));
        text.setDepth(63768);
        var seq = VFX.sequence().scaleTo(4,[0.02,1], Ops.EaseInExpo);
        seq.play(text);
      
     },
    _addVietConfig: function() {
  
        var allScene = Builder.makeSprite(this.node, 'Content/stone/frame.png', [445,114,50,50], [0,0]);
     
        Builder.makeTouch(allScene, [50,50], {func: function() {SceneDirector.push("ALL_SCENE");}, args: 0});
    },
    /*
     * args is map_id
     */
    _addChooseSumoning: function(args) {
        var rect_icon = new GL2.Node();
        Builder.makeSprite(this.node, 'Content/stone/frame.png', [4,4,50,50], [0,0]);
        rect_icon.setPosition(4,4);
        Builder.makeTouch(rect_icon, [50,50], {func: function() {SceneDirector.push("LIST_SCENE");}, args: 0});
        this.node.addChild(rect_icon);
    },
    onSelectOther: function() {
        Log("On select other button ");
    },
    _addHelp: function() {
       Log("On select Help");
        var document = "Character: Main Character Hệ thống game không đi sâu vào việc nhân vật cũng như các class của nhân vật ( như một số các tựa game phổ biến bây giờ ). Hay nói cách khác, các Summoner trong game chỉ có vai trò di chuyển và thu phục các Summoning để chiến đấu. Về cơ bản các kĩ năng skill của nhân vật không đáng kể trong tựa game này. Hệ thống nhân vật bao gồm:  Male Summoner Female Summoner Các Summoner trong game có khả năng triệu hồi thông qua những chiếc móng tay được đeo trên ngón tay. Vì vậy, mỗi một Summoner sở hữu tối đa là 10 Summoning.Extra Character Bao gồm các nhân vật phụ đóng vai trò rất quan trọng trong game :Guide Character : Nhân vật có vai trò hướng dẫn người chơi làm quen với game, xuất hiện ở phần đầu của game.Quest Character : Nhân vật có vai trò ra những nhiệm vụ cho người chơi, xuất hiện nhiều và rải rác khắp nơi trên map.Seller and Purchaser : Nhân vật xuất hiện nhiều tại các shop hàng hóa để mua và bán những item cho người chơi.Traders : Nhân vật trao đổi các summoning với người chơi.Extra Summoner : Xuất hiện rải rác khắp nơi trên map, cũng là những summoner, có thể là những support Summoner, hoặc cũng có thể là BossSummoning Element Summoning Đây là thứ đóng vai trò chủ đạo trong game. Đây là những Summoning được sử dụng đóng vai trò chiến đấu trong các battle xuyên suốt game. Các loại Summoning này được chia ra làm 6 loại khác nhau tương ứng với 6 hệ ( element ) : Lửa , Nước, Cây, Đất, Điện, Khí   ( Fire, Water, Wood, Earth, Electric, Air ) và được chia làm 2 đường chính :  Tấn công và phòng thủ. Mỗi một Element được chia theo 3 cấp độ :";
        var words =  document.split(' ');
        this.helps = [];
        
        for (var i = 0; i < words.length; i += 6){
        	var help = words[i] +" "+ words[i + 1] +" "+ words[i + 2] + " "  +   words[i + 3] + " "
        				+   words[i + 4] + " " +   words[i + 5] + " "; 
        	this.helps.push(help);
        }
        eff.makeHelp([455,30,50,50], this);
    },
    
    onExit: function($super) {
        this.preScene.node.setTouchable(true);
        $super();
    },
    onPause: function() {
        Log(this.classname + " paused");
        this.node.setVisible(false);
    },
    _addBackground: function() {
        this.bg = new GL2.Sprite();
        this.bg.setImage("Content/home_bg.png", new Core.Size(480,320), new Core.Point(0,0));
        this.node.addChild(this.bg);
    },
    onResume: function($super) {
       $super();
        this.node.setVisible(true);
        this.node.setTouchable(true);
    },

});


