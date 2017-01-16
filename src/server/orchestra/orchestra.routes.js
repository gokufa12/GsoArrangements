var orchestraCtrlr = require('./orchestra.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.get('/api/v1/orchestra', orchestraCtrlr.getOrchestrasAll);
    
    /* Miscellaneous operations below */
    
    app.get('/api/orchestra/testrt', orchestraCtrlr.testFcn);
};