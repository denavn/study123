var GL2                  = require('../../../NGCore/Client/GL2').GL2;
var Core                 = require('../../../NGCore/Client/Core').Core;
var UI                   = require('../../../NGCore/Client/UI').UI;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GUIBuilder           = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory         = require('../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var VFX                  = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var Builder              = require('../../utils/Builder').Builder;
var eff                  = require('../../utils/eff').eff;
var DebugView            = require('../../utils/DebugView').DebugView;
var Builder              = require('../../utils/Builder').Builder;
var VietScene            = require('./VietScene').VietScene;


exports.MapSelectionScene = VietScene.subclass({
    classname: "MapSelectionScene",  // must be unique
    sceneName: "MAP_SELECTION_SCENE",
    PROGRESS_STATUS_NEW: 0,
    PROGRESS_STATUS_CLEARED: 1,
    PROGRESS_STATUS_TRAINING:2,
    /*
     * 
     * @param data: data.progress_status[]
     * data returned from server, orderation of all objects in any arrays is free
     */
    initialize: function($super,data) {
        $super();
        this._data = data || [   {name: "SM1", status:  {stt1:0, tutorial : "hi there SM1"}}, 
                                 {name: "SM2", status:  {stt1:0}},
                                 {name: "SM3", status:  {stt1:0}}, 
                                 {name: "SM4", status:  {stt1:0, tutorial : "hi there SM4"}}, 
                                 {name: "SM5", status:  {stt1:0, tutorial : "hi there SM5"}}, 
                                 {name: "SM6", status:  {stt1:0, tutorial : "hi there SM6"}}];
        this._data2 = {keys: [{id: 1, img: "Content/stone/fire1-unlock2.png"},{id: 2, img: "Content/stone/fire1-unlock1.png"}]};
        this.sumonings = [];
    },
    defineConfig: function(controller,def) {
        var conf = {};
        conf.description = def.attrs.description;
        conf.debug = def.attrs.debug || false;
        conf.debugAttrs = def.attrs.debugAttrs || [];
        conf.rock = def.attrs.rock;
        conf.sumos = def.attrs.sumos;
        conf.lights = def.attrs.lights;
        return conf;
    },
    onSuccessConfig: function() {
        Log("call onSuccessConfig");
        this._addRock(this.node);
        //this._riseRock();
        this.addKey();
        this._addHelp();
        //this.sunSet(this.node);
        //this.sunLight();
    },
    setupForDebug: function() {
        this.reInitForDebug = function() {
            Log("call reInitForDebug");
            this.node.destroy();
            this.node = new GL2.Node();
            GL2.Root.addChild(this.node);
            this._addBackground();
        };
        this._setConfigAttrs = function(name,value) {
            Log("call _setConfigAttrs");
            switch(name) {
            case 'description' : {this.CONF.description = value;break;}
            case 'debug' : {this.CONF.debug = value;break;}
            case 'l0_ver' : {this.CONF.lights[0].ver = value; break;}
            case 'l0_time' : {this.CONF.lights[0].time = value; break;}
            case 'l0_rot' : {this.CONF.lights[0].rot = value; break;}
            
            case 'l1_ver' : {this.CONF.lights[1].ver = value; break;}
            case 'l1_time' : {this.CONF.lights[1].time = value; break;}
            case 'l1_rot' : {this.CONF.lights[1].rot = value; break;}
            
            case 'l2_ver' : {this.CONF.lights[2].ver = value; break;}
            case 'l2_time' : {this.CONF.lights[2].time = value; break;}
            case 'l2_rot' : {this.CONF.lights[2].rot = value; break;}
            
            case 'l3_ver' : {this.CONF.lights[3].ver = value; break;}
            case 'l3_time' : {this.CONF.lights[3].time = value; break;}
            case 'l3_rot' : {this.CONF.lights[3].rot = value; break;}
            default: Log("Can't find " + name + " in CONF");
        }
        };
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
    sunSet: function(parentNode) {
        Log("call sunSet");
        var sun = new GL2.Sprite();
        sun.setImage("Content/white.png", [50,50],[0,0]);
        sun.setPosition(200,300);
        sun.setColor(192/256, 255/256,62/256);
        parentNode.addChild(sun);
    },
    
    sunLight: function(pos) {
        Log("call sunLight");
        for (var i = 0; i < this.CONF.lights.length; i++) {
            var l = this.CONF.lights[i];
                Builder.makeLight(this.node,pos,l.ver,l.rot,l.scale,l.time);
        }
    },
    
    
    //Call when player click button to choose sumonor
    onSelectSumonor: function(sumoning) {
        Log("call onSelectSumonor this.classname = " + this.classname);
        //Log("imgPath = " + imgPath);
        
                /*if (s.status.tutorial != undefined) {
                    Log("sumoning: " + s.name + " has tutorial!!!: " + s.status.tutorial);
                    s.status.tutorial = undefined;
                    SceneDirector.push("TUTOR_SCENE", {cb: this.enterBattle.bind(this), args: s});
                  // Push tutorial scene here  or create text of tutorial
                  //After tutorial sh
                } else*/ 
               // this._downRock();
               // this.enterBattle(sumoning);
         
      eff.warn("Please choose a key, if you have!!");
        
        
    },
    
    enterBattle: function(s) {
         // eff.shakeNode(s.node, 4,5);
          //var pos = new Core.Point(s.frame[0] + s.frame[2]/2, s.frame[1] + s.frame[3]/2); //screenToLocal.....//setup more here
          //setTimeout(function() {this.sunLight(this.rock.localToScreen(pos));}.bind(this),1000);
          setTimeout(function() {
                // this.bg.setColor(192/256, 255/256,62/256);
                // this.bg.setDepth(60000);
                SceneDirector.transition("MISSION_SCENE");
           }.bind(this),2200);
    },
    
    /*Make effect such as add "cleared" text on trained sumonor, "on-going" text on training sumonor,...
    @param sumoNode: GL2.Node node that used to display image of sumoning.
    @param status: status of  training progress, 0,1,2
    
    */
    _markProgress: function(sumoNode, status) {
        //Log("call _markProgress  status = " + status );
        var pos = this.rock.localToScreen(sumoNode.getPosition());
       // Log("Pos.x = " + pos.getX() + " pos.y = " + pos.getY());
        switch(status) {
            case this.PROGRESS_STATUS_NEW: 
              //Log("status = new");
                //sumoNode.setColor(1,0,1);
                break;
            case this.PROGRESS_STATUS_CLEARED: 
               // Log("status = cleared");
               // var mark = Builder.makeSprite(this.node, 'Content/viet/ninja.png', [pos.getX(), pos.getY()- 20,64,64],[0,0]);
                break;
            case 2: 
                // Log("status = training");
                 sumoNode.setColor(1,0,1);  
                 var sp1 = Builder.makeSprite(this.node, 'Content/viet/arrow_icon.png',[pos.getX(), pos.getY() - 48,50,50],[0,0]);
                 eff.swingNode(sp1,'vertical', 10, 2);
                break;
        }
    },
    
    /*
     * draw sumoning on rock,
     * @param parentNode: GL2.Node - rock,
     * 
     * implement, GL2.Sprite, onClick function,...
     * now add sumoning1,sumoning 2, ... but when mission is settle, ...refactor code
     */
    _addSumoning: function(parentNode) {
        Log("call _addSumoning");
        for (var i = 0; i < this.CONF.sumos.length; i++) {
            var sumoning = {};
            sumoning.name = this.CONF.sumos[i].name;
            sumoning.frame = this.CONF.sumos[i].frame;
            sumoning.status = this._getStatus(sumoning.name) || this.PROGRESS_STATUS_NEW;
            Log("skfjalsfjajfaf: " + this.CONF.sumos[i].imgPath_cleared);
            sumoning.imgPath = this._getImgPath(this.CONF.sumos[i], sumoning.status.stt1);
            Log("IMG PSSSS: " + sumoning.imgPath);
            sumoning.node = Builder.makeSpriteButton(parentNode,sumoning.imgPath,sumoning.frame,{func: this.bind(this.onSelectSumonor), args: sumoning});
            sumoning.node.addChild(Builder.makeSprite(sumoning.node, "Content/stone/frame.png",[0,0,sumoning.frame[2], sumoning.frame[3]], [0,0]));
            this.sumonings.push(sumoning);
            this._markProgress(sumoning.node, sumoning.status.stt1);
        }   
    },
    // display rock
    _addRock: function(parentNode) {
       // Log("call _addRock");
      //  this.rock = new GL2.Sprite();
      this.rock = this.node;
       // this.rock.setImage(this.CONF.rock.imgPath, this.CONF.rock.size, [0,0]);
       // this.rock.setPosition(this.CONF.rock.pos);
       // parentNode.addChild(this.rock);
        //this._addSumoning(this.rock);
        this._addSumoning(this.node);
    },
    _getImgPath: function(sumoning, status) {
        Log("SSSSSSSSSSS+ " + status);
        if(status == this.PROGRESS_STATUS_TRAINING)
              return sumoning.imgPath_training;
         else if (status == this.PROGRESS_STATUS_NEW)
              return sumoning.imgPath_new;
         else if (status == this.PROGRESS_STATUS_CLEARED)
              return sumoning.imgPath_cleared;
    },
    
    _riseRock: function() {
    	var seq = VFX.sequence().move(2, [0, -180], Ops.EaseInQuad);
    	setTimeout(function() {
    		seq.play(this.rock);
    		eff.shakeNode(this.bg, 2, 1);
    		eff.shakeNode(this.bg2, 2, 1);
    	}.bind(this), 800);
    	//seq.play(this.rock);
    },
    _downRock: function() {
    	var seq = VFX.sequence().move(2, [0, 180], Ops.EaseInQuad);
    	setTimeout(function() {seq.play(this.rock)}.bind(this), 300);
    	//seq.play(this.rock);
    },

    /*
    Display all availble key of player, when player tap on one key, if key is suitable, it will fly to fit with
    sumoning on rock
    */
    addKey: function() {
        Log("addKey")
        var cb = function(i) {
            Log("Click a key");
           // var target = new Core.Point(this.CONF.sumos[i].frame[2], this.CONF.sumos[i].frame[3]);
            var target = this.getGlobalPositionOfSumoning(i);
            var seq = VFX.spawn().moveTo(2, target).rotate(2, 720, Ops.EaseInExpo);
            seq.play(this.keys[i]);
            setTimeout(function() {
            	this._downRock();
            	 eff.shakeNode(this.keys[i], 4,5);
            	this.enterBattle(this.sumonings[this._data2.keys[i].id - 1]);
            }.bind(this), 2090);
        };
        this.keys = [];
        for (var i = 0; i < this._data2.keys.length; i++) {
            Log("i ===" + i);
            var key = Builder.makeSpriteButton(this.node,this._data2.keys[i].img, 
                [80 + i* 60,280,35,35], {func: cb.bind(this), args: i});
            key.setDepth(62768);
            this.keys.push(key);
        }
    },

    getGlobalPositionOfSumoning: function(i) {
            var x = this.rock.getPosition().getX() + this.sumonings[i].node.getPosition().getX();
            var y = this.rock.getPosition().getY() + this.sumonings[i].node.getPosition().getY();
            Log("..............x/y: " + x + "/" + y);
            return new Core.Point(x,y);
           // return this.rock.localToScreen(this.sumonings[i].node.getPosition());
    },
    
    
    /*
     * get progress status of each mission (sumoning) from data
     */
    _getStatus: function(sumoningName) {
        //Log("call _getStatus");
        for (var i = 0; i < this._data.length; i++) {
            if(this._data[i].name == sumoningName)
                return this._data[i].status;
        }
        Log("Can't find sumoning with name = " + sumoningName + " in data");
    },
    _addBackground: function() {
        this.bg = new GL2.Sprite();
        this.bg.setPosition(-2,0);
        this.bg.setImage("Content/bg4.png", new Core.Size(482,320), new Core.Point(0,0));
        this.bg2 = new GL2.Sprite();
        this.bg2.setImage("Content/bg4.png", new Core.Size(482,80), new Core.Point(0,0),[0,0.75,1,0.25]);
        this.bg2.setPosition(-2,240);
        this.bg2.setDepth(62346);
        this.node.addChild(this.bg);
        //this.node.addChild(this.bg2);
    }
 });