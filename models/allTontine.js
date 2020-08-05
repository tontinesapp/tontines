var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var AllTontineSchema=new Schema({
	tontine:{type:Number},
	id:{type:Array}
});

module.exports=mongoose.model("AllTontine",AllTontineSchema,"AllTontine");