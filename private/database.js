var promise = require('bluebird');
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
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

module.exports = {

/* SQL */
user_insert : "INSERT INTO gso_user (name, \"e-mail\") VALUES ($1,$2)  RETURNING user_id",
user_select_all : "SELECT * FROM gso_user ORDER BY name ASC",
user_select : "SELECT user_id FROM gso_user WHERE name = $1",
user_select_one : "SELECT * FROM gso_user WHERE user_id=$1",
user_update : "UPDATE gso_user SET name=$1, \"e-mail\"=$2 WHERE user_id=$3 RETURNING *",
//TODO: Delete will have to cascade to satisfy foreign key constraints
user_delete : "DELETE FROM gso_user WHERE user_id=$1",

song_insert : "INSERT INTO song (user_id, title, game_title, date) VALUES ($1,$2,$3,$4) RETURNING *",
song_select_all : "SELECT song.*, gso_user.name FROM song NATURAL JOIN gso_user",
song_by_user : "SELECT song.*, gso_user.name FROM song NATURAL JOIN gso_user WHERE user_id=$1",
song_update : "UPDATE song SET title=$1, date=$2 WHERE song_id=$3",
//TODO: Delete will have to cascade to satisfy foreign key constraints
song_delete : "DELETE FROM song WHERE song_id=$1",

review_insert : "INSERT INTO review (song_id, reviewer_id, overall_rating, part_rating, part_difficulty, comments) VALUES($1,$2,$3,$4,$5,$6)",
review_select_all : "SELECT * FROM review",
review_update : "UPDATE review SET overall_rating=$1, part_rating=$2, part_difficulty=$3, comments=$4 WHERE song_id=$5 AND reviewer_id=$6",
review_delete : "DELETE FROM review WHERE song_id=$1 AND reviewer_id=$2",

song_title_user_select : "SELECT song_id FROM song NATURAL JOIN gso_user WHERE title = $1 AND name = $2",
reviewer_select : "SELECT name FROM reviewer",
instrument_view : "SELECT instrument_id, name as instrument FROM instruments "
            + "NATURAL JOIN $1 ON instrument_id",
review_select : "SELECT instrument.name as instrument, overall_rating, part_rating, part_difficulty, comments "
            + "FROM review LEFT JOIN instrument ON review.instrument_id = instrument.instrument_id "
            + "WHERE song_id = $1",
instrument_select_all : "SELECT * FROM instrument",
orchestra_select_all : "SELECT * FROM orchestra",


/** Generic post
 * @param sqlArray  pair of sql statements. First returns no values, second is SELECT
 * @param valArray  array containing values for placement in the INSERT statement
 * @param res       http response
 */
executePair : function(sqlArray, valArray, res) {
    console.log(sqlArray[0] + valArray);
    db.none(sqlArray[0],valArray)
    .then(function() {
        db.query(sqlArray[1])
        .then(function(data) {
            console.log(data);
            if (res === null) {
                console.log('returning..');
                return data;
            } else {
                res.status(200).json(data);
            }
        })
        .catch(function(err) {
            console.log('Error in post: ' + err);
            return res.status(500).json({success: false, reason: err});
        })
    });
},

/** Generic singular query with some return value
 * @param sql       sql statement
 * @param valArray  array containing values for placement in the select statement
 * @param res       http response
 */
executeQuery : function (sql, valArray, res) {
    console.log('sql: ' + sql);
    return db.query(sql,valArray)
    .then(function(data) {
        console.log(sql);
        console.log(data);
        
        if (res === null) {
            console.log('returning..' + data);
            //return res;
            return new Promise(function(resolve){
                console.log('inside the promise?');
                resolve(data);
                console.log('done with resolve. data was: ');
                console.log(data);
            });
        } else {
            res.status(200).json(data);
        }
    })
    .catch(function(err) {
        console.log(err);
        return res.status(500).json({success: false, reason: err});
    });
}

}