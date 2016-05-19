var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usercount = 0;
var userhashmap = {};   //stores client information
var firemap = [];   //stores all fired projectiles
var port = process.env.PORT || 3000;                    //heroku port or default port 3000

app.get('/', function (req, res) {                        //response handler
    res.sendFile(__dirname + '/index.html');            //default response
});
app.use("/assets", express.static(__dirname + '/app/assets'));
app.use("/js", express.static(__dirname + '/dist'));
app.use("/style", express.static(__dirname + '/app/style'));
//404
app.use(function (req, res, next) {                      //404 response handler
    res.status(404).send('404: Sorry cant find that!'); //basic 404 response
});


io.on('connection', function (socket) {                   //socket.io on connection to client

    function communicateJoin(status) {                  //function for handling socket io connections
        if (status == 'connected') {                            //status just checks if you want the function to handle a join or a leave
            usercount += 1;                             //if a user joins add 1 to the usercount
            console.log(userhashmap[socket.id][4] + " has " + status + ", users: " + usercount);

        } else if (status == 'disconnected') {
            if (typeof userhashmap[socket.id] != 'undefined') {
                usercount -= 1;
                console.log(userhashmap[socket.id][4] + " has " + status + ", users: " + usercount);
                delete userhashmap[socket.id];              //get rid of the info of the logged in socket when they leave
            }
            else {
                console.log("Unidentified user has " + status + ", users: " + usercount);
            }
        }

        for (var x in userhashmap) {                    //list connected sockets whenever someone leaves or joins
            console.dir(" | " + userhashmap[x][4]);
        }
        console.log("");
    }

    //someone joins on io.on('connection', ...

    socket.on('disconnect', function () {                //someone leaves on socket.on('disconnect', ...
        communicateJoin("disconnected");
    });
    socket.on('clientinfo', function (msg) {             //recieve info about the socket, i.e. their x, y, animation
        userhashmap[socket.id] = msg;                   //and put it in userhashmap associated with their socket id
    });

    socket.on('identify', function (msg) {             //recieve extra info about the socket, i.e. their name, color, etc
        userhashmap[socket.id] = msg;                   //and put it in userhashmap associated with their socket id
        communicateJoin("connected");
    });

    socket.on('fire', function (msg) {
        firemap.push(msg);
    });


});

setInterval(function () {
    if (usercount > 0) {
        io.sockets.emit('userhashmap', userhashmap);

        if (firemap.length > 0) {
            io.sockets.emit('fireBack', firemap);
            firemap = [];
        }
    }
}, 14);

http.listen(port, function () {                           //http serving
    console.log('Listening on ' + port);
});