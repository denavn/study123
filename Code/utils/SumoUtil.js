var Core = require('../../NGCore/Client/Core').Core;
var GL2  = require('../../NGCore/Client/GL2').GL2;

exports.SumoUtil = Core.Class.singleton({
    
    //Create animation 
    createAnimation: function(path, frameCount, duration, w, h){
    	//path = nj.IMG(null, path);
    	if (duration == undefined)
    		duration = 500;
        var animation = new GL2.Animation();

    	for (var i = 0; i < frameCount ; i ++ ){
        	animation.pushFrame(new GL2.Animation.Frame(path, duration, [w, h], [0.5, 1], [i/frameCount, 0, 1/frameCount, 1]));
    	}
        
        return animation;
    },
	
	//--------------------------------------------------------------------------
	traverse: function( obj, func, level ) {
		var level = level || 0;
		for (var i in obj) {
			func.apply( this, [i, obj[i], level] );
			if (typeof( obj[i] ) === "object" ) {
				this.traverse( obj[i], func, level+1 );
			}
		}
	},
	
	//--------------------------------------------------------------------------
	dump: function( obj, name ) {
		NgLogD( '--------------- traverse: ' + name );
		
		this.traverse( obj, function( key, val, level ) {
			var indent = '';
			var output = '';
			for (var i=0;  i<level;  i++) { indent += '    '; }
			output += indent + key + ': ';
			if (! (val + '').match(/\[object Object\]/)) {
				output += val;
			}
			NgLogD( output );
		}, 1);
	},
		
	//--------------------------------------------------------------------------
	makeButton: function( x, y, image, pressedImage, size, anchor, listener, onTouchHandler ) {
	
		var b = new GL2.Sprite();
		nj.Utils.setSpriteImage(b,  image, size, anchor );
		b.setPosition( x, y );
		b.image = image;
		b.pressedImage = pressedImage;
		
		var target = new GL2.TouchTarget();
		target.setAnchor( [0, 0] );
		target.setSize( size[0], size[1] );
		nj.crystal.touchEmitter.addListener(
			listener,
			target,
			//----- on touch
			function( touch ) {
				if (! this._hasPushed) { this._hasPushed = false; }
				switch (touch.getAction()) {
				case touch.Action.Start:
					nj.Utils.setSpriteImage(b,  pressedImage, size, anchor );
					this._hasPushed = true;
					break;
				case touch.Action.End:
					if (this._hasPushed) {
						nj.Utils.setSpriteImage(b,  image, size, anchor );
						onTouchHandler.apply( listener );
					}
					break;
				}
			},
			//----- on finger out
			function() {
				nj.Utils.setSpriteImage(b,  image, size, anchor );
			}
		);
		b.addChild( target );
		
		return b;
	},
	
	//--------------------------------------------------------------------------
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
	makeText: function( text, size, color ) {
		return new nj.crystal.ShadowText( text, size, color );
	},
	
	//--------------------------------------------------------------------------
	makeBlind: function() {
		
		//----- linear scaling して余った部分を黒い帯で隠す
		//----- (とりあえずの応急処置)
		var width  = Core.Capabilities.getScreenHeight();
		var height = Core.Capabilities.getScreenWidth();
		
		var scale    = height / 320;
		var shortage = width - (480 * scale);
		
		var blind;
		if (shortage > 0) {
			blind = new GL2.Primitive();
			blind.setType( GL2.Primitive.Type.TriangleStrip );
			blind.pushVertex( new GL2.Primitive.Vertex([width - shortage,      0], [0, 0], [0,0,0]) );
			blind.pushVertex( new GL2.Primitive.Vertex([width           ,      0], [1, 0], [0,0,0]) );
			blind.pushVertex( new GL2.Primitive.Vertex([width - shortage, height], [0, 1], [0,0,0]) );
			blind.pushVertex( new GL2.Primitive.Vertex([width           , height], [1, 1], [0,0,0]) );
			blind.setDepth( 99999999 );
			GL2.Root.addChild( blind );
		}
		return blind;
	}
});
