var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkOwner = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "沒有找到這個露營地!");
        res.redirect("back");
      } else {
        if (foundCampground.author.id.equals(req.user._id)) {
          //equals mongoose內建的 如果用=== 會不一樣 因為 foundCampground.author.id是object
          next();
        } else {
          req.flash("error", "你沒有這個權限!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "請先登入!");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error","請先登入!");
    res.redirect("/login");
  }
};

middlewareObj.checkCommentOwner = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "沒有找到這個評論!");
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          //equals mongoose內建的 如果用=== 會不一樣 因為 foundCampground.author.id是object
          next();
        } else {
          req.flash("error", "你沒有這個權限!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "請先登入!");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
