/*
SENG 513 Individual Project
Maryam Sohrabi 10077637
Lab section B04
*/

let themes = ["original", "forest", "beach", "pumpkin"];
let theme = "original";
let game_over = false;
var turn = false;
var my_player;

// change to the theme specified if valid
function change_theme(theme_name) {
    if (themes.indexOf(theme_name) > -1) {
        // get a list of all elements with the old class, add the new theme class, and remove the old class
        $(".themed").each(function (index) {
            $(this).removeClass(theme);
            $(this).addClass(theme_name);

        });

        $("#" + theme + "-theme").removeClass("theme-active");
        $("#" + theme_name + "-theme").addClass("theme-active");

        theme = theme_name;
        setCookie("theme", theme, 7);
    }
}

// handle theme options being clicked
$(".theme-option").on("click", function () {
    change_theme(this.title);
});

// gameplay
function game() {
    // set the tile indicators at the top of the screen
    if (my_player === 1) {
        $("#my-tile").addClass("player-1");
        $("#opponent-tile").addClass("player-2");
    } else {
        $("#my-tile").addClass("player-2");
        $("#opponent-tile").addClass("player-1");
    }

    // check for name and theme cookies
    let theme_cookie = getCookie("theme");
    if (theme_cookie) {
        if (themes.indexOf(theme_cookie) > -1) {
            // valid theme name
            //theme = theme_cookie;
            change_theme(theme_cookie);
        }
    }

    // set empty squares on the grid
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            $("#" + i + j).append("<div class='circle themed " + theme + " empty'></div>");
        }
    }

    // set display name
    let name_cookie = getCookie("name");
    $("#my-name").html(name_cookie);

    // handle game grid squares being clicked
    $(".square").click(function () {
        if (turn) {
            socket.emit("clicked square", { "square_id": this.id });
        }
    });

    // update the game board and turns after a valid move
    socket.on("valid move", function (args) {
        if (args["turn"]) {
            turn = true;
        } else {
            turn = false;
        }

        toggle_turn();

        $("#" + args.square).empty();

        // fill the piece that was just placed on the grid
        if (turn) {
            if (my_player === 1) {
                $("#" + args.square).append("<div class='circle themed " + theme + " player-" + 2 + "'></div>");
            } else {
                $("#" + args.square).append("<div class='circle themed " + theme + " player-" + 1 + "'></div>");
            }
        } else {
            $("#" + args.square).append("<div class='circle themed " + theme + " player-" + my_player + "'></div>");
        }

        $("#bad-click").prop("hidden", true);
    });

    // alert user about invalid move
    socket.on("invalid move", function (args) {
        $("#bad-click").prop("hidden", false);
    });

    // alert the user that they won the game
    socket.on("won game", function (args) {
        turn = false;
        game_over = false;
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", true);

        $("#result").append("<h2 class='text-success'>You won the game!</h2>");
    });

    // alert the user that they lost the game
    socket.on("lost game", function (args) {
        turn = false;
        game_over = false;
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", true);

        $("#result").append("<h2 class='text-danger'>You lost the game!</h2>");
    });

    // alert the user that they tied the game
    socket.on("tied game", function (args) {
        turn = false;
        game_over = false;
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", true);

        $("#result").append("<h2 class='text-primary'>You tied the game!</h2>");
    });
}

// set the turn indicator text at the top of the screen
function toggle_turn() {
    if (turn) {
        $("#your-turn").prop("hidden", false);
        $("#opponent-turn").prop("hidden", true);
    } else {
        $("#your-turn").prop("hidden", true);
        $("#opponent-turn").prop("hidden", false);
    }
}
