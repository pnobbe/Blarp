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