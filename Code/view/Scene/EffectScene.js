var GL2                  = require('../../../NGCore/Client/GL2').GL2;
var Core                 = require('../../../NGCore/Client/Core').Core;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GUIBuilder           = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX                  = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var VietScene            = require('./VietScene').VietScene;
var Builder              = require('../../utils/Builder').Builder;
var eff                  = require('../../utils/eff').eff;

exports.EffectScene = VietScene.subclass({
    classname: "EffectScene",  // must be unique
    sceneName: "EFFECT_SCENE",
    initialize: function($super) {
        $super();
    },
    onSuccessConfig: function() {
        //this.effShakeNode();
        //setTimeout(function() {this.effScaleAppear();}.bind(this),2000);
        this.effSwingNode();
    },
    effShakeNode: function() {
        var sp = Builder.makeSprite(this.node, 'Content/viet/arrow.png',[200,200,64,64]);
        eff.shakeNode(sp,2,5 );
    },
    effScaleAppear: function() {
        var sp = Builder.makeSprite(this.node, 'Content/viet/arrow.png',[200,200,64,64]);
        eff.scaleAppear(this.node,sp,0.25);
    },
    effSwingNode: function() {
        var sp = Builder.makeSprite(this.node, 'Content/viet/arrow.png',[100,50,64,64]);
        eff.shakeNode(sp, 10, 3, 100);
        //eff.swingNode(sp,'horizontal', 15, 0.5);
        var sp1 = Builder.makeSprite(this.node, 'Content/viet/arrow.png',[200,50,64,64]);
        //eff.swingNode(sp1,'vertical', 20, 2);
        eff.shakeNode(sp1, 20, 2);
        var sp2 = Builder.makeSprite(this.node, 'Content/viet/arrow.png',[200,200,64,64]);
        //eff.swingNode(sp2,'other', 18, 0.5);
        eff.shakeNode(sp2, 30, 1, 10);
    },
    
    
    
    
    
    
    
    
    
    
    
    //Must be override
    defineConfig: function(controller,def){
            var conf = {};
            conf.description = def.attrs.description;
            conf.debug = def.attrs.debug || false;
            conf.debugAttrs = def.attrs.debugAttrs || [];
            return conf;
    },
    /* starry night*/
    effect2: function() {
        var darkSky = new GL2.Sprite();
        darkSky.setImage('Content/black.png', new Core.Size(960,640), new Core.Point(0,0));
        for(var i = 0; i < 500; i++) {
            var star = new GL2.Sprite();
            var width = Math.random()*2;
            star.setImage('Content/white.png', new Core.Size(width, width), new Core.Point(0,0));
            star.setAlpha(Math.random()*2);
            star.setPosition(Math.random()*960, Math.random()*640);
            if(i%10 == 0) {
                var seq = VFX.sequence().fadeIn(Math.random()*4, 1).fadeOut(Math.random()*4,0);
                seq.repeat(40);
                seq.play(star);
            }
            darkSky.addChild(star);
            setTimeout(function() {
                VFX.sequence().scaleTo(1,[20,20]);
                VFX.play(star);
            }, 1000*Math.random());
        }
        this.node.addChild(darkSky);
        var seq = VFX.sequence().moveTo(60,[-480,0]).moveTo(60,[-480,-320]).moveTo(60,[0,-320]).moveTo(60,[0,0]);
        //seq.play(darkSky);
    },
    /*
     * Run far away
     */
    effect1: function() {
        console.log("effect1 inited");
        var bar1 = new GL2.Sprite();
        bar1.setImage('Content/black.png', new Core.Size(5,240), new Core.Point(0,0));
        bar1.setPosition(240,160);
        this.node.addChild(bar1);
        var seq = VFX.sequence().rotate(10,360);
        seq.repeat(10);
        seq.play(bar1);
        
        
        for(var i = 0; i < 48; i++) {
            var verticalBar = new GL2.Sprite();
            verticalBar.setImage('Content/black.png', new Core.Size(5,800), new Core.Point(0,0));
            verticalBar.setPosition(i*10, 0);
            if( i < 24)
                verticalBar.setRotation(0-(45 - i*5));
            else if( i > 24)
                verticalBar.setRotation((i -24)*5);
            this.node.addChild(verticalBar);
        }
    }
});









