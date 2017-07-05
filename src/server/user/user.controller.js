var db = require('../database.js');

/* SQL */
var sql = {
    user_insert : "INSERT INTO gso_user (name, \"e-mail\") VALUES ($1,$2)  RETURNING user_id",
    user_select_all : "SELECT * FROM gso_user ORDER BY name ASC",
    user_select : "SELECT user_id FROM gso_user WHERE name = $1",
    user_select_one : "SELECT * FROM gso_user WHERE user_id=$1",
    user_update : "UPDATE gso_user SET name=$1, \"e-mail\"=$2 WHERE user_id=$3 RETURNING *",
    //TODO: Delete will have to cascade to satisfy foreign key constraints
    user_delete : "DELETE FROM gso_user WHERE user_id=$1"
};

/* CRUD operations for USERs */

exports.createUser = function(req, res) {
    var vals = [req.body.name, req.body.email];
    db.executePair([sql.user_insert, sql.user_select_all], vals, res);
};

exports.getUsersAll = function(req, res) {
    db.executeQuery(sql.user_select_all,[],res);
};

exports.getUsersSingle = function(req, res) {
    var data = [req.user.user_id];
    db.executeQuery(sql.user_select_one,data,res);
};

exports.updateUser = function(req, res) {
    // TODO will this work instead?:
    // var vals = [req.user.name, req.user.email, req.user.user_id];
    var vals = [req.body.name, req.body.email, req.body.user_id];
    db.executeQuery(sql.user_update,vals,res);
};

exports.deleteUser = function(req, res) {
    // TODO will this work instead?:
    // var vals = [req.user.user_id];
    var vals = [req.params.user_id];
    db.executePair([sql.user_delete, sql.user_select_all], vals, res);  
};

/* Miscellaneous functions for USERs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'ya did it, lad'});
};