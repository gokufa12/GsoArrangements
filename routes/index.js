var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var path = require('path');
var multiparty = require('multiparty');
var csv = require('csv-parse');
var jwtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');

//TODO: modify code so this can be removed
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

const crypto = require('crypto');
const hash = crypto.createHash('sha256');
function genHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
const secrets = 'ThisIsMySecretPassword';
var db = require('../private/database.js');

//TODO: replace this with a better logging tool
var logger = console;

//Keeps track of emails to verify
var verifyList = [];

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'GSO Arrangements'});
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
    res.render('login', { title: 'GSO Arrangements Sign Up'});
});

router.get('/signup', function(req, res, next) {
    if (req.query.failed_email_verify) {
        res.render('signup_retry', { title: 'GSO Arrangements Sign Up'});
    } else {
        res.render('signup', { title: 'GSO Arrangements Sign Up'});
    }
});

router.get('/signup/:hash', function(req, res, next) {
    var currTime = new Date();
    
    function removeOld(verify) {
        //If expired, remove it
        if (verify.expire < currTime) {
            db.executeQuery('DELETE FROM gso_user WHERE \"e-mail\"=$1', [verify.email], null)
            .then(function() {
                db.executeQuery('DELETE FROM user_info WHERE email = $1', [verify.email], null);
            });
            return false;
        }
        return true;
    }
    
    function match(verify) {
        logger.log(verify);
        logger.log(req.params.hash === verify.hash);
        return verify.hash === req.params.hash;
    }
    
    function notMatch(verify) {
        return !match(verify);
    }

    //Iterate over verifyList and remove expired things
    verifyList = verifyList.filter(removeOld);
    //Find matching hash
    var found = verifyList.filter(match);
    if (found) {
        verifyList = verifyList.filter(notMatch);
        //Found match, flip the verify flag
        db.executeQuery('UPDATE user_info SET verified=true WHERE email=$1',[found[0].email], null)
        .then(function() {
            res.redirect('/login');
        });
    } else {
        res.redirect('/signup?failed_email_verify=true');
    }
});



function authenticate(email, password, create) {

    return db.executeQuery('SELECT salt, verified  FROM user_info WHERE email = $1', [email],null)
    .then(function(results) {
        //if salt existed AND account was verified
        if (results && (results.length > 0) && (results[0].salt != "") && (results[0].verified)) {
            var hash = genHash(results[0].salt + password);
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
                //TODO: What if we have a duplicate user?
                logger.log("NEW_USER: " + result);
                const buffer = crypto.randomBytes(32);
                salt = buffer.toString('hex');
                var hash = genHash(salt + password);
                var values = [result[0].user_id, email, hash, salt];
                
                return db.executeQuery('INSERT INTO user_info (gso_user_id, email, password, salt, verified) VALUES($1,$2,$3,$4,FALSE) RETURNING gso_user_id, salt',values, null);
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
            res.cookie('access_token', myToken, {secure: true, httpOnly: true});
            //res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly;');
            //res.cookie('Warning', '199 Miscellaneous warning',{secure: false, httpOnly: false });
            //Set cookie to avoid XSRF
            res.cookie('XSRF-TOKEN', myXSRF, {secure: true, httpOnly: true });
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

router.post('/api/v1/signup/mail', function(req, res){
    var date = new Date();
    date = date.setTime(date.getTime() + (6000 * 60));  //time + 60 minutes
    
    //Push our verify to the list
    verifyList.push({
        expire: date,
        hash: req.body.hash,
        email: req.body.mail
    });
    
    //send email with verification link
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'gso.arrangements@gmail.com', // Your email id
            pass: process.env.GMAIL_PASSWORD // Your password
        }
    });
    logger.log(req.body);
    logger.log(req.body.mail);
    var link = 'https://' + req.headers.host + '/signup/' + req.body.hash;
    var text = "Thanks for signing up for GSO Arrangements. Follow the link to complete registration: " + link;
    var mailOptions = {
        from: 'GSO Arrangements <gso.arrangements@gmail.com>', // sender address
        to: req.body.mail, // list of receivers
        subject: 'GSO Arrangements Signup', // Subject line
        text: text //, // plaintext body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logger.log(error);
            res.status(500).json({yo: 'error'});
        }else{
            logger.log('Message sent: ' + info.response);
            res.json({yo: info.response});
        };
    });
    
    transporter.close();    //shut down the conneciton
});

router.post('/api/v1/signup', function(req, res) {
    var vals = [req.body.name, req.body.email];
    signup(req.body.email, req.body.password, vals)
    .then(function(data) {
        //logger.log('SIGNUP: ' + vals);
        res.status(200).json({ success: true});
    })
    .error(function(error) {
        //Something failed
        logger.log('Signup error: ' + error);
        res.status(401).json({ success: false, message: 'Signup failed.'});
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
    var vals = [req.body.user_id, req.body.title, req.body.game_title, req.body.date, req.body.duration, req.body.orchestra_id];
    db.executePair([db.song_insert, db.song_select_all], vals, res);
});

router.post('/api/v1/song/id', function(req, res) {
    var vals = [req.user.user_id, req.body.title, req.body.game_title, req.body.date, req.body.duration, req.body.orchestra_id];
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
    
    //TODO: make this less disgusting
    //TODO: see if we can move this to a stream
    parser.on('finish', function() {
        
        function thing(row, index, array) {
            const title = row[0],
            game = row[1],
            name = row[2],
            email = row[3],
            orchestra = row[4],
            date = new Date(row[5]),
            duration = row[6];
            
            //Gross locking
            lock.acquire('db', ()=> {
            return db.executeQuery("SELECT user_id FROM gso_user WHERE name = $1 AND \"e-mail\" = $2", [name,email],null)
            .then(function(data) {
                logger.log('user_id data: ');
                logger.log(data);
                if (!data || data.length === 0) {
                    logger.log('add user...');
                    //add user
                    return db.executeQuery(db.user_insert, [name,email],null);
                } else {
                    return new Promise(function(resolve){
                        resolve(data);
                    });
                }
            }).then(function(user_id) {
                logger.log('got user_id? : ');
                logger.log(user_id);
                //See if orchestra exists - keep a set here so we don't have to keep querying everything
                db.executeQuery('SELECT orchestra_id FROM orchestra WHERE orchestra_name = $1', [orchestra],null)
                .then(function(orc){
                    if (!orc) {
                        //add orc
                        return db.executeQuery(db.orchestra_insert, [orchestra,'no email'],null);
                    } else {
                        return new Promise(function(resolve){
                            resolve(orc);
                        });
                    }
                })
                .then(function(orc_id) {
                    logger.log('we got orc_id: ' + orc_id);
                    logger.log(orc_id);
                    //logger.log([user_id[0].user_id, title, game, date, duration, orc_id[0].orchestra_id]);
                    //Finally, we can insert the song
                    return db.executeQuery(db.song_insert,[user_id[0].user_id, title, game, date, duration, orc_id[0].orchestra_id], null);
                });
            });
        });
        }
            
        output.forEach(thing);
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
