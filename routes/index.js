var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
//var walk = require('walk');



var deleteFolder = function (path) {

};
module.exports = function (passport) {


    router.post('/add', isLoggedIn, function(req,res){
        var type= req.body.p;

        if (type==='folder'){
            ensureExists('Uploads/'+req.user.name+req.user.id+'/'+req.body.p, 0744, function(err) {
                if (err) throw err; // handle folder creation error
                // else // we're all good
            });

        }
        res.redirect('/')


    });

    router.post('/deleteFile',function(req,res){

       var path = req.body.path;
        fs.unlink(path, function (err) {
            if (err) res.send({result: err});
            console.log('successfully deleted ' + path);
            res.redirect('/');
        });
    });

    var deleteFolder = function (path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
            //return {result: "Deleted successfully", files: traverseFileSystem(rootPath) };
        }

    };
    router.post('/deleteFolder', function(req,res){
       var path= req.body.path;
        deleteFolder(path);


        res.redirect('/');
    });
    router.get('/', function (req, res) {
        var j = 0;
        var count =0;

        var fs = require('fs');
        var content='';
        var j =0;
        var traverseFileSystem = function (currentPath) {

            content += '<div class="foldercontainer"><div class="icon"></div><span class="folder" style="display: inline" >' + path.basename(currentPath) + '</span>';
            content += '     <span class="fa fa-plus specificUploadTrigger" data-folder="' + currentPath + '"></span>';
            content += '     <form method="POST" action="/deleteFolder"><input type="hidden" name="path" value="' + currentPath + '"/><button type="submit"><i class="fa fa-trash-o"></i></button></form>';
            console.log(currentPath);
            content += '<ul class="foldercontent hide">';
            var files = fs.readdirSync(currentPath);
            for (var i in files) {
                var currentFile = currentPath + '/' + files[i];
                var stats = fs.statSync(currentFile);
                if (stats.isFile()) {
                    content += '<li class="filedownload"><div class="fileicon"></div><a href="/download/' + currentFile + '">' + path.basename(currentFile) + '</a><form method="POST" action="/deleteFile"><input type="hidden" name="path" value="' + currentFile + '" /><button type="submit"><i class="fa fa-trash-o"></i></button></form></li>';
                    console.log(currentFile);
                }
                else if (stats.isDirectory()) {
                    //content += '<div class="foldercontainer"><div class="icon"></div><span class="folder" style="display: inline" >' + path.basename(dir) + '</span>';
                    traverseFileSystem(currentFile);
                }
            }
            content += '</ul>';
            content += '</div>';

        };


    if(req.isAuthenticated())    traverseFileSystem('Uploads/'+req.user.name+req.user.id);

        res.render('index.ejs', {user: req.user, files: content});


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
            //if (rows.length === 0){ res.json(204); return; }


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


function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}
