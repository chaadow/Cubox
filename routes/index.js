var express = require('express');
var router = express.Router();

module.exports = function(passport){

    router.get('/', function(req, res) {
        console.log(req.user);
        res.render('index.ejs', {user : req.user});

    });

    router.get('/upload', function(req, res){
        res.render('upload.ejs', {user: req.user});
    });


    // SIGNUP ROUTES
    router.route('/signup')
        .get( function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        })
        .post(passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/houhou', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // LOGOUT ROUTE
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/profile', function(req, res){
        res.render('profile.ejs', {user: req.user});
    });
    router.get('/dashboard', isAdmin, function(req, res){
        res.render('dashboard.ejs', {user: req.user});
    });
    // SIGN IN ROUTES
    router.route('/signin')
        .get(isNotLoggedIn, function(req, res) {
            res.render('signin.ejs', { message: req.flash('loginMessage') });
        })
        .post(passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    return router;

};

// AUTHENTICATION MIDDLEWARES

function isAdmin(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.admin)
            next();
    }
    res.redirect('/');

}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}

function isNotLoggedIn(req, res, next) {
    console.log(req.user);
    if (!req.user)
        return next();

    res.redirect('/profile');
}

router.get('/dashboard', function(req, res){
    res.render('dashboard.ejs', {user: req.user});
});
