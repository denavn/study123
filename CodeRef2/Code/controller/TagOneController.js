/**
 * @author sonnn
 */

var Core = require('../../NGCore/Client/Core').Core;
var SceneDirector = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;


var controller = 
{
    action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        for (var key in this) {
        	console.log(key);
        	console.log(this[key].name);
        }
        if (buttnName === "HomeButton") {
        	console.log("Go to main scene");
        	SceneDirector.transition("MAIN_SCENE");
        }
    }
};

exports.TagOneController = Core.Class.subclass(controller);
