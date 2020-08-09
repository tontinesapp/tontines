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
	year:{type:String},
	dat:{type:String},
	month:{type:String},
	hour:{type:String},
	minute:{type:String},
	second:{type:String},
	millisecond:{type:String}
});

module.exports=mongoose.model("userAsking",userAsking,"userAsking");
