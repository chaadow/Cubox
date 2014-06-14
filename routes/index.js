var express = require('express');
var router = express.Router();
//var walk = require('walk');
module.exports = function(passport){

    router.get('/', function(req, res) {
        console.log(req.user);


            var fs = require('fs');
//            var walk = function(dir, done) {
//                var results = [];
//                var content = '<li>';
//                fs.readdir(dir, function(err, list) {
//                    if (err) return done(err);
//                    var i = 0;
//                    (function next() {
//                        var file = list[i++];
//                        if (!file) return done(null, results, content);
//                        file = dir + '/' + file;
//                        fs.stat(file, function(err, stat) {
//                            if (stat && stat.isDirectory()) {
//                                content+= '<a href="#" class="fa fa-folder folder" >'+stat.name+'</a>';
//                                content+=    '<ul>';
//                                walk(file, function(err, res) {
//                                    content+= '<li>'+res+'</li>';
//                                    results = results.concat(res);
//                                    next();
//                                });
//                            } else {
//                                content+= '</ul>';
//                                results.push(file);
//                                next();
//                            }
//                        });
//                    })();
//                });
//            };

//    <li>
//        <a href="#" class="fa fa-folder folder" >Folder 1</a>
//        <ul>
//            <li>
//            File 1
//            </li>
//            <li>
//            File 2
//            </li>
//            <li>
//            File 3
//            </li>
//        </ul>
//    </li>

        var fs = require('fs');
        var content='';
        var walk = function(dir, done) {
            var results = [];
            //content+='<li>';
            fs.readdir(dir, function(err, list) {

                content+= '<a href="#" class="fa fa-folder folder" >'+dir+'</a>';
                content+=    '<ul>';
                if (err) return done(err);
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results, content);
                    file = dir + '/' + file;
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            //content+= '<a href="#" class="fa fa-folder folder" >'+stat.name+'</a>';
                            content+=    '<ul>';
                            walk(file, function(err, res) {
                                //content+= '<li>'+res+'</li>';
                                content+= '</ul>';
                                results = results.concat(res);
                                next();
                            });
                            content+='</ul>';
                        } else {
                            content+= '<li>'+file+'</li>';

                            results.push(file);
                            next();
                        }
                        //content+= '</ul>';



                    });
                })();
            });
            //content+='<li>';

        };
            walk('public', function(err, results,contents) {
                if (err) throw err;
                //console.log(results);
                console.log(contents);
//                res.end(contents);
                res.render('index.ejs', {user : req.user, files: contents});
            });


//        var walk    = require('walk');
//        var files   = [];
//
//// Walker options
//        var walker  = walk.walk('public', { followLinks: false });
//
//        walker.on('file', function(root, stat, next) {
//            // Add this file to the list of files
//            console.log
//            files.push({file: root + '/' + stat.name, root: root});
//
//            next();
//        });
//
//        walker.on('end', function() {
//            console.log(files);
//        });
//        //res.end("hello");

//        res.render('index.ejs', {user : req.user, files: files});

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
