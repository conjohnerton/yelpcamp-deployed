var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    NodeGeocoder = require("node-geocoder");

var geocoderOptions = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(geocoderOptions);
    
var Campground = require("../models/campground"),
    Comment    = require("../models/comment");

// Index Route
router.get("/", function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const regObj = {
            $or: [
                {name: regex}, 
                {location: regex}, 
                {"author.username": regex}
            ]
        };
        
        // populate page iwth campgrounds matchin regex search
        Campground.find(regObj).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            if (err)
            {
                console.log(err);
                res.render("landing");
            }
            
            // check if there is no match in the search query
            if (allCampgrounds.length < 1) {
                var noMatch = "Sorry, no campgrounds match that search, please try again.";
                req.flash("error", noMatch);
                return res.redirect("back");
            }
            
            // render page with specified post limit
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        page: "campgrounds",
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });
    // run the home page without a search query
    } else {
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
        if (err)
        {
            console.log(err);
            res.render("landing");
        }
        Campground.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
                    current: pageNumber,
                    page: "campgrounds",
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    });
    }
});

// New Route
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new"); 
});



// Create Route
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      console.log(err);
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

// Show Route
router.get("/:id", (req, res) => {
    // find campground with provided ID and populate page with campground and comments
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// Edit Campground 
router.get("/:id/edit", middleware.checkCampgroundOwnership ,(req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err)
            res.redirect("/campground");
        else 
            res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update Campground
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// Destroy Campground
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            // pass in id and delete all comments associated with campground
            Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect("/campgrounds");
            });
        }
    });
});

function escapeRegex(text) {
    return text.replace();
}

module.exports = router;