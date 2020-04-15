let name = getCookie("name");
let my_game_code;
var socket;

$(function() {
    console.log("Start");
    socket = io();

    $("form").submit(function(e) {
        e.preventDefault();

        //console.log(e);

        socket.emit("entered game code", {"game_code": $("#code").val()});
        

        return false;
    });

    $("#change-name-btn").on("click", function() {
        socket.emit("update name", {"new_name": $("#name").val()});   
        setCookie("name", $("#name").val(), 7);
    });

    $("#random-game-btn").on("click", function() {
        socket.emit("random game selected", {});   
    });

    if (name) {
        // name cookie exists, set it in the display
        $("#name").val(name);

        socket.emit("setup with name", {"name" : name});    // ============================== combine setup into one emit with or without the name attribute
    } else {
        socket.emit("setup without name");
    }

    // update name value and cookie
    socket.on("setup", function(args) {
        console.log("Setup complete");
        my_game_code = args.game_code;
        $("#game-code").html(my_game_code);

        if (!name) {
            name = args.name;
            $("#name").val(name);
            setCookie("name", name, 7);
        }
    });

    socket.on("wait for random game", function(args) {
        $("#wait-notice").html("Please wait for another random player to join the game");
    });

    socket.on("start game", function(args) {
        console.log("Starting game with player " + args.other_player);
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

function toggle_turns() {

}

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
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
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