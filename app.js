var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Campground = require("./models/campground"),
    Comment    = require("./models/c")
    
    
// connect mongoose to our database and use new url parser
mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true} );

// Campground.create({name: "Salmon Creek", image: "https://www.nps.gov/shen/planyourvisit/images/20170712_A7A9022_nl_Campsites_BMCG_960.jpg?maxwidth=1200&maxheight=1200&autorotate=false", description: "Wow this thing is awesome!!"},
// (err, campground) => { 
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("NEW CAMPGROUND CREATED");
//         console.log(campground);
//     }
// });

// set express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
    
// set view engine to ejs, remove need for .ejs ext in res.render
app.set("view engine", "ejs");

// get route for home page
app.get("/", function(req, res) {
    res.render("landing");
});

// get campgrounds show page INDEX ROUTE
app.get("/campgrounds", function(req, res) {
    // get all campgrounds from db
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {campgrounds: allCampgrounds});
        }
    });
//   res.render("campgrounds", {campgrounds: campgrounds}) ;
});


// NEW - show campground form
app.get("/campgrounds/new", function(req, res) {
    // may need to be turned into new.ejs
    res.render("new"); 
});


// CREATE - post new 
app.post("/campgrounds", function(req, res) {
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCampground = {name: name, image: image, description: desc};
   
   // create campground and save to database
   Campground.create(newCampground, (err, newlyCreated) => {
       if (err) {
           console.log(err);
       } else {
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
       }
   });
});

// Show campground page
app.get("/campgrounds/:id", (req, res) => {
    // find campground with provided ID
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            // render show template for the campground
            res.render("show", {campground: foundCampground});
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("YelpCamp server has started!"); 
});