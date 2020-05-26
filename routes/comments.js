var express = require("express");
var router = express.Router({mergeParams:true});
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middleware=require("../middleware");  //middleware會自動找index.js

//評論表單
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});
//新增評論
router.post("/", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, camp) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "發生錯誤!");
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          camp.comments.push(comment);
          camp.save();
          req.flash("success", "成功新增評論!");
          res.redirect("/campgrounds/" + camp._id);
        }
      });
    }
  });
});
//編輯評論
router.get("/:comment_id/edit", middleware.checkCommentOwner, function (req,res) {
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err || !foundCamp){
      req.flash("error", "沒有找到這個露營地!");
      return res.redirect("back");
    }
      Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
          res.redirect("back");
        } else {
          res.render("comments/edit", {
            campground_id: req.params.id,
            comment: foundComment,
          });
        }
      });
  });
 
});
//處理編輯評論
router.put("/:comment_id", middleware.checkCommentOwner, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (
    err,
    updateComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "編輯完成!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});
//刪除評論
router.delete("/:comment_id", middleware.checkCommentOwner, function (req, res) {
  Comment.findByIdAndDelete(req.params.comment_id, function (err) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "刪除成功!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});


module.exports = router;