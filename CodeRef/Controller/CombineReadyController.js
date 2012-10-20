var Core = require('../../NGCore/Client/Core').Core;

exports.CombineReadyController = Core.Class.subclass({
    classname: "CombineReadyController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'CombineReadyScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    deactive: function() {
        this.CombineReadyView.setTouchable(false);
    },

    active: function() {
        this.CombineReadyView.setTouchable(true);
    },

    setProcess: function(process) {
    },

    setBaseHero: function(hero) {
    },

    setElementHeroes: function(heroes) {
        for (var i=0; i<heroes.length; i++) {
            this._createHeroSprite(heroes[i]);
        }
    },

    _createHeroSprite: function(hero) {

    },
});
