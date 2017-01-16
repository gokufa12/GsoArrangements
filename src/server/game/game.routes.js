var gameCtrlr = require('./game.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.get('/api/v1/game', gameCtrlr.getGamesAll);
    
    /* Miscellaneous operations below */
    
    app.get('/api/game/testrt', gameCtrlr.testFcn);
};