const express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require("socket.io")(http);
let names = require('adjective-adjective-animal');

let connected_players = {};
let games = {};

app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', function (socket) {
    console.log('a user connected');

    // generate a unique game code    
    let new_code = Math.floor(Math.random() * 10000000000);
    while (new_code in games) {
        new_code = Math.floor(Math.random() * 10000000000);
    }

    // create a new game
    games[new_code] = {
        1: socket,
        2: null,
        "game_state": [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
        ],
        "turn": 1,
        "playing": false,
        "end": false,
    };
    

    socket.on("setup with name", function(args) {
        
        // set the player's name
        connected_players[socket] = args.name;
        console.log("Name: " + connected_players[socket]);
        
        // send the game code
        socket.emit("setup", {"name": null, "game_code": new_code});
    });

    socket.on("setup without name", function() {
        //console.log("No name");
        // generate a random name and send it along with the game code
        names({ adjectives : 2, format : "title"}).then(function(generated_name) {
            // set the player's name
            connected_players[socket] = generated_name;

            console.log("Name: " + connected_players[socket]);
            // send the generated name and game code
            socket.emit("setup", {"name": generated_name, "game_code": new_code});
            
        });
    });

    socket.on("entered game code", function(args) {
        console.log(connected_players[socket] + " entered game code " + args.game_code);

        // check that the game code is valid and doesn't already have 2 players
        if (args.game_code in games && games[args.game_code][2] == null) {
            // remove the player's existing empty game
            for (let i in games) {
                if (games[i][1] == socket) {
                    delete games[i];
                }
            }

            // set this socket as player 2 in the game
            games[args.game_code][2] = socket;

            // toggle the game screen for player 1
            games[args.game_code][1].emit("start game", {"other_player": connected_players[games[args.game_code][2]], "turn": true});

            // toggle the game screen for player 2
            games[args.game_code][2].emit("start game", {"other_player": connected_players[games[args.game_code][1]], "turn": false});
        }

        
    });

    socket.on("update name", function(args) {
        console.log("Changing name to " + args.new_name)
        connected_players[socket] = args.new_name;
    });



    socket.on('disconnect', function () {
        console.log('user disconnected');
  });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});