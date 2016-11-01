'use strict';

(function() {
    var self;
    var MachineGun = function(position) {
        self = this;
        self.arrowGroup = game.add.group();
        self.arrowGroup.enableBody = true;
        self.arrowGroup.physicsBodyType = Phaser.Physics.ARCADE;
        self.arrowSpeed = 0;
        self.maxArrowSpeed = 50;
        self.startedArrowFire = false;

        self.grenadeGroup = game.add.group();
        self.grenadeGroup.enableBody = true;
        self.grenadeGroup.physicsBodyType = Phaser.Physics.ARCADE;
        self.grenadeAmount = 30; 
        self.grenadeFireRate = 1000;
        self.timeLastGrenadeFired = 0;
        self.timeStartedGrenadeFire = 0;
        self.grenadeFuseTimer = 2000;
        self.grenadeSpeed = 0;
        self.maxGrenadeSpeed = 50;
        self.startedGrenadeFire = false;
        self.grenadeRadius = 200;

        self.explosionGroup = game.add.group();
        self.explosionDuration = 500;

        self.initialPosition = {
            x: 180,
            y: 300
        };
        self.position = {
            x: self.initialPosition.x,
            y: self.initialPosition.y
        };
        self.mountPosition = { // where santa stands
            x: self.initialPosition.x + 40,
            y: self.initialPosition.y - 50
        };
        self.velocity = {
            x: 0.3,
            y: 1.0
        };
        self.sleighSprite = game.add.sprite(self.position.x, self.position.y, 'sleigh');
        self.sleighSprite.enableBody = true;
        self.sleighSprite.anchor.setTo(0.5, 0.5);

        self.mgSprite = game.add.sprite(self.position.x + 130, self.position.y - 40, 'bow');
        self.mgSprite.anchor.setTo(0.5, 0.5);
        self.active = false;
        var style = {
            font: 'bold 32px Arial',
            fill: '#ff9486',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
        };
        self.arrowAmountText = game.add.text(20, 50, "ammo: ∞", style);
        self.grenadeAmountText = game.add.text(20, 80, "grenades: " + self.grenadeAmount, style);
    };
  
    MachineGun.prototype = {
        /*
        fireBullet: function() {
            if(Date.now() - self.timeLastBulletFired >= self.bulletFireRate &&
               self.bulletAmount > 0) {
                var bullet = self.bulletsGroup.create(self.position.x, self.position.y, 'bullet');
                // check here if rotation is >= 0 or Math.PI
                game.physics.arcade.moveToPointer(bullet, self.bulletVelocity);
                self.timeLastBulletFired = Date.now();
                self.bulletAmount--;
                self.bulletAmountText.text = "ammo: " + self.bulletAmount;
            }
        },
        */
        startFiringArrow: function() {
            // initiate arrow firing
            if(self.startedArrowFire == false) {
                self.startedArrowFire = true;
            }
            // power up arrow firing
            else {
                self.arrowSpeed++;
                // cap the arrow speed if held in for ages
                self.arrowSpeed = Math.min(self.arrowSpeed, self.maxArrowSpeed);
            }
        },
        fireArrow: function() {
            var arrow = self.arrowGroup.create(self.mgSprite.x, self.mgSprite.y, 'arrow');
            game.physics.arcade.enable(arrow);
            arrow.body.gravity.y = 1000;
            var arrowDirection = Phaser.Point.subtract(game.input.mousePointer, self.position);
            arrow.body.velocity = arrowDirection.setMagnitude(self.arrowSpeed * 50);
            self.arrowSpeed = 0;
            self.startedArrowFire = false;
        },
        startFiringGrenade: function() {
            // initiate grenade firing
            if(self.startedGrenadeFire == false) {
                if(Date.now() - self.timeLastGrenadeFired >= self.grenadeFireRate &&
                   self.grenadeAmount > 0) {
                    self.startedGrenadeFire = true;
                    self.timeStartedGrenadeFire = Date.now();
                }
            }
            // power up grenade firing
            else {
                self.grenadeSpeed++;
                // cap grenade speed
                self.grenadeSpeed = Math.min(self.grenadeSpeed, self.maxGrenadeSpeed);
                // if you've been powering it up for too long, then explode in hand
                if(Date.now() - self.timeStartedGrenadeFire >= self.grenadeFuseTimer) {
                    var explosion = self.explosionGroup.create(self.position.x, self.position.y, 'explosion');
                    explosion.scale.setTo(3.0, 3.0);
                    explosion.explosionTime = Date.now();
                    self.timeLastGrenadeFired = Date.now();
                    self.grenadeSpeed = 0;
                    self.grenadeAmount--;
                    self.grenadeAmountText.text = "ammo: " + self.grenadeAmount;
                    self.startedGrenadeFire = false;
                }
            }
        },
        fireGrenade: function() {
            var grenade = self.grenadeGroup.create(self.position.x, self.position.y, 'grenade');
            game.physics.arcade.enable(grenade);
            grenade.body.bounce = new Phaser.Point(0.5, 0.5);
            grenade.body.gravity.y = 1000;
            grenade.body.collideWorldBounds = true;
            grenade.timeFired = Date.now();
            grenade.fuseTimeLeft = self.grenadeFuseTimer - (Date.now() - self.timeStartedGrenadeFire);
            var grenadeDirection = Phaser.Point.subtract(game.input.mousePointer, self.position);
            grenade.body.velocity = grenadeDirection.setMagnitude(self.grenadeSpeed * 50);
            self.timeLastGrenadeFired = Date.now();
            self.grenadeSpeed = 0;
            self.grenadeAmount--;
            self.grenadeAmountText.text = "ammo: " + self.grenadeAmount;
            self.startedGrenadeFire = false;
        },
        rotateMachineGun: function() {
            var rotation;
            if(self.active) {
                rotation = game.physics.arcade.angleToPointer(self.mgSprite);
                //                 -PI/2
                //
                //
                //
                //    -PI || PI      +           0
                //
                //
                //
                //                  PI/2
                // if in the TL quadrant
                if(rotation < 0 && rotation < -Math.PI / 2) {
                    self.mgSprite.scale.x = -1.0;
                }
                // if in the TR quadrant
                else if(rotation <= 0) {
                    self.mgSprite.scale.x = 1.0;
                }
                // if in the BL quadrant
                if(rotation > 0 && rotation > Math.PI / 2) {
                    rotation = rotation - Math.PI;
                    self.mgSprite.scale.x = -1.0;
                }
                // if in the BR quadrant
                else {
                    self.mgSprite.scale.x = 1.0;
                }
            }
            else {
                rotation = 0;
            }
            self.mgSprite.rotation = rotation;
        },
        collideWithChild: function(child, headshot, points, presents, childManager, deathAnimations) {
            points.addChildPoints(child);
            deathAnimations.killChild(child, headshot);
            presents.dropPresent(child);
            childManager.removeChild(child);

        },
        checkArrowCollisions: function(childManager, presents, points, deathAnimations) {
            self.arrowGroup.forEach(function(arrow) {
                // this type of for loop required to break; out of it
                for(var i = 0; i < childManager.children.length; ++i) {
                    var child = childManager.children[i];
                    var collision = false;
                    var headshot = false;

                    var arrowCentre = Phaser.Point.add(arrow, new Phaser.Point(arrow.width, arrow.height));
                    var headTL = Phaser.Point.add(child.sprite, child.sprite.headCollisionBox.TL);
                    var bodyTL = Phaser.Point.add(child.sprite, child.sprite.bodyCollisionBox.TL);
                    if(util.circleBoxCollision(arrowCentre, arrow.width, headTL, child.sprite.headCollisionBox.WH)) {
                        collision = true;
                        headshot = true;
                    }
                    else if(util.circleBoxCollision(arrowCentre, arrow.width, bodyTL, child.sprite.bodyCollisionBox.WH)) {
                        collision = true;
                    }

                    if(collision) {
                        self.collideWithChild(child, headshot, points, presents, childManager, deathAnimations);
                        self.arrowGroup.remove(arrow);
                        arrow.kill();
                        break; 
                    }
                }
            });
        },
        checkGrenadeExplosions: function(childManager, presents, points, deathAnimations) {
            // this type of check also occurs in startFiringGrenade, if powering 
            // up a grenade explosion to check for explosions in hand
            self.grenadeGroup.forEach(function(grenade) {
                if(Date.now() - grenade.timeFired >= grenade.fuseTimeLeft) {
                    self.grenadeSpeed = 0;
                    self.grenadeAmount--;
                    self.grenadeAmountText.text = "ammo: " + self.grenadeAmount;
                    self.grenadeGroup.remove(grenade);
                    var explosion = self.explosionGroup.create(grenade.x, grenade.y, 'explosion');
                    explosion.anchor.setTo(0.5, 0.5);
                    explosion.scale.setTo(3.0, 3.0);
                    explosion.explosionTime = Date.now();
                    childManager.children.forEach(function(child) {
                        if(Phaser.Point.distance(child.body, grenade) < 200 ||
                           Phaser.Point.distance(child.head, grenade) < 200) {
                            self.collideWithChild(child, false, points, presents, childManager, deathAnimations);
                        }
                    });
                    grenade.kill();
                }
            });
        },
        checkExplosionTimeouts: function() {
            self.explosionGroup.forEach(function(explosion) {
                if(Date.now() - explosion.explosionTime > self.explosionDuration) {
                    self.explosionGroup.remove(explosion);
                    explosion.kill();
                }
            });
        },
        checkArrowDecay: function() {
            self.arrowGroup.forEach(function(arrow) {
                if(arrow.x < -200 || arrow.x > 1500 ||
                   arrow.y < -200 || arrow.y > 1000) {
                    self.arrowGroup.remove(arrow);
                    arrow.kill();
                }
            });
        },
        rotateArrows: function() {
            self.arrowGroup.forEach(function(arrow) {
                console.log(arrow.body.velocity);
                //arrow.rotation = rotation;
            });
        },
        update: function(childManager, presents, points, deathAnimations) {
            self.rotateMachineGun();
            self.checkArrowCollisions(childManager, presents, points, deathAnimations);
            self.checkGrenadeExplosions(childManager, presents, points, deathAnimations);
            self.checkExplosionTimeouts();
            self.checkArrowDecay();
            self.rotateArrows();

            // hovering should be some kind of sin/cos-ish function over time
            // maybe look up simple harmonic motion again
            self.position.x += self.velocity.x;
            self.position.y += self.velocity.y;
            self.mountPosition.x += self.velocity.x;
            self.mountPosition.y += self.velocity.y;
            self.sleighSprite.x += self.velocity.x;
            self.sleighSprite.y += self.velocity.y;
            self.mgSprite.x += self.velocity.x;
            self.mgSprite.y += self.velocity.y;
            if(self.sleighSprite.y >= self.initialPosition.y + 200 ||
               self.sleighSprite.y <= self.initialPosition.y - 200) {
                self.velocity.y *= -1;
            }
            if(self.sleighSprite.x >= self.initialPosition.x + 50 ||
               self.sleighSprite.x <= self.initialPosition.x - 50) {
                self.velocity.x *= -1;
            }
        }
    };
  
    this.MachineGun = MachineGun;
    
}).call(self);
