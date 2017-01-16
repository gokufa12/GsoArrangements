var userCtrlr = require('./user.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.post('/api/v1/user', userCtrlr.createUser);
    
    app.get('/api/v1/user', userCtrlr.getUsersAll);
    
    app.get('/api/v1/user/id', userCtrlr.getUsersSingle);
    
    app.put('/api/v1/user/id', userCtrlr.updateUser);
    
    app.delete('/api/v1/user/id', userCtrlr.deleteUser);
    
    /* Miscellaneous operations below */
    
    app.get('/api/user/testrt', userCtrlr.testFcn);
};