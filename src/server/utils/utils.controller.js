// TODO move this into a better place later...
var db = require('../database.js');
var jwtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');

const crypto = require('crypto');
const hash = crypto.createHash('sha256');
function genHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
const secrets = 'ThisIsMySecretPassword';

var _ = require('lodash');

//TODO: replace this with a better logging tool
//var winston = require('winston');
//var logger = new winston.Logger({
//   transports: [
//        new (winston.transports.Console)(),
//        new (winston.transports.File)({filename: 'node.log'})
//    ]
//});
var logger = console;

//Keeps track of emails to verify
var verifyList = [];

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
       //Set cookie to avoid XSRF
       res.cookie('XSRF-TOKEN', myXSRF, {secure: false, httpOnly: false });
       res.status(200).json({ success: true, jwt: myToken});
   } else {
       //Something failed
       res.status(401).json({ success: false, message: 'Authentication failed.'});
   }
}

function authenticateHelper(email, password, create) {

    return db.executeQuery('SELECT salt, verified  FROM user_info WHERE email = $1', [email],null)
    .then(function(results) {
        console.log(results);
        //if salt existed AND account was verified
        if (results && (results.length > 0) && (results[0].salt != "") && (results[0].verified)) {
            var hash = genHash(results[0].salt + password);
            //Returns a promise with either the user data or null
            return db.executeQuery('SELECT gso_user_id FROM user_info WHERE email=$1 AND password=$2',
                          [email, hash],null);
        } else {
            //return a promise with null data
            return new Promise(function(resolve){
              resolve(null);
            });
        }
    });
}

exports.authenticate = function(req, res) {
    var vals = [req.body.name, req.body.email];
    authenticateHelper(req.body.email, req.body.password, vals)
    .then(function(data) {
        console.log(data);
      resolveJWT(data, res);
    });
};

//This will return the info we want to put into our JWT if you call .then
function signupHelper(email, password, create) {
    logger.log('signupHelper');
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
                logger.log("NEW_USER: " + JSON.stringify(result));
                const buffer = crypto.randomBytes(32);
                salt = buffer.toString('hex');
                var hash = genHash(salt + password);
                var values = [result[0].user_id, email, hash, salt];
                
                return db.executeQuery('INSERT INTO user_info (gso_user_id, email, password, salt, verified) VALUES($1,$2,$3,$4,FALSE) RETURNING gso_user_id, salt',values, null);
            });
        }
    });
}

exports.signup = function(req, res) {
    logger.log('info','trying to signup: ' + req.body.email);

    var vals = [req.body.name, req.body.email];
    logger.log(vals);
    signupHelper(req.body.email, req.body.password, vals)
    .then(function(data) {
        logger.log('SIGNUP: ' + vals);
        res.status(200).json({ success: true});
        
    })
    .error(function(error) {
        logger.log('Signup error: ' + error);
        res.status(401).json({ success: false, message: 'Signup failed.'});
    });
    
};

exports.signupVerify = function(req, res, next) {
    logger.log('signupVerify');
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
        return verify.hash === req.params.hash;
    }
    
    function notMatch(verify) {
        return !match(verify);
    }

    //Iterate over verifyList and remove expired things
    verifyList = verifyList.filter(removeOld);
    //Find matching hash
    var found = verifyList.filter(match);
    if (found && !_.isEmpty(found)) {
        console.log(found);
        verifyList = verifyList.filter(notMatch);
        //Found match, flip the verify flag
        db.executeQuery('UPDATE user_info SET verified=true WHERE email=$1',[found[0].email], null)
        .then(function() {
            logger.log('redirecting');
            res.redirect('/login');
        });
    } else {
        res.redirect('/signup?failed_email_verify=true');
    }
};

exports.mailVerify = function(req, res) {
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
            pass: 'ASDFASDF' // Your password
        }
    });

    var link = 'https://' + req.headers.host + '/signup/' + req.body.hash;
    var text = "Thanks for signing up for GSO Arrangements. Follow the link to complete registration: " + link;
    var mailOptions = {
        from: 'GSO Arrangements <gso.arrangements@gmail.com>', // sender address
        to: req.body.mail, // list of receivers
        subject: 'GSO Arrangements Signup', // Subject line
        text: text // plaintext body
    };

    logger.log('Sending mail to: ' + req.body.mail);
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logger.error(error);
            res.status(500).json({yo: 'error'});
        } else {
            logger.log('Message sent: ' + info.response);
            res.json({yo: info.response});
        }
    });
    
    transporter.close();    //shut down the conneciton
};