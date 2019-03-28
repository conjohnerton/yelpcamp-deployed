var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    seedDB          = require("./seeds"),
    passport        = require("passport"),
    flash           = require("connect-flash"),
    methodOverride  = require("method-override"),
    LocalStrategy   = require("passport-local"),
    expressSession  = require("express-session"),
    Campground      = require("./models/campground"),
    User            = require("./models/user"),
    Comment         = require("./models/comment");

// require routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    authRoutes       = require("./routes/index");

// remove all campgrounds, exported from seeds.js
// seedDB(); // seed the database 

// set default express configurations
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

// set mongoose config and suppress findAndModify warning (mongoose bug)
mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true} );
mongoose.set('useFindAndModify', false);

// PASSPORT CONFIGURATION
app.use(expressSession({
    secret: "Joey is stuck in the wall.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set req.vars to be accessed in all ejs templates
app.use((req, res, next) => {
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

// set shortcut routes
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use(authRoutes);

app.listen(process.env.PORT, process.env.IP, () => {
   console.log("YelpCamp server has started!"); 
});