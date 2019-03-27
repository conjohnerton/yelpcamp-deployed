var express = require("express");
var router  = express.Router({mergeParams: true});

var Campground = require("../models/campground"),
    Comment    = require("../models/comment");
    
// Comments New
router.get("/new", isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err)
            console.log(err);
        else
            res.render("comments/new", {campground: campground});
    });   
});

// Comments Create
router.post("/", isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
               if (err) {
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
                   res.redirect("/campgrounds/" + campground._id);
               }
            });
            console.log(req.body.comment);
            
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});


// COMMENT UPDATE ROUTE
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
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

// does not remove id from Campground in Mongo
// router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
//     Comment.findByIdAndRemove(req.params.comment_id, (err) => {
//         if (err) {
//             res.redirect("back");            
//         }
//         else {
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     })
// });

// allows removal of comment ID from Campground
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err || !comment)
        {
            res.redirect("back");
        }
        else
        {
            comment.remove();
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect("/login");
    }
}

function checkCommentOwnership(req, res, next) {
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
}

module.exports = router;