// TODO move this into a better place later...
var db = require('../../../private/database.js');

/* CRUD operations for INSTRUMENTs */

exports.getInstrumentsAll = function(req, res) {
    db.executeQuery(db.instrument_select_all,[],res);
};

/* Miscellaneous functions for INSTRUMENTs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'hit test route for INSTRUMENT'});
};