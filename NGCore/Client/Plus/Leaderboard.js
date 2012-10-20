var DataModel = require("./DataModel").DataModel;
var PlusRequest = require("./PlusRequest").PlusRequest;
var User = require("./User").User;
var Session = require("./Session").Session;
var Score = require("./Score").Score;

var Leaderboard = exports.Leaderboard = DataModel.subclass({
    classname: "Leaderboard" ,
    initialize: function($super, recordId, data){
		$super(recordId);
        NgLogD("Initializing with " + JSON.stringify(data));

		this.index = 0;
		this.level = data.level || 0;
		this.title = data.title || null;
		this.iconURL = data.icon_url || null;
		this.game = data.game;
    },

	submitScoreWithPoints: function(points, cb){
		cb = cb || PlusRequest.noOp;

		var user = Session.getCurrentSession().authenticatedUser();
		var request = new PlusRequest();

		request.setApiMethod("games/" + this.game.recordId + "/leaderboards/" + this.index + "/scores");
		request.setHttpMethod("POST");
		
		var postBody = {
			score: points
		};
		postBody[User.GamertagKey] = user.gamertag;
		request.setPostBody(postBody);
		
		request.send(function(err, data){
			if(!err && data && data.success === true){
				var score = new Score(data.score);
				cb(err, score);
			}else{
				cb(err, null);
			}
		});
		return request;
	},
	
	getTopScores: function(limit, offset, cb){
		this.getScoresWithBody(undefined, undefined, limit, offset,{
		}, cb);
	},

	getFriendsScores: function(limit, offset, cb){
		this.getScoresWithBody(undefined, undefined, limit, offset,{
			relation: "friends"
		}, cb);
	},
	
	getScoresWithBody: function(user, game, limit, offset, data, cb){
		cb = cb || PlusRequest.noOp;

		var self = this;
		
		if(!user){
			user = Session.getCurrentSession().authenticatedUser();
		}
		
		if(!game){
			game = this.game;
		}
		
		if(!data){
			data = {};
		}
		
		var postData = {};
		for(var key in data){
			postData[key] = data[key];
		}
		
		var request = new PlusRequest();
		request.setApiMethod("games/" + game.recordId + "/leaderboards/" + this.index);
		request.setHttpMethod("GET");
		request.setPostBody(postData);
		request.setEntityTag(this.entityTag);
		request.send(function(err, data, headers, status){
			if(!err){
				var scoreInfo = {};
				if(status == 304){
					scoreInfo = self.scoreInfo;
				}else if(data && data.success === true){
					var scores = [];
	
					var leaderboardJSON = data.leaderboard;
					for(var idx = 0; idx < leaderboardJSON.length; idx++){
						var scoreData = leaderboardJSON[idx];
						var score = new Score(scoreData);
						scores.push(score);
					}
					
					NgLogD("Entity tag! " + JSON.stringify(headers));
					self.entityTag = headers.etag;
					
					var userScore = (data.user_score ? new Score(data.user_score) : undefined);
					
					scoreInfo.leaderboard = self;
					scoreInfo.userScore = userScore;
					scoreInfo.scores = scores;
					
					self.scoreInfo = scoreInfo;
				}
				
				cb(err, scoreInfo);
			}else{
				NgLogD("Error getting scores: " + err);
				cb(err, null);
			}
		});
	}
});

DataModel.defineSetterCallbacks(Leaderboard, [
"level",
"title",
"game",
"index",
"iconURL"
]);

Leaderboard.getLeaderboardWithData = function(data){
    var recordId = "Leaderboard-" + data.game.recordId + "-" + data.level;
    var cachedLeaderboard = DataModel.getObjectWithRecordID(Leaderboard.classname, recordId);
    if(cachedLeaderboard !== null){
        return cachedLeaderboard;
    }
    
	NgLogD("New Leaderboard: " + JSON.stringify(data));
    var leaderboard = new Leaderboard(recordId, data);
    cachedLeaderboard = leaderboard._registerWithLocalCache();
    return cachedLeaderboard;
};

Leaderboard.getLeaderboards = function(cb){
	cb = cb || PlusRequest.noOp;

    // TODO fix this when we add game objects
    var game = {
        recordId: PlusRequest.appKey()
    };
    
    var request = new PlusRequest();
    request.setApiMethod("games/" + game.recordId + "/leaderboards");
    request.setHttpMethod("GET");
    request.send(function(err, data){
        var newLeaderboards = null;
        if(!err && data.success){
             newLeaderboards = [];
            
            var leaderboardsJSON = data.leaderboards;
            for(var idx = 0; idx < leaderboardsJSON.length; idx++){
                var leaderboardJSON = leaderboardsJSON[idx];
                leaderboardJSON.game = game;
                
                var leaderboard = Leaderboard.getLeaderboardWithData(leaderboardJSON);
                newLeaderboards.push(leaderboard);

				leaderboard.index = newLeaderboards.indexOf(leaderboard);
            }
        }
        
        cb(err, newLeaderboards);
    });
};
