var express=require("express"),
mongoose=require("mongoose"),

config=require("./server/configure"),
app=express();
app.set("port",process.env.PORT||3000);
app.set("views",__dirname+"/views");
app=config(app);

mongoose.Promise=global.Promise;
//mongoose.connect("mongodb://localhost/tontine");
mongoose.connect("mongodb+srv://tontinesDB:8Zo3US0OSGUxecml@cluster0.kmpt1.gcp.mongodb.net/Tontines?retryWrites=true&w=majority",{useNewUrlParser:true,useFindAndModify:false,useCreateIndex:true,keepAlive:1},function(err){console.log(err)});

mongoose.connection.on("open",function(){
	console.log("app is connected to mongoose");
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

//var server=http.createServer(app);

app.listen(app.get("port"),function(){
	//console.log("The Leader Construct Server is running on port "+app.get("port"));
});





