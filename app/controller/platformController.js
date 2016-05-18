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