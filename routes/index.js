var express = require('express');
var router = express.Router();
var path = require('path');
//var walk = require('walk');


module.exports = function (passport) {

    router.get('/', function (req, res) {
        var fs = require('fs');
        var content = '';
        var j = 0;
        var count =0;
        var walk = function (dir, done) {
            var results = [];
            //content+='<li>';
            fs.readdir(dir, function (err, list) {
                j++;

                if (j > 1) {


                    content+= '<form action="/add" method="POST">';
                    content += '<a href="#" class="fa fa-folder folder" style="display: inline" >' + dir.substring(dir.lastIndexOf('\\') + 1) + '</a>';
                    content += '<a href="button" class="fa fa-plus">Add folder to '+path.basename(dir)+'</a>';


                    content+= '</form>'
                }
                content += '<ul style="padding-left:28px; border-left:2px">';
                if (err) return done(err);
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results, content);
                    file = path.resolve(dir, file);

                    fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            content += '<ul style="padding-left= 28px;">';
                            //content += '<a href="button" class="fa fa-plus">Add '+file+'</a>';
                            walk(file, function (err, res) {
                                content += '</ul>';
                                results = results.concat(res);
                                next();
                            });
                            content += '</ul>';
                        } else {
                            content += '<li class="filedownload" style="padding-left: 18px"> <a href="/download/' + file + '">' + file.substring(file.lastIndexOf('\\') + 1) + '</a></li>';
                            results.push(file);
                            next();
                        }
                    });
                })();
            });


        };
        walk('public', function (err, results, contents) {
            if (err) throw err;
            //console.log(results);
            console.log(contents);
//                res.end(contents);
            res.render('index.ejs', {user: req.user, files: contents});
        });


    });

    router.get('/download/*', function (req, res) {
        var file = req.params[0];
        console.log("helllo" + file);
        res.setHeader('Content-disposition', 'attachment; filename=' + file);
        res.download(file); // Set disposition and send it.
    });

    router.get('/upload', function (req, res) {
        res.render('upload.ejs', {user: req.user});
    });


    // SIGNUP ROUTES
    router.route('/signup')
        .get(function (req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        })
        .post(passport.authenticate('local-signup', {
            successRedirect: '/', // redirect to the secure profile section
            failureRedirect: '/houhou', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

    // LOGOUT ROUTE
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/profile', function (req, res) {
        res.render('profile.ejs', {user: req.user});
    });
    router.get('/dashboard', isAdmin, function (req, res) {
        res.render('dashboard.ejs', {user: req.user});
    });
    // SIGN IN ROUTES
    router.route('/signin')
        .get(isNotLoggedIn, function (req, res) {
            res.render('signin.ejs', { message: req.flash('loginMessage') });
        })
        .post(passport.authenticate('local-login', {
            successRedirect: '/#banner', // redirect to the secure profile section
            failureRedirect: '/', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

    return router;

};

// AUTHENTICATION MIDDLEWARES

function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.admin)
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

router.get('/dashboard', function (req, res) {
    res.render('dashboard.ejs', {user: req.user});
});
