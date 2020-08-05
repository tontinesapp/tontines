//var socket=io.connect("http://192.168.173.1:3000");
var pseudo=prompt("name");
var socket=io.connect("http://localhost:3000");
/*socket.on("welcome",function(data){
	console.log(data);
	$("#users").append(data);
	socket.emit("how","how are you");
})
*/

	var socket2=io.connect("/"+pseudo);
	
	socket2.on("invitation",function(data){
		console.log(data);
	});
	
//var user1=io.connect("/"+pseudo);



/*
user1.on("hi",function(data){
	user1.emit("hi",)
});
*/
