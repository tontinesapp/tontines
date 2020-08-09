var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var userActivity=new Schema({
	type:{type:String},
	message:{type:String},
	telephone:{type:String},	
	date:{type:String},	
	time:{type:String},
	read:{type:Boolean,default:false},
	dateFormat:{type:String},
	year:{type:Number},
	dat:{type:Number},
	month:{type:Number},
	hour:{type:Number},
	minute:{type:Number},
	second:{type:Number},
	millisecond:{type:Number}
});

module.exports=mongoose.model("userActivity",userActivity,"userActivity");
