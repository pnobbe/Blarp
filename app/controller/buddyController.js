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