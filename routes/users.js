var express = require('express');
var router = express.Router();
var path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/users', 'user_profile.html'));
});

router.get('/addsong', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/users', 'song.html'));
});

router.get('/addsong_csv', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/users', 'upload_song_csv.html'));
});

router.get('/arrangements', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/users', 'arrangements.html'));
});

module.exports = router;
