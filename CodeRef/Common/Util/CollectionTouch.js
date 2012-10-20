var GL2 			= require('../../../NGCore/Client/GL2').GL2;
var Core 			= require('../../../NGCore/Client/Core').Core;
var ScreenManager	= require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneDirector	= require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var Constant		= require('./Constant').Constant;

exports.CollectionTouch = Core.MessageListener.subclass({
	initialize : function(heroController) {
		this._heroController = heroController;
				
		this._isTouchAble = true;
		this._touchCount = -1;
		this._firstTouch={"touchCount":0, "touchId":-1};
		this._secondTouch={"touchCount":0, "touchId":-1};
	},
	
	_getTouchCount : function()
    {
        var count = 0;
        var key;
        for(key in this._touches)
        {
            if (this._touches.hasOwnProperty(key))
            {
                ++count;
            }
        }
        return count;
    },
    
	onTouch : function(touch) {
		if (touch.getPosition().getY() < Constant.HEADER_HEIGHT) {
			return;
		}
		
		if(this._firstTouch.touchId == -1 && this._secondTouch.touchId == -1){
			this._firstTouch.touchId= touch.getId();
		}else if(this._firstTouch.touchId != -1 && this._firstTouch.touchId != touch.getId() && this._secondTouch.touchId == -1){
			this._secondTouch.touchId= touch.getId();
		}
		
		if(this.touchAble){
			switch(touch.getAction()) {
				case touch.Action.End: {
					
					//Hanlde pinch in/out and click on HeroCollection 
					if(this._firstTouch.touchId != -1 && this._secondTouch.touchId ==-1
							&&	this._firstTouch.touchCount <1)
					{
						for(var i = 0; i< this._heroController._heros.length; i++) {
							var heroObj = this._heroController._heros[i];
							
							if(touch.getIsInside(heroObj._mTarget) && heroObj.isCollected()){
								//NgLogD("++++ click on hero:" + heroObj);
								SceneDirector.push("HeroShowScene", heroObj);
								break;
							}
						}
					}
					
					//reset status of second touch
					if(touch.getId() == this._secondTouch.touchId || this._firstTouch.touchId == -1){
						this._secondTouch.touchId= -1;
						this._secondTouch.touchCount= 0;
					}
					
					//reset status of first touch
					if(touch.getId() == this._firstTouch.touchId){
						this._firstTouch.touchId= -1;
						this._firstTouch.touchCount= 0;
					}
					
					this._touchCount = -1;
					break;
				}
				case touch.Action.Move: {
					//Hanlde pinch in/out and click on HeroCollection 
					if(this._firstTouch.touchId != -1){
						this._firstTouch.touchCount ++;
					}					
					//check second touch
					if(this._secondTouch.touchId != -1){
						this._secondTouch.touchCount ++;
					}					
					//pinch is working, don't need to navigate
					if(this._heroController._myCamera.getScale() >1.5){					
						return;
					}							
					
					if (this._touchCount == -1) {
						this._touchCount = 0;
						
						this._ox = this._heroController.HeroCollectionView.getPosition().getX();					
						this._sx = this._heroController.HeroCollectionView.getParent().screenToLocal(touch.getPosition()).getX();
						this._oy = this._heroController.HeroCollectionView.getPosition().getY();					
						this._sy = this._heroController.HeroCollectionView.getParent().screenToLocal(touch.getPosition()).getY();
					}									
					
					this._cx = this._heroController.HeroCollectionView.getParent().screenToLocal(touch.getPosition()).getX();
					this._cy = this._heroController.HeroCollectionView.getParent().screenToLocal(touch.getPosition()).getY();
					var newX = this._ox + (this._cx - this._sx);
					var newY = this._oy + (this._cy - this._sy);
					
					var lowestX = -(Constant.BG_IMAGE_W - 320);
					var lowestY = -(Constant.BG_IMAGE_H - 480 + Constant.HEADER_HEIGHT);
					
					if(newX < lowestX) {
						newX = lowestX;
					} 
					else if(newX >= 0) {
						newX = 0;
					}
					
					if(newY < (lowestY + Constant.HEADER_HEIGHT)) {
						newY = lowestY + Constant.HEADER_HEIGHT;
					}
					else if(newY >= Constant.HEADER_HEIGHT) {
						newY = Constant.HEADER_HEIGHT;
					}
					
					this._heroController.HeroCollectionView.setPosition(newX, newY);
				}
			}			
		}
	},
	
	get touchAble()
	{
		return this._isTouchAble;
	},
	
	set touchAble(value)
    {
		if(value == true){
			this._isTouchAble = true;
		}else{
			this._isTouchAble = false;
		}        
    }	
});