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