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
var user_insert = "INSERT INTO gso_user (name, \"e-mail\") VALUES ($1,$2)";
var user_select_all = "SELECT * FROM gso_user ORDER BY name ASC";
var user_select = "SELECT user_id FROM gso_user WHERE name = $1";
var user_select_one = "SELECT * FROM gso_user WHERE user_id=$1";
var user_update = "UPDATE gso_user SET name=$1, \"e-mail\"=$2 WHERE user_id=$3 RETURNING *";
//TODO: Delete will have to cascade to satisfy foreign key constraints
var user_delete = "DELETE FROM gso_user WHERE user_id=$1";

var song_insert = "INSERT INTO song (user_id, title, game_title, date) VALUES ($1,$2,$3,$4)";
var song_select_all = "SELECT song.*, gso_user.name FROM song NATURAL JOIN gso_user";
var song_by_user = "SELECT song.*, gso_user.name FROM song NATURAL JOIN gso_user WHERE user_id=$1";
var song_update = "UPDATE song SET title=$1, date=$2 WHERE song_id=$3";
//TODO: Delete will have to cascade to satisfy foreign key constraints
var song_delete = "DELETE FROM song WHERE song_id=$1";

var review_insert = "INSERT INTO review (song_id, reviewer_id, overall_rating, part_rating, part_difficulty, comments) VALUES($1,$2,$3,$4,$5,$6)";
var review_select_all = "SELECT * FROM review";
var review_update = "UPDATE review SET overall_rating=$1, part_rating=$2, part_difficulty=$3, comments=$4 WHERE song_id=$5 AND reviewer_id=$6";
var review_delete = "DELETE FROM review WHERE song_id=$1 AND reviewer_id=$2";

var song_title_user_select = "SELECT song_id FROM song NATURAL JOIN gso_user WHERE title = $1 AND name = $2";
var reviewer_select = "SELECT name FROM reviewer";
var instrument_view = "SELECT instrument_id, name as instrument FROM instruments "
            + "NATURAL JOIN $1 ON instrument_id";
var review_select = "SELECT instrument.name as instrument, overall_rating, part_rating, part_difficulty, comments "
            + "FROM review LEFT JOIN instrument ON review.instrument_id = instrument.instrument_id "
            + "WHERE song_id = $1";
var instrument_select_all = "SELECT * FROM instrument";
var orchestra_select_all = "SELECT * FROM orchestra";


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.get('/user', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'user.html'));
});

router.get('/arrangements', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'user_profile.html'));
});

router.get('/song', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'song.html'));
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
        console.log(sql);
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
router.post('/api/v1/user', function(req, res) {
    console.log('data: ' + req.body.name + ' ' + req.body.email);
    var vals = [req.body.name, req.body.email];
    executePair([user_insert, user_select_all], vals, res);
});

//User Get
router.get('/api/v1/user', function(req, res) {
   console.log("doing get");
   executeQuery(user_select_all,[],res);
});

//User Get One
router.get('/api/v1/user/:user_id', function(req, res) {
   console.log('get with Id: ' + req.params.user_id);
   executeQuery(user_select_one,[req.params.user_id],res);
});

//User Update
router.put('/api/v1/user', function(req, res) {
    var vals = [req.body.name, req.body.email, req.body.user_id]
    console.log("doing update");
    executeQuery(user_update,vals,res);
});

//User delete
router.delete('/api/v1/user/:user_id', function(req, res) {
    console.log('Id: ' + req.params.user_id);
    var vals = [req.params.user_id];
    console.log("doing delete");
    executePair([user_delete, user_select_all], vals, res);    
});

/* Song CRUD */

//Song Create
router.post('/api/v1/song', function(req, res) {
    console.log('data: ' + req.body.title + ' ' + req.body.date);
    var vals = [req.body.user_id, req.body.title, req.body.game_title, req.body.date];
    executePair([song_insert, song_select_all], vals, res);
});

//Song Get
router.get('/api/v1/song', function(req, res) {
   console.log("doing get");
   executeQuery(song_select_all,[],res);
});

//Song Get
router.get('/api/v1/user/:user_id/song', function(req, res) {
   console.log('get with user_id: ' + req.params.user_id);
   console.log(song_by_user);
   executeQuery(song_by_user,[req.params.user_id],res);
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

//Review Get for Song
router.get('/api/v1/song/:song_id/review', function(req, res) {
   console.log("doing get for song_id: " + req.params.song_id);
   executeQuery(review_select,[req.params.song_id],res);
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

/* Instrument CRUD */
router.get('/api/v1/instrument', function(req, res) {
   console.log("doing get");
   executeQuery(instrument_select_all,[],res);
});

/* Orchestra CRUD */
router.get('/api/v1/orchestra', function(req,res) {
   console.log("get orchestra");
   executeQuery(orchestra_select_all,[],res);
});

/* Game CRUD */
router.post('/api/v1/game', function(req,res) {
    console.log('post game');
    executeQuery(game_insert,[req.body.game_title],res);
})

module.exports = router;
