/**
 * Player Model
 */

function Player(name, tint) {
    var self = game.add.sprite(spawnlocs[0], spawnlocs[1], 'dude');
    this.self = self;
    var movespeed = 300;
    var fireRate = 1000;
    var nextFire = 0;
    var keys;

    this.setup = function () {
        game.physics.p2.enable(self);
        self.physicsBodyType = Phaser.Physics.P2;
        self.body.setRectangle(30, 40, 0, 5);

        self.enableBody = true;
        self.body.debug = DEBUG;
        self.body.fixedRotation = true;

        self.anim = 'stop';
        self.dir = 'right';
        self.name = name;
        self.tint = tint;
        self.dead = false;
        self.source = socketid;

        self.checkWorldBounds = true;
        self.events.onOutOfBounds.add(function () {
            self.body.velocity.x = 0;
            self.body.velocity.y = 0;
            self.x = 1200;
            self.y = 850;
        });

        self.animations.add('left', [0, 1, 2, 3], 10, true);
        self.animations.add('right', [5, 6, 7, 8], 10, true);
        self.scale.setTo(1, 1);

        var label_name = game.add.bitmapText(0, -40, 'font1', self.name, 20);
        label_name.updateTransform();
        label_name.smoothing = true;
        label_name.position.x = (-3)-(label_name.width / 2);
        self.addChild(label_name);

        socket.emit('identify', [self.x, self.y, self.anim, self.dir, self.name, self.tint, socket.id]);

        keys = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
        };

        self.body.setCollisionGroup(playerCollisionGroup);
        self.body.collides([platformCollisionGroup, playerCollisionGroup]);
        self.body.collides(projectileCollisionGroup, self.hit, this);

        game.camera.follow(self);

    }

    this.updateBody = function () {
        if (!self.dead) {
            self.body.velocity.x = 0;
            self.animations.play(self.dir);

            // Resolve input
            if (keys['left'].isDown) {
                // Move to the left
                self.body.moveLeft(movespeed);

                self.anim = 'left';
                self.dir = 'left';
            }
            else if (keys['right'].isDown) {
                self.body.moveRight(movespeed);
                self.anim = 'right';
                self.dir = 'right';
            }
            else {
                self.animations.stop();
                self.anim = 'stop';
            }

            if (game.input.activePointer.isDown) {
                var targetAngle = game.physics.arcade.angleToPointer(self);
                if (game.time.now > nextFire && projectileCtrl.projectiles.countDead() > 0) {
                    nextFire = game.time.now + fireRate;
                    socket.emit('fire', [self.x, self.y, targetAngle, self.tint, socket.id]);
                }
            }

            if ((keys['up'].isDown || keys['space'].isDown) && touchingDown(self)) {
                self.body.moveUp(750);
                if (self.body.velocity.x > 0 && !touchingDown(self)) {
                    self.animations.stop();
                    self.frame = 6;
                    self.anim = 'jump_right';
                }

                if (self.body.velocity.x < 0 && !touchingDown(self)) {
                    self.animations.stop();
                    self.frame = 3;
                    self.anim = 'jump_left';
                }
            }
        }
    }

    self.hit = function (player, projectile) {
        if (projectile.sprite.source != socketid) {
            self.dead = true;
            self.body.moves = false;
            self.body.fixedRotation = false;
            self.body.velocity.x = projectile.sprite.body.velocity.x;
            self.body.velocity.y = projectile.sprite.body.velocity.y;
            self.body.angularVelocity = self.body.angularVelocity * 2;
            var tween = game.add.tween(self).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 2000);
            projectile.sprite.kill();

            setTimeout(function () {
                if (self.dead) {
                    game.tweens.remove(tween);
                    var tween2 = game.add.tween(self).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
                    tween2.repeat(4, 0);
                    self.body.rotation = 0;
                    self.rotation = 0;
                    self.reset(spawnlocs[0], spawnlocs[1]);
                    self.body.fixedRotation = true;
                    self.dead = false;
                }
            }, 4000);

        }
    }
}

function touchingDown(someone) {
    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;
    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"
        if (c.bodyA === someone.body.data || c.bodyB === someone.body.data) {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
            if (c.bodyA === someone.body.data) d *= -1;
            if (d > 0.5) result = true;

        }
    }
    return result;
}