var mongoose=require("mongoose"),
allTontine=require("./allTontine"),
Schema=mongoose.Schema;


var userTontineSchema=new Schema({
	username:{type:String},
	telephone:{type:String},
	password:{type:String},
	tontine:{type:Number},
	id:{type:Number},
	parent:{type:String},
	active:{type:Boolean,default:true},
	taken:{type:Boolean,default:false},
	partielSolde:{type:Number,default:0},
	open:{type:Boolean,default:true},
	child1:{type:Array},
	child2:{type:Array}
});


module.exports=mongoose.model("userTontine",userTontineSchema,"userTontine");

