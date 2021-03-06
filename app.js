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
			"Color":myList[keys[i]].color
		});
	};
	return userInfo;
}


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	
	users[socket.id] = new UserElement();
	
	let userInfo = {
		"Name": users[socket.id].name,
		"Color": users[socket.id].color
	};
	
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
	io.emit("update-users", JSON.stringify(genList(users)));
	console.log("A user has connected!");
  
    socket.on('chat-message', function(data){
		var myTime = new Date();
		//console.log(myTime);
		msgObj = new MessageElement(users[socket.id].name, users[socket.id].color, myTime, data);
		messages.push(msgObj);
		let msg = {
			"Name": users[socket.id].name,
			"Color": users[socket.id].color,
			"Date": myTime,
			"Data": data
		};
		io.emit("chat-individual-message", JSON.stringify(msg));
    });
	
	
	
	socket.on("cookie-exists", function(data){
		var cookie = JSON.parse(data);
		users[socket.id].name = cookie.Name;
		users[socket.id].color = cookie.Color;
		io.emit("update-users", JSON.stringify(genList(users)));
    });
	
	
	socket.on("change-username", function(data){
		var keys = Object.keys(users);
		for(var i = 0; i < keys.length;i++){
			if (data == users[keys[i]].name) {
				found = true;
			}
		};
		if (found){
			socket.emit("username-error", data);
		}
		else{
			users[socket.id].name = data;
			let userInfo = {
				"Name": users[socket.id].name,
				"Color": users[socket.id].color
			};
			io.emit("update-users", JSON.stringify(genList(users)));
			socket.emit("update-info", JSON.stringify(userInfo));
		}
		found = false;
    });
	
	socket.on("change-color", function(data){
		users[socket.id].color = data;
		let userInfo = {
			"Name": users[socket.id].name,
			"Color": users[socket.id].color
		};
		io.emit("update-users", JSON.stringify(genList(users)));
		socket.emit("update-info", JSON.stringify(userInfo));
    });
	
	socket.on("request-name", function(data){
		users[socket.id] = new UserElement();
		let userInfo = {
			"Name": users[socket.id].name,
			"Color": users[socket.id].color
		};
		socket.emit("request-name-res", JSON.stringify(userInfo));
		io.emit('update-users', JSON.stringify(genList(users)));
    });
	
	
    socket.on('disconnect', function(msg){
		delete users[socket.id];
		io.emit('update-users', JSON.stringify(genList(users)));
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
		var keys = Object.keys(users);
		for(var i = 0; i < keys.length;i++){
			if (text == users[keys[i]].name) {
				found = true;
			}
		};
		if (!found){
			gen = false;
		}
	}
	return text;
}
		
		
function genColor(){
	return "000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); //random color generation
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