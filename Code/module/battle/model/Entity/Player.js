var ModelBase = require('./ModelBase').ModelBase;

exports.Player = ModelBase.subclass({
    classname: "Player",

    _setParams: function (d) {
        d = d || {};
        
        this.name = d.name || "";
        this.type = d.type || "";
        this.level = d.level || 0;
        this.default_sumo = d.default_sumo || {};
    },
    
    testData: {
			"name":"Player 1",
			"type":"player",
			"level": 1,
			"default_sumo":{
				"type":"sumo_01",
				"level":5,
				"skill":["skill_01", "skill_02"]
			},
			"extra_sumonor":[]
		}
});
