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
};

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
           if (err) {
               res.redirect("back");
           }
           else {
               // does user own the comment?
               if (foundComment.author.id.equals(req.user._id)) {
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

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect("/login");
    }
};



module.exports = middlewareObj;