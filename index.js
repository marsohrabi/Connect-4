/*
SENG 513 Individual Project
Maryam Sohrabi 10077637
Lab section B04
*/

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

io.on("connection", function (socket) {
    // set up users that already have a name cookie
    socket.on("setup with name", function (args) {
        let new_code = Math.floor(Math.random() * 10000000000);
        while (new_code in games) {
            new_code = Math.floor(Math.random() * 10000000000);
        }

        // create a new game
        games[new_code] = {
            "1": socket.id,
            "2": null,
            "code": new_code,
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

        // set the player's name
        connected_players[socket.id] = { "name": args.name, "socket": socket, "game_code": new_code, "game": games[new_code] };

        // send the game code
        socket.emit("setup", { "name": null, "game_code": new_code });
    });

    socket.on("setup without name", function () {
        // set up users that don't have a name cookie

        // generate a unique game code    
        let new_code = Math.floor(Math.random() * 10000000000);
        while (new_code in games) {
            new_code = Math.floor(Math.random() * 10000000000);
        }

        // create a new game
        games[new_code] = {
            "1": socket.id,
            "2": null,
            "code": new_code,
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

        // generate a random name and send it along with the game code
        names({ adjectives: 2, format: "title" }).then(function (generated_name) {
            // set the player's name
            connected_players[socket.id] = { "name": generated_name, "socket": socket, "game_code": new_code, "game": games[new_code] };

            // send the generated name and game code
            socket.emit("setup", { "name": generated_name, "game_code": new_code });
        });
    });

    // handle game codes being entered
    socket.on("entered game code", function (args) {
        // check that the game code is valid and doesn't already have 2 players and the player didn't enter their own code
        if (args.game_code in games && games[args.game_code][2] == null && parseInt(args.game_code) !== connected_players[socket.id]["game_code"]) {
            // remove the player's existing empty game
            for (let i in games) {
                if (games[i]["1"] == socket.id) {
                    delete games[i];
                }
            }

            // set this socket as player 2 in the game
            games[args.game_code]["2"] = socket.id;
            games[args.game_code]["playing"] = true;

            // set this socket's game code and game reference
            connected_players[socket.id]["game_code"] = args.game_code;
            connected_players[socket.id]["game"] = games[args.game_code];

            games[args.game_code]["playing"] = true;

            // toggle the game screen for player 1
            connected_players[games[args.game_code]["1"]]["socket"].emit("start game", { "other_player": connected_players[games[args.game_code]["2"]]["name"], "turn": true });

            // toggle the game screen for player 2
            connected_players[games[args.game_code]["2"]]["socket"].emit("start game", { "other_player": connected_players[games[args.game_code]["1"]]["name"], "turn": false });

        }
    });

    // handle random game selection
    socket.on("random game selected", function (args) {
        if (random_game_users.length > 0) {
            let random_opponent = random_game_users.shift();

            // remove the player's existing empty game
            for (let i in games) {
                if (games[i]["1"] == socket.id) {
                    delete games[i];
                }
            }

            // get the opponent's game and set this socket as player 2
            games[connected_players[random_opponent]["game_code"]]["2"] = socket.id;
            let opponent_game_code = connected_players[random_opponent]["game_code"];

            // set this socket's game code and game reference
            connected_players[socket.id]["game_code"] = opponent_game_code;
            connected_players[socket.id]["game"] = games[opponent_game_code];

            // connected_players[random_opponent]["game"]["2"] = socket.id //   ============================= try this too
            games[opponent_game_code]["playing"] = true;

            // toggle the game screen for player 1
            connected_players[random_opponent]["socket"].emit("start game", { "other_player": connected_players[socket.id]["name"], "turn": true });

            // toggle the game screen for player 2 (this socket)
            connected_players[socket.id]["socket"].emit("start game", { "other_player": connected_players[random_opponent]["name"], "turn": false });

        } else {
            // add user to list of players waiting for a random opponent
            random_game_users.push(socket.id);

            socket.emit("wait for random game", {});
        }
    });

    // update the player's name in the game
    socket.on("update name", function (args) {
        connected_players[socket.id]["name"] = args.new_name;
    });

    socket.on("clicked square", function (args) {
        let clicked_square = args.square_id;

        // check if the move is valid
        let game = connected_players[socket.id]["game"];
        let clicked_row = parseInt(clicked_square.charAt(0));
        let clicked_col = parseInt(clicked_square.charAt(1));
        let valid_move = false;

        // determine whether the clicked square represents a valid move
        if (clicked_row >= 0 && clicked_row <= 5 && clicked_col >= 0 && clicked_col <= 6) {
            if (clicked_row === 5 && game["game_state"][clicked_row][clicked_col] === 0) {
                // bottom row clicked and valid move
                valid_move = true;
            } else if (game["game_state"][clicked_row][clicked_col] === 0 && game["game_state"][clicked_row + 1][clicked_col] !== 0) {
                // other row clicked and valid move
                valid_move = true;
            }
        }

        // update the game state and notify both players
        if (valid_move) {
            let this_player;
            // determine if this is player 1 or 2
            if (connected_players[socket.id]["game"]["1"] == socket.id) {
                // player 1 placed a piece, update game board and turns
                this_player = 1;
                game["game_state"][clicked_row][clicked_col] = 1;
                game["turn"] = 2;

                // notify other player
                connected_players[game["2"]]["socket"].emit("valid move", { "game_state": game["game_state"], "square": args.square_id, "turn": true });
            } else {
                // player 2 placed a piece, update game board and turns
                this_player = 2;
                game["game_state"][clicked_row][clicked_col] = 2;
                game["turn"] = 1;

                // notify other player
                connected_players[game["1"]]["socket"].emit("valid move", { "game_state": game["game_state"], "square": args.square_id, "turn": true });
            }

            // notify this player
            socket.emit("valid move", { "game_state": game["game_state"], "square": args.square_id, "turn": false });

            // check for a win or a draw
            if (checkForWin(game["game_state"], this_player)) {
                // tell both sockets the result
                if (this_player == 1) {
                    end_game(false, socket, connected_players[game["2"]]["socket"], game);
                } else {
                    end_game(false, socket, connected_players[game["1"]]["socket"], game);
                }
            } else if (checkForDraw(game["game_state"])) {
                // tell both sockets that there is a draw
                if (this_player == 1) {
                    end_game(true, socket, connected_players[game["2"]]["socket"], game);
                } else {
                    end_game(true, socket, connected_players[game["1"]]["socket"], game);
                }
            }

        } else {
            socket.emit("invalid move", {});
        }
    });

    // remove the user from the list of random game players on disconnect
    socket.on("disconnect", function () {
        if (random_game_users.indexOf(socket.id) !== -1) {
            random_game_users.splice(random_game_users.indexOf(socket.id), 1);
        }

    });

});

// Algorithm for checking winning conditions adapted from 
// https://cs.nyu.edu/courses/fall16/CSCI-UA.0101-009/notes/Lecture12.pdf
function checkForWin(game_board, player) {
    // check for horizontal win
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < game_board[row].length - 3; col++) {
            if (game_board[row][col] !== 0 && game_board[row][col] == game_board[row][col + 1] &&
                game_board[row][col] == game_board[row][col + 2] && game_board[row][col] == game_board[row][col + 3]) {
                return true;
            }
        }
    }

    // check for vertical win
    for (let col = 0; col < game_board[0].length; col++) {
        for (let row = 0; row < game_board.length - 3; row++) {
            if (game_board[row][col] !== 0 && game_board[row][col] == game_board[row + 1][col] &&
                game_board[row][col] == game_board[row + 2][col] && game_board[row][col] == game_board[row + 3][col]) {
                return true;
            }
        }
    }

    // check for diagonal win from top left
    for (let row = 0; row < game_board.length - 3; row++) {
        for (let col = 0; col < game_board[row].length - 3; col++) {
            if (game_board[row][col] !== 0 && game_board[row][col] == game_board[row + 1][col + 1] &&
                game_board[row][col] == game_board[row + 2][col + 2] && game_board[row][col] == game_board[row + 3][col + 3]) {
                return true;
            }
        }
    }

    // check for diagonal win from top right
    for (let row = 0; row < game_board.length - 3; row++) {
        for (let col = 3; col < game_board[row].length; col++) {
            if (game_board[row][col] !== 0 && game_board[row][col] == game_board[row + 1][col - 1] &&
                game_board[row][col] == game_board[row + 2][col - 2] && game_board[row][col] == game_board[row + 3][col - 3]) {
                return true;
            }
        }
    }

    return false;
}

// check if there is a draw, i.e. no remaining legal moves
function checkForDraw(game_board) {
    for (let i = 0; i < game_board.length; i++) {
        for (let j = 0; j < game_board[i].length; j++) {
            // check if there is an empty square left
            if (game_board[i][j] === 0) {
                return false;
            }
        }
    }

    return true;
}

// send alerts that the game is over and close the game
function end_game(tie, winner, loser, game) {
    if (!tie) {
        winner.emit("won game", {});
        loser.emit("lost game", {});
    } else {
        winner.emit("tied game", {});
        loser.emit("tied game", {});
    }
    
    game["playing"] = false;
    game["end"] = true;
}

const port = process.env.port || 3000;
http.listen(port, function () {
    console.log('listening on *:3000');
});