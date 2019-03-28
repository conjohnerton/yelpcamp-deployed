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
    res.render("register");
});

// handle registration logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, (err, user) => {
       if (err) {
           req.flash("error", err.message);
           res.render("register");
       }
       
       passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome to YelpCamp " + user.username + "!");
          res.redirect("/campgrounds"); 
       });
    });
});

// Show login form
router.get("/login", (req, res) => {
   res.render("login"); 
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