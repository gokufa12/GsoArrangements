// TODO move this into a better place later...
var db = require('../../../private/database.js');

/* CRUD operations for USERs */

exports.createUser = function(req, res) {
    var vals = [req.body.name, req.body.email];
    db.executePair([db.user_insert, db.user_select_all], vals, res);
};

exports.getUsersAll = function(req, res) {
    db.executeQuery(db.user_select_all,[],res);
};

exports.getUsersSingle = function(req, res) {
    var data = [req.user.user_id];
    db.executeQuery(db.user_select_one,data,res);
};

exports.updateUser = function(req, res) {
    // TODO will this work instead?:
    // var vals = [req.user.name, req.user.email, req.user.user_id];
    var vals = [req.body.name, req.body.email, req.body.user_id];
    db.executeQuery(db.user_update,vals,res);
};

exports.deleteUser = function(req, res) {
    // TODO will this work instead?:
    // var vals = [req.user.user_id];
    var vals = [req.params.user_id];
    db.executePair([db.user_delete, db.user_select_all], vals, res);  
};

/* Miscellaneous functions for USERs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'ya did it, lad'});
};