var express = require("express");
var router = express.Router();
var passport=require("passport");
var User=require("../models/user");
var crypto=require("crypto");
var async=require("async");
var nodemailer=require("nodemailer"); 


//Root 
router.get("/", function (req, res) {
  res.render("landing");
});

//=================
//Auth routes
//=================
//註冊表單
router.get("/register", function (req, res) {
  res.render("register");
});
//處理註冊
router.post("/register", function (req, res) {
  var newUser = new User({ username: req.body.username,email:req.body.email });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/register");
    } else {
      //登入
      passport.authenticate("local")(req, res, function () {
        req.flash("success", `歡迎 ${user.username} 到YelpCamp！！`);
        res.redirect("/campgrounds");
      });
    }
  });
});
//登入表單
router.get("/login", function (req, res) {
  res.render("login");
});
//處理登入
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: "登入錯誤!",
    successFlash:"登入成功!"
  }),
  function (req, res) {}
);

//登出
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success","你已經登出");
  res.redirect("/campgrounds");
});
//忘記密碼
router.get("/forgot",function(req,res){
  res.render("forgot");
});
//處理忘記密碼
router.post("/forgot",function(req,res,next){
    async.waterfall([
      function(done){
        crypto.randomBytes(20,function(err,buf){
          var token =buf.toString("hex");
          done(err,token);  //用done 把參數傳到下一個Function(把token放到下面的token)
        });
      },
      function(token,done){
        User.findOne({email:req.body.email},function(err,user){
          if(!user){
            req.flash("error","沒有這個Email");
            return res.redirect("/forgot");
          }
          user.resetPasswordToken=token;
          user.resetPasswordExpires=Date.now()+3600000; //1 小時
          user.save(function(err){
            done(err,token,user);
          });
        });
      },
      function(token,user,done){
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAILAC,
            pass: process.env.GMAILPW,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "zyoukai2519@gmail.com",
          subject:"yelpcamp 重置密碼",
          text:"點擊下面網址重置密碼"+
          "http://"+req.headers.host+"/reset/"+token+"\n\n",
        };
        smtpTransport.sendMail(mailOptions,function(err){
          console.log("郵件寄送");
          req.flash("success","EMAIL已經寄送到"+user.email+"了");
          done(err,"done");
        });
      }
    ],function(err){
      if(err) return next(err);
      res.redirect("/forgot");
    });
});
//重置密碼
router.get("/reset/:token",function(req,res){
    User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
      if(!user){
        req.flash("error","重置已過期或錯誤");
        return res.redirect("/forgot");
      }
      res.render("reset",{token:req.params.token});
    });
});
//處理重置密碼
router.post("/reset/:token",function(req,res){
    async.waterfall([
      function(done){
        User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user) {
          if(!user){
             req.flash("error","重置已過期或錯誤");
             return res.redirect("back");
          }
          if(req.body.password===req.body.confirm){
            user.setPassword(req.body.password,function(err) {
              user.resetPasswordToken=undefined;
              user.resetPasswordExpires=undefined;
              user.save(function(err) {
                req.logIn(user,function(err){
                  done(err,user);
                });
              });
            });
          }else{
            req.flash("error","密碼跟確認密碼不符合");
            return res.redirect("back");
          }

        });
      },
      function(user,done){
        var smtpTransport=nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "zyoukai2519@gmail.com",
            pass:process.env.GMAILPW
          },
        });
        var mailOptions = {
          to: user.email,
          from: "zyoukai2519@gmail.com",
          subject: "yelpcamp 密碼已修改",
          text:"Hello,\n\n"+
               "你的密碼已經修改完成 "+user.email,
        };
        smtpTransport.sendMail(mailOptions,function(err) {
          req.flash("success","完成! 密碼已修改");
          done(err);
        });
      }
    ],function(err) {
      res.redirect("/campgrounds");
    });
});
module.exports = router;