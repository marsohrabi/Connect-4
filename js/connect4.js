let themes = ["original", "forest", "beach", "pumpkin"];
let theme = "original";
let game_over = false;
var turn = false;



function change_theme(theme_name) {
    if (themes.indexOf(theme_name) > -1) {
        //console.log("Theme " + theme_name + " selected, old theme is " + theme);

        if (theme_name != theme) {
            console.log("Changing theme name from " + theme + " to " + theme_name);
            // get a list of all elements with the old class, add the new theme class, and remove the old class
            $(".themed").each(function(index) {
                //console.log(this);
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
            console.log(this.id);
            socket.emit("clicked square", {"square_id": this.id});
        }
        
    });

    socket.on("valid move", function(args) {
        console.log("Valid move!");

        if (args["turn"]) {
            turn = true;
        } else {
            turn = false;
        }

        toggle_turn();
    });

    socket.on("invalid move", function(args) {
        console.log("Invalid move!");
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