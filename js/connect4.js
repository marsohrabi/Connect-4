let themes = ["original", "forest", "beach", "pumpkin"];
let theme = "original";
let game_over = false;
var turn = false;
var my_player;

function change_theme(theme_name) {
    if (themes.indexOf(theme_name) > -1) {
        if (theme_name != theme) {
            console.log("Changing theme name from " + theme + " to " + theme_name);
            // get a list of all elements with the old class, add the new theme class, and remove the old class
            $(".themed").each(function(index) {
                $(this).removeClass(theme);
                $(this).addClass(theme_name);
                
            });

            theme = theme_name;
        }
    }
}

$(".theme-option").on("click", function() {
    change_theme(this.title);
});

function game() {
    // check for name and theme cookies
    let theme_cookie = getCookie("theme")
    if (theme_cookie) {
        if (themes.indexOf(theme_cookie) > -1) {
            // valid theme name
            theme = theme_cookie;
        }
    }

    let name_cookie = getCookie("name");
    // set display name
    $("#my-name").html(name_cookie);

    $(".square").click(function () {
        if (turn) {
            socket.emit("clicked square", {"square_id": this.id});
        }
        
    });

    socket.on("valid move", function(args) {
        if (args["turn"]) {
            turn = true;
        } else {
            turn = false;
        }

        toggle_turn();

        if (turn) {
            if (my_player === 1) {
                $("#" + args.square).append("<div class='circle themed " + theme + " player-" + 2 + "'></div>");
             } else {
                $("#" + args.square).append("<div class='circle themed " + theme + " player-" + 1 + "'></div>");
            }
        } else {
            $("#" + args.square).append("<div class='circle themed " + theme + " player-" + my_player + "'></div>");
        }

        console.log(args.game_state);
    });

    socket.on("invalid move", function(args) {
        console.log("Invalid move!");
    });

    socket.on("won game", function(args) {
        turn = false;
        game_over = false;
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", true);

        $("#result").append("<h2 color='red'>You won the game!</h2>");
    });

    socket.on("lost game", function(args) {
        turn = false;
        game_over = false;
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", true);

        $("#result").append("<h2 color='red'>You lost the game!</h2>");
    });
}

function toggle_turn() {
    if (turn) {
        $("#your-turn").prop("hidden", false);
        $("#opponent-turn").prop("hidden", true);
    } else {
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", false);
    }
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