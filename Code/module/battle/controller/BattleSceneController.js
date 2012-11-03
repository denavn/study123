/**
 * @author sonnn
 */

var Core 			= require('../../../../NGCore/Client/Core').Core;
var GL2  			= require('../../../../NGCore/Client/GL2').GL2;
var SceneDirector 	= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 	= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var ParticleEmitter = require('../../../../NGGo/Service/Graphics/ParticleEmitter').ParticleEmitter;
var Logger 			= require('../../../utils/Logger').Logger;

var MoveListener = Core.MessageListener.subclass({
	initialize: function(controller, offsetX, step) {
		this._controller = controller;
		this._offsetX = offsetX;
		this._step = step;
		this._dirY = 1;
		this._currentDirection1 = 1;
		this._currentDirection2 = -1;
		this._done = false;
		this._counter = 0;
		this._dCounter = 0;
		this._alpha = 1;
		this._died = false;
		this._hasFightedE = false;
		this._hasFightedS = false;
		
		this._newX1 = this._controller.sumo.getPosition().getX();
		this._newY1 = this._controller.sumo.getPosition().getY();
		
		this._newX2 = this._controller.enemy.getPosition().getX();
		this._newY2 = this._controller.enemy.getPosition().getY();
		
		this._maxY = this._newY1 + 10;
		this._newY = this._newY1;
		this._minY = this._newY1 - 10;
		this._orgY = this._newY1;
		
		this._maxX11 = this._newX1 + offsetX + 10;
		this._maxX12 = this._maxX11 - 15;
		
		this._maxX21 = this._newX2 - offsetX - 10;
		this._maxX22 = this._maxX21 + 15;
		
		this._fMaxX1 = this._maxX11 + (this._maxX21 - this._maxX11);
		this._fMaxX2 = this._maxX21 - (this._maxX21 - this._maxX11);
	},
	
	_damage: function(isEnemy) {
		this._isDamagedE = true;
		this._isDamagedS = false;
		
		var obj = this._controller.enemy;
		
		if (!isEnemy) {
			this._isDamagedE = false;
			this._isDamagedS = true;
			obj = this._controller.sumo
		}
		
		obj.setAnim(null, "damaged");
		obj.setColor(1, 0, 0);
	},
	
	_resetObj: function(isEnemy) {
		this._isDamagedE = false;
		this._isDamagedS = false;
		
		this._controller.sumo.setAnim(null, "stand");
		this._controller.enemy.setAnim(null, "stand");
		
		this._controller.sumo.setColor(1, 1, 1);
		this._controller.sumo.setAlpha(1);
		this._controller.sumo.setRotation(0);
		this._controller.enemy.setColor(1, 1, 1);
		this._controller.enemy.setAlpha(1);
		this._controller.enemy.setRotation(0);
		this._controller.sumo.setPosition(this._controller.sumo.getPosition().getX(), this._orgY);
		this._controller.enemy.setPosition(this._controller.enemy.getPosition().getX(), this._orgY);
		this._newY = this._orgY;
	},
	
	onUpdate: function(delta) {
		
		// Beginning time
		if (!this._done) {
			this._newX1 += this._step;
			this._newX2 -= this._step;
			
			this._done = (this._newX1 >= this._maxX11) ? true : false;
			this._controller.sumo.setPosition(this._newX1, this._newY1);
			this._controller.enemy.setPosition(this._newX2, this._newY2);
		}
		
		// Standing
		if (this._done && !this._controller.isFighting) {
						
			this._newX1 += this._currentDirection1 * 1.8;
			this._newX2 += this._currentDirection2 * 1.8;
			
			// Sumo
			if (this._newX1 <= this._maxX11 && this._currentDirection1 == 1) {
				this._controller.sumo.setPosition(this._newX1, this._newY1);
			} else {
				this._currentDirection1 = -1;
				if (this._newX1 >= this._maxX12) {
					this._controller.sumo.setPosition(this._newX1, this._newY1);
				} else {
					this._currentDirection1 = -this._currentDirection1;
				}
			}
			
			// Enemy
			if (this._newX2 >= this._maxX21 && this._currentDirection2 == -1) {
				this._controller.enemy.setPosition(this._newX2, this._newY2);
			} else {
				this._currentDirection2 = 1;
				if (this._newX2 <= this._maxX22) {
					this._controller.enemy.setPosition(this._newX2, this._newY2);
				} else {
					this._currentDirection2 = -this._currentDirection2;
				}
			}
			
		// Fighting
		} else if (this._controller.isFighting) {
			
			// Sumo turn
			if (!this._controller.enemyTurn) {
				var sumo = this._controller.sumo;
				
				// Normal skill
				if (this._controller._skillTypeS == 1) {
					sumo.setAlpha(sumo.getAlpha() + 0.2);
					
					this._newX1 += this._step;
					if (this._newX1 <= this._fMaxX1) {
						sumo.setPosition(this._newX1, this._newY1);
					} else {
						this._hasFightedE = true;
					}
				
				// Advanced skill
				} else {
					if (!this._controller.isFightingE) {
						this._controller.isFightingE = true;
						sumo.fight(this._controller._skillTypeS, "ENEMY");
					}
					
					this._hasFightedE = sumo.getFightStatus();
				}
					
				// Sumo has fighted enemy
				if (this._hasFightedE) {
					sumo.resetFightStatus();
					var isEnemy = true;
					this._damage(isEnemy);
					sumo.setAnim(null, "stand");
					this._controller.enemyHp -= Math.round(this._controller.enemy.hp / sumo.attackNum);
					this._controller.enemyHp = this._controller.enemyHp <= 0 ? 0 : this._controller.enemyHp;
					this._controller.updateHpBar(undefined, undefined, this._controller.enemyHp, this._controller.enemy.hp);
					
					this._newX1 = this._maxX11;
					this._controller.enemyTurn = true;
					this._controller.isFighting = false;
					this._controller.isFightingE = false;
					this._hasFightedE = false;
				}
				
			// Enemy turn				
			} else if (this._controller.enemyTurn && this._controller.isFighting) {
				var enemy = this._controller.enemy;
				
				// Normal skill
				if (this._controller._skillTypeE == 1) {
					enemy.setAlpha(enemy.getAlpha() + 0.2);
					
					this._newX2 -= this._step;
					if (this._newX2 >= this._fMaxX2) {
						enemy.setPosition(this._newX2, this._newY2);
					} else {
						this._hasFightedS = true;
					}
				
				// Advanced skill
				} else {
					if (!this._controller.isFightingS) {
						this._controller.isFightingS = true;
						enemy.fight(this._controller._skillTypeE, "SUMO");
					}
					
					this._hasFightedS = enemy.getFightStatus();
				}
					
				// Enemy has fighted sumo
				if (this._hasFightedS) {
					enemy.resetFightStatus();
					var isEnemy = false;
					this._damage(isEnemy);
					enemy.setAnim(null, "stand");
					
					this._controller.sumoHp -= Math.round(this._controller.sumo.hp / this._controller.enemy.attackNum);
					this._controller.sumoHp = this._controller.sumoHp <= 0 ? 0 : this._controller.sumoHp;
					this._controller.updateHpBar(this._controller.sumoHp, this._controller.sumo.hp, undefined, undefined);
					
					this._newX2 = this._maxX21;
					this._controller.enemyTurn = false;
					this._controller.isFighting = false;
					this._controller.isFightingS = false;
					this._hasFightedS = false;
				}
			}
		}
		
		// Effect in case that Sumo || Enemy is damaged
		if (this._isDamagedE || this._isDamagedS) {
			this._dCounter += 50;
			
			var obj = null;
			if (this._isDamagedE) {
				obj = this._controller.enemy;
			} else {
				obj = this._controller.sumo;
			}
			
			if (!this._died) {
			
				var x = obj.getPosition().getX();
				this._newY += this._dirY * 10;
			
				if (this._newY <= this._maxY && this._dirY == 1) {
					obj.setPosition(x, this._newY);
				} else {
					if (this._controller.enemyHp && this._controller.sumoHp) {
						this._dirY = -1;
					} else {
						this._died = true;
					}
					
					if (this._newY >= this._minY) {
						obj.setPosition(x, this._newY);
					} else {
						obj.setPosition(x, this._minY);
						this._dirY = 1;
					}
				}
			
			} else {
				this._alpha -= 0.05;
				obj.setAlpha(this._alpha);
				var s = obj.getScale();
				obj.setScale(s.getX() > 0 ? s.getX() - 0.05 : s.getX() + 0.05, s.getY() - 0.05);
			}
			
			var d = 0.5;
			
			if ((this._dCounter / 1000) >= d && this._controller.enemyHp == 0) {
				this._controller.sumo.setAnim(null, "stand");
			}
			
			if (this._controller.enemyHp == 0 || this._controller.sumoHp == 0) {
				d = 1.5;
			}
			
			if ((this._dCounter / 1000) >= d) {
				this._dCounter = 0;
				
				if (this._controller.enemyHp == 0 || this._controller.sumoHp == 0) {
					this.destroy();
					SceneDirector.pop();
				}
				
				this._resetObj();
				
				this._controller.skill.reset();
				this._controller.skill.setPosition(-500, this._newY1);
				
				this._controller.resetSkillSlot(this._controller._skillTypeS);
				this._controller.resetSkillSlot(this._controller._skillTypeE, true);
			}
		}
		
		this._counter += 50;
		
		if ((this._counter / 1000) >= 2) {
			this._counter = 0;
			
			if (this._controller.enemyTurn) {
				this._controller.fightSumo();
			} else {
				this._controller.fightEnemy();
			}
		}
	}	
});

var battleSceneController = 
{
	
	initialize: function() {
		this.currentBattle = "";
		this.enemyTurn = false;
		this.isFightingE = false;
		this.isFightingS = false;
		this.isFighting = false;
		this._skillTypeS = 0;
		this._skillTypeE = 0;
	},
	
	action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        
        if (buttnName === "Home") {
        	this._mvListener.destroy();
        	SceneDirector.pop();
        }
    },
    
    updateHpBar: function(playerHp, maxPlayerHp, enemyHp, maxEnemyHp) {
		if (playerHp >= 0) {
			this.HUD.PlayerHp.setScale(playerHp/maxPlayerHp, 1);
		}
		
		if (enemyHp >= 0) {
			this.HUD.EnemyHp.setScale(-enemyHp/maxEnemyHp, 1);
		}
	},
	
	highlightSkillSlot: function(skillType, isEnemy) {
	    Logger.log("skillType = " + skillType);
	    var x = isEnemy ? 3 : 0;
		this.HUD[skillType + x].setColor(0, 0.7, 0.5);
		
		var pos = this.HUD[skillType + x].getPosition();
		var light = new GL2.Sprite();
		light.setImage("Content/battle/effect/light.png", new Core.Size(30, 30), new Core.Point(0,0));
		light.setPosition(pos.getX() - 3, pos.getY());
		this.HUD.addChild(light);
	},
	
	resetSkillSlot: function(skillType, isEnemy) {
		Logger.log("skillType = " + skillType);
		var x = isEnemy ? 3 : 0;
		this.HUD[skillType + x].setColor(1, 1, 1);
	},
	
	initData: function(sumoObj, isEnemy) {
		var hp = 200;
		var ap = 1000;
		var dp = 400;
		var isBoss = false;
		var skillType = 1;
		var name = "dragon";
		
		if (isEnemy) {
			if (this.currentBattle === "Battle1") {
				ap = 600;
				dp = 300;
				isBoss = true;
			} else {
				ap = 1600;
				dp = 600;
			}
		}
		
		sumoObj.hp = hp;
		sumoObj.ap = ap;
		sumoObj.dp = dp;
		sumoObj.skillType = skillType;
		sumoObj.isBoss = isBoss;
		sumoObj.name = name;
	},
	
	setup: function(sumo, enemy, skill) {
		this.sumo = sumo;
		this.enemy = enemy;
		this.skill = skill;
		
		// Populate properties
		this.initData(this.sumo, false);
		this.initData(this.enemy, true);
		
		// Calculate attacking capability
		var delta = this.sumo.ap - this.enemy.ap;
		var attackNum1 = 10;
		var attackNum2 = 10;
		
		if (delta > 0) {
			attackNum1 = 10 - 10 * (delta / this.enemy.ap)
			attackNum2 = 10 - 10 * (delta / this.sumo.ap)
		} else {
			attackNum1 = 10 - 10 * (-delta / this.enemy.ap)
			attackNum2 = 10 - 10 * (-delta / this.sumo.ap)
		}
		
		if (attackNum1 > 0) {
			this.sumo.attackNum = Math.floor(attackNum1);
			this.enemy.attackNum = Math.floor(attackNum2);
		} else {
			if (delta > 0) {
				this.sumo.attackNum = 1;
				this.enemy.attackNum = Math.floor(attackNum2);
			} else {
				this.sumo.attackNum = Math.floor(attackNum2);
				this.enemy.attackNum = 1;
			}
		}
		
		this.enemyHp = this.enemy.hp;
		this.sumoHp = this.sumo.hp;
		this.HUD.avatar1.setScale(-1, 1);
		this.HUD.EnemyHp.setScale(-1, 1);
		this.HUD["5"].setVisible(false);
		this.HUD["6"].setVisible(false);
		
		if (this.currentBattle === "Battle2") {
			this.enemy.name = "bull2";
			this.enemy.setScale(1, 1);
			this.HUD["5"].setVisible(true);
			this.HUD["6"].setVisible(true);
		}
		
		enemy.setAnim(null, "stand");
		sumo.setAnim(null, "stand");
		
		this.MainGame.addChild(sumo.getAnim());
		this.MainGame.addChild(enemy.getAnim());
		this.MainGame.addChild(skill.getAnim());
		
		this._mvListener = new MoveListener(this, 220, 50);
    	Core.UpdateEmitter.addListener(this._mvListener, this._mvListener.onUpdate);
	},
	
	fightEnemy: function() {
    	this.sumo.setAnim(null, "attack");
    	this.isFighting = true;
		this.skill.setRotation(180);
		var skillType = this.getRandomSkill(false);
		if (skillType == 1) { this.sumo.setAlpha(0); }
		this.highlightSkillSlot(skillType);
	},
	
	fightSumo: function() {
		this.enemy.setAnim(null, "attack");
		this.isFighting = true;
		var skillType = this.enemy.isBoss ? this.enemy.skillType : this.getRandomSkill(false);
		this._skillTypeE = skillType;
		this.skill.setRotation(0);
		this.skill.setPosition(1000, this.skill.getPosition().getY());
		if (skillType == 1) { this.enemy.setAlpha(0); }
		this.highlightSkillSlot(skillType, true);
	},
	
	getRandomSkill: function(isEnemy) {
		if (isEnemy) {
			this._skillTypeE = 1;
			return this._skillTypeE; 
		} else {
			var s = (this._skillTypeS + 1) % 3;
			var e = (this._skillTypeE + 1) % 3;
			this._skillTypeS = s == 0 ? 3 : s;
			this._skillTypeE = e == 0 ? 3 : e;
			
			return this._skillTypeS;
		}
	},
	
	addChild: function(child) {
		this.MainGame.addChild(child);
	}
};

exports.BattleSceneController = Core.Class.subclass(battleSceneController);