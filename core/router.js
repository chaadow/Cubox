exports.run = function route(auth, app, routes, passport){
    var handlers = {};
    var express = require('express');
    var apiRouter= express.Router();
    var filesApiRouter = express.Router();

    routes.forEach(function(val){ // FOR PLANS!!!
        handlers[val] = require('../routes/api/'+val);
        apiRouter.route('/'+val)
            .get( handlers[val].get)
            .post(handlers[val].ins);

        apiRouter.route('/'+val+'/:id')
            .get( handlers[val].find)
            .put( handlers[val].upd)
            .delete(handlers[val].del);
    });

    var userApi = require('../routes/api/users');
    var filesApi = require('../routes/api/fileHandlers');

    // User api routes.
    apiRouter.get('/users/:id', userApi.find);
    apiRouter.post('/users', userApi.ins);
    apiRouter.put('/users/:id', userApi.upd);
    apiRouter.post('/users/login', userApi.login);
    //---

    // File api routes

    filesApiRouter.post('/deleteFolder', filesApi.deleteFolder);
    filesApiRouter.post('/deleteFile', filesApi.deleteFile);
    filesApiRouter.post('/traverseFolder', filesApi.traverseDirectory);

    var routes = require('../routes/index')(passport);
    var users = require('../routes/users');


    app.use('/', routes);
    app.use('/users', users);
    app.use('/api', apiRouter);
};
