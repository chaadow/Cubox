var express = require('express');
var router = express.Router();

module.exports = function(passport){

    router.get('/', function(req, res) {
        res.render('index.ejs', { title: 'Express' });
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

    // SIGN IN ROUTES
    router.route('/signin')
        .get(isNotLoggedIn, function(req, res) {
            res.render('signin.ejs', { message: req.flash('loginMessage') });
        })
        .post(passport.authenticate('local-login', {
            successRedirect : '/halo', // redirect to the secure profile section
            failureRedirect : '/profile', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    return router;

};

// AUTHENTICATION MIDDLEWARES

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}

function isNotLoggedIn(req, res, next) {
    if (!req.user)
        return next();

    res.redirect('/profile');
}