var gameCtrlr = require('./game.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/game')
        .get(gameCtrlr.getGamesAll);
    
    /* Miscellaneous operations below */
    
    app.route('/api/game/testrt')
        .get(gameCtrlr.testFcn);
};