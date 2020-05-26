require("dotenv").config();
const  express        = require("express");
const  app            = express();
const  bodyParser     = require("body-parser");
const  mongoose       = require("mongoose");
const  passport       =require("passport");
const  flash          =require("connect-flash");
const  Localstrategy  =require("passport-local");
const  Campground     =require("./models/campground");
const  methodOverride =require("method-override");
const  Comment        =require("./models/comment");
const  User           =require("./models/user");
const  seedDB         =require("./newseed");

//載入ROUTES
const commentRoutes   =require("./routes/comments");
const campgroundRoutes=require("./routes/campgrounds");
const indexRoutes     =require("./routes/index");
    
app.locals.moment=require("moment");

const url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }).then(()=>{
    console.log("connect to DB");
  }).catch(err=>{
    console.log("ERROR:",err.message);
  });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// app.use(express.static(__dirname + "public"));
app.use(express.static("public"));
app.use(methodOverride("_method"));
//passport設定
app.use(require("express-session")({
     secret:"Cute a cat",
     resave:false,
     saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  res.locals.success    =req.flash("success");
  res.locals.error      =req.flash("error");
  next();
})

// seedDB();
app.use(indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("YelpCamp Serving");
});
