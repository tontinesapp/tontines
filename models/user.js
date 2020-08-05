var mongoose=require("mongoose"),
Schema=mongoose.Schema;


var userSchema=new Schema({
	name:{type:String},
	username:{type:String},
	firstname:{type:String},
	telephone:{type:String},
	password:{type:String},
	password_confirmation:{type:String},
	code:{type:String,default:12},
	solde:{type:Number},
	role:{type:String},
	connected:{type:Boolean,default:false},
	withfound:{type:Number,default:0},
	join:{type:String}
});

module.exports=mongoose.model("User",userSchema,"User");
