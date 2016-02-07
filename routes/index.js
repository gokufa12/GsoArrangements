var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();
var path = require('path');
/* Config details for the database */
var config = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',	//Plan to change this in the future
    user: 'db_user',
    password: 'password'
};
var db = pgp(config);

/* SQL */
var arranger_insert = "INSERT INTO arranger (name, \"e-mail\") VALUES ($1,$2)";
var arranger_select_all = "SELECT * FROM arranger ORDER BY name ASC";
var arranger_select = "SELECT arranger_id FROM arranger WHERE name = $1";
var arranger_update = "UPDATE arranger SET name=$1, \"e-mail\"=$2 WHERE arranger_id=$3 RETURNING *";
//TODO: Delete will have to cascade to satisfy foreign key constraints
var arranger_delete = "DELETE FROM arranger WHERE arranger_id=$1";

var song_insert = "INSERT INTO song (arranger_id, title, date) VALUES ($1,$2,$3)";
var song_select_all = "SELECT * FROM song";
var song_update = "UPDATE song SET title=$1, date=$2 WHERE song_id=$3";
//TODO: Delete will have to cascade to satisfy foreign key constraints
var song_delete = "DELETE FROM song WHERE song_id=$1";

var reviewer_insert = "INSERT INTO reviewer (name, instrument_id, \"e-mail\") VALUES ($1,$2,$3)";
var reviewer_select_all = "SELECT * FROM reviewer";
var reviewer_update = "UPDATE reviewer SET name=$1, instrument_id=$2, \"e-mail\"=$3 WHERE reviewer_id=$4";
//TODO: Delete will have to cascade to satisfy foreign key constraints
var reviewer_delete = "DELETE FROM reviewer WHERE reviewer_id=$1";

var review_insert = "INSERT INTO review (song_id, reviewer_id, overall_rating, part_rating, part_difficulty, comments) VALUES($1,$2,$3,$4,$5,$6)";
var review_select_all = "SELECT * FROM review";
var review_update = "UPDATE review SET overall_rating=$1, part_rating=$2, part_difficulty=$3, comments=$4 WHERE song_id=$5 AND reviewer_id=$6";
var review_delete = "DELETE FROM review WHERE song_id=$1 AND reviewer_id=$2";

var song_title_arranger_select = "SELECT song_id FROM song NATURAL JOIN arranger WHERE title = $1 AND name = $2";
var reviewer_select = "SELECT name FROM reviewer";
var instrument_view = "SELECT instrument_id, name as instrument FROM instruments "
            + "NATURAL JOIN $1 ON instrument_id";
var review_select = "SELECT instrument.name, part_rating, part_difficulty "
            + "FROM review NATURAL JOIN reviewer NATURAL JOIN instrument "
            + "WHERE song_id = $1";


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

/** Generic post
 * @param sqlArray  pair of sql statements. First returns no values, second is SELECT
 * @param valArray  array containing values for placement in the INSERT statement
 * @param res       http response
 */
function executePair(sqlArray, valArray, res) {
    console.log(sqlArray[0] + valArray);
    db.none(sqlArray[0],valArray)
    .then(function() {
        db.query(sqlArray[1])
        .then(function(data) {
            console.log(data);
            res.status(200).json(data);
        })
        .catch(function(err) {
            console.log('Error in post: ' + err);
            return res.status(500).json({success: false, reason: err});
        })
    });
}

/** Generic singular query with some return value
 * @param sql       sql statement
 * @param valArray  array containing values for placement in the select statement
 * @param res       http response
 */
function executeQuery(sql, valArray, res) {
    db.query(sql,valArray)
    .then(function(data) {
        console.log(data);
        res.status(200).json(data);
    })
    .catch(function(err) {
        console.log(err);
        return res.status(500).json({success: false, reason: err});
    });
}

/* Arranger CRUD */

//Arranger Create
router.post('/api/v1/arranger', function(req, res) {
    console.log('data: ' + req.body.name + ' ' + req.body.email);
    var vals = [req.body.name, req.body.email];
    executePair([arranger_insert, arranger_select_all], vals, res);
});

//Arranger Get
router.get('/api/v1/arranger', function(req, res) {
   console.log("doing get");
   executeQuery(arranger_select_all,[],res);
});

//Arranger Update
router.put('/api/v1/arranger', function(req, res) {
    var vals = [req.body.name, req.body.email, req.body.arranger_id]
    console.log("doing update");
    executeQuery(arranger_update,vals,res);
});

//Arranger delete
router.delete('/api/v1/arranger/:arranger_id', function(req, res) {
    console.log('Id: ' + req.params.arranger_id);
    var vals = [req.params.arranger_id];
    console.log("doing delete");
    executePair([arranger_delete, arranger_select_all], vals, res);    
});

/* Song CRUD */

//Song Create
router.post('/api/v1/song', function(req, res) {
    console.log('data: ' + req.body.title + ' ' + req.body.date);
    var vals = [req.body.arranger_id, req.body.title, req.body.date];
    executePair([song_insert, song_select_all], vals, res);
});

//Song Get
router.get('/api/v1/song', function(req, res) {
   console.log("doing get");
   executeQuery(song_select_all,[],res);
});

//Song Update
router.put('/api/v1/song', function(req, res) {
    var vals = [req.body.title, req.body.date, req.body.song_id]
    console.log("doing update");
    executeQuery(song_update,vals,res);
});

//Song delete
router.delete('/api/v1/song/:song_id', function(req, res) {
    console.log('Id: ' + req.params.song_id);
    var vals = [req.params.song_id];
    console.log("doing delete");
    executePair([song_delete, song_select_all], vals, res);    
});

/* Reviewer CRUD */

//Reviewer Create
router.post('/api/v1/reviewer', function(req, res) {
    console.log('data: ' + req.body.name + ' ' + req.body.email);
    var vals = [req.body.name, req.body.instrument_id, req.body.email];
    executePair([reviewer_insert, reviewer_select_all], vals, res);
});

//Reviewer Get
router.get('/api/v1/reviewer', function(req, res) {
   console.log("doing get");
   executeQuery(reviewer_select_all,[],res);
});

//Reviewer Update
router.put('/api/v1/reviewer', function(req, res) {
    var vals = [req.body.name, req.body.instrument_id, req.body.email, req.body.reviewer_id];
    console.log("doing update");
    executeQuery(reviewer_update,vals,res);
});

//Reviewer delete
router.delete('/api/v1/reviewer/:reviewer_id', function(req, res) {
    console.log('Id: ' + req.params.reviewer_id);
    var vals = [req.params.reviewer_id];
    console.log("doing delete");
    executePair([reviewer_delete, reviewer_select_all], vals, res);    
});

/* Review CRUD */

//Review Create
router.post('/api/v1/review', function(req, res) {
    console.log('data: ' + req.body.song_id + ' ' + req.body.reviewer_id);
    var vals = [req.body.song_id, req.body.reviewer_id, req.body.overall_rating, req.body.part_rating, req.body.part_difficulty, req.body.comments];
    executePair([review_insert, review_select_all], vals, res);
});

//Review Get
router.get('/api/v1/review', function(req, res) {
   console.log("doing get");
   executeQuery(review_select_all,[],res);
});

//Review Update
router.put('/api/v1/review', function(req, res) {
    var vals = [req.body.overall_rating, req.body.part_rating, req.body.part_difficulty, req.body.comments, req.body.song_id, req.body.reviewer_id];
    console.log("doing update");
    executeQuery(review_update,vals,res);
});

//Review delete
router.delete('/api/v1/review/:review_id', function(req, res) {
    console.log('Id: ' + req.params.review_id);
    var vals = [req.params.review_id];
    console.log("doing delete");
    executePair([review_delete, review_select_all], vals, res);    
});

module.exports = router;
