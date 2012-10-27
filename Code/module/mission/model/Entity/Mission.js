var ModelBase = require('../../../../model/Entity/ModelBase').ModelBase;

exports.Mission = ModelBase.subclass({
    classname: "Mission",

    _setParams: function (d) {
        d = d || {};
        
        this.data = this.testData;
        
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
	    "monsters" : [
	      {
	        "monster_id" : "evil",
	        "x" : 100,
	        "y" : 50
	      },
	      {
	        "monster_id" : "evil2",
	        "x" : 260,
	        "y" : 50
	      },
	      {
	        "monster_id" : "evil3",
	        "x" : 300,
	        "y" : 70
	      },
	      {
	        "monster_id" : "evil4",
	        "x" : 400,
	        "y" : 100
	      }
	    ],
	    "hero" : {
	    	"hero_id":"hero",
	        "x" : 150,
	        "y" : 270
	    },
	    "bonus" : {
	    } 
  }
});
