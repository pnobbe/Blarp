function buddyController() {
    var e = this;
    e.setup = function () {
        e.buddys = game.add.group()
    }, e.update = function () {
        userscount = 0;
        for (var a in userhashmap) {
            userscount++;
            var o = !0;
            if (a != "/#" + socket.id && (e.buddys.forEach(function (e) {
                    e.name == a && (o = !1, game.physics.arcade.moveToXY(e, userhashmap[e.name][0], userhashmap[e.name][1], 300, 70), game.physics.arcade.distanceToXY(e, userhashmap[e.name][0], userhashmap[e.name][1]) > 60 ? (buddydistancetimer += 1, buddydistancetimer > 10 && (e.position.x = userhashmap[e.name][0], e.position.y = userhashmap[e.name][1])) : buddydistancetimer = 0, "stop" == userhashmap[e.name][2] ? (e.animations.stop(), "left" == userhashmap[e.name][3] ? e.frame = 0 : e.frame = 5) : "jump_left" == userhashmap[e.name][2] ? (e.animations.stop(), e.frame = 3) : "jump_right" == userhashmap[e.name][2] ? (e.animations.stop(), e.frame = 6) : e.animations.play(userhashmap[e.name][3]))
                }, this), o)) {
                var t = e.buddys.create(userhashmap[a][0], userhashmap[a][1], "dude");
                game.physics.p2.enable(t), t.body.setRectangle(30, 40, 0, 5), t.enableBody = !0, t.physicsBodyType = Phaser.Physics.P2JS, t.body.debug = DEBUG, t.body.fixedRotation = !0, t.body.angularDamping = .6, t.isBuddy = !0, t.name = a, t.tint = userhashmap[a][5], t.nickname = userhashmap[a][4], t.animations.add("left", [0, 1, 2, 3], 10, !0), t.animations.add("right", [5, 6, 7, 8], 10, !0);
                var i = game.add.bitmapText(0, -40, "font1", t.nickname, 18);
                i.updateTransform(), i.smoothing = !0, i.position.x = -3 - i.width / 2, t.addChild(i), t.frame = 4, t.body.mass = 2, t.body.setCollisionGroup(playerCollisionGroup), t.body.collides([playerCollisionGroup]), t.body.collides([projectileCollisionGroup], function (e, o) {
                    userhashmap[a][6] != o.sprite.source && (t.body.fixedRotation = !1, t.body.rotateRight(o.sprite.body.angle + 90), t.body.velocity.x = o.sprite.body.velocity.x, t.body.velocity.y = o.sprite.body.velocity.y, t.body.angularVelocity = 2 * t.body.angularVelocity, o.sprite.kill(), setTimeout(function () {
                        t.body.fixedRotation = !0, t.body.rotation = 0, t.rotation = 0
                    }, 4e3))
                }, t), userText.text = "Players: " + userscount, loginText.text = t.nickname + " joined the game.", setTimeout(function () {
                    loginText.text = ""
                }, 4e3)
            }
        }
        e.buddys.forEach(function (e) {
            var a = !0;
            for (var o in userhashmap)e.name == o && (a = !1);
            a && (e.destroy(), loginText.text = e.nickname + " left the game.", setTimeout(function () {
                loginText.text = ""
            }, 4e3))
        })
    }
}
function preload() {
    game.load.image("sky", "assets/background4.jpg"), game.load.image("platform", "assets/platform.png"), game.load.image("ground", "assets/ground.png"), game.load.spritesheet("projectile", "assets/projectile100x18.png", 100, 18, 2), game.load.spritesheet("dude", "assets/dude.png", 32, 48), game.load.audio("blarp", "assets/blarp.wav"), game.load.audio("music", "assets/music.wav"), game.load.bitmapFont("font1", "assets/font.png", "assets/font.fnt"), game.load.script("webfont", "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"), game.scale.scaleMode = Phaser.ScaleManager.RESIZE, game.scale.pageAlignHorizontally = !0, game.scale.pageAlignVertically = !0, game.scale.forceOrientation(!0, !1)
}
function create() {
    platformCtrl = new platformController, projectileCtrl = new projectileController, buddyCtrl = new buddyController, playerCtrl = new playerController, playerCreated = !1, game.physics.startSystem(Phaser.Physics.P2JS), game.stage.disableVisibilityChange = !0, game.physics.p2.setImpactEvents(!0), game.physics.p2.updateBoundsCollisionGroup(), game.physics.p2.gravity.y = 1e3, game.physics.p2.setPostBroadphaseCallback(checkCollision, this), game.time.advancedTiming = !0, game.world.setBounds(0, 0, 2e3, 2e3);
    game.add.sprite(0, 0, "sky");
    blarp = game.add.audio("blarp"), music = game.add.audio("music"), music.loop = !0, music.volume = .03, music.play(), projectileCollisionGroup = game.physics.p2.createCollisionGroup(), playerCollisionGroup = game.physics.p2.createCollisionGroup(), platformCollisionGroup = game.physics.p2.createCollisionGroup(), platformCtrl.setup(), projectileCtrl.setup(), buddyCtrl.setup(), game.camera.setPosition(580, 500)
}
function update() {
    playerCtrl.update(), platformCtrl.update(), projectileCtrl.update(), buddyCtrl.update(), userText.text = "Players: " + userscount
}
function render() {
    DEBUG && game.debug.text("FPS:" + (game.time.fps || "--"), 2, 14, "#00ff00")
}
function checkCollision(e, a) {
    if ("projectile" == e.sprite.key) {
        if (e.sprite.source == a.sprite.source)return !1;
        if (a.isBuddy)return !1;
        console.dir(e.sprite), console.dir(a.sprite)
    }
    return !0
}
function saveNickname() {
    nickname = $("#nickname").val(), $("#nicknameModal").modal("hide"), playerCtrl.setup(), userText = game.add.bitmapText(10, 10, "font1", "", 20), userText.smoothing = !0, userText.fixedToCamera = !0, loginText = game.add.bitmapText(10, 40, "font1", "", 20), loginText.smoothing = !0, loginText.fixedToCamera = !0
}
function platformController() {
    var e = this;
    e.setup = function () {
        e.platforms = game.add.group(), game.physics.p2.enable(e.platforms), e.platforms.enableBody = !0, e.platforms.physicsBodyType = Phaser.Physics.P2JS, e.addPlatform(400, 1450, "platform", null, 5, 1), e.addPlatform(550, 1050, "platform", null, 1, 1), e.addPlatform(300, 1300, "platform", null, 1, 1), e.addPlatform(1500, 1100, "platform", null, 1, 1), e.addPlatform(1700, 950, "platform", null, 1, 1), e.addPlatform(900, 1100, "platform", null, 1, 1), e.addPlatform(1300, 1250, "platform", null, 1, 1)
    }, e.update = function () {
    }, e.hit = function (e, a) {
        a.sprite.kill()
    }, e.addPlatform = function (a, o, t, i, r, s) {
        for (var l = 0; s > l; l++) {
            var n = e.platforms.create(a, o, t);
            n.tint = 16777215 * Math.random(), n.body.setCollisionGroup(platformCollisionGroup), n.body["static"] = !0, n.body.collides(playerCollisionGroup), n.body.debug = DEBUG, n.anchor.y = .85, n.body.collides(projectileCollisionGroup, e.hit, this);
            for (var d = 0; r - 1 > d; d++)n = e.platforms.create(n.width * (d + 1) + a, o, t), n.body.setCollisionGroup(platformCollisionGroup), n.body["static"] = !0, n.tint = 16777215 * Math.random(), n.body.collides([playerCollisionGroup]), n.body.debug = DEBUG, n.anchor.y = .85, n.body.collides(projectileCollisionGroup, e.hit, this);
            o = n.height + o
        }
    }
}
function playerController() {
    var e = this;
    e.setup = function () {
        e.player = new Player(nickname, 16777215 * Math.random()), e.player.setup(), playerCreated = !0
    }, e.update = function () {
        playerCreated && e.player.updateBody()
    }
}
function projectileController() {
    var e = this;
    e.setup = function () {
        e.projectileList = [], e.projectiles = game.add.group(), e.projectiles.enableBody = !0, e.projectiles.physicsBodyType = Phaser.Physics.P2, e.projectiles.createMultiple(50, "projectile"), e.projectiles.setAll("checkWorldBounds", !0), e.projectiles.setAll("outOfBoundsKill", !0)
    }, e.update = function () {
        for (var a = 0; a < e.projectileList.length; a++)e.projectileList[a].fire(e.projectiles);
        e.projectileList = []
    }
}
function Player(e, a) {
    var o = game.add.sprite(spawnlocs[0], spawnlocs[1], "dude");
    this.self = o;
    var t, i = 300, r = 1e3, s = 0;
    this.setup = function () {
        game.physics.p2.enable(o), o.physicsBodyType = Phaser.Physics.P2, o.body.setRectangle(30, 40, 0, 5), o.enableBody = !0, o.body.debug = DEBUG, o.body.fixedRotation = !0, o.anim = "stop", o.dir = "right", o.name = e, o.tint = a, o.dead = !1, o.source = socketid, o.checkWorldBounds = !0, o.events.onOutOfBounds.add(function () {
            o.body.velocity.x = 0, o.body.velocity.y = 0, o.x = 1200, o.y = 850
        }), o.animations.add("left", [0, 1, 2, 3], 10, !0), o.animations.add("right", [5, 6, 7, 8], 10, !0), o.scale.setTo(1, 1);
        var i = game.add.bitmapText(0, -40, "font1", o.name, 20);
        i.updateTransform(), i.smoothing = !0, i.position.x = -3 - i.width / 2, o.addChild(i), socket.emit("identify", [o.x, o.y, o.anim, o.dir, o.name, o.tint, socket.id]), t = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        }, o.body.setCollisionGroup(playerCollisionGroup), o.body.collides([platformCollisionGroup, playerCollisionGroup]), o.body.collides(projectileCollisionGroup, o.hit, this), game.camera.follow(o)
    }, this.updateBody = function () {
        if (!o.dead) {
            if (o.body.velocity.x = 0, o.animations.play(o.dir), t.left.isDown ? (o.body.moveLeft(i), o.anim = "left", o.dir = "left") : t.right.isDown ? (o.body.moveRight(i), o.anim = "right", o.dir = "right") : (o.animations.stop(), o.anim = "stop"), game.input.activePointer.isDown) {
                var e = game.physics.arcade.angleToPointer(o);
                game.time.now > s && projectileCtrl.projectiles.countDead() > 0 && (s = game.time.now + r, socket.emit("fire", [o.x, o.y, e, o.tint, socket.id]))
            }
            (t.up.isDown || t.space.isDown) && touchingDown(o) && (o.body.moveUp(750), o.body.velocity.x > 0 && !touchingDown(o) && (o.animations.stop(), o.frame = 6, o.anim = "jump_right"), o.body.velocity.x < 0 && !touchingDown(o) && (o.animations.stop(), o.frame = 3, o.anim = "jump_left"))
        }
    }, o.hit = function (e, a) {
        if (a.sprite.source != socketid) {
            o.dead = !0, o.body.moves = !1, o.body.fixedRotation = !1, o.body.velocity.x = a.sprite.body.velocity.x, o.body.velocity.y = a.sprite.body.velocity.y, o.body.angularVelocity = 2 * o.body.angularVelocity;
            var t = game.add.tween(o).to({alpha: 0}, 2e3, Phaser.Easing.Linear.None, !0, 2e3);
            a.sprite.kill(), setTimeout(function () {
                if (o.dead) {
                    game.tweens.remove(t);
                    var e = game.add.tween(o).to({alpha: 1}, 500, Phaser.Easing.Linear.None, !0);
                    e.repeat(4, 0), o.body.rotation = 0, o.rotation = 0, o.reset(spawnlocs[0], spawnlocs[1]), o.body.fixedRotation = !0, o.dead = !1
                }
            }, 4e3)
        }
    }
}
function touchingDown(e) {
    for (var a = p2.vec2.fromValues(0, 1), o = !1, t = 0; t < game.physics.p2.world.narrowphase.contactEquations.length; t++) {
        var i = game.physics.p2.world.narrowphase.contactEquations[t];
        if (i.bodyA === e.body.data || i.bodyB === e.body.data) {
            var r = p2.vec2.dot(i.normalA, a);
            i.bodyA === e.body.data && (r *= -1), r > .5 && (o = !0)
        }
    }
    return o
}
function Projectile(e, a, o, t, i) {
    var r = this;
    r.x = e, r.y = a, r.rotation = o, r.tint = t, r.source = i, r.fire = function (e) {
        var a = e.getFirstDead();
        game.physics.p2.enable(a), a.body.setRectangle(45, 15, 25), a.tint = r.tint, a.body.angle = 180 * r.rotation / Math.PI, a.source = r.source, a.body.data.gravityScale = 0, a.body.debug = DEBUG, a.reset(r.x, r.y), a.animations.add("shoot");
        var o = r.rotation;
        a.body.velocity.x = 1e3 * Math.cos(o), a.body.velocity.y = 1e3 * Math.sin(o), a.animations.play("shoot", 5, !0), blarp.volume = .05, blarp.play(), a.body.setCollisionGroup(projectileCollisionGroup), a.body.collides([platformCollisionGroup, playerCollisionGroup])
    }
}
$("#nicknameModal").modal({backdrop: "static", keyboard: !1}), $("#nicknameModal").modal("show");
var game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "", {
    preload: preload,
    create: create,
    update: update,
    render: render
}, !1, !1), socket = io(), DEBUG = !1, playerCtrl, projectileCtrl, platformCtrl, buddyCtrl, projectileCollisionGroup, playerCollisionGroup, platformCollisionGroup, nickname = "", platforms, userscount = 0, userText = "", loginText = "", userhashmap = {}, socketid, buddydistancetimer, playerCreated, blarp, music, spawnlocs = [580, 1e3];
socket.on("userhashmap", function (e) {
    userhashmap = e
}), socket.on("fireBack", function (e) {
    for (var a = 0; a < e.length; a++)projectileCtrl.projectileList.push(new Projectile(e[a][0], e[a][1], e[a][2], e[a][3], e[a][4]))
}), socket.on("connect", function () {
    socketid = socket.id, setInterval(function () {
        playerCreated && (socket.id in userhashmap ? userhashmap[socket.id][0] == playerCtrl.player.x && userhashmap[socket.id][1] == playerCtrl.player.x || socket.emit("clientinfo", [playerCtrl.player.self.x, playerCtrl.player.self.y, playerCtrl.player.self.anim, playerCtrl.player.self.dir, playerCtrl.player.self.name, playerCtrl.player.self.tint, socket.id]) : socket.emit("clientinfo", [playerCtrl.player.self.x, playerCtrl.player.self.y, playerCtrl.player.self.anim, playerCtrl.player.self.dir, playerCtrl.player.self.name, playerCtrl.player.self.tint, socket.id]))
    }, 45)
});