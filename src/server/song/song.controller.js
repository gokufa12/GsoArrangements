// TODO move this into a better place later...
var db = require('../../../private/database.js');

/* CRUD operations for SONGs */

exports.createSong = function(req, res) {
    var vals = [req.body.user_id, req.body.title, req.body.game_title, 
        req.body.date, req.body.duration, req.body.orchestra_id];
    db.executePair([db.song_insert, db.song_select_all], vals, res);
};

exports.getSongsAll = function(req, res) {
    db.executeQuery(db.song_select_all,[],res);
};

exports.getSongsSingle = function(req, res) {
    db.executeQuery(db.song_by_user,[req.user.user_id],res);
};

exports.updateSong = function(req, res) {
    var vals = [req.body.title, req.body.date, req.body.song_id];
    db.executeQuery(db.song_update,vals,res);
};

exports.deleteSong = function(req, res) {
    var vals = [req.params.song_id];
    db.executePair([db.song_delete, db.song_select_all], vals, res); 
};

/* Miscellaneous functions for SONGs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'that\'s one HUGE bizzle!'});
};

// TODO holy crap come back to this
exports.csv = function(req, res) {
    res.status(501).send({NYI: 'this function isn\'t yet implemented'});
};