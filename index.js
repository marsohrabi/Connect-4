const express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require("socket.io")(http);
let names = require('adjective-adjective-animal');

let connected_players = {};
let games = {};
let random_game_users = {};

app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', function (socket) {
    console.log('a user connected');

    

    /* // create a new game
    games[new_code] = {
        "1": socket.id,
        "2": null,
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
    }; */

    //console.log(games);

    // generate a unique game code    
    
    

    socket.on("setup with name", function(args) {
        console.log("Setup with name");
        let new_code = Math.floor(Math.random() * 10000000000);
        while (new_code in games) {
            new_code = Math.floor(Math.random() * 10000000000);
        }

        console.log("Got new code");
        // create a new game
        games[new_code] = {
            "1": socket.id,
            "2": null,
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

        console.log("Made a new game");

        // set the player's name
        connected_players[socket.id] = {"name": args.name, "socket": socket, "game": games[new_code]};
        console.log("Name: " + connected_players[socket.id]["name"]);
        //console.log(connected_players);
        
        // send the game code
        socket.emit("setup", {"name": null, "game_code": new_code});
    });

    socket.on("setup without name", function() {
        // generate a unique game code    
        let new_code = Math.floor(Math.random() * 10000000000);
        while (new_code in games) {
            new_code = Math.floor(Math.random() * 10000000000);
        }

        // create a new game
        games[new_code] = {
            "1": socket.id,
            "2": null,
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

        //console.log("No name");
        // generate a random name and send it along with the game code
        names({ adjectives : 2, format : "title"}).then(function(generated_name) {
            // set the player's name
            connected_players[socket.id] = {"name": generated_name, "socket": socket, "game": games[new_code]};
            //console.log(connected_players);

            console.log("Name: " + connected_players[socket.id]["name"]);
            // send the generated name and game code
            socket.emit("setup", {"name": generated_name, "game_code": new_code});
            
        });
        //console.log(connected_players);
    });

    socket.on("entered game code", function(args) {
        //console.log(connected_players[socket.id]["name"] + " entered game code " + args.game_code);

        // check that the game code is valid and doesn't already have 2 players
        if (args.game_code in games && games[args.game_code][2] == null) {
            // remove the player's existing empty game
            for (let i in games) {
                if (games[i]["1"] == socket.id) {
                    //console.log("Deleting game for user " + connected_players[socket.id]["name"]);
                    delete games[i];
                }
            }

            // set this socket as player 2 in the game
            games[args.game_code]["2"] = socket.id;

            //console.log(connected_players);
            console.log("Player 1 is " + connected_players[games[args.game_code]["1"]]["name"] + ", player 2 is " + connected_players[games[args.game_code]["2"]]["name"]);

            // toggle the game screen for player 1
            connected_players[games[args.game_code]["1"]]["socket"].emit("start game", {"other_player": connected_players[games[args.game_code]["2"]]["name"], "turn": true});

            // toggle the game screen for player 2
            connected_players[games[args.game_code]["2"]]["socket"].emit("start game", {"other_player": connected_players[games[args.game_code]["1"]]["name"], "turn": false});

            games[args.game_code]["playing"] = true;
        }

        
    });

    socket.on("update name", function(args) {
        console.log("Changing name to " + args.new_name)
        connected_players[socket.id]["name"] = args.new_name;
    });

    socket.on("clicked square", function(args) {
        console.log(connected_players[socket.id]["name"] + " clicked square " + args.square_id);
    });



    socket.on('disconnect', function () {
        console.log('user disconnected');
  });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});