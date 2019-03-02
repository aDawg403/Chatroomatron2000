var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = {};
var messages = [];


function genList(myList){
    var keys = Object.keys(myList);
    msg = "";
    for(var i = 0; i < keys.length;i++){
	    msg = msg + myList[keys[i]].name + "~" + myList[keys[i]].color + ";"  
    }
    return msg;
}

function genMessages(pastMessages){
	msg = "";
    for (var i = 0; i < pastMessages.length; i++){
	    msg = msg + pastMessages[i].name + "~" + pastMessages[i].color + "~" + pastMessages[i].date + "~" + pastMessages[i].message + ";"  
    }
    return msg;
}

function genMessage(message){
    return message.name + "~" + message.color + "~" + message.date + "~" + message.message;  
}



app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	users[socket.id] = new UserElement();
	io.emit("update-users", genList(users));
	let userInfo = users[socket.id].name + "~" + users[socket.id].color;
	let messageInfo = genMessages(messages);
	socket.emit("pass-info", userInfo);
	socket.emit("pass-messages", messageInfo);
	console.log("A user connected!");
  
    socket.on('chat-message', function(msg){
		msgObj = new MessageElement(users[socket.id].name, users[socket.id].color, "NOW", msg);
		messages.push(msgObj);
		console.log(genMessage(msgObj));
	    io.emit('chat-message', genMessage(msgObj));
    });
  
    socket.on('disconnect', function(msg){
		delete users[socket.id];
		io.emit('update-users', genList(users));
		console.log("user disconnected");
    });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});




function genName(){
	gen = true;
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	while(gen){
		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		
		found = false;
		for (var i = 0; i < users.length;i++){
			if (text == users[i].name) {
				found = true;
			}
		}
		if (!found){
			gen = false;
		}
	}
	return text;
}

function genColor(){
	return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); //random color generation
}

function UserElement() {
	this.name = genName();
	this.color = genColor();
}

function MessageElement(name, color, date, message){
	this.name = name;
	this.color = color;
	this.date = date;
	this.message = message;
}