/**
 * @author sonnn
 */

var Core = require('../../NGCore/Client/Core').Core;
var SceneDirector = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;

var MoveListener = Core.MessageListener.subclass({
	initialize: function(hero, pos1, pos2, a, b, buttonName) {
		this._hero = hero;
		this._pos1 = pos1;
		this._pos2 = pos2;
		this._a = a;
		this._b = b;
		this._buttonName = buttonName;
		this._newX = pos2.getX();
		this._newY = pos2.getY();
		this._done = false;
	},
	
	onUpdate: function(delta) {
		if (this._done) {
			return;
		}
		
		this._newY -= 5;
		if (this._newY > this._pos1.getY()) {
			 this._newX = (this._newY - this._b) / this._a;
		} else {
			this._newY = this._pos1.getY();
			this._newX = this._pos1.getX();
			this._done = true;
		}
		
		this._hero.setPosition(this._newX, this._newY);
		
		if (this._done) {
			this._hero.setColor(1, 1, 1);
			console.log([this._hero.name, this._buttonName]);
			SceneDirector.transition("TAG_ONE_SCENE", [this._hero.name, this._buttonName]);
		} 
	}
});

var controller = 
{
    action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        if (buttnName === "HomeButton") {
        	console.log("Go to main scene");
        	SceneDirector.transition("MAIN_SCENE");
        } else if (buttnName === "c1" || buttnName === "c2") {
        	var f = elem.getFrame();
        	var pos1 = new Core.Point(f[0], f[1]);
        	console.log(pos1);
        	
        	var pos2 = this.TagTwo.mainHero.getPosition();
        	console.log(pos2);
        	
        	var a = (pos1.getY() - pos2.getY()) / (pos1.getX() - pos2.getX());
        	var b = (pos1.getX() * pos2.getY() - pos2.getX() * pos1.getY()) / (pos1.getX() - pos2.getX());
        	
        	var l = new MoveListener(this.TagTwo.mainHero, pos1, pos2, a, b, buttnName);
        	Core.UpdateEmitter.addListener(l, l.onUpdate);
        }
    }
};

exports.TagTwoController = Core.Class.subclass(controller);