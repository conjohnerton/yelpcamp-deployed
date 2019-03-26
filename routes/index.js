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

// handle registration
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, (err, user) => {
       if (err) {
           console.log(err);
           res.render("register");
       }
       
       passport.authenticate("local")(req, res, () => {
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
    res.redirect("/campgrounds");
});

// Auth Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect("/login");
    }
}

module.exports = router;