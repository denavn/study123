var ModelBase = require('./ModelBase').ModelBase;

exports.Battle = ModelBase.subclass({
    classname: "Battle",

    _setParams: function (d) {
        d = d || {};
        
        this.name = d.name || "";
        this.type = d.type || "";
        this.level = d.level || 0;
        this.default_sumo = d.default_sumo || {};
    },
    
    testData: {
		"background" : "image.png",
		"width":480,
	    "height":320,
	    "bonus_gold": 400,
	    "enemy" : {
	        "player_id" : "player_02",
	        "sumo" :"sumo_02",
	        "x" : 400,
	        "y" : 200
	    },
	    "player" : {
	        "player_id" : "player_01",
	        "sumo" :"sumo_01",
	        "x" : 400,
	        "y" : 200
	    },
	    "bonus" : {
	    } 
  }
});
