var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();
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
var arranger_select = "SELECT arranger_id FROM arranger WHERE name = $1";
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
  res.render('index', { title: 'Express' });
});

/* Arranger CRUD */

//Arranger Create
router.post('/api/v1/arranger', function(req, res) {
	//This may be able to be done by including :name and :email in the url, but will need to investigate
    var vals = [req.body.name, req.body.email];
    db.none(arranger_insert, vals)
    .then(function() {
        db.query("SELECT * FROM arranger ORDER BY name ASC")
        .then(function(data) {
            console.log(data);
            res.status(200).json(data);
        })
    })
    .catch(function(err) {
        console.log(err);
        return res.status(500).json({success: false, reason: err});
    });
});

/* Song CRUD */

/* Reviewer CRUD */

/* Review CRUD */

module.exports = router;
