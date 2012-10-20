/**
 * 
 */
var Core = require('../../NGCore/Client/Core').Core;
var SceneDirector = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;

var controller = 
{
    action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        if (buttnName === "OkButton") {
        	console.log("Go to main scene");
        	SceneDirector.transition("MAIN_SCENE");
        }
        else if(buttnName === "HomeButton"){
        	SceneDirector.transition("MAIN_SCENE");
        }
    }
};
exports.SceneViewCardController = Core.Class.subclass(controller);