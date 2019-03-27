var mongoose = require("mongoose");

var CommentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String
    }
});

// add prehook to remove comment ID from Campground in Mongo
CommentSchema.pre("remove", function(next){
    // delete any references to this comment from campgrounds
    this.model("Campground").update(
        { },
        { "$pull": {"comments": this._id}},
        { "multi": true},
        next
    );
});

// return campground module to app.js
module.exports = mongoose.model("Comment", CommentSchema);