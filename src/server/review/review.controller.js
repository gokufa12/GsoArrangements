var db = require('../database.js');

/* SQL */
var sql = {
    review_insert : "INSERT INTO review (song_id, reviewer_id, overall_rating, part_rating, part_difficulty, comments) VALUES($1,$2,$3,$4,$5,$6)",
    review_select_all : "SELECT * FROM review",
    review_update : "UPDATE review SET overall_rating=$1, part_rating=$2, part_difficulty=$3, comments=$4 WHERE song_id=$5 AND reviewer_id=$6",
    review_delete : "DELETE FROM review WHERE song_id=$1 AND reviewer_id=$2"
};

/* CRUD operations for REVIEWs */

exports.createReview = function(req, res) {
    var vals = [req.body.song_id, req.body.reviewer_id, req.body.overall_rating, 
        req.body.part_rating, req.body.part_difficulty, req.body.comments];
    db.executePair([sql.review_insert, sql.review_select_all], vals, res);
};

exports.getReviewsAll = function(req, res) {
    db.executeQuery(sql.review_select_all,[],res);
};

exports.getReviewSong = function(req, res) {
    db.executeQuery(sql.review_select,[req.params.song_id],res);
};

exports.updateReview = function(req, res) {
    var vals = [req.body.overall_rating, req.body.part_rating, 
        req.body.part_difficulty, req.body.comments, req.body.song_id, 
        req.body.reviewer_id];
    db.executeQuery(sql.review_update,vals,res);
};

exports.deleteReview = function(req, res) {
    var vals = [req.params.review_id];
    db.executePair([sql.review_delete, sql.review_select_all], vals, res);
};

/* Miscellaneous functions for REVIEWs */

exports.testFcn = function(req, res) {
    res.status(200).send({success: 'what dat mouf do'});
};