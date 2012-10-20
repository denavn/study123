var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var GL2 = require("../../NGCore/Client/GL2").GL2;
var Layer = require("../Layer").Layer;
var Hero = require('../Model/Hero').Hero;

exports.HeroDebugScene = Scene.subclass({
    classname: "HeroDebugScene",
    sceneName: "HeroDebugScene",

    onEnter: function(prevScene, option) {
        var _self = this;

        _self.node = new GL2.Node();

        Layer.addRootChild(_self.node, Layer.Depth.TOP);

        var hero = new Hero({id: 1});

        var face = hero.getFaceSprite([64, 64]);
        face.setPosition(10, 100);
        _self.node.addChild(face);

        var upper = hero.getUpperSprite([150, 300]);
        upper.setPosition(10, 200);
        _self.node.addChild(upper);

        var full = hero.getFullSprite([256, 256], [0.5, 0]);
        full.setPosition(160, 100);
        _self.node.addChild(full);

        var full = hero.getFullSprite([256, 120], [0.5, 0]);
        full.setPosition(250, 100);
        _self.node.addChild(full);

        var eye = hero.getEyeSprite([320, 50]);
        eye.setPosition(0, 350);
        _self.node.addChild(eye);

    },

    onExit: function(nextScene, option) {
        Layer.removeRootChild(this.node);
        this.node.destroy();

        this.controller = null;
    }
});

