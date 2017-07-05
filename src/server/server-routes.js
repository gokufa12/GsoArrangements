var express = require('express');

module.exports = function(app) {
    var _router = express.Router();
    
    // Include server-side express route files here...
    
    //require('./game/game.routes.js')(app, _router);
    
    require('./instrument/instrument.routes.js')(app, _router);
    
    require('./orchestra/orchestra.routes.js')(app, _router);
    
    require('./review/review.routes.js')(app, _router);
    
    require('./song/song.routes.js')(app, _router);
    
    require('./user/user.routes.js')(app, _router);
    
    require('./utils/utils.routes.js')(app, _router);
};