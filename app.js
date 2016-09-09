'use strict';
var http = require('http');
var express = require('express');
//var mongoose = require('mongoose');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
server.listen(3000);

/*
mongoose.connect("mongodb://localhost:27017/chat", function(error){
    if(error)
        console.log("Hello World!");
    else{
        console.log("Connected to MongoDb!");
    }

});

*/

app.get("/", function(request, response){
    response.sendFile(__dirname + "/index.html");
});

var users = {};


io.sockets.on("connection", function(socket){
    socket.on("send message", function(data, callback){
        var msg = data.trim();
        if(data.substr(0, 3).toLowerCase() === '/w '){ //Wisper
            msg = msg.substr(3);
            msg = msg.trim();
            var index = msg.indexOf(" ");
            if(index !== -1){
                var name = msg.substring(0, index);
                name = name.toLowerCase();
                msg = msg.substr(index+1);
                msg = msg.trim();
                if(name in users){
                    users[name].emit("wisper", {"msg" : msg, "nick": socket.nick});
                    console.log("Wisper!");
                }else{
                    callback("Error! You didn't entered a valid user");
                }

            }else {
                callback("Error! You didn't entered message for yours wisper.")
            }


        }else{
            io.sockets.emit("new message", {"msg" : msg, "nick" : socket.nick});
        }

    });

    socket.on("new user", function(data, callback){
        data = data.toLowerCase();
        if(data in users ){
          callback(false);
        }else{
          callback(true);
          socket.nick = data;
          users[socket.nick] = socket;
          io.sockets.emit("usernames", Object.keys(users));
        }
    });

    socket.on("disconnect", function(data){
        if(!socket.nick)
            return;
        else{
            delete users[socket.nick];
            io.sockets.emit("usernames", Object.keys(users));

        }

    });
});
