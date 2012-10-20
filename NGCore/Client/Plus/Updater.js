var ClassReq = require("./../Core/Class");
var DataModelReq = require("./DataModel");
var PlusRequestReq = require("./PlusRequest");

var kDefaultMinRefreshInterval = 5;
var kDefaultMaxRefreshInterval = 240;

var Updater = exports.Updater = ClassReq.Class.singleton({
	classname: "Updater",
	_running: false,
	_requestedIntervals: {}, // map: interval -> count

	_updateTimer: {
		uid: null,
		time: null
	},
	_updateInterval: {
		minimum: kDefaultMinRefreshInterval,
		maximum: kDefaultMaxRefreshInterval,
		current: kDefaultMinRefreshInterval
	},
	initialize: function(){
		
	},
	start: function(){
		if(!this._running){
			this._running = true;
			this._scheduleCheck();
		}
	},
	stop: function(){
		if(this._running){
			this._running = false;
			this._stopTimer();
		}
	},
	checkNow: function(){
		NgLogD("PlusUpdater: Checking");
		this._stopTimer();
		
		var request = new PlusRequestReq.PlusRequest();
		request.setApiMethod("user_updates");
		request.setHttpMethod("GET");
		request.send(this.bind(this.handleUpdates));
	},
	handleUpdates: function(err, data){
		if(data && data.success){
			this._updateInterval.minimum = (data.update_interval || this._updateInterval.minimum);
			
			var onlineUsers = [];
			for(var idx in data.online_friends){
				var userID = data.online_friends[idx];
				onlineUsers.push(DataModelReq.DataModel.getObjectWithRecordID("User", userID));
			}

			// TODO set online users somewhere
			
			// TODO handle data.updates
			
			if(data.update_interval){
				this._updateInterval.minimum = data.update_interval;
			}
			
			this._recalculateInterval();
			this._scheduleCheck();
		}
	},
	updateInterval: function(){
		var interval = this._updateInterval;
		return (interval.current > interval.minimum ? interval.current : interval.minimum);
	},
	pushUpdateInterval: function(interval){
		var count = (this._requestedIntervals[interval] || 0);
		this._requestedIntervals[interval] = count + 1;
		this._recalculateInterval();
	},
	popUpdateInterval: function(interval){
		var count = this._requestedIntervals[interval];
		if(count){
			this._requestedIntervals[interval] = count - 1;
		}
		this._recalculateInterval();
	},
	_scheduleCheck: function(time){
		if(!time) time = this._updateInterval.current;
		
		this._stopTimer();
		
		var self = this;
		this._updateTimer.uid = setTimeout(function(){
			self.checkNow();
		}, time * 1000);
		NgLogD("PlusUpdater: Updating in " + time + "s");
	},
	_stopTimer: function(){
		if(this._updateTimer.uid){
			clearTimeout(this._updateTimer.uid);
			this._updateTimer.uid = null;
		}
	},
	_recalculateInterval: function(){
		var previousInterval = this.updateInterval();

		// find the shortest interval
		var minimum = kDefaultMaxRefreshInterval;
		for(var index = 0; index < this._requestedIntervals.length; index++){
			var interval = this._requestedIntervals[index];
			if(interval < minimum){
				minimum = interval;
			}
		}
		
		this._updateInterval.current = minimum;
		
		// reset the timer if necessary
		var newInterval = this.updateInterval();
		/* Skip unused code
		if(newInterval < previousInterval){
			
		}
		*/
	}
});
