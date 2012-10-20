/**

 # NGJSEnvironmentSupport.js
 # webgame
 #
 # Created by Frederic Barthelemy on 10/01/10.
 # Copyright 2010 ngmoco:). All rights reserved.

 */

/**
 * Provides Environmental support for features missing on certain platforms.
 */


/**
 * setTimeout and setInterval implementation for platforms that don't have it.
 *	It fires timers at the beginning of the first frame past the requested millisecond,
 *	before it processes messages for a particular frame.
 *
 * Platform Consumers:
 *	- Android
 *
 * Note:
 *	- Only accurate to within the frame.
 *	- Does behaves like webkit in that it lets clearInterval and clearTimeout
 *		clear timers created by each other's constructor style.
 *
 */
var NGSetTimeoutCustom = false;
var NGSetTimeoutCallbacks = {};
var NGSetTimeoutUIDGenerator = 0;

exports.NGSetTimeoutRunTimers = function() {
	if(NGSetTimeoutCustom) {
		var timersToExecute = [];
		var curTime = new Date().getTime();
		for (var tk in NGSetTimeoutCallbacks) {
			if (NGSetTimeoutCallbacks.hasOwnProperty(tk) && NGSetTimeoutCallbacks[tk].shouldExecute(curTime)) {
				timersToExecute.push(NGSetTimeoutCallbacks[tk]);
			}
		}

		for (var i in timersToExecute) {
			if (timersToExecute.hasOwnProperty(i)) {
				timersToExecute[i].execute();
			}
		}
	}
};

if(typeof(setTimeout) != "function") {
	NGSetTimeoutCustom = true;

	var NGSingleTimeoutInstance = function(fptr, timeMs) {
		this.uid = NGSetTimeoutUIDGenerator++;
		if (NGSetTimeoutUIDGenerator == Infinity)
		{
			NGSetTimeoutUIDGenerator = 0;
		}
		this.fptr = fptr;
		this.interval = timeMs;
		this.requestedTime = new Date().getTime() + timeMs;
	};

	NGSingleTimeoutInstance.prototype.shouldExecute = function(curTime) {
		if(curTime < this.requestedTime) {
			return false;
		}
		return true;
	};

	NGSingleTimeoutInstance.prototype.execute = function() {
		delete NGSetTimeoutCallbacks[this.uid];
		this.fptr();
	};
	/**
	*
	*/
	setTimeout = function(fptr,requestedTime) {
		if(requestedTime < 0 || typeof(requestedTime) != "number") {
			requestedTime = 0;
		}

		var inst = new NGSingleTimeoutInstance(fptr,requestedTime);
		NGSetTimeoutCallbacks[inst.uid] = inst;
		return inst.uid;
	};
	/**
	*
	*/
	clearTimeout = function(uid) {
		if(NGSetTimeoutCallbacks.hasOwnProperty(uid)) {
			delete NGSetTimeoutCallbacks[uid];
		}
	};
	/**
	*
	*/
	setInterval = function(fptr,requestedTime) {
		if(requestedTime < 0 || typeof(requestedTime) != "number") {
			requestedTime = 0;
		}

		var inst = new NGSingleTimeoutInstance(fptr,requestedTime);
		/*Special setIntervalMagic */
		inst.execute = function() {
			this.requestedTime = new Date().getTime() + this.interval;
			this.fptr();
		};
		/*End setIntervalMagic */
		NGSetTimeoutCallbacks[inst.uid] = inst;
		return inst.uid;
	};
	clearInterval = clearTimeout;
	
}
