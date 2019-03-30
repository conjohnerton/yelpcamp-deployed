var mongoose = require("mongoose");
const Comment = require("./comment");

var CampgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ]
});

// pre-hook to remove comments when campground is deleted
// CampgroundSchema.pre("remove", async function() {
//   await Comment.remove({
//       _id: {
//           $in: this.comments
//       }
//   });
// });

// return campground module to app.js
module.exports = mongoose.model("Campground", CampgroundSchema);