var express = require("express"),
    router  = express.Router(),
    async   = require("async"),
    crypto  = require("crypto"),
    nodemailer = require("nodemailer");
var passport = require("passport");
var User     = require("../models/user");

// Home Route
router.get("/", (req, res) => {
    res.render("landing");
});

// Show register form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

// handle registration logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, (err, user) => {
       if (err) {
           console.log(err);
           return res.render("register", {error: err.message});
       }
       
       passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome to YelpCamp " + user.username + "!");
          res.redirect("/campgrounds"); 
       });
    });
});

// Show Admit register form
router.get("/registerAdmin", (req, res) => {
   res.render("registerAdmin");
});

router.post("/registerAdmin", (req, res) => {
   var newUser = new User({username: req.body.username});
   
   if (req.body.adminCode === "secretcode123") {
       newUser.isAdmin = true;
   }
   
   User.register(newUser, req.body.password, (err, user) => {
        if (err) {
        console.log(err);
        return res.render("register", {error: err.message});
        } 
   
        passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome to YelpCamp " + user.username + "!");
          res.redirect("/campgrounds");
        });
   });
});

// Show login form
router.get("/login", (req, res) => {
   res.render("login", {page: "login"}); 
});

// Post login authentication
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), (req, res) => { // do nothing
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

router.get("/forgot", (req, res) => {
   res.render("forgot"); 
});

router.post("/forgot" , (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function acquireToken(err, buf) {
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        // token = previous done, token
        function setUserResetToken(token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (err) {
                    req.flash("error", "There was an unforseen error, sorry :-(");
                    res.redirect("/forgot");
                }
                if (!user) {
                   req.flash("error", "No account with that email exists.");
                   return res.redirect("/forgot");
               }
               
               user.resetPasswordToken = token;
               user.resetPasswordExpires = Date.now() + 360000; // 1 hour
               
               user.save((err) => {
                  done(err, token, user); 
               });
            });
        },
        function createMailObject(token, user, done) {
            // create mailer object
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "rajmajong@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            // set mail options
            var mailOptions = {
                to: user.email,
                from: "rajmajong@gmail.com",
                subject: "YelpCamp Password Reset",
                text: "You are recieving this because you (or someone else) have requested the reset of your account password.\n\n" +
                    "Please click on the following link or paste this into your browser to complete the process\n\n" +
                    "http://' + req.headers.host + '/reset/' + token + '\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
      smtpTransport.sendMail(mailOptions, function sendMailCallback(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function redirectToLogin(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function checkUserToken(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (err) {
        req.flash("error", "There was an unforseen error, sorry. ;-(");
        res.redirect("/forgot");
    }
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function resetUserPass(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err) {
            req.flash("error", "There was an unforseen error, sorry. ;-(");
            res.redirect("/forgot");
        }
        
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function nullifyUserToken(err) {
            if (err) {
                req.flash("error", "There was an unforseen error, sorry. ;-(");
                res.redirect("/forgot");
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if (err) {
                    req.flash("error", "There was an unforseen error, sorry. ;-(");
                    res.redirect("/forgot");
                }
                req.logIn(user, function(err) {
                done(err, user);
              });
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function createMailObject(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'rajmajong@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'rajmajong@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
        if (err) {
        req.flash("error", "There was an unforseen error, sorry. ;-(");
        res.redirect("/forgot");
    }
      
        res.redirect('/campgrounds');
  });
});

module.exports = router;