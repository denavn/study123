var GL2					 = require('../../NGCore/Client/GL2').GL2;
var Core				 = require('../../NGCore/Client/Core').Core;
var UI 					 = require('../../NGCore/Client/UI').UI;

/*
 * DebugView is used to modify configurations for one scene. Instead of restart Game, we can use DebugView to enter values for
 * some configurations, and then reload Scene to view result. To use DebugView, Scene must install:
 * 1. Init a debugView object as its attribute
 * 2. reloadForDebug function (see StoryScene's one)
 * 3. Call debugView.destroy in scene's onExit
 * 
 */
exports.DebugView = Core.Class.subclass({
	// max frame width = 480
	initialize: function(scene, text, frame) {
		this._scene = scene;
		this._text = text;
		this._frame = frame;
		this.values = [];
		this._view = new UI.View();
		this.scrollView = new UI.ScrollView();
		this.config = new UI.Button();
		this.reset = new UI.Button();
		
		this.objs = [];
		this.createView();
	},
	createView: function() {
		Log("in CreateView");
		this._view.setFrame(this._frame);
		this.scrollView.setFrame(this._frame[2]/16 + 2, 0, this._frame[2]/16*14 -2, this._frame[3]);
		this.scrollView.setContentSize((3 + this._frame[2]/7)*this._text.length, this._frame[3]);
		this.scrollView.setScrollIndicatorsVisible(false);
		UI.Window.document.addChild(this._view.addChild(this.scrollView));
		this.scrollView.setVisible(false);
		this._create2Button();
		var x = 0;
		var w = this._frame[2]/ 7;
		for(var i = 0; i < this._text.length; i++) {
			var obj = {};
				
			obj.editText = new UI.EditText();
			//obj.editText.setBackgroundColor("FF2FFF");
			obj.editText.setAlpha(0.4);
			obj.editText.setPlaceholder(this._text[i]);
			obj.editText.setBackgroundColor("FFFFFF");
			obj.editText.setPlaceholderColor("FF0000");
			obj.editText.setFrame([x, 0, w, this._frame[3]]);
			this.scrollView.addChild(obj.editText);
			this.objs.push(obj);
		
			x += w + 2 ;
		}
	},
	
	_create2Button: function() {
		Log("in Create2Button");
		this.config.setFrame(0,0,this._frame[2]/16, this._frame[3]);
		this.config.setImage('Content/viet/avatar_arrow.png');
		this.config.onclick = function() {
			this.scrollView.setVisible(true);
			this.reset.setVisible(true);
		}.bind(this);
		this._view.addChild(this.config);
		this.reset.setImage('Content/viet/reset.png');
		this.reset.setFrame(this._frame[2] - this._frame[2]/16, 0,this._frame[2]/18, this._frame[3] -5);
		this.reset.setVisible(false);
		this.reset.onclick = function() {
			this.scrollView.setVisible(false);
			this.reset.setVisible(false);
			this.values = [];
			if(this.objs != undefined) {
				for(var i = 0; i < this.objs.length; i++) {
					
					this.values.push(this._getValue(this.objs[i].editText.getText()));
					Log("values_origin[" + i + "]  = " + this.values[i]);
				}
			}
			
			setTimeout(function() {this._scene.reloadForDebug(this.values);}.bind(this),500);
			
		}.bind(this);
		this._view.addChild(this.reset);
	},
	/*
	 * Return number value or array from a string that contains comma ','
	 * ex: 34,56
	 */
	_getValue: function(str) {
		if(str) {
			if(str.indexOf(',') == -1)
				return str;
			else {
				return str.split(',');
			}
		}
	},
	destroy: function() {
		this._view.destroy();
	}
});