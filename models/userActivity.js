var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var userActivity=new Schema({
	type:{type:String},
	message:{type:String},
	telephone:{type:String},	
	date:{type:String},	
	time:{type:String},
	read:{type:Boolean,default:false},
	dateFormat:{type:String}
});

module.exports=mongoose.model("userActivity",userActivity,"userActivity");
