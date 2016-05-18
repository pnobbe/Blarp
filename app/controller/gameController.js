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