var instrumentCtrlr = require('./instrument.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.get('/api/v1/instrument', instrumentCtrlr.getInstrumentsAll);
    
    /* Miscellaneous operations below */
    
    app.get('/api/instrument/testrt', instrumentCtrlr.testFcn);
};