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

                    content += '<a href="#" class="fa fa-folder folder" style="display: inline" >' + path.basename(dir) + '</a>';
                    content += '     <button style="padding-left:20px" class="fa fa-plus specificUploadTrigger" data-folder="'+dir+'"></button>';

                };
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
                            content += '<li class="filedownload" style="padding-left: 18px"> <a href="/download/' + file + '">' + path.basename(file) + '</a></li>';
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
var logAndRespond = function logAndRespond(err,res,status){
    console.error(err);
    res.statusCode = ('undefined' === typeof status ? 500 : status);
    res.send({
        result: 'error',
        err:    err.code
    });
};
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
    var plans={};
    var users= {};
    var planStats=[];
    req.mysql.getConnection(function(err,connection){
        connection.query('SELECT * FROM plans ORDER BY id DESC', function handleSql(err, rows) {
            if (err){ logAndRespond(err,res); return; }
            if (rows.length === 0){ res.json(204); return; }


            for(var i=0; i< rows.length; i++) {
                console.log(rows[i]);
                var hh = rows[i];
                connection.query('SELECT * from users where choosen_plan=' + rows[i]['id'], function (err, results) {
                    if (err) {
                        logAndRespond(err, res);
                        return;
                    }
                    planStats.push({name: hh['name'], count: results.length });
                    //rows[i].count = results.length;
                    console.log(planStats);
                    console.log(results.length + 'helooo');

                });
            }
            plans.rows= rows;
            plans.length = rows.length;
            //connection.release();
        });
        connection.query('SELECT * FROM users ORDER BY id DESC', function(err, rows) {

            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.send({
                    result: 'error',
                    err:    err.code
                });
            } else {
                if (rows.length === 0) {
                    //res.statusCode = 204;
                    users= {};
                } else {

                    users.count= rows.length;
                    users.users = rows;
                    console.log(planStats);
                    res.render('dashboard.ejs', { plans: plans, users: users, planStat:planStats});
                }
            }
        });


        //res.render('dashboard.ejs', {user: req.user, plans: plans, users: users});

    });

});
