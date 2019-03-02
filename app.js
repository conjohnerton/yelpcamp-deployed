var express = require("express"),
    app     = express(),
    bodyParser = require("body-parser");
    
// set express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
    
// set view engine to ejs, remove need for .ejs ext in res.render
app.set("view engine", "ejs");

// get route for home page
app.get("/", function(req, res) {
    res.render("landing");
});

// random fake campgrounds
var campgrounds = [
    {name: "Salmon Creek", image: "https://www.nps.gov/shen/planyourvisit/images/20170712_A7A9022_nl_Campsites_BMCG_960.jpg?maxwidth=1200&maxheight=1200&autorotate=false"},
    {name: "Howl Peak", image: "https://s3.amazonaws.com/ugc.tentrr/1994d816-5bc4-11e7-a8bc-0a932d599b6f/43e3a0e2-b636-11e8-82ba-0a6f2f44134e_SITE_PROFILE.jpeg"},
    {name: "Fur's Creek", image: "https://dailygazette.com/sites/default/files/styles/article_image/public/180702d.jpg?itok=6L_qDMLP"},
];

// get campgrounds show page
app.get("/campgrounds", function(req, res) {
   res.render("campgrounds", {campgrounds: campgrounds}) ;
});

app.get("/campgrounds/new", function(req, res) {
    // may need to be turned into new.ejs
    res.render("new"); 
});

app.post("/campgrounds", function(req, res) {
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var newCampground = {name: name, image: image};
   campgrounds.push(newCampground);
   
   // redirect back to campgrounds page
   res.redirect("/campgrounds");
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("YelpCamp server has started!"); 
});
