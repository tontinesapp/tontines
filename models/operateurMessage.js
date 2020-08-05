var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var OperatorSchema=new Schema({
	type:{type:String},
	message:{type:String},	
	date:{type:String},	
	time:{type:String},
	check:{type:Boolean,default:false},
	accept:{type:Boolean,default:false},
	admissible:{type:Boolean,default:false}
});

module.exports=mongoose.model("SMSOperateur",OperatorSchema,"SMSOperateur");
