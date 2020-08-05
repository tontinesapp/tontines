var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var queueSchema=new Schema({
	name:{type:String},
	telephone:{type:String},
	tontineQueue:{type:Number}
});

module.exports=mongoose.model("Queue",queueSchema,"Queue");
