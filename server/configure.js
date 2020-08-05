var path=require("path"),
hdbr=require("express-handlebars-multi"),
express=require("express"),
bodyParser=require("body-parser"),
cookieParser=require("cookie-parser"),
morgan=require("morgan"),
methodOveride=require("method-override"),
errorHandler=require("errorhandler"),
session=require("express-session"),
//sessionStore=require("connect-mongo")(session),
/*
store=new sessionStore({
	url:"mongodb://192.168.173.1/tontine"
}),
*/
moment=require("moment"),
multer=require("multer"),
routes=require("./routes");

//options=require("./options");


module.exports=function(app){
	app.use(cookieParser("secretCode"));
	app.use(session({secret:"secret Code",saveUninitialized:true,resave:true}));
	app.use(morgan("dev"));
	app.use(bodyParser.urlencoded({"extended":true}));
	app.use(bodyParser.json());
	app.use(methodOveride());
	
	app.use(multer({dest:path.join(__dirname,"../public/upload/temp")}).single("file"));
	routes(app);
	app.use("/public",express.static(path.join(__dirname,"../public")));
	app.use("/views",express.static(path.join(__dirname,"../views")));
	
	if("development"==app.get("env")){
		app.use(errorHandler());
		console.log("development");
	}else{
		console.log("You are on "+app.get("env"));
	}
	/*
	let partialCours=function(){
		var elem=[];
		for(let i=0; i<options.level.length;i++){
			for(var j=0;j<options.options.length;j++){
				elem.push(app.get("views")+"/cours/"+options.level[i]+"/"+options.options[j]);
				elem.push(app.get("views")+"/quiz/"+options.level[i]+"/"+options.options[j]);
			}
		}
		
		for(var option in (options.exetat)){
			for(var serie=0; serie<options.exetat[option].length;serie++){
				elem.push(app.get("views")+"/exetat/"+option+"/"+options.exetat[option][serie])
			}
		}
		if(elem.length>0){
			return elem
		}
	};
	*/
	let partialVues=[app.get("views")+"/partial",
	app.get("views")+"/cours",
	app.get("views")+"/quiz",app.get("views")+"/exetat"];
	
	//let partialDir=partialVues.concat(partialCours());
	app.engine("handlebars",hdbr({
		defaultLayout:"main",
		ext:".handlebars",
		layoutDirs:[app.get("views")+"/layouts"],
		partialDirs:partialVues,
		helpers:{
			section:function(name,options){
				if(!this._sections) this._sections={};
				this._sections[name]=options.fn(this);
				return null;
			},
			timeago:function(timestamp){
				return moment(timestamp).startOf("minute").fromNow();
			}
		}
	}));
	
	app.set("view engine","handlebars");
	return app;
}