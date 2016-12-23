var express = require('express');

module.exports = function(app) {
    var _router = express.Router();
    
    // Include server-side express route files here...
    require('./user/user.routes.js')(app, _router);
};