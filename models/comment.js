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

// return campground module to app.js
module.exports = mongoose.model("Comment", CommentSchema);