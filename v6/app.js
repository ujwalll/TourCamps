const express = require("express"),
	app = express(),
	bodyparser = require("body-parser"),
	mongoose = require("mongoose"),
	Campground = require("./models/campground");
	seedDB= require("./seeds");
	Comment = require("./models/comment"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	User = require("./models/user")	;

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");

// seedDB();

//Passport conf.

app.use(require("express-session")({
	secret:"Be aware!",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
})
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
			res.render("campgrounds/index",{campgrounds:allcampgrounds, currentUser:req.user});
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

app.get("/campgrounds/:id/comments/new", isLoggedIn,function(req,res){
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

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
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

//============
//AUTH ROUTES
//============
app.get("/register",function(req,res){
	res.render("register");
})

app.post("/register",function(req,res){
	let newuser = new User({username:req.body.username});
	User.register(newuser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/campgrounds");
		})
	})
})

//show login form
app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login", passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"
}),function(req,res){
})

//logout
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/campgrounds");
})

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000,function(){
	console.log("Yelpcamp server is up!");
});