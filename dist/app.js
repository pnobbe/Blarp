/**
 * Player Controller
 */
function buddyController() {
    var self = this;

    self.setup = function () {
        //other players (buddy)
        self.buddys = game.add.group();                      //buddys represent the other connected players
    };

    self.update = function () {
        //buddy control
        userscount = 0;
        for (var user in userhashmap) {
            //iterate through all connected players
            userscount++;
            var nobuddy = true;                         //flag for if a buddy has been created for this user already
            if (user != "/#" + socket.id) {                     //if the connected user isn't you
                self.buddys.forEach(function (guy) {         //iterate through current representations of players
                    if (guy.name == user) {             //if a self (individual buddy) has already been created
                        //***manipulating buddys already present in room***
                        nobuddy = false;                //a buddy has already been created for this user
                        game.physics.arcade.moveToXY(guy, userhashmap[guy.name][0], userhashmap[guy.name][1], 300, 70);
                        //above: interpolate the self's position to the current one
                        //below: checks if a self gets too far away from where hes supposed to be and deals with it.
                        if (game.physics.arcade.distanceToXY(guy, userhashmap[guy.name][0], userhashmap[guy.name][1]) > 60) { //arbitrary 60 can be fiddled with
                            buddydistancetimer += 1;
                            if (buddydistancetimer > 10) { //arbitrary 10 can be fiddled with
                                guy.position.x = userhashmap[guy.name][0]; //snaps to non-interpolated position
                                guy.position.y = userhashmap[guy.name][1]; //if too far away from it
                            }
                        } else buddydistancetimer = 0;

                        //below: set the animations for the buddy
                        if (userhashmap[guy.name][2] == 'stop') {
                            guy.animations.stop();
                            if (userhashmap[guy.name][3] == 'left')
                                guy.frame = 0;
                            else
                                guy.frame = 5;
                        } else if (userhashmap[guy.name][2] == 'jump_left') {
                            guy.animations.stop();
                            guy.frame = 3;
                        } else if (userhashmap[guy.name][2] == 'jump_right') {
                            guy.animations.stop();
                            guy.frame = 6;
                        } else {
                            guy.animations.play(userhashmap[guy.name][3]);
                        }

                    }
                }, this);
                if (nobuddy) {  //no buddy has been created for this user, so create one
                    var buddy = self.buddys.create(userhashmap[user][0], userhashmap[user][1], 'dude');  //create buddy
                    game.physics.p2.enable(buddy);
                    buddy.body.setRectangle(30, 40, 0, 5);

                    buddy.enableBody = true;
                    buddy.physicsBodyType = Phaser.Physics.P2JS;
                    buddy.body.debug = DEBUG;
                    buddy.body.fixedRotation = true;
                    buddy.body.angularDamping = 0.6;
                    buddy.isBuddy = true;
                    buddy.name = user;
                    buddy.tint = userhashmap[user][5] //identify the buddy with it's corresponding user
                    buddy.nickname = userhashmap[user][4];
                    buddy.animations.add('left', [0, 1, 2, 3], 10, true);
                    buddy.animations.add('right', [5, 6, 7, 8], 10, true);

                    var label_name = game.add.bitmapText(0, -40, 'font1', buddy.nickname, 18);
                    label_name.updateTransform();
                    label_name.smoothing = true;
                    label_name.position.x = (-3)-(label_name.width / 2);
                    buddy.addChild(label_name);

                    buddy.frame = 4;
                    buddy.body.mass = 2;
                    buddy.body.setCollisionGroup(playerCollisionGroup);
                    buddy.body.collides([playerCollisionGroup]);
                    buddy.body.collides([projectileCollisionGroup], function (body1, projectile) {
                        if (userhashmap[user][6] != projectile.sprite.source) {
                            buddy.body.fixedRotation = false;
                            buddy.body.rotateRight(projectile.sprite.body.angle + 90);
                            buddy.body.velocity.x = projectile.sprite.body.velocity.x;
                            buddy.body.velocity.y = projectile.sprite.body.velocity.y;
                            buddy.body.angularVelocity = buddy.body.angularVelocity * 2;
                            projectile.sprite.kill();

                            setTimeout(function () {
                                buddy.body.fixedRotation = true;
                                buddy.body.rotation = 0;
                                buddy.rotation = 0;
                            }, 4000);
                        }
                    }, buddy);

                    userText.text = "Players: " + userscount;
                    loginText.text = buddy.nickname + ' joined the game.'; //first time creating a buddy so user just joined
                    setTimeout(function () {
                        loginText.text = ""
                    }, 4000);
                }
            }
        }

        //destroy buddies if they are not in the hashmap (the user left the game)
        self.buddys.forEach(function (guy) { //iterate through all buddys
            var nouser = true;
            for (var user in userhashmap) {
                if (guy.name == user) { //if the buddy represents a documented user
                    nouser = false;     //then make sure he is not destroyed
                }
            }
            if (nouser) {               //if the user is gone from the hashmap but the buddy still exists
                guy.destroy();          //destroy that buddy
                loginText.text = guy.nickname + ' left the game.';  //tell the player that the user left the game
                setTimeout(function () {
                    loginText.text = ""
                }, 4000);
            }
        });

    };
}
/**
 * Game Controller
 */

$('#nicknameModal').modal({
    backdrop: 'static',
    keyboard: false
})

$('#nicknameModal').modal('show');

var game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
}, false, false);
var socket = io();                                          //initialise socket connection


function preload() {                                        //preload our images
    game.load.image('sky', 'assets/background4.jpg');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.spritesheet('projectile', 'assets/projectile100x18.png', 100, 18, 2);
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.audio('blarp', 'assets/blarp.wav');
    game.load.audio('music', 'assets/music.wav');
    game.load.bitmapFont('font1', 'assets/font.png', 'assets/font.fnt');

    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.forceOrientation(true, false);
}

var DEBUG = false;

// Reserve controllers
var playerCtrl;
var projectileCtrl;
var platformCtrl;
var buddyCtrl;

// Create collision groups
var projectileCollisionGroup;
var playerCollisionGroup;
var platformCollisionGroup;

var nickname = "";
var platforms;          //these variables are explained inline
var userscount = 0;
var userText = '';
var loginText = '';
var userhashmap = {};
var socketid;
var buddydistancetimer;
var playerCreated;
var blarp;
var music;
var spawnlocs = [580, 1000];


function create() {
    // Instantiate new controllers
    platformCtrl = new platformController();
    projectileCtrl = new projectileController();
    buddyCtrl = new buddyController();
    playerCtrl = new playerController();
    playerCreated = false;

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.stage.disableVisibilityChange = true;
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.updateBoundsCollisionGroup();
    game.physics.p2.gravity.y = 1000;
    game.physics.p2.setPostBroadphaseCallback(checkCollision, this);


    game.time.advancedTiming = true;
    game.world.setBounds(0, 0, 2000, 2000);

    var sky = game.add.sprite(0, 0, 'sky');

    blarp = game.add.audio('blarp');
    music = game.add.audio('music');
    music.loop = true;
    music.volume = 0.03;
    music.play();

    projectileCollisionGroup = game.physics.p2.createCollisionGroup();
    playerCollisionGroup = game.physics.p2.createCollisionGroup();
    platformCollisionGroup = game.physics.p2.createCollisionGroup();

    // Setup our controllers
    platformCtrl.setup();
    projectileCtrl.setup();
    buddyCtrl.setup();

    game.camera.setPosition(580, 500);

}


function update() {

    // Update controllers
    playerCtrl.update();
    platformCtrl.update();
    projectileCtrl.update();
    buddyCtrl.update();

    userText.text = 'Players: ' + userscount; //update displayed amount of users
}

function render() {

    if (DEBUG) {
        game.debug.text("FPS:" + (game.time.fps || '--'), 2, 14, "#00ff00");
    }
}

function checkCollision(body1, body2) {
    if (body1.sprite.key == 'projectile') {
        if (body1.sprite.source == body2.sprite.source) {
            return false;
        }
        if (body2.isBuddy) {
            return false;
        }
        console.dir(body1.sprite);
        console.dir(body2.sprite);
    }
    return true;
}

function saveNickname() {
    nickname = $("#nickname").val();
    $('#nicknameModal').modal('hide');
    playerCtrl.setup()

    // Add user counter to top left.
    userText = game.add.bitmapText(10, 10, 'font1', '', 20);
    userText.smoothing = true;
    userText.fixedToCamera = true;

    // Add (dis)connected messages to top left.
    loginText = game.add.bitmapText(10, 40, 'font1', '', 20);
    loginText.smoothing = true;
    loginText.fixedToCamera = true;
}

//socket.io
socket.on('userhashmap', function (msg) {             //receive other player's info
    userhashmap = msg;                              //put the other player's info into userhashmap
});

socket.on('fireBack', function (msg) {
    for (var i = 0; i < msg.length; i++) {
        projectileCtrl.projectileList.push(new Projectile(msg[i][0], msg[i][1], msg[i][2], msg[i][3], msg[i][4]));
    }
});

socket.on('connect', function () {
    socketid = socket.id;                           //store socket.id for use in the game

    setInterval(function () {
        if (playerCreated) {//send info about your character to the server
            //if-else if for only sending data if the character has moved
            if (!(socket.id in userhashmap)) {
                socket.emit('clientinfo', [playerCtrl.player.self.x, playerCtrl.player.self.y, playerCtrl.player.self.anim, playerCtrl.player.self.dir, playerCtrl.player.self.name, playerCtrl.player.self.tint, socket.id]);
            }
            else if (userhashmap[socket.id][0] != playerCtrl.player.x || userhashmap[socket.id][1] != playerCtrl.player.x) {
                socket.emit('clientinfo', [playerCtrl.player.self.x, playerCtrl.player.self.y, playerCtrl.player.self.anim, playerCtrl.player.self.dir, playerCtrl.player.self.name, playerCtrl.player.self.tint, socket.id]);
            }
        }
    }, 45);                                        //every 45ms (22hz)
});
/**
 * Platform Controller
 */
function platformController() {
    var self = this;

    self.setup = function () {


        // Add group and set physics.
        self.platforms = game.add.group();
        game.physics.p2.enable(self.platforms);
        self.platforms.enableBody = true;
        self.platforms.physicsBodyType = Phaser.Physics.P2JS;


        self.addPlatform(400, 1450, 'platform', null, 5, 1);
        self.addPlatform(550, 1050, 'platform', null, 1, 1);
        self.addPlatform(300, 1300, 'platform', null, 1, 1);
        self.addPlatform(1500, 1100, 'platform', null, 1, 1);
        self.addPlatform(1700, 950, 'platform', null, 1, 1);
        self.addPlatform(900, 1100, 'platform', null, 1, 1);
        self.addPlatform(1300, 1250, 'platform', null, 1, 1);




    };

    self.update = function () {
        // Not used
    }

    self.hit = function(platform, projectile) {
        projectile.sprite.kill();
    }

    self.addPlatform = function (x, y, sprite, offset, repeatHor, repeatVer) {
        for (var j = 0; j < repeatVer; j++) {
            var ground = self.platforms.create(x, y, sprite);
            ground.tint = Math.random() * 0xffffff;
            ground.body.setCollisionGroup(platformCollisionGroup);
            ground.body.static = true;
            ground.body.collides(playerCollisionGroup);
            ground.body.debug = DEBUG;
            ground.anchor.y = 0.85;
            ground.body.collides(projectileCollisionGroup, self.hit, this);

            for (var i = 0; i < repeatHor - 1; i++) {
                ground = self.platforms.create((ground.width * (i + 1)) + x, y, sprite);
                ground.body.setCollisionGroup(platformCollisionGroup);
                ground.body.static = true;
                ground.tint = Math.random() * 0xffffff;
                ground.body.collides([playerCollisionGroup]);
                ground.body.debug = DEBUG;
                ground.anchor.y = 0.85;
                ground.body.collides(projectileCollisionGroup, self.hit, this);

            }
            y = ground.height + y;
        }
    }
}
/**
 * Player Controller
 */
function playerController() {
    var self = this;

    self.setup = function () {
        // Create new player
        self.player = new Player(nickname, Math.random() * 0xffffff);
        self.player.setup();


        playerCreated = true;
    };

    self.update = function () {
        if (playerCreated) {
            self.player.updateBody();
        }
    };
}
/**
 * Projectile Controller
 */
function projectileController() {
    var self = this;


    self.setup = function () {
        // Add group and set physics.
        self.projectileList = [];

        self.projectiles = game.add.group();
        self.projectiles.enableBody = true;
        self.projectiles.physicsBodyType = Phaser.Physics.P2;

        self.projectiles.createMultiple(50, 'projectile');
        self.projectiles.setAll('checkWorldBounds', true);
        self.projectiles.setAll('outOfBoundsKill', true);
    };

    self.update = function () {
        // Fire all projectiles that are in the list
        for (var i = 0; i < self.projectileList.length; i++) {
            self.projectileList[i].fire(self.projectiles);
        }
        self.projectileList = [];         // Empty the list of projectiles

    };


}

/**
 * Platform Model
 */

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
/**
 * Projectile Model
 */
function Projectile(x, y, rotation, tint, source) {
    var self = this;

    self.x = x;
    self.y = y;
    self.rotation = rotation;
    self.tint = tint;
    self.source = source;


    self.fire = function (group) {
        var projectile = group.getFirstDead();

        game.physics.p2.enable(projectile);
        projectile.body.setRectangle(45, 15, 25);
        projectile.tint = self.tint;
        projectile.body.angle = self.rotation * 180 / Math.PI;
        projectile.source = self.source;
        projectile.body.data.gravityScale = 0;
        projectile.body.debug = DEBUG;

        projectile.reset(self.x, self.y);

        projectile.animations.add('shoot');

        var angle = self.rotation;
        projectile.body.velocity.x = 1000 * Math.cos(angle);
        projectile.body.velocity.y = 1000 * Math.sin(angle);

        projectile.animations.play('shoot', 5, true);
        blarp.volume = 0.05;
        blarp.play();

        projectile.body.setCollisionGroup(projectileCollisionGroup);
        projectile.body.collides([platformCollisionGroup, playerCollisionGroup]);

    }
}