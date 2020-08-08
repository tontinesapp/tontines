var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var adminSchema=new Schema({
	//name:{type:String},
	telephone:{type:String},
	password:{type:String},
	role:{type:String},
	token:{type:String},
	connected:{type:Boolean,default:false},
	solde:{type:Number,default:0},
	benefice:{type:Number,default:0}
});

module.exports=mongoose.model("Admin",adminSchema,"Admin");