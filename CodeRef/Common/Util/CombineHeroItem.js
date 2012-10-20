/**
 * 
 */
var Core	= require('../../../NGCore/Client/Core').Core;
var GL2		= require('../../../NGCore/Client/GL2').GL2;
var Constant	= require('./Constant').Constant;

exports.CombineHeroItem = Core.MessageListener.subclass({
	classname : "CombineHeroItem",

	/**
	 * Initialize function
	 * @param hero 	{Hero} a Hero object contain information of a hero
	 * @param posS 	{Core.Vector} position of a hero item.
	 * @param scale {Number} scale ratio of item.
	 * @param color {Number} color of item
	 * @param path 	{Array Object} path of item in scroll
	 * @param speed {Number} number of steps item will move from current millstone to next milstone in is path
	 * */
	initialize : function(hero, posS, scale, color, path, speed){
		this._view = new GL2.Sprite();
		this._view = hero.getFullSprite([512,512],[0.5,0.5]);
	//	console.log("hero sprite: " + this._view.getVisible());
		this._view.setPosition(posS[0], posS[1]);
		this._view.setScale(scale, scale);
		this._view.setColor(new Core.Color(color, color, color));
		
		this._itemInfo = hero;
		this._desPos = posS;
		this._path = path;
		this._speed = speed;
		this._ordSpeed = speed;
		
		this._curIndex = path.length - 1;
		this._isHide = false;
		this._isReachPos = false;
		
		Core.UpdateEmitter.addListener( this, this.onUpdate );
	},
	
	/**
	 * Create a triangle arrow animation.
	 * @return {GL2.Animation} an animation of a arrow.
	 * */
	_createArrow : function(){
		var a = new GL2.Animation();
		
		for(var i = 0 ; i < 2 ; i++){
			a.pushFrame(new GL2.Animation.Frame('Content/image/combine_new/arrow_anim.png',300,[25,29],[0.5,0.5],[i/2,0,1/2,1]));
		}
		return a;
	},
	
	/**
	 * Add an arrow on hero's head
	 * */
	addArrow : function(){
		if(!this._arrow){
			this._arrow = new GL2.Sprite();
			this._arrow.setAnimation(this._createArrow());
			
			this._arrow.setPosition(-10,-240);
			this._view.addChild(this._arrow);	
		}
	},
	
	/**
	 * Remove the arrow on hero's head
	 * */
	removeArrow : function(){
		this._view.removeChild(this._arrow);
		this._arrow.destroy();
		this._arrow = null;
	},
	
	/**
	 * Hide item by setting alpha = 0
	 * */
	hide : function(){
		this._hideAlpha = this._view.getAlpha();
		this._view.setAlpha(0);
		x = this._view.getPosition().getX();
//		console.log("..hide x: " + x  + ", i: " + this._index);
		this._isHide = true;
	},
	/**
	 * Show item
	 * */
	show : function(alpha){
		alpha = alpha || this._hideAlpha || 1;
		this._view.setAlpha(alpha);
		x = this._view.getPosition().getX();
//		console.log("..show x: " + x  + ", i: " + this._index);
		this._isHide = false;
	},
	
	/**
	 * Check whether item is hided or not
	 * @return {Boolean}
	 * */
	isHide : function(){
		return this._isHide;
	},
	
	/**
	 * Return the sprite contain item
	 * @return {GL2.Sprite}
	 * */
	getView : function(){
		return this._view;
	},
	
	/**
	 * Return information of item.
	 * @return {Hero}
	 * */
	getItemInfo : function(){
		return this._itemInfo;
	},
	
	/**
	 * Return current index of millstone in item's path
	 * @retun {Number}
	 * */
	getCurIndex : function(){
		return this._curIndex;
	},
	
	/**
	 * Onupdate function
	 * */
	onUpdate : function(){
		var x = this._view.getPosition().getX();
		var remX = x - this._desPos[0];
		
		if(remX > 0 && this._move){
			this.move(Constant.MOVE_LEFT);
		}else if(remX < 0 && this._move){
			this.move(Constant.MOVE_RIGHT);
		}else{
			this._speed = this._ordSpeed;
			this._move = false;
			this._isReachPos = true;
		}
	},
	
	/**
	 * Check whether item is reach end position or not
	 * @return {Boolean}
	 * */
	isReachEndPos : function(){
		return this._isReachPos;
	},
	/**
	 * Move the item to a position
	 * @param 	pos {GL2.Vector} a position. [x,y]
	 * */
	moveTo : function(pos){
		this._desPos = pos;
		this._speed = Constant.AUTOMOVE_SPEED;
		this._move = true;
	},
	
	/**
	 * For debug purpose only
	 * */
//	setIndex : function(id){
//		this._index = id;
//	},
	
	/**
	 * Move the item a portion based on its position and millstones in its path.
	 * @param	direction {String} the direction of motion. Currently support Constant.MOVE_LEFT and Constant.MOVE_RIGHT 
	 * 
	 * */
	move : function(direction){
		if(this._isHide){
			return;
		}
		
		var x = this._view.getPosition().getX();
		var y = this._view.getPosition().getY();
		var s = this._view.getScale().getX();
		var c = this._view.getColor().getRed();
		var a = this._view.getAlpha();
		var idx = this._curIndex;
		var nextIdx = 0;
		var deltaX = 0;
		var deltaY = 0;
		var dX = 0;//delta X
		var dY = 0;//delta Y
		var dC = 0;//delta Color
		var dS = 0;//delta Scale
		var dA = 0;//delta Alpha
		
		//Calculate next index
		if(direction == Constant.MOVE_LEFT){
			if(this._path[idx].x < x){
				this._curIndex = idx = idx + 1;
			}
			nextIdx = idx - 1;
		}
		else{
			if(this._path[idx].x > x){
				this._curIndex = idx = idx - 1;	
			}
			nextIdx = idx + 1;
		}
		
		if(direction == Constant.MOVE_LEFT && idx <= 0){
			this._view.setPosition(this._path[idx].x, this._path[idx].y);
			this.hide();
			this._curIndex = 0;
			return;
		}
		if(direction == Constant.MOVE_RIGHT && idx >= this._path.length - 1){
			this._view.setPosition(this._path[idx].x, this._path[idx].y);
			this.hide();
			this._curIndex = this._path.length - 1;
			return;
		}
		
		deltaX = this._path[idx].x - this._path[nextIdx].x;
		deltaY = this._path[idx].y - this._path[nextIdx].y;
		dX = deltaX/this._speed;
		dY = dX * deltaY/deltaX;
		dC = (this._path[idx].color - this._path[nextIdx].color)/this._speed;
		c = c - dC;
		dS = (this._path[idx].scale - this._path[nextIdx].scale)/this._speed;
		s = s - dS;
		dA = (this._path[idx].alpha - this._path[nextIdx].alpha)/this._speed;

		this._view.setPosition(x - dX, y - dY);
		this._view.setScale(s,s);
		this._view.setColor(new Core.Color(c,c,c));
		this._view.setAlpha(a - dA);
		
		x = this._view.getPosition().getX();
//		console.log("in CombineHeroItem move x: " + x + ", next: " + this._path[nextIdx].x + ", i: " + this._index);	
		var subX = Math.floor(x - this._path[nextIdx].x);
		//Change to next index	
		if(direction == Constant.MOVE_LEFT){
			if(subX <= 0){
				this._curIndex = nextIdx;
				this._view.setPosition(this._path[nextIdx].x, this._path[nextIdx].y);
				s = this._path[nextIdx].scale;
				this._view.setScale(s,s);
				c = this._path[nextIdx].color;
				this._view.setColor(new Core.Color(c,c,c));
				this._view.setAlpha(this._path[nextIdx].alpha);
				
				if(nextIdx == 0){
					this.hide();
				}
			}	
		}else{
			if(subX >= 0){
				this._curIndex = nextIdx;
				this._view.setPosition(this._path[nextIdx].x, this._path[nextIdx].y);
				s = this._path[nextIdx].scale;
				this._view.setScale(s,s);
				c = this._path[nextIdx].color;
				this._view.setColor(new Core.Color(c,c,c));
				this._view.setAlpha(this._path[nextIdx].alpha);
				
				if(nextIdx == this._path[nextIdx].length - 1){
					this.hide();
				}
			}
		}
//		x = this._view.getPosition().getX();
//		console.log("in CombineHeroItem move x: " + x + ", next: " + this._path[nextIdx].x + ", i: " + this._index);
	},
	
	/**
	 * @Override destroy
	 * */
	destroy : function($super){
		Core.UpdateEmitter.removeListener(this, this.onUpdate);
		
		this._arrow.destroy();
		this._arrow = null;
		
		this._view.destroy();
		delete this._view;
		
		delete this._path;
		delete this._curIndex;
		delete this._itemInfo;
		delete this._desPos;
		delete this._ordPos;
		delete this._speed;
		delete this._isHide;
		delete this._isReachPos;
		delete this._move;
		$super();
	}
});