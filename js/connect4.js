let themes = ["standard", "forest", "beach", "pumpkin"];
let theme = "standard";

$(".square").click(function () {
    console.log(this.id);
});



function game() {
    //var socket = io();

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