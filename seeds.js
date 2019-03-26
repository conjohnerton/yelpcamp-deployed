var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment");
    
var data = [
    {
        name: "Obscure Staircamp", 
        image: "https://assets.atlasobscura.com/media/W1siZiIsInVwbG9hZHMvcGxhY2VfaW1hZ2VzL2tpenBicms3cGp2NnZvOTY5NGMxN2Y4MGM0ZjQ4ZmE5M2NfS2luZGVya3JhbmtlbmhhdXMgMjQuanBnIl0sWyJwIiwidGh1bWIiLCJ4MzkwPiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA4MSAtYXV0by1vcmllbnQiXV0/Kinderkrankenhaus%2024.jpg",
        description: "Like, woah man! This is bar is so hip! Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Swamp Shakk", 
        image: "https://previews.123rf.com/images/server/server1603/server160300091/53274632-old-abandoned-shack-stationmaster-in-the-forest.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Crackhead Corner", 
        image: "https://1.bp.blogspot.com/-tfz4N7Isyx8/WC3FHejL5UI/AAAAAAAARsE/Sr3EQX_UHKsZ6M_wdIvxPTv8owKjeOgAgCLcB/s1600/10%2BFuneral%2BHome.jpg",
        description: "Great place to visit at night! Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
]
    
function seedDB() {
    
//     // remove all campgrounds
    Campground.deleteMany({}, (err) => {
    if (err)
        console.log(err);
    else
        console.log("removed campground!");
        // add a few campgrounds
        data.forEach( (seed) => {
            Campground.create(seed, (err, campground) => {
                if (err)
                    console.log(err);
                else {
                    console.log("added a campground");
                    
                    // create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there were internet.",
                            author: "Homer"
                        }, (err, comment) => {
                            if (err)
                                console.log(err);
                            else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log("added a campground");                                
                            }
                        });
                }
            });  
        });
    });
}


module.exports = seedDB;