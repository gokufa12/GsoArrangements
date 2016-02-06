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
    password: 'admin'
};
var db = pgp(config);

/* SQL */
var arranger_insert = "INSERT INTO arranger (name, \"e-mail\") VALUES ($1,$2)";
var arranger_select_all = "SELECT * FROM arranger ORDER BY name ASC";
var arranger_select = "SELECT arranger_id FROM arranger WHERE name = $1";
var arranger_update = "UPDATE arranger SET name=$1, \"e-mail\"=$2 WHERE arranger_id=$3 RETURNING *";
var arranger_delete = "DELETE FROM arranger WHERE arranger_id=$1";
var song_select = "SELECT title, date, avg_rating, avg_difficulty FROM song";
var song_title_arranger_select = "SELECT song_id FROM song NATURAL JOIN arranger WHERE title = $1 AND name = $2";
var song_insert = "INSERT INTO song (title, arranger_id, date) VALUES ($1,$2,$3)";
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
	//This may be able to be done by including :name and :email in the url, but will need to investigate
    var vals = [req.body.name, req.body.email];
    executePair([arranger_insert, arranger_select_all], vals, res)
});

//Arranger Get
router.get('/api/v1/arranger', function(req, res) {
   console.log("doing get");
   executeQuery(arranger_select_all,[],res);
});

//Arranger Update
router.put('/api/v1/arranger', function(req, res) {
    var vals = [req.body.name, req.body.email, req.body.condition]
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

/* Reviewer CRUD */

/* Review CRUD */

module.exports = router;
