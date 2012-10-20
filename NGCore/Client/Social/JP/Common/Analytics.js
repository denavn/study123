var SessionReq = require("../Data/Session").Session;

/**
 * @private
 * @name Social.Common.Analytics
 * @description Private interface for analytics data
 *
 */
exports.Analytics = {
  getUserId: function() {
	var cur_sess =	this._getSession(), cur_u = null;
	if (cur_sess) {
	  cur_u = (cur_sess.user() || {}).recordID;
	}
	return cur_u;
  },
  getUsername: function() {
	var cur_u = null;
    //Ignoring username for the time being
    //as it requires request to the server
	return cur_u;
  }, 
  getPlatformVersion: function(){
    var cur_sess =	this._getSession(), cur_pver = null;
	if (cur_sess) {
	  cur_pver = cur_sess.platformVersion();
	}
	return cur_pver;
  },
  getServiceId: function() { 
    return "JP"; 
  },
  _getSession: function() {
	return SessionReq.getCurrentSession();
  }
};
