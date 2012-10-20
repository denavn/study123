var SessionReq = require("../Data/Session");

/**
 * @private
 * @name Social.Common.Analytics
 * @description Private interface for analytics data
 *
 * TODO: These should be going into the priv interpreter. But need to check with Japan.
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
	var cur_sess =	this._getSession(), cur_u = null;
	if (cur_sess) {
	  cur_u = (cur_sess.user() || {}).gamertag;
	}
	return cur_u;
  },
  getPlatformVersion: function() {
	var cur_sess =	this._getSession(), cur_pver = null;
	if (cur_sess) {
	  cur_pver = cur_sess.platformVersion();
	}
	return cur_pver;
  },
  getServiceId: function() { 
	return "US"; 
  },
  _getSession: function() {
	return SessionReq.Session.getCurrentSession();
  }
};
