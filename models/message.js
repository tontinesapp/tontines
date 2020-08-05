var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var messageSchema=new Schema({
	code:{type:Number},
	depot:{type:Number},	
	phoneNumber:{type:Number},	
});

module.exports=mongoose.model("Message",messageSchema);
