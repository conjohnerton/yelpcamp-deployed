var express = require("express"),
    router  = express.Router({mergeParams: true}),
    middleware = require("../middleware");

var Campground = require("../models/campground"),
    Comment    = require("../models/comment");
    
// Comments New
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err)
            console.log(err);
        else
            res.render("comments/new", {campground: campground});
    });   
});

// Comments Create
router.post("/", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
               if (err) {
                   req.flash("error", "Something went wrong :(");
                   console.log(err);
               }
               else {
                   // save comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   
                   // save campground
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Comment successfully posted");
                   res.redirect("/campgrounds/" + campground._id);
               }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", "That campground does not exist!");
            return res.redirect("back");
        }
        
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            }
            else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
    
});


// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
       if (err) {
           res.redirect("back");
       }
       else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// COMMENT DESTROY ROUTE
// allows removal of comment ID from Campground
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err || !comment)
        {
            res.redirect("back");
        }
        else
        {
            comment.remove();
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;