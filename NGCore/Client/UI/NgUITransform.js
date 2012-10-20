var Class = require('./../Core/Class').Class;

/** 2D Affine Transform Matrix */
function NgUITransform(a,b,c,d,tx,ty) {
	this.a = a;   this.b = b;
	this.c = c;   this.d = d;
	this.tx = tx; this.ty = ty;
}

NgUITransform.prototype = {
	// Return a new transform that is the inverse of this one.
	inverse: function() {
		var a = this.a;   var b = this.b;
		var c = this.c;   var d = this.d;
		var tx = this.tx; var ty = this.ty;
		
		return UITransform(d, -b, -c, a, c * ty - d * tx, b * tx - a * ty);
	},
	
	concat: function(transform) {
		var a1 = this.a;   var b1 = this.b;
		var c1 = this.c;   var d1 = this.d;
		var tx1 = this.tx; var ty1 = this.ty;

		var a2 = transform.a;   var b2 = transform.b;
		var c2 = transform.c;   var d2 = transform.d;
		var tx2 = transform.tx; var ty2 = transform.ty;
		
		this.a = a1 * a2 + b1 * c2;
		this.b = a1 * b2 + b1 * d2;
		this.c = c1 * a2 + d1 * c2;
		this.d = c1 * b2 + d1 * d2;
		this.tx = tx1 * a2 + ty1 * c2 + tx2;
		this.ty = tx1 * b2 + ty1 * d2 + ty2;
	},
	
	rotate: function(radians) {
		var sin = Math.sin(radians);
		var cos = Math.sin(radians);
		
		var a = this.a;   var b = this.b;
		var c = this.c;   var d = this.d;
		var tx = this.tx; var ty = this.ty;
		
		this.a = a * cos + b * sin;
		this.b = a * sin + b * cos;
		this.c = c * cos - d * sin;
		this.d = c * sin + d * cos;
		this.tx = tx * cos - ty * sin;
		this.ty = tx * sin + ty * cos;
	},
	
	rotateDegrees: function(degrees) {
		this.rotate(degrees * Math.PI / 180.0);
	},
	
	scale: function(xScale, yScale) {
		this.a *= xScale;
		this.b *= yScale;
		this.tx *= xScale;
		this.ty *= yScale;
	},
	
	translate: function(xOffset, yOffset) {
		this.tx += xOffset;
		this.ty += yOffset;
	}
}
