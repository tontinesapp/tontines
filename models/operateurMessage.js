var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var OperatorSchema=new Schema({
	type:{type:String},
	message:{type:String},	
	date:{type:String},	
	time:{type:String},
	check:{type:Boolean,default:false},
	accept:{type:Boolean,default:false},
	admissible:{type:Boolean,default:false},
	role:{type:String},
	year:{type:Number},
	dat:{type:Number},
	month:{type:Number},
	hour:{type:Number},
	minute:{type:Number},
	second:{type:Number},
	millisecond:{type:Number}
});

module.exports=mongoose.model("SMSOperateur",OperatorSchema,"SMSOperateur");
