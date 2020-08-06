var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

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
router.post("/",isLoggedIn,function(req,res){
	var name = req.body.name;
	var image =  req.body.image;
	var desc = req.body.description;
	var newcamp = {
		name: name,
		image: image,
		description: desc
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
router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//shows more info abour one campground
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

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
module.exports = router;