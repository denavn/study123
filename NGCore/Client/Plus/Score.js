var DataModel = require("./DataModel").DataModel;
var Class = require("../Core/Class").Class;

var Score = exports.Score = Class.subclass({
    classname: "Score",
    initialize: function(data){
		data = data || {};
		
		this.score = data.score;
		this.displayScore = data.formatted_score || this.score;
		this.rank = data.rank;
		this.level = data.level;
	}
});
