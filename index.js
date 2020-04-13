const express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require("socket.io")(http);
let names = require('adjective-adjective-animal');

let connected_players = {};
let games = {};
let random_game_users = [];

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
        connected_players[socket.id] = {"name": args.name, "socket": socket, "game_code": new_code, "game": games[new_code]};
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
            connected_players[socket.id] = {"name": generated_name, "socket": socket, "game_code": new_code, "game": games[new_code]};
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
            games[args.game_code]["playing"] = true;

            //console.log(connected_players);
            console.log("Player 1 is " + connected_players[games[args.game_code]["1"]]["name"] + ", player 2 is " + connected_players[games[args.game_code]["2"]]["name"]);

            // toggle the game screen for player 1
            connected_players[games[args.game_code]["1"]]["socket"].emit("start game", {"other_player": connected_players[games[args.game_code]["2"]]["name"], "turn": true});

            // toggle the game screen for player 2
            connected_players[games[args.game_code]["2"]]["socket"].emit("start game", {"other_player": connected_players[games[args.game_code]["1"]]["name"], "turn": false});

            
        }

        
    });

    socket.on("random game selected", function(args) {
        if (random_game_users.length > 0) {
            let random_opponent = random_game_users.shift();

            // remove the player's existing empty game
            for (let i in games) {
                if (games[i]["1"] == socket.id) {
                    //console.log("Deleting game for user " + connected_players[socket.id]["name"]);
                    delete games[i];
                }
            }

            // get the opponent's game and set this socket as player 2
            games[connected_players[random_opponent]["game_code"]]["2"] = socket.id;

            // set this socket's game code and game reference
            connected_players[socket.id]["game_code"] = connected_players[random_opponent]["game_code"];
            connected_players[socket.id]["game"] = games[connected_players[socket.id]["game_code"]];

            // connected_players[random_opponent]["game"]["2"] = socket.id //   ============================= try this too
            games[connected_players[random_opponent]["game_code"]]["playing"] = true;

            // toggle the game screen for player 1
            connected_players[random_opponent]["socket"].emit("start game", {"other_player": connected_players[socket.id]["name"], "turn": true});

            // toggle the game screen for player 2 (this socket)
            connected_players[socket.id]["socket"].emit("start game", {"other_player": connected_players[random_opponent]["name"], "turn": false});

        } else {
            random_game_users.push(socket.id);

            socket.emit("wait for random game", {});
        }
    });

    socket.on("update name", function(args) {
        console.log("Changing name to " + args.new_name)
        connected_players[socket.id]["name"] = args.new_name;
    });

    socket.on("clicked square", function(args) {
        let clicked_square = args.square_id;
        console.log(connected_players[socket.id]["name"] + " clicked square " + args.square_id);

        // check if the move is valid
        let game = connected_players[socket.id]["game"];
        let clicked_row = parseInt(clicked_square.charAt(0));
        let clicked_col = parseInt(clicked_square.charAt(1));
        let valid_move = false;

        if (clicked_row >= 0 && clicked_row <= 5 && clicked_col >= 0 && clicked_col <= 6) {
            if (clicked_row === 5 && game["game_state"][clicked_row][clicked_col] === 0) {
                // bottom row clicked and valid move
                console.log("Valid move at square " + clicked_row + "," + clicked_col);
                valid_move = true;
            } else if (game["game_state"][clicked_row+1][clicked_col] !== 0) {
                // other row clicked and valid move
                console.log("Valid move at square " + clicked_row + "," + clicked_col);
                valid_move = true;
            } else {
                console.log("INVALID MOVE at square " + clicked_row + "," + clicked_col);
            }
        }

        // update the game state and notify both players
        if (valid_move) {
            // determine if this is player 1 or 2
            if (connected_players[socket.id]["game"]["1"] == socket.id) {
                game["game_state"][clicked_row][clicked_col] = 1;
                game["turn"] = 2;
                // ===================================================================== check for winning condition here

                connected_players[game["2"]]["socket"].emit("valid move", {"game_state": game["game_state"], turn: true});
            } else {
                game["game_state"][clicked_row][clicked_col] = 2;
                game["turn"] = 1;
                // ===================================================================== check for winning condition here

                connected_players[game["1"]]["socket"].emit("valid move", {"game_state": game["game_state"], turn: true});
            }

            socket.emit("valid move", {"game_state": game["game_state"], turn: false});
            
        } else {
            socket.emit("invalid move", {});
        }
        

    });



    socket.on('disconnect', function () {
        console.log('user disconnected');
  });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});