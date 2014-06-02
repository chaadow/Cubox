exports.run = function route(auth, app, routes, passport){
    var handlers = {};
    var express = require('express');
    var apiRouter= express.Router();

    routes.forEach(function(val){
        handlers[val] = require('../routes/api/'+val);
        apiRouter.route('/'+val)
            .get(auth, handlers[val].get)
            .post(auth, handlers[val].ins);

        apiRouter.route('/'+val+'/:id')
            .get(auth, handlers[val].get)
            .put(auth, handlers[val].upd)
            .delete(auth, handlers[val].del);
    });
    userApi = require('../routes/api/users');

    // User api routes.
    apiRouter.get('/users/:id', auth, userApi.find);
    apiRouter.post('/users/', auth, userApi.ins);
    apiRouter.put('users/:id', auth, userApi.upd);
    //---

    var routes = require('../routes/index')(passport);
    var users = require('../routes/users');

    app.use('/', routes);
    app.use('/users', users);
    app.use('/api', apiRouter);
};
