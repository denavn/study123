/**
 * 
 */
var Core	= require('../../../NGCore/Client/Core').Core;
var GL2		= require('../../../NGCore/Client/GL2').GL2;
var CombineHeroItem	= require('./CombineHeroItem').CombineHeroItem;
var Constant = require('./Constant').Constant;

/**
 * This class processes touch actions.
 * */
var TouchListener = Core.MessageListener.subclass({
	classname : "TouchListener",
	
	/**
	 * Initialize function
	 * @param 	controller 	{a controller} the controller control the scroll
	 * @param	itemList 	{Array CombineHeroItem} an array of CombineHeroItem
	 * @param 	posS		{GL2.Vector} start position of the scroll
	 * @param 	posE		{GL2.Vector} end position of the scroll
	 * @param 	itemView	{Number} number of items represented on screen
	 * @param 	path		{Array Object} path of items in scroll
	 * */
	initialize : function(controller,itemList, itemView, path){
		this._controller = controller;
		this._itemList = itemList;
		this._itemView = itemView;
		this._path = path;
		
		this._vList = [];
		this._maxLength = 10;
		this._curItem = 0;
		this._itemList[0].addArrow();
		this._controller.showStat(this._itemList[0].getItemInfo());
		
		this._prevTouchId = null;
	},
	
	/**
	 * onTouch function
	 * */
	onTouch : function(touch){
		var scale = 320 / Core.Capabilities.getScreenWidth();
		var x = touch.getPosition().getX() * scale;
		var y = touch.getPosition().getY() * scale;
		
		switch(touch.getAction()){
			case touch.Action.Start:
				if(this._prevTouchId && this._prevTouchId != touch.getId()){
					break;
				}
				this._vList = [ {
					x : x,
					y : y
				} ];
				
				return true;
				break;
			case touch.Action.End:
				if(this._prevTouchId && this._prevTouchId != touch.getId()){
					break;
				}
			//	console.log("end touch...");
				if(this._vList.length > 1){
					var cur = this._curItem;
					var curX = this._itemList[cur].getView().getPosition().getX();
					var move = (cur + this._itemView) > this._itemList.length ? this._itemList.length : cur + this._itemView;
				//	console.log("--end: move: " + move);
					if(this._vList[0].x < this._vList[1].x || this._vList[0].y > this._vList[1].y){
					//move forward	
					//	console.log("end: " + this._curItem + ", idx: " + this._itemList[this._curItem].getCurIndex() + ", move: " + move);
						//case current item passed end position
						// => change current item to next item 
						if(this._itemList[cur].getCurIndex() == 1 && curX < this._path[1].x){
							var idx = 0;
							for(var i = cur ; i < move ; i++){
//								console.log("move left to next item, i: " + i);
//								this._itemList[i].setIndex(i);
								this._itemList[i].moveTo([this._path[idx].x, this._path[idx].y]);
								idx++;
							}
							if(this._itemList[move]){
								this._itemList[move].show();
							}
							
							this._curItem = cur + 1;
							this._itemList[cur].removeArrow();
							this._itemList[cur + 1].addArrow();
							this._controller.showStat(this._itemList[cur+1].getItemInfo());
						}else if(this._itemList[cur].getCurIndex() == 2 && curX > this._path[1].x){
						//case current item hasn't reach end position
						// => move current item to end position
							var idx = 0;
							if(move < (cur + this._itemView)){
								move = move + 1;
							}
							for(var i = cur - 1 ; i < move - 1 ; i++){
//								console.log("move left to end pos, i: " + i);
//								this._itemList[i].setIndex(i);
								this._itemList[i].moveTo([this._path[idx].x, this._path[idx].y]);
								idx++;
							}
							
							if(this._itemList[move - 1]){
								this._itemList[move - 1].show();
							}
						}
					}else if(this._vList[0].x > this._vList[1].x || this._vList[0].y < this._vList[1].y){
					//move backward
						//case current item passed end position
						// => change current item to previous item
						if(this._itemList[cur].getCurIndex() == 1 && curX > this._path[1].x && cur > 0){
							var idx = 1;
							if(move < (cur + this._itemView)){
								move = move + 1;
							}
							for(var i = cur - 1 ; i < move - 1 ; i++ ){
//								console.log("move right to pre item, i: " + i);
//								this._itemList[i].setIndex(i);
								this._itemList[i].moveTo([this._path[idx].x, this._path[idx.y]]);
								idx ++;
							}

							this._curItem = cur - 1;
							this._itemList[cur].removeArrow();
							this._itemList[cur - 1].addArrow();
							this._controller.showStat(this._itemList[cur - 1].getItemInfo());
						} else if(this._itemList[cur].getCurIndex() == 0 && curX < this._path[1].x){
						//case current item hasn't reach end position
						//=> move current item to end position
							var idx = 1;
							for(var i = cur ; i < move ; i++){
//								console.log("move right to end pos, i: " + i);
//								this._itemList[i].setIndex(i);
								this._itemList[i].moveTo([this._path[idx].x , this._path[idx].y]);
								idx++;
							}
						}
					}
				}
				this._prevTouchId = null;
				this._vList = [];
				break;
			case touch.Action.Move:
				if(this._prevTouchId && this._prevTouchId != touch.getId()){
					break;
				}
				
				this._prevTouchId = touch.getId();
				
				this._vList.unshift({
					x : x,
					y : y
				});
				
				if(this._vList.length < 2){
					break;
				}
				
				this._prevPos = this._vList[0];
				var curItemX = this._itemList[this._curItem].getView().getPosition().getX();
				var startId = (this._curItem - 1) < 0 ? 0 : this._curItem - 1;
				var endId = (startId + this._itemView + 1) < this._itemList.length ? (startId + this._itemView + 1) : this._itemList.length;
				if(this._prevPos.x < this._vList[1].x || this._prevPos.y > this._vList[1].y){
					//move forward
					if(this._curItem < this._itemList.length - 1 
							|| (this._curItem == this._itemList.length - 1 && curItemX > this._path[1].x)){
				//		for(var i = 0 ; i < this._itemList.length ; i++){
						for(var i = startId ; i < endId ; i++){
							var item = this._itemList[i];
							var iX = item.getView().getPosition().getX();
							
							if(i <= (this._itemList.length - this._itemView) && iX == this._path[1].x){
//								console.log("--show: " + (i + this._itemView - 1));
								this._itemList[i + this._itemView - 1].show();
//								this._itemList[i + this._itemView - 1].move(Constant.MOVE_LEFT);
							}
//							console.log("move left: " + i);
							item.move(Constant.MOVE_LEFT);
							
							iX = item.getView().getPosition().getX();
							
							if(this._curItem == i && i != (this._itemList.length - 1) && iX < 0){
								this._curItem = i + 1;
								item.removeArrow();
								this._itemList[i + 1].addArrow();
								this._controller.showStat(this._itemList[i+1].getItemInfo());
							}
						}
					}
				}else if(this._prevPos.x > this._vList[1].x || this._prevPos.y < this._vList[1].y){
					//move backward
					if(this._curItem > 0 || (this._curItem == 0 &&  curItemX < this._path[1].x)){
					//	for(var i = 0 ; i < this._itemList.length ; i++){
						for(var i = startId ; i < endId ; i++){
							var item = this._itemList[i];
							var iX = item.getView().getPosition().getX();
							
							if(i != 0 && iX == this._path[1].x){
//								console.log("--show: " + (i-1));
								this._itemList[i-1].show();
								this._itemList[i-1].move(Constant.MOVE_RIGHT);
							}
//							console.log("right: " + i);
							item.move(Constant.MOVE_RIGHT);
							
							iX = item.getView().getPosition().getX();
						
							if(this._curItem == (i + 1) && iX > 0){
								this._curItem = i;
								item.addArrow();
								this._itemList[i+1].removeArrow();
								this._controller.showStat(this._itemList[i].getItemInfo());
							}
						}
					}
				}
				
				break;
		}
		
		while ( this._maxLength < this._vList.length ) {
			this._vList.pop();
		}
	},
	
	/**
	 * Get current selected item id
	 * @return {Number}
	 * */
	getCurrentItem : function(){
		return this._curItem;
	},
	
	/**
	 * @Override destroy
	 * */
	destroy : function($super){
		delete this._vList;
		delete this._controller;
		delete this._curItem;
		delete this._itemList;
		delete this._itemView;
		delete this._maxLength;
		delete this._path;
		delete this._prevPos;
		delete this._prevTouchId;
		$super();
	}
});

exports.CombineHeroScroller = Core.MessageListener.subclass({
	classname: "CombineHeroScroller",
	
	/**
	 * Initialize function
	 * @param	controller 	{a controller} the controller control the scroll
	 * @param	size		{GL2.Vector} size of touch target added in the scroll
	 * @param 	posS		{GL2.Vector} start position of the scroll
	 * @param	posE		{GL2.Vector} end position of the scroll
	 * @param	itemView	{Number} number of items represented 
	 * @param	speed		{Number} number of steps which each item will move in each milstone
	 * */
	initialize : function(controller, size, itemView, speed, path){
		this._garbage = [];
		this._node = new GL2.Sprite();
		this._node.setPosition(0,0);
		this._itemsObj = [];
		
		this._controller = controller;
//		this._posS = posS;
//		this._posE = posE;
		this._itemView = itemView;
		this._speed = speed;
		this._milstone = path;
		
//		this._maxScale = 1;
//		this._minScale = 0.2;
//		this._minAlpha = 0.2;
//		this._minColor = Constant.DARK_COLOR.getRed();
		
		this._touchTarget = new GL2.TouchTarget();
		this._touchTarget.setAnchor(0, 0);
		this._touchTarget.setSize(size[0], size[1]);
		
		this._node.addChild(this._touchTarget);
		
		Core.UpdateEmitter.addListener( this, this.onUpdate );
		
		this._garbage.push(this._touchTarget);
		this._garbage.push(this._node);
	},
	
	/**
	 * create ui for the scroll
	 * */
	_initUI : function(){
		if(!this._items){
			return;
		}
		if(!this._milstone){
			this._setDefaultPath();
		}
		console.log("---milstone: " + this._milstone.length);
		
		//reset itemview to avoid exception when input data is inappropriate
		if(this._itemView > this._milstone.length - 1){
			this._itemView = this._milstone.length - 1;
		}
		
		this._itemsObj = [];
		var items = this._items;
		var item = null;
		var mil = this._milstone[this._itemView];
		var posS = [mil.x, mil.y];
		var scale = mil.scale;
		var color = mil.color;
		
		
		for(var i = 0 ; i < items.length ; i++){
			item = new CombineHeroItem(items[i], posS, scale, color, this._milstone, this._speed);
			item.getView().setDepth(1/(i+1));
			
			if(i < this._itemView){
				var mil = this._milstone[i + 1];
				item.moveTo([mil.x, mil.y]);
				console.log("---milstone: " + i + ", x: " + mil.x + ", y: " + mil.y);
			}
			else{
				item.hide();
			}
			
			this._node.addChild(item.getView());
			this._itemsObj.push(item);
			this._garbage.push(item);
		}
//		if(!this._listener){
//			this._listener = new TouchListener(this._controller, this._itemsObj, this._itemView, this._milstone);
//			this._touchTarget.getTouchEmitter().addListener(this._listener, this._listener.onTouch);
//			this._garbage.push(this._listener);
//		}
	},
	/**
	 * on update function.
	 * */
	onUpdate : function(){
		//Wait until viewed items moved to destination position
		if(!this._listener && this._itemsObj.length > this._itemView){
			for(var i = 0 ; i < this._itemView ; i++){
				if(!this._itemsObj[i].isReachEndPos()){
					return;
				}
			}
			this._listener = new TouchListener(this._controller, this._itemsObj, this._itemView, this._milstone);
			this._touchTarget.getTouchEmitter().addListener(this._listener, this._listener.onTouch);
			this._garbage.push(this._listener);
		}
	},
	
	/**
	 * generate path for items in the scroll
	 * */
//	_generateMilstone : function(){
//		this._milstone = [];
//		var pE = this._posE;
//		var pS = this._posS;
//		
//		if(this._items.length < this._itemView){
//			this._itemView = this._items.length;
//		}
//		
//		var deltaX = pS[0] - pE[0];
//		var deltaY = pS[1] - pE[1];
//		var preX = -100;
//		var preY = pS[1] - deltaY * (pS[0] - preX)/deltaX;
//		
//		this._milstone.push({
//			x : preX,
//			y : preY,
//			color: 1,
//			scale:this._maxScale + 0.5,
//			alpha: this._minAlpha
//		});
//		
//		var oX = 0;
//		var oY = pE[1];
//		var scale = this._maxScale;
//		var color = 0;
//		var t = 0;
//		for(var i = 0 ; i < this._itemView ; i++){
//			color = 1 - i * (1 - this._minColor)/(this._itemView - 1);
//			
//			this._milstone.push({
//				x: oX + pE[0],
//				y: oY,
//				color: color,
//				scale: scale,
//				alpha: 1
//			});
//			t = 2 * (deltaX - oX)/(this._itemView - i);
//			oX += t;
//			oY += t * deltaY/deltaX;
//			scale -= t * (this._maxScale - this._minScale)/deltaX;
//		}
//	},
	
	/**
	 * set default path for scroll
	 * */
	_setDefaultPath : function(){
		this._milstone = [
							{
								x: -100,
								y: 400,
								color: 1,
								scale: 1.5,
								alpha: 0.2
							},
							{
								x: 100,
								y: 280,
								color: 1,
								scale: 1,
								alpha: 1
							},
							{
								x: 200,
								y: 170,
								color: 0.7,
								scale: 0.5,
								alpha: 1
							},
							{
								x: 250,
								y: 140,
								color: 0.5,
								scale: 0.35,
								alpha: 1
							},
							{
								x: 270,
								y: 125,
								color: 0.3,
								scale: 0.2,
								alpha: 1
							}
        	            ];
	},
	/**
	 * set controller contains the scroll.
	 * */
	setController : function(controller){
		if(controller){
			this._controller = controller;
		}
	},
	
	/**
	 * Set items information.
	 * */
	setItems : function(items){
		this._items = items;
	//	this._generateMilstone();
		this._initUI();
	},
	/**
	 * Set scroll's path
	 * */
	setPath : function(path){
		if(path){
			this._milstone = path;
		}
	},
	
	/**
	 * Get current selected item id
	 * @return	 {Number}
	 * */
	getCurrentItem : function(){
		return this._listener.getCurrentItem();
	},
	
	/**
	 * Get node of the scroll
	 * @return {GL2.Sprite}
	 * */
	getNode : function(){
		return this._node;
	},
	
	/**
	 * @override destroy
	 * */
	destroy : function($super){
		for(var i = 0 ; i < this._garbage.length ; i++){
			this._garbage[i].destroy();
			this._garbage[i] = null;
		}
		delete this._garbage;
		
		if(this._milstone){
			delete this._milstone;
		}
		if(this._itemsObj){
			delete this._itemsObj;
		}
		delete this._controller;
		delete this._items;
		delete this._itemView;
		delete this._milstone;
		$super();
	}
});