var socket=require("socket.io");
var io;
var guestNumber=1;
var nickNames={};
var namesUsed=[];
var currentRoom={};

exports.listen=function(server){
	io=socket.listen(server);
	io.set("log level",1);
	io.sockets.on("connection",function(socket){
		questNumber=assignGuestNumber(socket,guestNumber,nickNames,namesUsed);
		joinRoom(socket,"Lobby");
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);
		
		socket.on("rooms",function(){
			socket.emit("rooms",io.sockets.manager.rooms);
		});
		
		handleClientDisconnection(socket, nickNames, namesUsed);
	});
}