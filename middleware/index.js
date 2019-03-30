var Campground = require("../models/campground"),
    Comment = require("../models/comment");
    
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function checkCampgroundOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
           if (err) {
               res.redirect("back");
           }
           else {
               if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
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
};

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
           if (err) {
               req.flash("error", "That campground does not exist!");
               res.redirect("back");
           }
           else {
               //is user comment owner or is owner admin
               if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                   next();
               }
               else {
                   req.flash("error", "You don't have permission to do that ;)");
                   res.redirect("back");
               }
           }
        });
    } 
    else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    }
};



module.exports = middlewareObj;