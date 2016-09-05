'use strict';
    
var GameplayState = function() {};

GameplayState.prototype = {
    create: function() {
        // all this takes too long to load; move some of it into the loading state
        self = this;
        self.wave = new Wave(0);
        self.gameOverFlag = false;
        self.bg = game.add.sprite(0, 0, 'bg');
        self.santa = new Santa();
        self.children = new ChildManager(wave);
        self.points = new PointsManager();
        self.platforms = game.add.group();
        // move these platform things to their own class! :)
        self.platforms.enableBody = true;
        var ground = self.platforms.create(0, game.world.height - 64, 'platform');
        ground.scale.setTo(2, 1);
        ground.body.immovable = true;
        //var ledge = self.platforms.create(400, 400, 'platform');
        //ledge.body.immovable = true;

        self.presents = new PresentPile();
        self.machineGun = new MachineGun();
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.left.includes(event.key)) {
                // ← left
                self.santa.movement.left = true;
            }
            else if(keycodes.right.includes(event.key)) {
                // → right
                self.santa.movement.right = true;
            }
            else if(keycodes.up.includes(event.key)) {
                // ↑ up
                self.santa.movement.up = true;
            }
            else if(keycodes.down.includes(event.key)) {
                // ↓ down
                self.santa.movement.down = true;
            }
        };
        game.input.keyboard.onUpCallback = function(event) {
            if(keycodes.action.includes(event.key)) {
                // E action
                self.santa.use(self.machineGun);
            }
            else if(keycodes.left.includes(event.key)) {
                // ← left
                self.santa.movement.left = false;
            }
            else if(keycodes.right.includes(event.key)) {
                // → right
                self.santa.movement.right = false;
            }
            else if(keycodes.up.includes(event.key)) {
                // ↑ up
                self.santa.movement.up = false;
            }
            else if(keycodes.down.includes(event.key)) {
                // ↓ down
                self.santa.movement.down = false;
            }
        };
    },
    update: function() {
        // physics goes first, to make sure the updates work properly
        game.physics.arcade.collide(self.santa.santa, self.platforms);
        game.physics.arcade.collide(self.machineGun.bulletsGroup, self.children.childGroup, self.killChild);

        // feels a bit ugly checking for this flag here tbh
        self.gameOverFlag = self.presents.update(); 
        if(self.wave.active) {
            self.children.update(self.presents); 
        }
        else {
            self.wave.newWaveUpdate();
        }
        self.machineGun.update();
        self.santa.update(self.presents);

        if(game.input.activePointer.isDown) {
            self.machineGun.fireBullet();
        }
        if(self.gameOverFlag) {
            game.state.states['GameOverState'].score = self.points.totalScore;
            game.state.start("GameOverState");
        }
    },
    killChild: function(bullet, child) {
        if(child.present != undefined) {
            self.presents.dropPresent(child.present);
        }
        else {
            // drop ammo, but should the self.children holding self.presents drop ammo too?
        }
        self.machineGun.bulletsGroup.remove(bullet);
        self.children.childGroup.remove(child);
        if(child.from) {
            self.points.add(child.points.from);
        }
        else {
            self.points.add(child.points.to);
        }
        bullet.kill();
        child.kill();
    }
};
