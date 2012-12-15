var ImageListView        = require('../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2                  = require('../../NGCore/Client/GL2').GL2;
var Core                 = require('../../NGCore/Client/Core').Core;
var UI                   = require('../../NGCore/Client/UI').UI;
var GL2                  = require('../../NGCore/Client/GL2').GL2;
var GUIBuilder           = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var GLUI                 = require('../../NGGo1.3/GLUI').GLUI;
var VFX                  = require('../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../NGGo1.3/Foundation/Math/Ops').Ops;
var Builder              = require('./Builder').Builder;
var ListNode             = require('./ListNode').ListNode;
var ScreenManager        = require('../../NGGo/Service/Display/ScreenManager').ScreenManager;

exports.eff = {};
exports.eff.shakeNode = function(node, time, dx, frequency) {
        Log("call eff shakeNode");
        var f = frequency || 50;
        var n = Math.round(f * time);
        var dt = time*1000/n;
        var x = node.getPosition().getX();
        var y = node.getPosition().getY();
        for( var i = 0; i < n; i++) {
            switch(i%4) {
                case 0: setTimeout(function() {node.setPosition(x + dx, y);}, i*dt); break;
                case 1: setTimeout(function() {node.setPosition(x - dx, y);}, i*dt); break;
                case 2: setTimeout(function() {node.setPosition(x, y + dx);}, i*dt); break;
                case 3: setTimeout(function() {node.setPosition(x, y - dx);}, i*dt); break;
            }
        }
};

/*
    Note when using this function, because it will create some new properties for scene, include:
    bb sprite: 	black background: added to node
    listNode ListNode added to ScreenManager.rootNode
    2. Ensure that scene has property helps which is array of help message.

	Can't add listNode to scene's node because when node is set touchable false, we can't touch listnode too even
	listNode is setTouchable true
*/
exports.eff.makeHelp = function(frame, context) {
    var Builder              = require('./Builder').Builder;
   
    var close = function() {
        //this.node.removeChild(this.bb);
       	//ScreenManager.getRootNode().removeChild(this.listNode);
 		this.listNode.destroy();
 		this.bb.destroy();
 		this.back.destroy();
        var seq = VFX.spawn().scaleTo(1,[1,1], Ops.EaseInExpo).moveTo(1,[frame[0],frame[1]], Ops.EaseInExpo);
        seq.play(this.clan);
        setTimeout(function() {this.node.setTouchable(true);}.bind(this), 1012);
    };
    var open = function() {
    	 this.bb =  Builder.makeSprite(null, "Content/black.png", [0,0,800,400], [0,0], [0,0,1,1], 63768);
    	 this.bb.setAlpha(0.9);

    	 var items = [];
    		if( this.helps == undefined) {Log("ERROR: scene must have helps array message"); return;}
    	 for (var i = 0; i < this.helps.length; i++) {
        	var item = Builder.makeText(null, [0,0], [180,180], this.helps[i], 14, [0.1,0,0]);
        	items.push(item)
    	 }
    	
    	 this.listNode =  new ListNode(2,items);

    	 this.back = Builder.makeSpriteButton(this.listNode,"Content/viet/img_batu.png", [340,35,40,30],{func: close.bind(this), args: 0}, [0.5,0.5]);

            this.node.addChild(this.bb);
            this.node.setTouchable(false);
            var seq = VFX.spawn().moveTo(1,[240,160], Ops.EaseInExpo).scaleTo(1,[8,8], Ops.EaseInExpo);
            seq.play(this.clan);
            setTimeout(function() {
                this.listNode.setDepth(63970);
                ScreenManager.getRootNode().addChild(this.listNode);
           
            }.bind(this), 1000);
    };
    context.clan = Builder.makeSpriteButton(context.node, "Content/viet/clan.png", frame, {func: open.bind(context), args: 0}, [0.5,0.5]);
    context.clan.setDepth(63769);
    Log("======00000000000000add clan");

},
exports.eff.scaleAppear = function(parent, child, time) {
    child.setScale(0.1,0.1);
    parent.addChild(child);
    var seq = VFX.sequence().scaleTo(time,[1,1]);
    seq.play(child);
};
/*
 * Swinging a gl2 node in different direction, maybe random direction, forever time.
 * @param direction: horizontal, vertical, or crossal
 * @dx: distance that node swing.
 * @time: decide to speed of node's movement
 */

exports.eff.swingNode = function(node, direction, dx, time) {
    var pos = [0,0];
    switch(direction) {
        case 'horizontal':
            pos = [dx,0]; 
            break;
        case 'vertical':
            pos = [0, dx];
            break;
        case 'other':
            pos = [dx,dx];
            break;
    }
    var sequence = VFX.sequence().move(time, pos).move(time,[0 - pos[0], 0 - pos[1]]).repeatForEver();
    sequence.play(node);
};

/*
 * see arrow motion in Daovang game
 */
exports.eff.guideArrow = function(arrowNode) {
    
};

exports.eff.warn = function(txt) {
    var Builder              = require('./Builder').Builder;
    Log("warn effect");
    var text = Builder.makeText(GL2.Root, [-150,20], [300,50], txt, 16, new Core.Color(1,0,0));
    text.setDepth(63768);
    var seq = VFX.sequence().moveTo(1,[100,20], Ops.EaseInExpo).waitFor(1).move(0.3, [-20,0]).moveTo(1,[480,480], Ops.EaseInExpo);
    seq.play(text);
    setTimeout(function() {text.destroy();},3000);
    
},
/*
 * Effect when user touch any point on screen, two circle appears and scale gradually (android  keyboard unlock)
 */
exports.eff.touch = function(pos,cb) {
    Log("touch effectwwwwwww");
   
    for (var i = 0; i < 5; i++) {
        var bubble = new GL2.Sprite();
        bubble.setImage("Content/viet/drop_water.png", [20,20],[0,0]);
        bubble.setPosition(Math.random()*480, 320 * Math.random());
        bubble.setDepth(62128);
        GL2.Root.addChild(bubble);
        var seq = VFX.sequence().moveTo(1,pos, Ops.easeInExpo).fadeOut(1,0.5).disappear();
        seq.play(bubble);
       setTimeout(function() {
           //Log("ahahahahah: +" + i);
            bubble.destroy();
            cb();
       }, 1100);
    }
},

/*
 * Effect similar to unlock screen of android or wave of water spread out when throw a stone to water surface
 */
exports.eff.touch2 = function(pos,cb) {
    Log("vvvvvv=====touch2");
    var Builder              = require('./Builder').Builder;
    var firstCircle = Builder.makeSprite(GL2.Root, "Content/stone/frame.png", [pos.getX(), pos.getY(),50,50],[0.5,0.5], null, 62345);
    var secondCircle = Builder.makeSprite(GL2.Root, "Content/stone/frame.png", [pos.getX(), pos.getY(),50,50],[0.5,0.5], null, 62345);
    var seq = VFX.sequence().scaleTo(0.3, [2,2], Ops.EaseInExpo).scaleTo(0.3,[1,1], Ops.EaseInExpo);
    seq.play(secondCircle);
    setTimeout(function() {
        firstCircle.destroy();
        secondCircle.destroy();
    }, 600);
},


/*
 * lighting a gl2 node by cycle ( node will delight each cycle time)
 * @params cycle: time that after each, node will delight
 */
exports.eff.lightNode = function(node, cycle) {
    
}
