var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var userAsking=new Schema({
	type:{type:String},
	message:{type:String},
	telephone:{type:String},	
	date:{type:String},
	dateFormat:{type:String},
	time:{type:String},
	check:{type:Boolean,default:false},
	checkTime:{type:String},
	checkDate:{type:String},
	traited:{type:Boolean,default:false},
	traitedTime:{type:String},
	traitedDate:{type:String},
	sum:{type:String,default:0},
	year:{type:Number},
	dat:{type:Number},
	month:{type:Number},
	hour:{type:Number},
	minute:{type:Number},
	second:{type:Number},
	millisecond:{type:Number}
});

module.exports=mongoose.model("userAsking",userAsking,"userAsking");
