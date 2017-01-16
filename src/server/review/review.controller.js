// TODO move this into a better place later...
var db = require('../../../private/database.js');

/* CRUD operations for REVIEWs */

exports.createReview = function(req, res) {
    var vals = [req.body.song_id, req.body.reviewer_id, req.body.overall_rating, 
        req.body.part_rating, req.body.part_difficulty, req.body.comments];
    db.executePair([db.review_insert, db.review_select_all], vals, res);
};

exports.getReviewsAll = function(req, res) {
    db.executeQuery(db.review_select_all,[],res);
};

exports.getReviewSong = function(req, res) {
    db.executeQuery(db.review_select,[req.params.song_id],res);
};

exports.updateReview = function(req, res) {
    var vals = [req.body.overall_rating, req.body.part_rating, 
        req.body.part_difficulty, req.body.comments, req.body.song_id, 
        req.body.reviewer_id];
    db.executeQuery(db.review_update,vals,res);
};

exports.deleteReview = function(req, res) {
    var vals = [req.params.review_id];
    db.executePair([db.review_delete, db.review_select_all], vals, res);
};

/* Miscellaneous functions for REVIEWs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'what dat mouf do'});
};