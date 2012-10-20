var ClassReq = require("./../Core/Class");
var PlusRequestReq = require('././PlusRequest');
var UserReq = require('././User');
var CoreReq = require('./../Core');

// HACK
var UI = require("./../UI").UI;

var UserSearch = ClassReq.Class.subclass({
    classname: "UserSearch",
    initialize: function($super, searchTerm, pageSize) {
        this._searchTerm = searchTerm;
        this._pageSize = pageSize;
    },
    getSearchResults: function(pageNum, fieldlist, cb, loopUsersDetailsWorkAround) {
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

        var request = new PlusRequestReq.PlusRequest();
        var params = [
        "gamertag=" + this._searchTerm,
        "offset=" + (pageNum * this._pageSize),
        "count=" + this._pageSize
        ];
        request.setApiMethod("users/search?" + params.join("&"));
        request.setHttpMethod("GET");
		var self = this;
        request.send(function(err, data, status, headers) {
            var users = null;
            if (!err) {
                var success = data.success;
                if (success) {
                    var retlist = [];
                    for (var idx in data.list) {
                        if (data.list.hasOwnProperty(idx)) {
                            var item = data.list[idx];
                            var userObj = UserReq.User.getUserWithData(item);
                            retlist.push(userObj);
                        }
                    }

					CoreReq.Core.Analytics._getPipe().plusEvent("FRSRCHR", {
						frsrc: "Device Contacts",
						cnt: retlist.count
					});

					if (sparseMode) {
                    	cb(err, retlist, data.total, data.offset, this._pageSize);
					} else {
						UserReq.User._loopUsersDetails(cb, err, data.total, data.offset, this._pageSize, retlist, []);
					}
                    return;
                }
            }
            cb(err, null, null, null);
        });

		CoreReq.Core.Analytics._getPipe().plusEvent("FRSRCHR", {
			frsrc: "Device Contacts",
			cnt: 0
		});
    }
});

exports.UserSearch = UserSearch;
