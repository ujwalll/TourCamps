const express = require("express"),
	app = express(),
	bodyparser = require("body-parser"),
	mongoose = require("mongoose"),
	Campground = require("./models/campground");
	seedDB= require("./seeds");


mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyparser.urlencoded({extended:true}));

app.set("view engine","ejs");
seedDB();


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
			res.render("index",{campgrounds:allcampgrounds});
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
	res.render("new");
});

//show
app.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundcamp){
		if(err){
			console.log(err);
		}
		else{
			console.log(foundcamp);
			res.render("show",{campground:foundcamp});
		}
	})
	// res.render("show");
});

app.listen(3000,function(){
	console.log("Yelpcamp server is up!");
});