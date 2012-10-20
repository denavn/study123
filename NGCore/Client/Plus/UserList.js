var DataModelReq = require("././DataModel");
var PlusRequestReq = require("././PlusRequest");
var UserReq = require('././User');

var UserList = DataModelReq.DataModel.subclass({
/** @lends Plus.UserList.prototype */
	classname: "UserList",
    initialize: function($super, userid, relation, pageSize) {
        var recordID = userid + "--" + relation + "--" + pageSize;
        $super(recordID);
		this._userid = userid;
		this._relation = relation;
        this._pageSize = pageSize;
    },
	getUserListPage: function(pageNum, fieldlist, cb) {
		if(!pageNum) { pageNum = 0; }
		if(!fieldlist) { fieldlist = []; }
		
		var sparseMode = true;
		for (var key in fieldlist) {
			if (fieldlist.hasOwnProperty(key)) {
				var field = fieldlist[key];
				if (UserReq.User.NonSparseKeys.indexOf(field) > -1) {
					sparseMode = false;
					break;
				}
			}
		}
		
		var self = this;

		/*
		 * TODO - currently there is no cache check for friend / buddy
		 * list results.  If they do become cached they should maintain 'mutabiblity
		 * property' because DataModel is caching them.
		 *
		 * Also need to
		 * investigate what triggers cache invalidation:  maybe game restart,
		 * maybe hints from user_update?
		 */
	    var request = new PlusRequestReq.PlusRequest();
        var params = {
			slim: false,
        	relation: this._relation,
        	offset: (pageNum * this._pageSize),
        	count: this._pageSize
        };
	    request.setApiMethod("users/" + this._userid + "/buddies");
	    request.setHttpMethod("GET");
		request.setEntityTag(this.entityTag);
		request.setPostBody(params);
	    request.send(function(err, data, headers, status) {
            if (!err) {
                var success = data.success && data.list.length > 0;
                if (success) {
                    var retlist = [];
                    for (var idx in data.list) {
                        if (data.list.hasOwnProperty(idx)) {
                            var item = data.list[idx];
                            var userObj = UserReq.User.getUserWithData(item);
                            retlist.push(userObj);
                        }
                    }
					
					self._usersInfo = {
						users: retlist,
						total: data.total,
						offset: data.offset
					};
					self.entityTag = headers.etag;
					
					if (sparseMode) {
                		cb(err, self._usersInfo.users, self._usersInfo.total, self._usersInfo.offset, self._pageSize);
					} else {
						UserReq.User._loopUsersDetails(cb, err, data.total, data.offset, self._pageSize, retlist, []);
					}
                    return;
                }else if(status == 304){
            		cb(null, self._usersInfo.users, self._usersInfo.total, self._usersInfo.offset, self._pageSize);
				}
            }
            cb(err, null, null, null, null);
		});
	}
});

// helper function to get a 'mutable' object
UserList.getUserList = function(userid, relation, pageSize) {
    var recordID = userid + "--" + relation + "--" + pageSize;
	var cachedUserList = DataModelReq.DataModel.getObjectWithRecordID(UserList.classname, recordID);
	if (cachedUserList !== null) {
		return cachedUserList;
	}

	var list = new UserList(userid, relation, pageSize);
	// Enter this user object into the cache to maintain 'mutability' property
	cachedUserList = list._registerWithLocalCache();
    return cachedUserList;
};

exports.UserList = UserList;
