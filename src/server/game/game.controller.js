// TODO move this into a better place later...
var db = require('../../../private/database.js');

/* CRUD operations for GAMEs */

exports.getGamesAll = function(req, res) {
    db.executeQuery(db.game_insert,[req.body.game_title],res);
};

/* Miscellaneous functions for GAMEs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'hit test route for GAME'});
};