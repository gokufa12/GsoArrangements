var db = require('../database.js');

/* SQL */
var sql = {
    orchestra_select_all : "SELECT * FROM orchestra"
};

/* CRUD operations for INSTRUMENTs */

exports.getOrchestrasAll = function(req, res) {
    db.executeQuery(sql.orchestra_select_all,[],res);
};

/* Miscellaneous functions for INSTRUMENTs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'hit test route for ORCHESTRA'});
};