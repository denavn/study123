var DataModelReq = require("././DataModel");
var PlusRequestReq = require("././PlusRequest");

var UserData = DataModelReq.DataModel.subclass({
	classname: "UserData",
    initialize: function($super, recordID) {
        $super(recordID);
    }
});

UserData.getKeysForUser = function(user, cb){
	var request = new PlusRequestReq.PlusRequest();
	request.setApiMethod("users/" + user.recordID + "/user_data");
	request.setHttpMethod("GET");
	request.send(function(err, data){
		if((data.success === true) && (data.datas != undefined)){
			cb(err, data.datas);
		}else{
			cb(err, null);
		}
	});
	return request;
};

UserData.getUserDataWithData = function(user, key, result) {
    var recordID = user.recordID + '--' + key;
	var cachedUserData = DataModelReq.DataModel.getObjectWithRecordID(UserData.classname, recordID);
	if (cachedUserData !== null) {
		return cachedUserData;
	}

	var data = new UserData(recordID);
	data.user = user;
	data.key = key;

	// Enter this user object into the cache to maintain 'mutability' property
	cachedUserData = data._registerWithLocalCache();
    return cachedUserData;
};

UserData.getDataForUserWithKey = function(user, key, cb){
	return UserData.getDataForUserWithKeyAndETag(user, key, null, cb);
};

UserData.getDataForUserWithKeyAndETag = function(user, key, eTag, cb){
	var request = new PlusRequestReq.PlusRequest();
	request.setApiMethod("users/" + user.recordID + "/user_data/" + key);
	request.setHttpMethod("GET");
	request.setHttpHeaders({
		"Accept": "application/octet-stream"
	});
	request.setEntityTag(eTag);

	request.send(function(err, result, headers, status){
		// Call getUserDataWithData to fetch any previously returned object
		// instance, so "mutability property" can be maintained
        var data = UserData.getUserDataWithData(user, key, result);
		data.permissions = result.privacy;
	    data.entityTag = result.entityTag;

		if(!((status == 304) || err)){
			data.data = result;
		}
		cb(err, data);
	});

	return request;
};
UserData.setDataForUserWithKeyAndPermissions = function(data, user, key, permissions, cb){
	var request = new PlusRequestReq.PlusRequest();
	request.setApiMethod("users/" + user.recordID + "/user_data");
	request.setHttpMethod("POST");
	request.setPostBody({
		key: key,
		privacy: permissions
	});

	request.addAttachmentWithNameAndFilenameOfType(data, "value", "value", null);

	request.send(function(err, result, headers, status){
		if(result.success === true){
			cb(null, {
				success: true,
				user: user,
				key: key
			});
		}else{
			cb(err, null);
		}
	});

	return request;
};

UserData.Permissions = {
	Private: 0,
	FriendsReadOnly: 1,
	PublicReadOnly: 2
};

exports.UserData = UserData;
