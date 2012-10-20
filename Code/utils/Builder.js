var ImageListView		 = require('../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2					 = require('../../NGCore/Client/GL2').GL2;
var Core				 = require('../../NGCore/Client/Core').Core;
var UI 					 = require('../../NGCore/Client/UI').UI;
var GL2 				 = require('../../NGCore/Client/GL2').GL2;
var GUIBuilder			 = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var GLUI				 = require('../../NGGo1.3/GLUI').GLUI;
var VFX					 = require('../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions			 = require('../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops 				 = require('../../NGGo1.3/Foundation/Math/Ops').Ops;
var eff                  = require('./eff').eff;
exports.Builder = {};
exports.Builder.makeSpriteButton = function(imgPath, frame, onclick) {
		Log("[SpriteButton] = " + imgPath);
		var sprite = new GL2.Sprite();
		sprite.setImage(imgPath,new Core.Size(frame[2],frame[3]), [0,0]);
		sprite.setPosition(frame[0], frame[1]);
		
		var button = new GLUI.Button();
		button.setFrame([0,0,frame[2], frame[3]]);
		//button.setBackgroundColor('FF0000');
		button.onclick = function() {
			sprite.setColor(1,0,0);
			setTimeout(function() {sprite.setColor(1,1,1);}, 200);
			onclick(imgPath);
		}
		sprite.addChild(button.getGLObject());
		return sprite;
};
/*
 * Create a GL2 Sprite and add to parent
 * @params frame: [x,y,z,t] in this [x,y]: position of sprite, [z,t]: size of image
 * @return sprite :GL2 Sprite
 */
exports.Builder.makeSprite = function(parent, imgPath, frame, anchor, uvs) {
    var anchor = (anchor == undefined ? [0,0] : anchor);
	var sprite = new GL2.Sprite();
	sprite.setPosition(frame[0], frame[1]);
	sprite.setImage(imgPath, [frame[2], frame[3]],anchor, uvs );
	if(parent)
	   parent.addChild(sprite);
	return sprite;
};
//ver = [40, -40, 60,-40]
exports.Builder.makeLight = function(parent, pos, ver, angle, scale,time) {
	
	var prim1 = new GL2.Primitive();
	prim1.setPosition(pos);
    prim1.setType(GL2.Primitive.Triangles);
    prim1.pushVertex(new GL2.Primitive.Vertex([0, 0]));
    prim1.pushVertex(new GL2.Primitive.Vertex([ver[0], ver[1]]));
    prim1.pushVertex(new GL2.Primitive.Vertex([ver[2], ver[3]]));
    prim1.setColor(192/256, 255/256,62/256);
   // prim1.setImage('Content/vn/sheet01.png', [20,20]);
   setTimeout(function() {
   		parent.addChild(prim1);
    	var seq = VFX.spawn().scaleTo(0.5, scale).rotate(5,angle);
    	seq.play(prim1);
   }, time);
   

};
exports.Builder.makeNode = function(parent, frame) {
	// var prim1 = new GL2.Primitive();
//     
	// prim1.setPosition(frame[0]);
    // prim1.setType(GL2.Primitive.TriangleStrip);
    // prim1.pushVertex(new GL2.Primitive.Vertex([0, 0], [0, 0]));
    // prim1.pushVertex(new GL2.Primitive.Vertex([100, 0], [0.5, 0]));
    // prim1.pushVertex(new GL2.Primitive.Vertex([0, 100], [0, 1]));
    // prim1.setImage('Content/white.png', [20,20]);
    // parent.addChild(prim1);
    // return prim1;
   // GL2.Root.addChild(prim1);

	var prim1 = new GL2.Primitive();
	prim1.setPosition(frame[0]);
    prim1.setType(GL2.Primitive.TriangleStrip);
    prim1.pushVertex(new GL2.Primitive.Vertex(frame[0], [0, 0],[1,1,1]));
    prim1.pushVertex(new GL2.Primitive.Vertex(frame[1], [1, 0],[1,1,1]));
    prim1.pushVertex(new GL2.Primitive.Vertex(frame[3], [1, 1],[1,1,1]));
    prim1.pushVertex(new GL2.Primitive.Vertex(frame[2], [0, 1],[1,1,1]));
    prim1.setImage("Content/white.png",[20,20]);
    prim1.setColor(1,1,1);
    parent.addChild(prim1);
    return prim1;
};

/*
 * Create and attach a touch target in to parent(GL2Node). a touch target has same size as its parents.
 * @params type: which touch event will be catched, default: tap, type = 1: scroll up, type =2 scroll down, etc
 */
exports.Builder.makeTouch = function(parent, size, cb, type) {
    var tt = new GL2.TouchTarget();
    tt.setAnchor(0,0);
    tt.setSize(size);
    var lis = new Core.MessageListener();
   // parent.cb = cb;
    lis.onTouch = function(touch) {
          Log("onTouch function called");
            switch(touch.getAction()) {
            case touch.Action.Start:
                // Start tracking the touch event.
                this.trackingId = touch.getId();
                this.trackingPosition = touch.getPosition();
                this.trackingPositionStart = this.trackingPosition;

                // Identify the touch event's offset from the global
                // scene coordinates.
                var local = this.screenToLocal(this.trackingPosition);
                var current = this.getPosition();
                this.trackingOffset = new Core.Vector(current.getX() - local.getX(),
                  current.getY() - local.getY());
                    Log("type =========2SSFSSSSSSSSSSSSSSSSSSSSSSSS ");
                if(type == 2) {
                    Log("type =========2 ");
                  
                } else {
                    eff.touch(this.trackingPosition, cb);
                    cb.func(cb.args);
                      break;
                 }
                
                // Return true so that we continue to get touch events.
                return true;

            case touch.Action.Move:
                // Make sure this is the same touch that we are
                // currently tracking.
                if (this.trackingId != touch.getId()) {
                    return;
                }
                // Update the touch position.
                this.trackingPosition = touch.getPosition();
                //Log("tracking at:::::" + this.trackingPosition.getX() + " y = " + this.trackingPosition.getY());
                break;

            case touch.Action.End:
                // Make sure this is the same touch that we are
                // currently tracking.
                if (this.trackingId != touch.getId()) {
                    return;
                }
                if(touch.getPosition().getY() < this.trackingPositionStart.getY() - 25) {
                    Log("OK, scroll up occured");
                    cb.func(cb.args);
                }
                // Clear the ID and position.
                this.trackingId = this.trackingPosition = null;
                break;
        }
    };
    tt.getTouchEmitter().addListener(lis, lis.onTouch.bind(parent));
    parent.addChild(tt);
    return tt;
}

exports.Builder.makeText = function(parent, pos, size, message, fontSize, fontColor) {
    var text = new GL2.Text();
    text.setFontSize(fontSize);
    text.setSize(size);
    text.setColor(fontColor);
    text.setFontLocation(GL2.Text.FontLocation.Manifest);
    text.setFontFamily("Content/viet/StrikeOut.ttf");
   // font = new GL2.Font("Content/viet/StrikeOut.otf");
    //text.setFont(font);
    text.setHorizontalAlign(GL2.Text.HorizontalAlign.Center);
    text.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    //text.setOverflowMode(GL2.Text.OverflowMode.Multiline);
   text.setAnchor(0,0);
   // text.setFont("Arial");
    text.setText(message || "");
    parent.addChild(text);
    return text;
}
