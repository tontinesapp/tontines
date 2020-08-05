var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var tontineSchema=new Schema({
	tontine:{type:String},
	Admin:{type:String},
	superAmin:{type:String,default:"Admin"},
	user:{type:Number},
	child:{type:Number}
});

module.exports=mongoose.model("Tontine",tontineSchema);
