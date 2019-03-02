var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = {};
var messages = [];


function genList(myList){
	var userInfo = {"Users":[]};
	var keys = Object.keys(myList);
	for(var i = 0; i < keys.length;i++){
		userInfo.Users.push(
		{
			"Name":myList[keys[i]].name,
			"Color":myList[keys[i]].color,
			"Date":myList[keys[i]].date,
			"Data":myList[keys[i]].data
		});
	};
	return userInfo;
}


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	users[socket.id] = new UserElement();
	io.emit("update-users", JSON.stringify(genList(users)));
	let userInfo = {
		"Name": users[socket.id].name,
		"Color": users[socket.id].color
	}
	var messageInfo = {"Messages":[]};
	for (var i in messages){
		messageInfo.Messages.push(
		{
			"Name":messages[i].name,
			"Color":messages[i].color,
			"Date":messages[i].date,
			"Data":messages[i].data
		});
	};
	socket.emit("pass-info", JSON.stringify(userInfo));
	socket.emit("pass-messages", JSON.stringify(messageInfo));
	console.log("A user connected!");
  
    socket.on('chat-message', function(data){
		msgObj = new MessageElement(users[socket.id].name, users[socket.id].color, "NOW", data);
		messages.push(msgObj);
		
		let msg = {
			"Name": users[socket.id].name,
			"Color": users[socket.id].color,
			"Date": "NOW",
			"Data": data
		};
		socket.broadcast.emit("chat-add-message", JSON.stringify(msg));
		socket.emit("chat-individual-message", JSON.stringify(msg));
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

function MessageElement(name, color, date, data){
	this.name = name;
	this.color = color;
	this.date = date;
	this.data = data;
}