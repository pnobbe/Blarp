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
