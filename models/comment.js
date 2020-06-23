var mongoose=require("mongoose");

var commentSchema = mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
});



                              //跟ref一樣
module.exports=mongoose.model("comment",commentSchema);