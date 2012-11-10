exports.Bezier = {
	
    bezier3: function(t, p0, p1, p2, p3) {
		return Math.pow(1-t, 3) * p0 + 3 * t * Math.pow(1-t, 2) * p1 + 3 * t * t * (1-t) * p2 + t * t * t * p3;
    }
}
