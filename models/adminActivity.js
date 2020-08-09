var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var adminActivity=new Schema({
	type:{type:String},
	message:{type:String},
	telephone:{type:String},	
	date:{type:String},
	dateFormat:{type:String},
	time:{type:String},
	read:{type:Boolean,default:false}.
	year:{type:String},
	dat:{type:String},
	month:{type:String},
	hour:{type:String},
	minute:{type:String},
	second:{type:String},
	millisecond:{type:String}
});

module.exports=mongoose.model("adminActivity",adminActivity,"adminActivity");
