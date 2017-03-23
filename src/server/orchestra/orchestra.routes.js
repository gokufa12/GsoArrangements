var orchestraCtrlr = require('./orchestra.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/orchestra')
        .get(orchestraCtrlr.getOrchestrasAll);
    
    /* Miscellaneous operations below */
    
    app.route('/api/orchestra/testrt')
        .get(orchestraCtrlr.testFcn);
};