var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground"),
	Comment = require("../models/comment");
var middleware = require("../middleware");


//Comments new
router.get("/new", middleware.isLoggedIn,function(req,res){
	//find campground by id
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else {
				res.render("comments/new",{campground:campground});
		}
	})
})

//Comments create
router.post("/",middleware.isLoggedIn,function(req,res){
	//lookup campground by id
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					//Add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//Save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	})
	//create new comment
	//connect new comment to specific campground
	//redirect to campground show page
	
});

//Edit comment
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
		}
	})
})

//Update comment
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,newComment){
		if(err){
			res.redirect("back");
		}	
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

//Destroy comment
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

module.exports = router;