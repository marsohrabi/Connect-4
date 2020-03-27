const express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require("socket.io")(http);
let names = require('adjective-adjective-animal');

app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});