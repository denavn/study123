/********************************************************************************************
 * Class Name: Constant 
 * 
 * @Description: Define constants which will be used in all classes 
 * 
 *******************************************************************************************/
var Core	= require('../../../NGCore/Client/Core').Core;
var Color	= require('../../../NGCore/Client/Core/Color').Color;

exports.Constant= Core.Class.singleton({
	
	//This color constant is used to make color of hero image darker
	COLOR_DARK: new Color(0.4, 0.4, 0.4),
	COLOR_WHITE: new Color(1, 1, 1),
	
	//Motion direction
	MOVE_LEFT:		"left",
	MOVE_RIGHT:		"right",
	AUTOMOVE_SPEED:	5,// speed of items when CombineHeroScroller auto move
	SCALE_HERO_COLLECTION: 0.19921875,
	HERO_SIZE: 512,
	HERO_SCALE: 0.4,
	BLANK_BOUND_EACH_SIDE:30,
	
	BG_IMAGE_W: 512,
	BG_IMAGE_H: 512,
	QUESTION_MARK_SIZE: 10,
	
	//font type
	FONT_BASE_PATH: "Content/image/collection_new/",
	FONT_RED: "number_red",
	FONT_SILVER: "number_silver",
	HEADER_HEIGHT: 70,

});
