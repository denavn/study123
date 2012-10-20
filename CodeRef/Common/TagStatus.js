var GL2 = require('../../NGCore/Client/GL2').GL2;

exports.TagStatus = GL2.Sprite.subclass({
	TEXT_SIZE: 12,
	
	/**
	 * Construct TagStatus object. 
	 *
	 * @param {Object} The left tag
	 * @param {Object} The right tag
	 */
	initialize: function(heroLeft, heroRight) {
		this.setImage('Content/image/tag/tag_change_status_bg1.png', [320, 151], [0, 0], [0, 0, 1, 1]);
		
		this.update(heroLeft, heroRight);
	},
	
	/**
	 * Update tags status 
	 *
	 * @param {Object} The left tag
	 * @param {Object} The right tag
	 */
	update: function(heroLeft, heroRight) {
		// Style
		if(this.style1){
			this.removeChild(this.style1);
			this.style1.destroy();
			this.style1 = null;
		}
		this.style1 = heroLeft.getStyleSprite([44, 28], [0, 0]);
		this.style1.setPosition(0, 4);
		this.addChild(this.style1);
		
		if(this.style2){
			this.removeChild(this.style2);
			this.style2.destroy();
			this.style2 = null;
		}
		this.style2 = heroRight.getStyleSprite([44, 28], [0, 0]);
		this.style2.setPosition(320 - 44, 4);
		this.addChild(this.style2);
		
		// Rariry
		if(this.rarity1){
			this.removeChild(this.rarity1);
			this.rarity1.destroy();
			this.rarity1 = null;
		}
		this.rarity1 = heroLeft.getRaritySprite([33, 14], [0, 0]);
		this.rarity1.setPosition(48, 14);
		this.addChild(this.rarity1);
		
		if(this.rarity2){
			this.removeChild(this.rarity2);
			this.rarity2.destroy();
			this.rarity2 = null;
		}
		this.rarity2 = heroRight.getRaritySprite([33, 14], [0, 0]);
		this.rarity2.setPosition(320 - 48 - 33, 14);
		this.addChild(this.rarity2);
		
		// Rank
		if(this.rank1){
			this.removeChild(this.rank1);
			this.rank1.destroy();
			this.rank1 = null;
		}
		this.rank1 = heroLeft.getRankSprite([33, 13], [0, 0]);
		this.rank1.setPosition(82, 17);
		this.addChild(this.rank1);
		
		if(this.rank2){
			this.removeChild(this.rank2);
			this.rank2.destroy();
			this.rank2 = null;
		}
		this.rank2 = heroRight.getRankSprite([33, 13], [0, 0]);
		this.rank2.setPosition(210, 17);
		this.addChild(this.rank2);
		
		// Name
		if(!this.name1){
			this.name1 = new GL2.Text();
			this.name1.setFontSize(this.TEXT_SIZE);
			this.name1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.name1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.name1.setAnchor(0, 0);
			this.name1.setPosition(10, 44);
			this.addChild(this.name1);
		}
		this.name1.setText(heroLeft.name);	
		
		if(!this.name2){
			this.name2 = new GL2.Text();
			this.name2.setFontSize(this.TEXT_SIZE);
			this.name2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.name2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.name2.setAnchor(0, 0);
			this.name2.setPosition(192, 44);
			this.addChild(this.name2);
		}
		this.name2.setText(heroRight.name);
		
		// Level
		if(!this.level1){
			this.level1 = new GL2.Text();
			this.level1.setFontSize(this.TEXT_SIZE);
			this.level1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.level1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.level1.setAnchor(0, 0);
			this.level1.setPosition(38, 62);
			this.addChild(this.level1);
		}
		this.level1.setText(heroLeft.status.level);
		
		if(!this.level2){
			this.level2 = new GL2.Text();
			this.level2.setFontSize(this.TEXT_SIZE);
			this.level2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.level2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.level2.setAnchor(0, 0);
			this.level2.setPosition(287, 62);
			this.addChild(this.level2);
		}
		this.level2.setText(heroRight.status.level);
		
		//Text
		if(!this.text){
			// Text
			this.text = new GL2.Text();
			this.text.setFontSize(this.TEXT_SIZE);
			this.text.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.text.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.text.setText('This status is pending now');
			this.text.setAnchor(0, 0);
			this.text.setPosition(60, 80);
			this.addChild(this.text);
		}
		
		// Special move
		if(!this.specialMove1){
			this.specialMove1 = new GL2.Text();
			this.specialMove1.setFontSize(this.TEXT_SIZE);
			this.specialMove1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.specialMove1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.specialMove1.setAnchor(0, 0);
			this.specialMove1.setPosition(10, 98);
			this.specialMove1.setSize(140, 20);
			this.addChild(this.specialMove1);
		}
		this.specialMove1.setText(heroLeft.special_move);
		
		if(!this.specialMove2){
			this.specialMove2 = new GL2.Text();
			this.specialMove2.setFontSize(this.TEXT_SIZE);
			this.specialMove2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.specialMove2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.specialMove2.setAnchor(0, 0);
			this.specialMove2.setPosition(192, 98);
			this.specialMove2.setSize(140, 20);
			this.addChild(this.specialMove2);
		}
		this.specialMove2.setText(heroRight.special_move);
		
		// Offence
		if(!this.offence1){
			this.offence1 = new GL2.Text();
			this.offence1.setFontSize(this.TEXT_SIZE);
			this.offence1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.offence1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.offence1.setAnchor(0, 0);
			this.offence1.setPosition(25, 115);
			this.addChild(this.offence1);
		}
		this.offence1.setText(heroLeft.status.offence);
		
		if(!this.offence2){
			this.offence2 = new GL2.Text();
			this.offence2.setFontSize(this.TEXT_SIZE);
			this.offence2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.offence2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.offence2.setAnchor(0, 0);
			this.offence2.setPosition(207, 115);
			this.addChild(this.offence2);
		}
		this.offence2.setText(heroRight.status.offence);
		
		// Defence
		if(!this.defence1){
			this.defence1 = new GL2.Text();
			this.defence1.setFontSize(this.TEXT_SIZE);
			this.defence1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.defence1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.defence1.setAnchor(0, 0);
			this.defence1.setPosition(91, 115);
			this.addChild(this.defence1);
		}
		this.defence1.setText(heroLeft.status.defence);
		
		if(!this.defence2){
			this.defence2 = new GL2.Text();
			this.defence2.setFontSize(this.TEXT_SIZE);
			this.defence2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.defence2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.defence2.setAnchor(0, 0);
			this.defence2.setPosition(271, 115);
			this.addChild(this.defence2);
		}
		this.defence2.setText(heroRight.status.defence);
		
		// Experience rate
		if(this.expRate1){
			this.removeChild(this.expRate1);
			this.expRate1.destroy();
			this.expRate1 = null;
		}
		this.expRate1 = heroLeft.getExpRateSprite();
		this.expRate1.setPosition(8, 136); // 219
		this.addChild(this.expRate1);
		
		if(this.expRate2){
			this.removeChild(this.expRate2);
			this.expRate2.destroy();
			this.expRate2 = null;
		}
		this.expRate2 = heroRight.getExpRateSprite();
		this.expRate2.setPosition(217, 136); // 219
		this.addChild(this.expRate2);
		
		// Level up experience
		if(!this.levelUp1){
			this.levelUp1 = new GL2.Text();
			this.levelUp1.setFontSize(this.TEXT_SIZE);
			this.levelUp1.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.levelUp1.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.levelUp1.setAnchor(0, 0);
			this.levelUp1.setPosition(63, 132);
			this.addChild(this.levelUp1);
		}
		this.levelUp1.setText(heroLeft.status.level_up_exp);
		
		if(!this.levelUp2){
			this.levelUp2 = new GL2.Text();
			this.levelUp2.setFontSize(this.TEXT_SIZE);
			this.levelUp2.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			this.levelUp2.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			this.levelUp2.setAnchor(0, 0);
			this.levelUp2.setPosition(272, 132);
			this.addChild(this.levelUp2);
		}
		this.levelUp2.setText(heroRight.status.level_up_exp);
	},
	
	destroy : function($super){
		if(this.style1){
			this.removeChild(this.style1);
			this.style1.destroy();
			this.style1 = null;
		}
		if(this.style2){
			this.removeChild(this.style2);
			this.style2.destroy();
			this.style2 = null;
		}
		if(this.rarity1){
			this.removeChild(this.rarity1);
			this.rarity1.destroy();
			this.rarity1 = null;
		}
		if(this.rarity2){
			this.removeChild(this.rarity2);
			this.rarity2.destroy();
			this.rarity2 = null;
		}
		if(this.rank1){
			this.removeChild(this.rank1);
			this.rank1.destroy();
			this.rank1 = null;
		}
		if(this.rank2){
			this.removeChild(this.rank2);
			this.rank2.destroy();
			this.rank2 = null;
		}
		if(this.name1){
			this.name1.destroy();
			this.name1 = null;
		}
		if(this.name2){
			this.name2.destroy();
			this.name2 = null;
		}
		if(this.level1){
			this.level1.destroy();
			this.level1 = null;
		}
		if(this.level2){
			this.level2.destroy();
			this.level2 = null;
		}
		if(this.text){
			this.text.destroy();
			this.text = null;
		}
		if(this.specialMove1){
			this.specialMove1.destroy();
			this.specialMove1 = null;
		}
		if(this.specialMove2){
			this.specialMove2.destroy();
			this.specialMove2 = null;
		}
		if(this.offence1){
			this.offence1.destroy();
			this.offence1 = null;
		}
		if(this.offence2){
			this.offence2.destroy();
			this.offence2 = null;
		}
		if(this.defence1){
			this.defence1.destroy();
			this.defence1 = null;
		}
		if(this.defence2){
			this.defence2.destroy();
			this.defence2 = null;
		}
		if(this.expRate1){
			this.removeChild(this.expRate1);
			this.expRate1.destroy();
			this.expRate1 = null;
		}
		if(this.expRate2){
			this.removeChild(this.expRate2);
			this.expRate2.destroy();
			this.expRate2 = null;
		}
		if(this.levelUp1){
			this.levelUp1.destroy();
			this.levelUp1 = null;
		}
		if(this.levelUp2){
			this.levelUp2.destroy();
			this.levelUp2 = null;
		}
		$super();
	}
});