var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var path = require('path');
var multiparty = require('multiparty');
var csv = require('csv-parse');
var jwtoken = require('jsonwebtoken');

const crypto = require('crypto');
const hash = crypto.createHash('sha256');
function genHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
const secrets = 'ThisIsMySecretPassword';
var db = require('../private/database.js');

//TODO: replace this with a better logging tool
var logger = console;

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

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

router.get('/signup', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'signup.html'));
});

function authenticate(email, password, create) {

    return db.executeQuery('SELECT salt FROM user_info WHERE email = $1', [email],null)
    .then(function(salt) {
        //if salt existed
        if (salt && (salt.length > 0) && (salt[0].salt != "")) {
            var hash = genHash(salt[0].salt + password);
            //Returns a promise with either the user data or null
            return db.executeQuery('SELECT gso_user_id FROM user_info WHERE email=$1 AND password=$2',
                          [email, hash],null)
        } else {
            //return a promise with null data
            return new Promise(function(resolve){
              resolve(null);
            });
        }
    });
}

//This will return the info we want to put into our JWT if you call .then
function signup(email, password, create) {
    return db.executeQuery('SELECT salt FROM user_info WHERE email = $1', [email],null)
    .then(function(salt) {
        //if salt existed
        if (salt && salt != "") {
            //return a promise with null data
            return new Promise(function(resolve){
              resolve(null);
            });
        } else {
            //  Everything should be cool. Add stuff to gso_user first, then add user_info
            return db.executeQuery(db.user_insert,create,null)
            .then(function(result) {
                logger.log("NEW_USER: " + result);
                const buffer = crypto.randomBytes(32);
                salt = buffer.toString('hex');
                var hash = genHash(salt + password);
                var values = [result[0].user_id, email, hash, salt];
                
                return db.executeQuery('INSERT INTO user_info (gso_user_id, email, password, salt) VALUES($1,$2,$3,$4) RETURNING gso_user_id, salt',values, null);
            });
        }
    });
}

function resolveJWT(data, res, date) {
        //if data is there, generate jwt
        if (data) {
            if (!date) {
                date = '1d';
            }
            //send their salt back mixed with our secret?
            var myXSRF = genHash(data[1] + secrets);
            var payload = {user_id: data[0].gso_user_id,
                          xsrfToken: myXSRF};
            var options = {expiresIn: date,
                          issuer: 'http://gamersymphonyorch.org'};
            var myToken = jwtoken.sign(payload, secrets, options);
            //Set it in the cookie
            res.cookie('access_token', myToken, {secure: false, httpOnly: false});
            //res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly;');
            //res.cookie('Warning', '199 Miscellaneous warning',{secure: false, httpOnly: false });
            //Set cookie to avoid XSRF
            res.cookie('XSRF-TOKEN', myXSRF, {secure: false, httpOnly: false });
            res.status(200).json({ success: true, jwt: myToken});
        } else {
            //Something failed
            res.status(401).json({ success: false, message: 'Authentication failed.'});
        }
        
    }

router.post('/api/v1/authenticate', function(req, res) {
    var vals = [req.body.name, req.body.email];
    authenticate(req.body.email, req.body.password, vals)
    .then(function(data) {
      resolveJWT(data, res);
    });
});

router.get('/api/v1/logout', function(req, res) {
    res.status(200).send(req.cookies['access_token'])
    //var vals = [req.body.name, req.body.email];
    //authenticate(req.body.email, req.body.password, vals)
    //.then(function(data) {
    //  resolveJWT(data, res, '0');
    //});
});

router.post('/api/v1/signup', function(req, res) {
    var vals = [req.body.name, req.body.email];
    signup(req.body.email, req.body.password, vals)
    .then(function(data) {
        logger.log('SIGNUP: ' + vals);
      resolveJWT(data, res);
    });
});

/* Arranger CRUD */

//Arranger Create
router.post('/api/v1/user', function(req, res) {
    var vals = [req.body.name, req.body.email];
    db.executePair([db.user_insert, db.user_select_all], vals, res);
});

//User Get
router.get('/api/v1/user', function(req, res) {
   db.executeQuery(db.user_select_all,[],res);
});

//User Get
router.get('/api/v1/user/id', function(req, res) {
   var data = [req.user.user_id];
   db.executeQuery(db.user_select_one,data,res);
});

//User Get One
//TODO: remove this, using req.user instead
router.get('/api/v1/user/:user_id', function(req, res) {
   db.executeQuery(db.user_select_one,[req.params.user_id],res);
});

//User Update
//TODO: remove this, using req.user instead
router.put('/api/v1/user', function(req, res) {
    var vals = [req.body.name, req.body.email, req.body.user_id]
    db.executeQuery(db.user_update,vals,res);
});

//User delete
router.delete('/api/v1/user/:user_id', function(req, res) {
    var vals = [req.params.user_id];
    db.executePair([db.user_delete, db.user_select_all], vals, res);    
});

/* Song CRUD */

//Song Create
router.post('/api/v1/song', function(req, res) {
    var vals = [req.body.user_id, req.body.title, req.body.game_title, req.body.date];
    db.executePair([db.song_insert, db.song_select_all], vals, res);
});

router.post('/api/v1/song/id', function(req, res) {
    var vals = [req.user.user_id, req.body.title, req.body.game_title, req.body.date];
    db.executeQuery(db.song_insert, vals, res);
});

router.post('/api/v1/song/csv', function(req, res) {
    var form = new multiparty.Form();
    var count = 0;
    var output = [];
    var parser = csv();
    parser.on('readable', function(){
        while ((record = parser.read())) {
            output.push(record);
        }
    });
    
    parser.on('finish', function() {
        //TODO: batch inserts
    });

    form.on('error', function(err) {
        logger.error('Error parsing form: ' + err.stack);
    });
    
    // Parts are emitted when parsing the form
    form.on('part', function(part) {
      if (part.filename) {
        // filename is defined when this is a file
        count++;
        logger.log('FILE: ' + part.name);
        //Pipe contents to csv parser
        part.pipe(parser);
      }
      
      part.on('error', function(err) {
        part.close();
        res.status(500).send();
      });
    });
    
    // Close emitted after form parsed
    form.on('close', function() {
      logger.log('FILE: Completed');
      res.setHeader('Content-Type', 'text/plain');
      res.end('Received ' + count + ' files');
    });
    
    form.parse(req);
});

//Song Get
router.get('/api/v1/song', function(req, res) {
   db.executeQuery(db.song_select_all,[],res);
});

//Song Get
//Used for users other than self
router.get('/api/v1/user/:user_id/song', function(req, res) {
   db.executeQuery(db.song_by_user,[req.params.user_id],res);
});

//Song Get
router.get('/api/v1/user/song/id', function(req, res) {
   db.executeQuery(db.song_by_user,[req.user.user_id],res);
});

//Song Update
router.put('/api/v1/song', function(req, res) {
    var vals = [req.body.title, req.body.date, req.body.song_id];
    db.executeQuery(db.song_update,vals,res);
});

//Song delete
router.delete('/api/v1/song/:song_id', function(req, res) {
    var vals = [req.params.song_id];
    db.executePair([db.song_delete, db.song_select_all], vals, res);    
});

/* Review CRUD */

//Review Create
router.post('/api/v1/review', function(req, res) {
    var vals = [req.body.song_id, req.body.reviewer_id, req.body.overall_rating, req.body.part_rating, req.body.part_difficulty, req.body.comments];
    db.executePair([db.review_insert, db.review_select_all], vals, res);
});

//Review Get
router.get('/api/v1/review', function(req, res) {
   db.executeQuery(db.review_select_all,[],res);
});

//Review Get for Song
router.get('/api/v1/song/:song_id/review', function(req, res) {
   db.executeQuery(db.review_select,[req.params.song_id],res);
});

//Review Update
router.put('/api/v1/review', function(req, res) {
    var vals = [req.body.overall_rating, req.body.part_rating, req.body.part_difficulty, req.body.comments, req.body.song_id, req.body.reviewer_id];
    db.executeQuery(db.review_update,vals,res);
});

//Review delete
router.delete('/api/v1/review/:review_id', function(req, res) {
    var vals = [req.params.review_id];
    db.executePair([db.review_delete, db.review_select_all], vals, res);    
});

/* Instrument CRUD */
router.get('/api/v1/instrument', function(req, res) {
   db.executeQuery(db.instrument_select_all,[],res);
});

/* Orchestra CRUD */
router.get('/api/v1/orchestra', function(req,res) {
   db.executeQuery(db.orchestra_select_all,[],res);
});

/* Game CRUD */
router.post('/api/v1/game', function(req,res) {
    db.executeQuery(db.game_insert,[req.body.game_title],res);
})

module.exports = router;
