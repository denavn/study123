//
//  Mobclix.Core.Utils.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;

exports.Utils = Core.Class.singleton(
/** @lends Mobclix.Core.Utils.prototype */
{
	/**
	 * @class Utils is a singleton class with a collection of static utility methods to help with development.
	 * @constructs The default constructor.
	 * @private
	 */
	initialize: function() {
		
	},
	
	/**
	 * Gets device indpenedent pixel
	 * @param	{number} pixel	Pixel to conver to DIP
	 * @return	{number} pixel converted to dip
	 * @private
	 */
	$dip: function(pixel) {
		return Math.round(pixel * Core.Capabilities.getScreenUnits());
	},
	
	/**
	 * Add a property to a class so it can be called the following ways:
	 * @example
	 * <code>(function() {
	 * Foo.addProperty('bar', true);
	 * })();
	 *
	 * // Instances of Foo can now access the bar property the following ways:
	 * obj.bar = value;
	 * obj.setBar(value);
	 * var barVal = obj.bar;
	 * var barVal = obj.getBar();</code>
	 * 
	 * 
	 * @param	{class}	target		Target class to this property to
	 * @param	{string}	propName	Name of the property to add to the class
	 * @param	{boolean}	shouldRetain	Whether or not this property should be retained when set (and released when unset)
	 * @param	{mixed}	defaultValue	Default value of this property
	 * @private
	 * @function
	 * @static
	 */
	$addProperty: function(target, propName, shouldRetain, defaultValue) {
		if(!propName) return;
		var self = this;
		
		shouldRetain = shouldRetain || false;

		var instVarName = '__' + propName;
		var caseAdjusted = propName.charAt(0).toUpperCase() + propName.substr(1);

		target.prototype[instVarName] = defaultValue || null;
		
		if(typeof target.prototype['get'+caseAdjusted] != 'function') {
			target.prototype['get'+caseAdjusted] = function() {
				return this[instVarName];
			};
		}

		if(typeof target.prototype['set'+caseAdjusted] != 'function') {
			target.prototype['set'+caseAdjusted] = function(newValue) {
				this[instVarName] = newValue;
			};
		}

		target.prototype.__defineSetter__(propName, function(newValue) {
			if(this[instVarName] && shouldRetain) {
				if(shouldRetain) {
					try {
						this[instVarName].release();
					} catch(e) {
						self.log("Error releasing ", target[instVarName], e);
					} finally {
						this[instVarName] = defaultValue;
					}
				}
			}
			
			this[instVarName] = newValue;
			if(shouldRetain && newValue) {
				try {
					newValue.retain();
				} catch(e) {
					self.log("Error retaining ", newValue, e);
				}
			}
		});
		
		target.prototype.__defineGetter__(propName, function() {
			return this[instVarName];
		});
	},
	
	/**
	 * Logs to console
	 * @since 1.1.5
	 */
	$log: function() {
		arguments[0] = "MobclixSDK: " + arguments[0];
		console.log.apply(console.log, arguments);
	},
	
	/**
	 * Primative stack trace tool
	 * @since 1.1.5
	 */
	$trace: function() {
		var stack = arguments.callee;
		
		this.log("+ Starting Trace");

		while(stack) {
			this.log("|", stack.toString().split('\n')[0].replace(/\{\s?/, ""));
			stack = stack.caller;
		}
		
		this.log("+ Finished Trace");
	},
	
	/**
	 * Quickly enumerate an object or array
	 * 
	 * @param	{mixed}	object	Object or array to enumerate through
	 * @param	{function}	callback	Calback function that will be run on each element in the object.  Should conform to <code>function(value, key)</code>
	 * @private
	 * @function
	 * @static
	 */
	$each: function(object, callback) {
		if(!object) {
			this.log("Passed null object.. ");
			this.trace();
		}
		
		if(typeof object == 'array' || (typeof object.length == 'number' && typeof object[0] != 'undefined')) {
			for(var index = 0; index < object.length; index++) {
				if(callback(object[index], index) === false) break;
			}
		} else if(typeof object == 'object' && (typeof object.length != 'number' || object.length > 0)) {
			for(var key in object) {
				if(callback(object[key], key) === false) break;
			}
		}
	},
	
	/**
	 * Extend classes with functions and variables from another object
	 * 
	 * @param	{mixed}	target	base target to extend
	 * @param	{object}	objects,...	subsequent objects to apply to the base target
	 * @return	{mixed}	target extended with new functions/params
	 * @since 1.1.5
	 */
	$extend: function() {
		self = this;
		
		// Make sure we have a target
		if(arguments.length == 0) return {};

		// Get the tag
		var target = arguments[0];

		// Ensure we have an extendable target
		if(typeof target != 'object' && typeof target != 'function') {
			target = {};
		}

		for(var i = 1; i < arguments.length; i++) {
			// Get the object
			var object = arguments[i];

			// Ensure we have an object we can extend with, otherwise, bail.
			if(typeof object != 'object') {
				return target;
			}

			// Loop through object and bring eerything into the target scope
			for(var key in object) {
				var value = object[key];

				// Ignore undefined values
				if(typeof value == 'undefined') continue;

				// Handle null
				else if(value == null) {
					if(typeof target == 'function') target.prototype[key] = null;
					else target[key] = null;
				}

				// Handle objects recursively
				else if(typeof value == 'object') {
					if(typeof target == 'function') {
						target.prototype[key] = self.extend(target.prototype[key], value);
					} else {
						target[key] = self.extend(target[key], value);
					}
				}

				// For the rest, just do a straight assign
				else {
					if(typeof target == 'function') target.prototype[key] = value;
					else target[key] = value;
				}
			}
		}

		// Pass it back
		return target;
	},
	
	/**
	 * Get the bounds of a provided view
	 * 
	 * @param	{UI.View}	view	Instance of <code>UI.View</code> to get the bounds of
	 * @private
	 * @function
	 * @static
	 * @return	Bounds of the view
	 */
	$bounds: function(view) {
		var frame = view.getFrame();
		frame[0] = 0;
		frame[1] = 0;
		return frame;
	},
	
	/**
	 * Get the boolean value of a string
	 * 
	 * @param	{string}	str
	 * @private
	 * @function
	 * @static
	 * @return	Boolean
	 */
	$parseBool: function(str) {
		if(typeof str == 'undefined') return false;
		
		if(typeof str == 'boolean') {
			return str;
		}
		
		try {
			str = str.toString().substr(0, 1);
			if(str == "t" || str == "y" || str == "1") {
				return true;
			} else {
				return false;
			}
		} catch(e) {
			return false;
		}
	},
	
	/**
	 * Get the double value of a string
	 * 
	 * @param	{string}	str
	 * @private
	 * @function
	 * @static
	 * @return	Double
	 */
	$parseDouble: function(str) {
		if(typeof str == 'double' || typeof str == 'undefined') {
			return str;
		}
		
		if(str == null) return str;
		
		return str + 0.0;
	},
	
	/**
	 * Get the SHA1 value of a string
	 * 
	 * @param	{string}	msg
	 * @private
	 * @function
	 * @static
	 * @return	SHA1 String
	 */
	$sha1: function(msg) {
		/**
		*
		*  Secure Hash Algorithm (SHA1)
		*  http://www.webtoolkit.info/
		*
		**/

		function rotate_left(n,s) {
			var t4 = ( n<<s ) | (n>>>(32-s));
			return t4;
		};

		function lsb_hex(val) {
			var str="";
			var i;
			var vh;
			var vl;

			for( i=0; i<=6; i+=2 ) {
				vh = (val>>>(i*4+4))&0x0f;
				vl = (val>>>(i*4))&0x0f;
				str += vh.toString(16) + vl.toString(16);
			}
			return str;
		};

		function cvt_hex(val) {
			var str="";
			var i;
			var v;

			for( i=7; i>=0; i-- ) {
				v = (val>>>(i*4))&0x0f;
				str += v.toString(16);
			}
			return str;
		};


		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		};

		var blockstart;
		var i, j;
		var W = new Array(80);
		var H0 = 0x67452301;
		var H1 = 0xEFCDAB89;
		var H2 = 0x98BADCFE;
		var H3 = 0x10325476;
		var H4 = 0xC3D2E1F0;
		var A, B, C, D, E;
		var temp;

		msg = Utf8Encode(msg);

		var msg_len = msg.length;

		var word_array = new Array();
		for( i=0; i<msg_len-3; i+=4 ) {
			j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
			word_array.push( j );
		}

		switch( msg_len % 4 ) {
			case 0:
				i = 0x080000000;
			break;
			case 1:
				i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
			break;

			case 2:
				i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
			break;

			case 3:
				i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8	| 0x80;
			break;
		}

		word_array.push( i );

		while( (word_array.length % 16) != 14 ) word_array.push( 0 );

		word_array.push( msg_len>>>29 );
		word_array.push( (msg_len<<3)&0x0ffffffff );


		for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {

			for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
			for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

			A = H0;
			B = H1;
			C = H2;
			D = H3;
			E = H4;

			for( i= 0; i<=19; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}

			for( i=20; i<=39; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}

			for( i=40; i<=59; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}

			for( i=60; i<=79; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}

			H0 = (H0 + A) & 0x0ffffffff;
			H1 = (H1 + B) & 0x0ffffffff;
			H2 = (H2 + C) & 0x0ffffffff;
			H3 = (H3 + D) & 0x0ffffffff;
			H4 = (H4 + E) & 0x0ffffffff;

		}

		var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

		return temp.toLowerCase();
	},


	/**
	 * Base64 decode
	 * http://www.webtoolkit.info/
	 * 
	 * @param	{string}	input	base64 encoded string
	 * @function
	 * @static
	 * @private
	 * @return	{string} base64 decoded string
	 **/
	$base64Decode: function(input) {
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		
		var utf8_decode = function(utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while ( i < utftext.length ) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		};
		
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		return utf8_decode(output);
	}

});
