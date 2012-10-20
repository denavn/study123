var Core  = require('../../../NGCore/Client/Core').Core;
var GL2   = require('../../../NGCore/Client/GL2').GL2;
var Audio = require('../../../NGCore/Client/Audio').Audio;
var SceneDirector 		= require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var ScreenManager		= require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
//========================================================================================
exports.SpecialMission = Scene.subclass({
	
	//--------------------------------------------------------------------------
	initialize: function( rootNode, message1, message2,onCompleteHandler ) {
		
		this.name = "SpecialMission";
		this.rootNode = rootNode  ||  new GL2.Node();
		this.rootNode.setDepth(65535);
		
		this.nodes = [];
		this.onCompleteHandler = onCompleteHandler;
		this._message1 = message1;
		this._message2 = message2;
		
		this._color1 = [1, 1, 0.5];
		this._color2 = [0.2, 0.8, 0.2];
	},
	//--------------------------------------------------------------------------
	destroy: function() {},
	
	//--------------------------------------------------------------------------
	onEnter: function() {
		console.log("NDL: --- onEnter");
		
		
		var duration = 1.0;
		//dn.AudioPlayer.playEffect( 'common/Z_009.wav' );
		
		//----- diagonal black frame
		//var p = this.makeBrushStroke( 145-50, 235, 100, 100 );
		var p = new GL2.Sprite();
		p.setImage("Content/cutscene/brush_stroke.png");
		//p.setRotation( 45 );
		//p.setAlpha( 0 );
		this.rootNode.addChild( p );
		this.nodes.push( p );
		GL2.Root.addChild(this.rootNode);
		//dn.VFX.enchant( p ).fi( 0.2 ).wait( duration ).fo( 0.2 );
		//dn.VFX.enchant( p ).move( 0.2, 50, 0, -1 ).wait( duration ).move( 0.2, 50, 0, 1);
		
		
		//----- logo: SPECIAL MISSION
		//var n = new GL2.Node();
		
		//var t = dn.ImageFontFactory.create(
		//	'common/font/general.png', nj.TT('SPECIAL'), 48, -1, [1, 1, 0.5], [0.2, 0.8, 0.2]
		//);
		//t.setAnchor( 1, 1 );
		//t.setPosition( 0, 0 );
		//console.log("NDL:1111");
		//var t = new GL2.Text();
		//t.setSize(100, 30);
		//t.setText("SPECIAL ABCDEF");
		//n.addChild( t );
		//this.nodes.push( t );
		
		//var t = dn.ImageFontFactory.create(
		//	'common/font/general.png', nj.TT('MISSION!'), 48, -1, [1, 1, 0.5], [0.2, 0.8, 0.2]
		//);
		//t.setAnchor( 1, 1 );
		//t.setPosition( 120, 42 );
		//n.addChild( t );
		//this.nodes.push( t );
		//console.log("NDL:2222");
		//n.setRotation( 45 );
		//n.setPosition( 135 - 200, 200 - 200 );
		//this.rootNode.addChild( n );
		//this.nodes.push( n );
		//console.log("NDL:33333");
		//dn.VFX.enchant( n ).move( 0.3, 200, 200, 1 )
		//	.move( 0.03, -5, -5, -1 ).move( 0.03, 9, 9, -1 )
		//	.move( 0.03, -7, -7, -1 ).move( 0.03, 5, 5, -1 )
		//	.move( 0.03, -3, -3, -1 ).move( 0.03, 1, 1, -1 )
		//	.wait( duration - 0.3 ).move( 0.4, 250, 250, 1 );
		//dn.VFX.enchant( n ).wait( duration + 0.2 ).fo( 0.3 );
		
		//----- set end trigger
		console.log("NDL:-- set time out");
		dn.Timekeeper.setTimeout( dn.bind( this, function() {
			this.endScene();
		}), duration + 0.6 );
	},
	
	//--------------------------------------------------------------------------
	onExit: function() {
		
		dn.VFX.removeAllTasks();
		dn.Timekeeper.clearAllTimeout();
		dn.each( this.nodes, function(i) {
			i.destroy();
		});
		this.destroy();
	},
	
	//--------------------------------------------------------------------------
	endScene: function() {
		console.log("NDL: endScene");
		SceneDirector.pop();
		console.log("NDL:this.onCompleteHandler="+this.onCompleteHandler);
		//if (this.onCompleteHandler) {
		//	this.onCompleteHandler.apply();
		//}
	},
	makePrimitive: function( x, y, w, h, color1, color2, color3, color4 ) {
		
		if (arguments.length <= 6) {
			color3 = color2 || color1;
			color4 = color2 || color1;
			color2 = color1;
		}
		
		var p = new GL2.Primitive();
		p.setType( GL2.Primitive.Type.TriangleStrip );
		
		p.pushVertex( new GL2.Primitive.Vertex([0, 0], [0, 0], color1) );
		p.pushVertex( new GL2.Primitive.Vertex([w, 0], [1, 0], color2) );
		p.pushVertex( new GL2.Primitive.Vertex([0, h], [0, 1], color3) );
		p.pushVertex( new GL2.Primitive.Vertex([w, h], [1, 1], color4) );
		
		p.setPosition( x, y );
		return p;
	},
	//--------------------------------------------------------------------------
	makeBrushStroke: function( x, y, w, h ) {
		
		var s = new GL2.Sprite();
		s.setImage("Content/cutscene/brush_stroke.png");
		//nj.Utils.setSpriteImage(
		//	s,
		//	nj.IMG("common/cutscene", "brush_stroke.png"),
		//	[w, h], [0.5, 0.5]
		//);
		s.setPosition( x, y );
		return s;
	},
	
	//--------------------------------------------------------------------------
	onEnterViaPush: function( prevScene, option ) { this.onEnter( prevScene ); },
	onEnterViaPop : function( prevScene, option ) {},
	onExitViaPush : function( nextScene, option ) {},
	onExitViaPop  : function( nextScene, option ) { this.onExit( nextScene ); }
});

