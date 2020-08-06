const express = require("express"),
	app = express(),
	bodyparser = require("body-parser"),
	mongoose = require("mongoose"),
	Campground = require("./models/campground");
	seedDB= require("./seeds");
	Comment = require("./models/comment");

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyparser.urlencoded({extended:true}));

app.set("view engine","ejs");
// seedDB();


// Campground.create(
//      {
//          name: "Granite Hill", 
//          image: "https://farm1.staticflickr.com/60/215827008_6489cd30c3.jpg",
//          description: "This is a huge granite hill, no bathrooms. No water. Beautiful granite!"
         
//      },
//      function(err, campground){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("NEWLY CREATED CAMPGROUND: ");
//           console.log(campground);
//       }
//     });

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allcampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allcampgrounds});
		}
	});
});

app.post("/campgrounds",function(req,res){
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

app.get("/campgrounds/new",function(req,res){
	res.render("campgrounds/new");
});

//show
app.get("/campgrounds/:id",function(req,res){
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

//=========================
//     COMMENT ROUTES
//=========================

app.get("/campgrounds/:id/comments/new",function(req,res){
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

app.post("/campgrounds/:id/comments",function(req,res){
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
	
})


app.listen(3000,function(){
	console.log("Yelpcamp server is up!");
});