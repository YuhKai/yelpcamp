var mongoose=require("mongoose");
var Comment=require("./comment");
//架構(Schema)設定
var campSchema = new mongoose.Schema({
  name: String,
  price:String,
  image: String,
  description: String,
  location:String,
  lat:Number,
  lng:Number,
  createdAt:{
    type:Date,
    default:Date.now,
  },
  author:{
    id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
    },
    username:String
  },
  comments:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"comment"  //跟comment model命名一樣
    }
  ]
});

campSchema.pre('remove', async function (next) {
  //pre hook
  try {
    await Comment.deleteMany({
      _id: {
        $in: this.comments,             //include comments
      },
    });
    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("campground", campSchema);

