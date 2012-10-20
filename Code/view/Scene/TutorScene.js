var GL2                  = require('../../../NGCore/Client/GL2').GL2;
var Core                 = require('../../../NGCore/Client/Core').Core;
var UI                   = require('../../../NGCore/Client/UI').UI;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GUIBuilder           = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX                  = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var Builder              = require('../../utils/Builder').Builder;
var eff                  = require('../../utils/eff').eff;
var DebugView            = require('../../utils/DebugView').DebugView;
var VietScene            = require('./VietScene').VietScene;

/*
 * Tutor Scene: like opening a book to read. move to another page if long.
 */
exports.TutorScene = VietScene.subclass({
    classname: "TutorScene",  // must be unique
    sceneName: "TUTOR_SCENE",
    initialize: function(data) {
        Log(this.classname + " initialized");
        this.controller = {};
        this.CONF = {};
        this.node = new GL2.Node();
       // this._addBackground();
    },
    onEnter: function($super, preScene,option) {
        $super();
        Log("option in tutor scene is : " + option);
        this.preScene = preScene;
        this._data = option;
    },
    onSuccessConfig: function() {
        Log("call onSuccessConfigwwwwwwwwwwwwww");
        //Builder.makeSprite(this.node, 'Content/home.png', [200,200,90,90], [0,0]);
        this.spreadClan();
    },
    spreadClan: function() {
        Log("Clan spreading");
        //this.preScene.node.setTouchable(false);
        this.clan = Builder.makeSprite(this.node, 'Content/viet/clan.png', [100,-300, 280,320],[0,0]);
        var txt = "I 123 12 456 12345 0 2   1.5 2.6 ";
        this.text = Builder.makeText(this.clan, [0,20], [220,320], txt, 20, [1,0,0]);
        
        var tt = Builder.makeTouch(this.clan, [280,320], {func: this.rollingBackClan.bind(this), args: 0 });
        var seq = VFX.sequence().moveTo(1, [100, 0], Ops.easeInExpo);
        seq.play(this.clan);
    },
    rollingBackClan: function() {
        Log("Clan is rolling back");
        var seq = VFX.sequence().moveTo(1,[100, -300],Ops.easeInExpo);
        seq.play(this.clan);
        setTimeout(function() {
            SceneDirector.pop();
            if(this._data.cb && this._data.args)
            this._data.cb(this._data.args);
        }.bind(this), 1100
        );
       
    },
    
    //Must be override
    defineConfig: function(controller,def){
            var conf = {};
            conf.description = def.attrs.description;
            conf.debug = def.attrs.debug || false;
            conf.debugAttrs = def.attrs.debugAttrs || [];
            return conf;
    },
  
  
 });