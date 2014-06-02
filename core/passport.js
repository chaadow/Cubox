var LocalStrategy   = require('passport-local').Strategy
    ,BasicStrategy = require('passport-http').BasicStrategy
    ,bcrypt   = require('bcrypt-nodejs');


var users = [
    { id: 1, username: 'cuboxadmin', password: 'cuboxpassword', email: 'cuboxadmin@cubox.com' }
    , { id: 2, username: 'cubox', password: 'cubox', email: 'cubox@cubox.com' }
];

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


        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {


        pool.getConnection(function(err, connection){
            connection.query("select * from users where id = "+id,function(err,rows){

                if (err) console.err(err);
                done(err, rows[0]);

            });
        });


    });

    // =========================================================================
    // API Middleware ============================================================
    // =========================================================================

    passport.use(new BasicStrategy({
        },
        function(username, password, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    if (user.password != password) { return done(null, false); }
                    return done(null, user);
                })
            });
        }
    ));




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
            req.mysql.getConnection( function(err, connection){
                connection.query("select * from users where email = '"+email+"'",function(err,rows){

                    if (err)
                        return done(err);
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var salt = bcrypt.genSaltSync(8);
                        var newUserMysql = new Object();
                        newUserMysql.email    = email;
                        newUserMysql.password = bcrypt.hashSync(password, salt,null);
                        newUserMysql.name = req.body.name;
                        newUserMysql.salt = salt;
                        connection.query('INSERT INTO users SET ?',newUserMysql,function(err,rows){
                            if(err) throw err;

                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                    }
                });
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
            console.log('hello');
                    console.log(rows[0].password);
                    // if the user is found but the password is wrong
                    if (!(  bcrypt.compareSync(password, rows[0].password  )))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                    console.log('helloMOTO');
                    // all is well, return successful user
                    return done(null, rows[0]);

                });
            });
        }));

};