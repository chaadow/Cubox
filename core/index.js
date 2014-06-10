exports.init = function init(){
    var router  = require('./router')
        , middleware  = require('./middleware')
        , webSocketServer = require('./server_socket')
        , express = require('express')
        , passport = require('passport')
        , app     = express()
        , conf    = require('./conf').get(process.env.NODE_ENV); // Use 'personal' instead of 'process.env.NODE_ENV.

    middleware.setup(app, conf, passport);

    var auth = passport.authenticate('basic', { session: false });
    router.run(auth, app, conf.application.routes, passport);



    var io      = require('socket.io').listen(   app.listen(conf.server.port, function(){
        console.log('node-rest-demo pid %s listening on %d in %s',process.pid,conf.server.port,process.env.NODE_ENV);
        }));

//    var RedisStore = require('socket.io/lib/stores/redis');
//    var redis = require('socket.io/node_modules/redis');
//
//    io.set('store', new RedisStore({
//        redisPub: redis.createClient(),
//        redisSub: redis.createClient(),
//        redisClient: redis.createClient()
//    }));
    webSocketServer.on(io);




};