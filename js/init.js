/*
SENG 513 Individual Project
Maryam Sohrabi 10077637
Lab section B04
*/

let name = getCookie("name");
let my_game_code;
var socket;

$(function () {
    socket = io();

    // handle game code being entered
    $("form").submit(function (e) {
        e.preventDefault();

        socket.emit("entered game code", { "game_code": $("#code").val() });

        return false;
    });

    // set the new name
    $("#change-name-btn").on("click", function () {
        socket.emit("update name", { "new_name": $("#name").val() });
        setCookie("name", $("#name").val(), 7);
    });

    // action for when the random game button is clicked
    $("#random-game-btn").on("click", function () {
        socket.emit("random game selected", {});
    });

    // set up the game with or without a name cookie
    if (name) {
        // name cookie exists, set it in the display
        $("#name").val(name);

        socket.emit("setup with name", { "name": name });
    } else {
        socket.emit("setup without name");
    }

    // update name value and cookie
    socket.on("setup", function (args) {
        my_game_code = args.game_code;
        $("#game-code").html(my_game_code);

        if (!name) {
            name = args.name;
            $("#name").val(name);
            setCookie("name", name, 7);
        }
    });

    // tell user to wait for an opponent
    socket.on("wait for random game", function (args) {
        $("#wait-notice").html("Please wait for another random player to join the game");
    });

    // start the game by setting the turns and showing the game screen
    socket.on("start game", function (args) {
        $("#opponent-name").html(args.other_player);

        turn = args.turn;

        if (turn) {
            my_player = 1;
        } else {
            my_player = 2;
        }

        toggle_turn();
        show_page();
    });
});

// hide the setup screen and show the game screen
function show_page() {
    $("#setup").prop("hidden", true);
    $("#game").prop("hidden", false);
    game();
}


/*
Cookie functions from https://www.w3schools.com/js/js_cookies.asp
*/
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}