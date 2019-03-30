var express = require("express"),
    router  = express.Router();
var passport = require("passport");
var User     = require("../models/user");

// Home Route
router.get("/", (req, res) => {
    res.render("landing");
});

// Show register form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

// handle registration logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    
    // if (req.body.adminCode === "secretcode123") {
    //     newUser.isAdmin = true;    
    // }
    
    User.register(newUser, req.body.password, (err, user) => {
       if (err) {
           console.log(err);
           return res.render("register", {error: err.message});
       }
       
       passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome to YelpCamp " + user.username + "!");
          res.redirect("/campgrounds"); 
       });
    });
});

// Show Admit register form
router.get("/registerAdmin", (req, res) => {
   res.render("registerAdmin");
});

router.post("/registerAdmin", (req, res) => {
   var newUser = new User({username: req.body.username});
   
   if (req.body.adminCode === "secretcode123") {
       newUser.isAdmin = true;
   }
   
   User.register(newUser, req.body.password, (err, user) => {
        if (err) {
        console.log(err);
        return res.render("register", {error: err.message});
        } 
   
        passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome to YelpCamp " + user.username + "!");
          res.redirect("/campgrounds");
        });
   });
});

// Show login form
router.get("/login", (req, res) => {
   res.render("login", {page: "login"}); 
});

// Post login authentication
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), (req, res) => { // do nothing
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

module.exports = router;