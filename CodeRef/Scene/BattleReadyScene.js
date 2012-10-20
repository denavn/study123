var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var BattleReadyController = require('../Controller/BattleReadyController').BattleReadyController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;
var Social = require('../../NGCore/Client/Social').Social;

exports.BattleReadyScene = Scene.subclass({

    classname: "BattleReadyScene",

    sceneName: "BattleReadyScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new BattleReadyController();
        GUIBuilder.loadConfigFromFile("Content/view/BattleReadyView.json", this.controller, function (e){
            Layer.getHeaderController().deactive();
            Layer.addRootChild(_self.controller.BattleReadyView, Layer.Depth.TOP);
            _self.controller.setTargetUser(option.user);
            Social.Common.Service.hideCommunityButton();
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
        Layer.getHeaderController().deactive();
        Social.Common.Service.hideCommunityButton();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
        Layer.getHeaderController().active();
        Social.Common.Service.showCommunityButton([0,0],'default', function (error) {
            NgLogE(error);
        });
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
        Layer.getHeaderController().active();
        this.controller.destroy();
        this.controller = null;
        Social.Common.Service.showCommunityButton([0,0],'default', function (error) {
            NgLogE(error);
        });
    }

});
