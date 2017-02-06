var LocalStrategy   = require('passport-local').Strategy
    ,BasicStrategy = require('passport-http').BasicStrategy
    ,bcrypt   = require('bcrypt-nodejs'),
    fs = require('fs');


var users = [
    { id: 1, username: 'cuboxadmin', password: 'cuboxpassword', email: 'cuboxadmin@cubox.com' }
    , { id: 2, username: 'cubox', password: 'cubox', email: 'cubox@cubox.com' }
];
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
function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}
// expose this function to our app using module.exports
module.exports = function(passport, pool) {

    passport.serializeUser(function(user, done) {

        console.log(" ENTER SERIALIZE WITH USER: "+ JSON.stringify(user));
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {

console.log(" ENTER DESERIALIZE WITH ID: "+ id);
        pool.getConnection(function(err, connection){
            connection.query("select * from users where id = ?",id,function(err,rows){

                if (err) console.error(err);
                console.log(err);
                console.log(" ROWS OF 0 IS "+ JSON.stringify(rows[0]));
                done(err, rows[0]);

            });
            connection.release();
        });


    });

    // =========================================================================
    // API Middleware ============================================================
    // =========================================================================
//
//    passport.use(new BasicStrategy({
//        },
//        function(username, password, done) {
//            // asynchronous verification, for effect...
//            process.nextTick(function () {
//                findByUsername(username, function(err, user) {
//                    if (err) { return done(err); }
//                    if (!user) { return done(null, false); }
//                    if (user.password != password) { return done(null, false); }
//                    return done(null, user);
//                })
//            });
//        }
//    ));




    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================


    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            console.log(req.mysql);
            req.mysql.getConnection( function(err, connection){
                if (err) {
                    console.error('CONNECTION error: ',err);
                    res.statusCode = 503;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                } else {
                    console.log("CONNECTION HAHAHAHAHAH   "+ email);
                    connection.query("select * from users where email = ?", email, function (err, rows) {

                        if (err)
                            return done(err);


                            if (rows.length) {
                                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                            } else {

                                // if there is no user with that email
                                // create the user
                                var salt = bcrypt.genSaltSync(8);
                                var newUserMysql = new Object();
                                newUserMysql.email = email;
                                newUserMysql.password = bcrypt.hashSync(password, salt, null);
                                newUserMysql.name = req.body.name;
                                newUserMysql.salt = salt;
                                connection.query('INSERT INTO users SET ?', newUserMysql, function (err, rows) {
                                    if (err) throw err;

                                    newUserMysql.id = rows.insertId;
                                    ensureExists('Uploads/'+newUserMysql.name+rows.insertId, 0744, function(err) {
                                        if (err) throw err; // handle folder creation error
                                       // else // we're all good
                                    });

                                    return done(null, newUserMysql);
                                });
                            }

                    });
                    connection.release();
                }
            })
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            req.mysql.getConnection( function(err, connection){
                connection.query("select * from users where email = '"+email+"'",function(err,rows){


                    if (err)
                        return done(err);
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                    }

                    console.log(rows[0].password);
                    // if the user is found but the password is wrong
                    if (!(  bcrypt.compareSync(password, rows[0].password  ))){
                        console.log("hihihih")
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                    }
                    console.log('helloMOTO');
                    // all is well, return successful user
                    ensureExists('Uploads/'+rows[0]["name"]+rows[0]["id"], 0744, function(err) {
                        if (err) throw err; // handle folder creation error
                        // else // we're all good
                    });
                    return done(null, rows[0]);

                });
                connection.release();
            });
        }));

};