/**
 * @author sonnn
 */

var GL2 = require('../../../../NGCore/Client/GL2').GL2;

exports.TagStatus = GL2.Sprite.subclass({
	initialize: function(heroLeft, heroRight) {
		this.setImage('Content/tag/tag_change_status_bg.png', [320, 151], [0, 0], [0, 0, 1, 1]);
		
		// Status coordinate
		// 10, 43
		// 40, 62 287, 62
		// 62, 81, max260, 81
		// 27, 117 93, 117 208, 117 274, 117
		// 11, 135 225, 135
		// 71, 133 278, 133 
	}
});
