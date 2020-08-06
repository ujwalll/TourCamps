var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//Index: Show all campgrounds
router.get("/",function(req,res){
	Campground.find({},function(err,allcampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allcampgrounds, currentUser:req.user});
		}
	});
});

//Post a new campground
router.post("/",middleware.isLoggedIn,function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image =  req.body.image;
	var desc = req.body.description;
	var author = {
		id:req.user._id,
		username:req.user.username
	};
	var newcamp = {
		name: name,
		price:price,
		image: image,
		description: desc,
		author:author
	};
	Campground.create(newcamp,function(err,newlycreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	})
});

//Show form for new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//shows more info about one campground
router.get("/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundcamp){
		if(err){
			console.log(err);
		}
		else{
			console.log(foundcamp);
			res.render("campgrounds/show",{campground:foundcamp});
		}
	})
	// res.render("show");
});

//Edit campground route
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err, foundCampground){
		res.render("campgrounds/edit",{campground: foundCampground});
	});
})

//Update campground route
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

//Destroy campground route
router.delete("/:id",middleware.checkCampgroundOwnership,async(req, res) => {
  try {
    let foundCampground = await Campground.findById(req.params.id);
    await foundCampground.remove();
    res.redirect("/campgrounds");
  } catch (error) {
    console.log(error.message);
    res.redirect("/campgrounds");
  }
});


module.exports = router;