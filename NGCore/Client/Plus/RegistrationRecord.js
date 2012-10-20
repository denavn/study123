var ClassReq = require("./../Core/Class");
var PlusRequestReq = require("././PlusRequest");
var UserReq = require('././User');
var sha1 = require("././sha1");
var SessionReq = require("./Session");
var Capabilities = require('../Core/Capabilities').Capabilities;

//Helper class that emits more useful error objects for form validation
function RegError(__value__){
    this.length = (this.__value__ = __value__ || "").length;
    this.field = null;
	this.abortTests = false;
}
RegError.prototype = new String;
RegError.prototype.toString = function(){return this.__value__;};
RegError.prototype.toJSON = RegError.prototype.toString;
RegError.prototype.valueOf = RegError.prototype.toString;

var RegistrationRecord = ClassReq.Class.subclass({
	classname: "RegistrationRecord",

	gamername: null,
	password: null,
	email: null,
	birthdate: null,
	gender: null,

	firstName: null,
	lastName: null,
	motto: null,

	profileImage: null,
	profileURLString: null,

	userRecord: null,

	optIn: false,
	lite: false,

	// these get filled in during the registration process if necessary
	alternateGamernames: [],

	/**
	 * Checks the age of the user to see if they are underage (less than 14 years old)
	 *
	 * @return true if the user is under the age limit, false otherwise
	 * @since 1.0
	 */
	isUnderage: function(){
		var age = this.getAge();
		return (age < 14.0);
	},

	/**
	 * Calculates the age from the record's birthdate
	 *
	 * @return the age of the user
	 * @since 1.0
	 */
	getAge: function(){
		if(!this.birthdate) {return -1;}

		var currentDate = new Date();

		// get and compare years
		var currentYear  = currentDate.getYear();
		var currentMonth = currentDate.getMonth() + 1;

		var birthYear    = this.birthdate.getYear();
		var birthMonth   = this.birthdate.getMonth() + 1;

		var age = currentYear - birthYear;

		//if the current month is before the birth month, they're a year younger
		if(currentMonth < birthMonth){
			age -= 1;
		//if the months are the same, and today < birth day, they're a year younger
		}else if(currentMonth == birthMonth && this.birthdate.getDate() < currentDate.getDate()){
			age -= 1;
		}
		return age;
	},

	/**
	 * Creates a new User on the Plus server from the contents of the registration record.
	 * If the record is incomplete, the User is not created.
	 *
	 * @param {Function} cb Follows the Completion callback pattern, returns (error, user)
	 * @since 1.0
	 */
	createUser: function(cb){
		var self = this;
		NgLogD("Creating user from registration record");
		this.testInformationForCreation(function(errors){
			if(errors && errors.length > 0){
				cb(errors, null);
			}else{
				NgLogD("Preparing to send user registration request");
 	   			var data = {
 	   				password: self.password,
 	   				password_confirmation: self.password,
 	   				age_restricted: (self.isUnderage() ? 0 : 1)
 	   			};

 	   			if (!self.lite) {
					NgLogD("Populating nonlite data");
 	   				data.gamertag = self.gamername;
 	   				data.email = self.email;
 	   				data.motto = (self.motto ? self.motto : "");
 	   				data.first_name = self.firstName;
 	   				data.last_name = self.lastName;
 	   				data.birth_date = self.birthdateString;
 	   				data.gender = self.gender;

 	   				data.last_name = self.lastName;
 	   				data.opt_in = (self.optIn ? 1 : 0);
 	   			} else {
					NgLogD("Populating lite data");
 	   				data.lite = 1;
 	   			}

 	   			var loginData = SessionReq.Session.getCurrentSession()._loginParameters();
 	   			loginData.user = data;

				NgLogD("Got login data");

 	   			var request = new PlusRequestReq.PlusRequest();
 	   			request.setHttpMethod("POST");
 	   			request.setApiMethod("users");
 	   			request.setPostBody(loginData);

				NgLogD("Sending registration request for user: " + JSON.stringify(loginData));
 	   			request.send(function(err, data, headers, status){
 	   				SessionReq.Session.getCurrentSession()._handleLoginResponse(err, data, headers, status, function(err, data){
						cb((err ? [err] : null), data);
					});
				});
			}
		});
		return null;
	},

	/**
	 * Performs tests needed for the first Plus screen in the iPhone Chrome
	 *
	 * @param {Function} cb Gets an array of errors, or an empty array if there were none
	 * @since 1.0
	 */
	testBasicInformation: function(cb){
		this._performTests([
			this.testLocalGamername,
			this.testLocalPassword,
			this.testLocalEmail,
			this.testRemoteEmail,
			this.testRemoteGamername
		], cb);
	},

	/**
	 * Performs tests needed to create an account
	 *
	 * @param {Function} cb Gets an array of errors, or an empty array if there were none
	 * @since 1.0
	 */
	testInformationForCreation: function(cb){
		this._performTests([
			this.testLocalGamername,
			this.testLocalPassword,
			this.testLocalEmail,
			this.testUnderageRequirements,
			this.testLocalAge,
			this.testRemoteEmail,
			this.testRemoteGamername
		], cb);
	},

	/**
	 * Performs tests needed to update information on an in-flight registered user
	 *
	 * @param {Function} cb Gets an array of errors, or an empty array if there were none
	 * @since 1.0
	 */
	testBatchChangesForFinalization: function(cb){
		this._performTests([
			this.testUnderageRequirements
		], cb);
	},

	/**
	 * Uses a continuation pattern to execute a series of tests in a row.
	 *
	 * @param tests An array of functions that act as the tests. Each accepts a function they should callback
	 *              when the test is done, with an error if there was one was the only parameter
	 * @param {Function} cb Gets an array of errors, or an empty array if there were none
	 * @since 1.0
	 */
	_performTests: function(tests, cb){
		var self = this;
		var errors = [];

		var nextTest = function(error){
			if(error) {
				errors.push(error);
			}

			if(tests.length > 0 && (!error || error.abortTests !== true)){
				// pop the first test off the array, and execute it,
				// supplying this continuation function as the callback
				var thisTest = tests.shift();
				thisTest.call(self, nextTest);
			}else{
				if(errors.length > 0){
					NgLogD("Registration tests errored: " + JSON.stringify(errors));
				}else{
					NgLogD("Registration: No errors!");
				}
				cb(errors);
			}
		};

		nextTest();
	},

	/**
	 * Tests the gamername for length requirements
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testLocalGamername: function(cb){
		var error = null;
		if(!this.gamername){ error = new RegError("You must enter a gamername.");}
		else if( this.gamername.length < 4){  error = new RegError("Gamername must be at least 4 letters.");}
		else if( this.gamername.length > 15){ error = new RegError("Gamername can't be more than 15 letters.");}
		
		if(error) {
			NgLogD("****** Setting Gamername Error Field!");
			error.field = "gamername";
		}
		cb(error);
	},

	/**
	 * Tests the password for length requirements
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testLocalPassword: function(cb){
		var error = null;
		if(!this.password){ error = new RegError("You must enter a password.");}
		else if(this.password.length < 4){  error = new RegError("Password must be at least 4 letters.");}
		else if(this.password.length > 25){ error = new RegError("Password can't be more than 25 letters.");}
		
		if(error) { 
			error.field = "password";
		}
		cb(error);
	},

	/**
	 * Tests the email address for valid-lookingness
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testLocalEmail: function(cb){
		var error = null;
		if(!this.email){ error = new RegError("You must enter an email address.");}
		else if(UserReq.User.emailAddressLooksValid(this.email) === false){ error = new RegError("You must enter a valid email address.");}
		
		if(error) {
			error.field = "email";
		}
		cb(error);
	},

	/**
	 * Tests the email address against the Plus server to find existing matches or for additional valid-lookingness
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testRemoteEmail: function(cb){
		if(!this.email){
			var error = new RegError("You must enter an email address.");
			error.field = "email";
			cb(error);
			return;
		}
		var request = new PlusRequestReq.PlusRequest();
		request.setApiMethod("users/validate");
		request.setPostBody({
			field: UserReq.User.EmailAddressKey,
			value: this.email
		});
		request.setHttpMethod("POST");
		request.send(function(err, data){
			var error = null;
			if(data && !data.success) {
				error = new RegError(data.error_msg);
				error.field = "email";
			}else if (err && err == "Error connecting to server"){
				error = new RegError(err);
				error.field = "network";
				error.abortTests = true;
			}
			cb(error);
		});
	},

	/**
	 * Tests the gamername for server side conflicts
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testRemoteGamername: function(cb){
		var error = null;
		
		if(!this.gamername){
			error = new RegError("You must enter a gamername.");
			error.field = "gamername";
			cb(error);
			return;
		}

		var self = this;
		var request = new PlusRequestReq.PlusRequest();
		request.setApiMethod("users/validate");
		request.setPostBody({
			field: UserReq.User.GamertagKey,
			value: this.gamername
		});
		request.setHttpMethod("POST");
		request.send(function(err, data){
			if(data){
				var suggestions = data.suggestions || [];
				for(var idx=0; idx<suggestions.length; idx++){
					self.alternateGamernames.push(suggestions[idx]);
				}

				if(!data.success) {
					error = new RegError(data.error_msg);
					error.field = "gamername";
				}
			}else if (err && err == "Error connecting to server"){
				error = new RegError(err);
				error.field = "network";
				error.abortTests = true;
			}
			cb(error);
		});
	},

	/**
	 * Tests the age to ensure it falls within valid age bounds
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testLocalAge: function(cb){
		var age = this.getAge();
		var error = null;
		if(age < 2 || age > 102){
			error = new RegError("You have entered an invalid age.");
			error.field = "birthdate";
		}
		cb(error);
	},

	/**
	 * Tests if the user is underage, and disables certain fields if so
	 *
	 * @param cb The callback function, which receives an error if one occurred, or null otherwise.
	 * @since 1.0
	 */
	testUnderageRequirements: function(cb){
		if(this.isUnderage()){
			this.optIn = false;
			this.lastName = "";
		}
		cb(null);
	}
});

/**
 * Creates a new lite user.
 *
 *  @param {Function} cb Follows the Completion callback pattern, returns (error, user)
 */
RegistrationRecord.createLiteUser = function(cb){
	var record = new RegistrationRecord();
	record.lite = true;
	record.password = sha1.b64_sha1(Capabilities.getUniqueId()).substr(0,24);
	record.createUser(cb);
	return null;
};

exports.RegistrationRecord = RegistrationRecord;
