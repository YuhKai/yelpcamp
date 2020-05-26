var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middleware=require("../middleware");  //middleware會自動找index.js
var NodeGeocoder =require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

var geocoder = NodeGeocoder(options);
//index 顯示所有露營地
router.get("/", function (req, res) {
  //從資料庫取得資料
  // eval(require("locus"));
  var perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1; //pageQuery||1
  var noMatch=null;
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Campground.find({name:regex}, function (err, Allcampgrounds) {
    Campground.find({ name: regex })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function (err, Allcampgrounds) {
        Campground.countDocuments({ name: regex }).exec(function (err, count) {
          if (err) {
            console.log(err);
          } else {
            if (Allcampgrounds.length < 1) {
              noMatch = "沒有符合搜尋的露營地";
            }
            res.render("campgrounds/index", {
              campgrounds: Allcampgrounds,
              noMatch: noMatch,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              search: req.query.search,
            });
          }
        });
      });
  }else{
  // Campground.find({}, function (err, Allcampgrounds) {
  Campground.find({})
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec(function (err, Allcampgrounds) {
      Campground.countDocuments().exec(function (err, count) {
        if (err) {
          console.log(err);
        } else {
          res.render("campgrounds/index", {
            campgrounds: Allcampgrounds,
            noMatch: noMatch,
            current: pageNumber,
            pages: Math.ceil(count / perPage),
            search: false,
          });
        }
      });
    });
}
  // res.render("campgrounds", { campgrounds: campgrounds });
});
//new-顯示表單可以創建新的露營地到資料庫
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});
//create- 新增一個新的露營地到資料庫
router.post("/", middleware.isLoggedIn, function(req, res){
  
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
   
    if (err || !data.length) {
      console.log(err);
      req.flash('error', '錯誤的地點');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      description: description,
      author: author,
      location: location,
      lat: lat,
      lng: lng,
      price: price,
    };
    //創建資料存到資料庫
    Campground.create(newCampground, function (err, newcamp) {
      if (err) {
        console.log(err);
      } else {
        console.log(newcamp);
        res.redirect("/campgrounds");
      }
    });
  });
});
//要在/new 後面不然/:id會蓋到
//show-顯示一個露營地的更多資訊
router.get("/:id", function (req, res) {
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampgorund) {
      if (err || !foundCampgorund) {
        console.log(err);
        req.flash("error", "沒有找到這個露營地");
        res.redirect("back")
      } else {
        res.render("campgrounds/show", { campground: foundCampgorund });
      }
    });
});

//編輯露營地表單
router.get("/:id/edit", middleware.checkOwner, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});
//處理編輯
router.put("/:id", middleware.checkOwner, function (req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.editCamp, function (
    err,
    updateCamp
  ) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "編輯完成!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//刪除露營地
router.delete("/:id", middleware.checkOwner, function (req, res) {
  Campground.findByIdAndDelete(req.params.id, function (err, camp) {
    camp.remove();
    req.flash("success", "刪除成功!");
    res.redirect("/campgrounds");
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;