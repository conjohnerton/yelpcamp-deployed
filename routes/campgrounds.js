var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment    = require("../models/comment");

// Index Route
router.get("/", (req, res) => {
    // get all campgrounds from db
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
});

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    // may need to be turned into new.ejs
    res.render("campgrounds/new"); 
});



// Create Route
router.post("/", isLoggedIn, (req, res) => {
    
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, image: image, description: desc, author: author};
   
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

// Show Route
router.get("/:id", (req, res) => {
    // find campground with provided ID and populate page with campground and comments
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            // render show template for the campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// Edit Campground 
router.get("/:id/edit", checkCampgroundOwnership ,(req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err)
            res.redirect("/campground");
        else 
            res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update Campground
router.put("/:id", checkCampgroundOwnership ,(req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updateCampground) => {
        if (err)
            res.redirect("/campgrounds");
        else
            res.redirect("/campgrounds/" + req.params.id);
    });
});

// Destroy Campground
router.delete("/:id", checkCampgroundOwnership, (req, res) => {
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

// Middleware

function checkCampgroundOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
           if (err) {
               res.redirect("back");
           }
           else {
               if (foundCampground.author.id.equals(req.user._id)) {
                   next();
               }
               else {
                   res.redirect("back");
               }
           }
        });
    } 
    else {
        res.redirect("back");
    }
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect("/login");
    }
}

module.exports = router;