var userCtrlr = require('./user.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/user')
        .post(userCtrlr.createUser);
    
    app.route('/api/v1/user')
        .get(userCtrlr.getUsersAll);
    
    app.route('/api/v1/user/id')
        .get(userCtrlr.getUsersSingle);
    
    app.route('/api/v1/user/id')
        .put(userCtrlr.updateUser);
    
    app.route('/api/v1/user/id')
        .delete(userCtrlr.deleteUser);
    
    /* Miscellaneous operations below */
    
    app.route('/api/user/testrt')
        .get(userCtrlr.testFcn);
};