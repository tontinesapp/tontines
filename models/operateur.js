var mongoose=require("mongoose"),
Schema=mongoose.Schema;

var operateurSchema=new Schema({
	operateur:{type:String},
	num:{type:String}
});

module.exports=mongoose.model("Operateur",operateurSchema,"Operateur");