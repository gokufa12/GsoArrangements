var instrumentCtrlr = require('./instrument.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/instrument')
        .get(instrumentCtrlr.getInstrumentsAll);
    
    /* Miscellaneous operations below */
    
    app.route('/api/instrument/testrt')
        .get(instrumentCtrlr.testFcn);
};