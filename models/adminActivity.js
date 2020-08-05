var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var adminActivity=new Schema({
	type:{type:String},
	message:{type:String},
	telephone:{type:String},	
	date:{type:String},
	dateFormat:{type:String},
	time:{type:String},
	read:{type:Boolean,default:false}
});

module.exports=mongoose.model("adminActivity",adminActivity,"adminActivity");
