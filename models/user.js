var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
var UserSchema=new mongoose.Schema({
  username:{type:String,unique:true,required:true},
  password:String,
  email:{type:String,unique:true,required:true},
  resetPasswordToken:String,
  resetPasswordExpires:Date,
});
UserSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("user",UserSchema);