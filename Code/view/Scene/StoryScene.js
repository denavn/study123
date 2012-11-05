/*
 *
 * 
 * 
 * 
 * 
 */
var ImageListView		 = require('../../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var Core				 = require('../../../NGCore/Client/Core').Core;
var UI 					 = require('../../../NGCore/Client/UI').UI;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX					 = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions			 = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops 				 = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var GLUI				 = require('../../../NGGo1.3/GLUI').GLUI;
var DebugView 			 = require('../../utils/DebugView').DebugView;
var VietScene 			 = require('./VietScene').VietScene;


_StorySceneListener = Core.MessageListener.subclass({
	initialize: function(storyScene) {
		this.ss = storyScene;
	},
	onUpdate: function() {
		
	},
	onTouchNext: function(touch) {
		Log("onTOuchNext$$$$$$$$$$$$$$$$$$$$$$$$");
		switch (touch.getAction()) {
			
		case touch.Action.Start:
			this.ss.nextPage(this.ss.index);
			return true;
			break;
		case touch.Action.End:
			break;
		}
	},
});
/*
 * This function is used to display a line of word, each character will appear at different position
 * and run into one position.
 * @params text: 
 * @param finalPos: Core.Point final position that place line of words(in horizontal)
 * @params textSize: Core.Size size of node contains each character.
 */


exports.StoryScene = VietScene.subclass({
	classname: "StoryScene",
	sceneName: "STORY_SCENE",
	/*
	 * type = 0 means display opening story
	 * type = 1 means display boss story,...
	 * conf is an array that contains stories for each type
	 */
	initialize: function($super, type) {
		$super();
		
		this.listener = new _StorySceneListener(this);
		Core.UpdateEmitter.addListener(this.listener, this.listener.onUpdate);
		this.type = type || 0;     
		this.stories = [];		// an array contains background images of stories
		this.txt = [];    //an array contains stories
		this.index = 0;
	},
	defineConfig: function(controller,def) {
		var conf = {};
			conf.description = def.attrs.description;
			conf.debug = def.attrs.debug || false;
			conf.debugAttrs = def.attrs.debugAttrs || [];
			conf.tEachStory = def.attrs.tEachStory; 
    		conf.bgScale = def.attrs.bgScale;
    		conf.tScale = def.attrs.tScale;
   		 	conf.tTextMove = def.attrs.tTextMove;
   		 	conf.posTextMove = def.attrs.posTextMove;
   		 	conf.posTextBgMove = def.attrs.posTextBgMove;
   		 	conf.bgtextAlpha= def.attrs.bgtextAlpha;
    		return conf;
	},
	onSuccessConfig: function() {
		Log("call onSuccessConfig");
		this._addNextButton();
		GL2.Root.addChild(this.node);
		if(this.type == 0) {
			this.stories.push({id: '01', story: this.controller.story1, txt: this.controller.txt1, bgtext: this.controller.bgtext1});
			this.stories.push({id: '02',story: this.controller.story2, txt: this.controller.txt2, bgtext: this.controller.bgtext2});
			this.stories.push({id: '03',story: this.controller.story3, txt: this.controller.txt3, bgtext: this.controller.bgtext3});
		}
		this.nextPage(this.index);
		this.makeLine("CHXHCNVN", 25, [60,60] );
	},
	nextPage: function(idx) {
		Log("on nextPage");
		if(idx < 0 || idx > this.stories.length -1) {
			Log("End story");
			SceneDirector.transition("MAP_SELECTION_SCENE");
			//return;
			//set up more here
		} else {
			//Log("idx~~~~~~~~~" + idx);
			if(this.timeoutId != undefined)
				clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(this.bind(function() {this.nextPage(this.index);}), this.CONF.tEachStory*1000);
			this.index++;
			var story = this.stories[idx].story;
				story.setScale(this.controller.CONF.bgScale);
			var txt = this.stories[idx].txt;
			var id = this.stories[idx].id;
			var bgtext = this.stories[idx].bgtext;
				bgtext.setAlpha(this.CONF.bgtextAlpha);	
			this.node.addChild(story);
			this.node.addChild(bgtext);
			this.node.addChild(txt);
			
			var sequenceStory = VFX.spawn().fadeIn(this.CONF.tEachStory - this.CONF.tScale,1).scaleTo(this.CONF.tScale,[1,1]);
				sequenceStory.play(story,this.vfxErrorCb);
			if(id == '01' || id == '03')
			     var sequenceText = VFX.sequence().moveTo(this.CONF.tTextMove,this.CONF.posTextMove).fadeOut(this.CONF.tEachStory - this.CONF.tTextMove,0);//.blink(8,0.5, [1, 0]);
			else if(id == '02'){
			      var sequenceText = VFX.sequence().moveTo(this.CONF.tTextMove,[-40,50]).fadeOut(this.CONF.tEachStory - this.CONF.tTextMove,0);//.blink(8,0.5, [1, 0]);
			Log("@@@@@@@@@@@@@@@@@@@@@@@@@");}else if (id == '04')
			     var sequenceText = VFX.sequence().moveTo(this.CONF.tTextMove,this.CONF.posTextMove).fadeOut(this.CONF.tEachStory - this.CONF.tTextMove,0);//.blink(8,0.5, [1, 0]);
			sequenceText.play(txt,this.vfxErrorCb);
			var sequenceBgtext = VFX.sequence().fadeIn(this.CONF.tEachStory - this.CONF.tScale,1).fadeOut(this.CONF.tEachStory - this.CONF.tTextMove,0);
				sequenceBgtext.play(bgtext,this.vfxErrorCb);
			
		}
	},

	_addNextButton: function() {
		Log("_addNextButton");
	
		var touchTarget = new GL2.TouchTarget();
		touchTarget.setAnchor(0,0);
		touchTarget.setSize(60,50);
		touchTarget.getTouchEmitter().addListener(this.listener, this.listener.onTouchNext);
		
		this.controller.btnNext.addChild(touchTarget);
		this.controller.btnNext.setDepth(62001);
		this.node.addChild(this.controller.btnNext);
		
		var sequence = VFX.sequence().blink(48,0.5,[1,0],Ops.easeInExpo);
		sequence.play(this.controller.btnNext);
	},
	
	/*Create a line of words, character from random position will fly to desination to create a line of word
        first, design for horizontal line
        @param finalPos (60,60)
        */
	
	makeLine: function(text,textSize, finalPos) {
		var seq = [];
		var line = [];
		var node = new GL2.Node();
		node.setPosition(finalPos);
		for (var i = 0; i < text.length; i++) {
			var c = text.charAt(i);
			var linei = new GL2.Text();
			linei.setPosition(Math.random()*480, Math.random()*320);
			linei.setText(c);
			linei.setFontSize(textSize.getWidth());
			linei.setColor(1,0,0);
			if( c == 'V') {   // create special effect for some character
				var mv = VFXActions.moveTo(20, [(textSize.getWidth()* i), 0]);
				var rotate = VFXActions.rotate(5,360);
				var s = VFXActions.createSpawn([mv,rotate]);
				s.repeat(10);
			
			} else {
				//var mv = VFXActions.moveTo(10, [(textSize.getWidth()* i), 0]);
				//var rotate = VFXActions.rotate(5,360);
				//var s = VFXActions.createSpawn([mv,rotate]);
				//s.repeat(10);
				var s = VFX.sequence().waitFor(i).appear().moveTo(10,[(textSize.getWidth()*i),0],Ops.easeInExpo).rotate(5,-360).blink(5,0.5, [1, 0],Ops.easeInExpo).waitFor(3);
			}
			s.play(linei);
			seq.push(s);
			line.push(linei);
			node.addChild(linei);
		}
		node.setDepth(60004);
		GL2.Root.addChild(node);
	
	},
	vfxErrorCb: function(err) {
		if(err)
			Log("Error occur when apply vfx to node");
	},
	
	setupForDebug: function() {
 		this.reInitForDebug = function() {
 			Log("call reInitForDebug");
 			this.node.destroy(); 
			this.node = new GL2.Node();
			this._addBackground();
			this.listener = new _StorySceneListener(this);
			this.stories = [];		// an array contains background images of stories
			this.txt = [];    //an array contains stories
			this.index = 0;	
 		};
 		this._setConfigAttrs = function(name,value) {
 			Log("call _setConfigAttrs");
 			switch(name) {
 				case 'description' : this.CONF.description = value;break;
 				case 'debug' : this.CONF.debug = value;break;
 				case 'tEachStory' : this.CONF.tEachStory = value; break;
				case 'bgScale' : this.CONF.bgScale = value; break;
				case 'tTextMove' : this.CONF.tTextMove = value; break;
				case 'posTextMove' : this.CONF.posTextMove = value; break;
				case 'posTextbgMove' : this.CONF.posTextbgMove = value; break;
				case 'bgtextAlpha' : this.CONF.bgtextAlpha = value; break;
 				default: Log("Can't find " + name + " in CONF");
 			}
 		};
 	},
	
	onExit: function($super) {
		Core.UpdateEmitter.removeListener(this.listener);
		$super();
	},
	onPause: function() {
		Log(this.classname + " paused");
		this.node.setVisible(false);
	},
	onResume: function($super) {
	   $super();
		this.node.setVisible(true);
	},

});


