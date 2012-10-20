/*
 * Copyright (c) 2011 DeNA Co., Ltd.
 * Permission is hereby granted, free of charge, to any person to obtain a copy of
 * this software and associated documentation files (collectively called
 * the "Software"), in order to exploit the Software without restriction, including
 * without limitation the permission to use, copy, modify, merge, publish,
 * distribute, and/or sublicense copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS LICENSED TO YOU "AS IS" AND WITHOUT
 * WARRANTY OF ANY KIND. DENA CO., LTD. DOES NOT AND CANNOT
 * WARRANT THE PERFORMANCE OR RESULTS YOU MAY OBTAIN BY
 * USING THE SOFTWARE. EXCEPT FOR ANY WARRANTY, CONDITION,
 * REPRESENTATION OR TERM TO THE EXTENT TO WHICH THE SAME
 * CANNOT OR MAY NOT BE EXCLUDED OR LIMITED BY LAW APPLICABLE
 * TO YOU IN YOUR JURISDICTION, DENA CO., LTD., MAKES NO
 * WARRANTIES, CONDITIONS, REPRESENTATIONS OR TERMS, EXPRESS
 * OR IMPLIED, WHETHER BY STATUTE, COMMON LAW, CUSTOM, USAGE,
 * OR OTHERWISE AS TO THE SOFTWARE OR ANY COMPONENT
 * THEREOF, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * INTEGRATION, MERCHANTABILITY,SATISFACTORY QUALITY, FITNESS
 * FOR ANY PARTICULAR PURPOSE OR NON-INFRINGEMENT OF THIRD
 * PARTY RIGHTS. IN NO EVENT SHALL DENA CO., LTD. BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * EXPLOITATION OF THE SOFTWARE.
 */

var Class 		= require('../../../../NGCore/Client/Core/Class').Class;
var FileSystem 	= require('../../../../NGCore/Client/Storage/FileSystem').FileSystem;


exports.AutoReloader = Class.subclass(
/** @lends AutoReloader.prototype */
{
	classname: 'AutoReloader',
	/**
	 * @class
	 */
	initialize: function(onReloadFunc, interval) {
		this._onReloadFunc = onReloadFunc;
		this._ongoing = true;
		this._interval = interval || 1000;
		this._path = "reload.txt";
		this._start();
	},
	/**
	 *
	 */
	_processReloadFile: function(filePath) {
		FileSystem.readFile(filePath, false, function(err, data) {
			if(err) { return; }

			NgLogD("readFile: success");
			this._ongoing = false;
			fileSys.deleteFile(filePath, function() {
				this._onReloadFunc(data);
				this._ongoing = true;
			}.bind(this));
		}.bind(this));
	},
	_start: function() {
		var update = function() {
			if(!this._ongoing) { return; }
			this._processReloadFile(this._path);
		}.bind(this);
		setInterval(update, this._interval);
	}
});
