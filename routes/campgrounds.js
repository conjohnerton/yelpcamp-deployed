var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    NodeGeocoder = require("node-geocoder"),
    multer       = require("multer"),
    cloudinary   = require("cloudinary");

var storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = (req, file, callback) => {
    // only accept image files and throw error if not image
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    
    // allow file upload if image file
    callback(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

// config cloudinary api
cloudinary.config({ 
  cloud_name: 'yelpcampbyrajmajong', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single("image"), (req, res) => {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var desc = req.body.description;
  var image;
  var imageId;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  
  geocoder.geocode(req.body.location, function (err, data) {
    
    // if address is invalid return back to form
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      console.log(err);
      return res.redirect('back');
    }
    
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    
    cloudinary.uploader.upload(req.file.path, function(result) {
        image = result.secure_url;
        imageId = result.public_id;
        // create object that holds all info for new campground
        var newCampground = {
            name: name, 
            image: image, 
            imageId: imageId,
            description: desc, 
            author: author, 
            location: location, 
            lat: lat, 
            lng: lng
        };
        
        // add campground to DB then save
        Campground.create(newCampground, function(err, newlyCreated) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                res.redirect("/campgrounds/" + newlyCreated.id);
            }
        });
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
    Campground.findById(req.params.id, async function(err, campgroundRemoved) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
        try {
            // pass in id and delete all comments associated with campground
            Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect("/campgrounds");
            });
            
            await cloudinary.v2.uploader.destroy(campgroundRemoved.imageId);
            
            campgroundRemoved.remove();
            req.flash("success", "Campground deleted successfully!");
            res.redirect("/campgrounds");
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace();
}

module.exports = router;