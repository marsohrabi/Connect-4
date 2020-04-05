let name = getCookie("name");
let my_game_code;
var socket;

$(function() {


    console.log("Start");
    socket = io();

    $("form").submit(function(e) {
        e.preventDefault();

        console.log(e);

        socket.emit("entered game code", {"game_code": $("#code").val()});

        return false;
    });

    $("#change-name-btn").on("click", function() {
        socket.emit("update name", {"new_name": $("#name").val()});   
    });

    if (name) {
        // name cookie exists, set it in the display
        $("#name").val(name);

        socket.emit("setup with name", {"name" : name});
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

    socket.on("start game", function(args) {
        console.log("Starting game with player " + args.other_player);
    });



});



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