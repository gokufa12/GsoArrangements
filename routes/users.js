var express = require('express');
var router = express.Router();
var path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('../views/users/user_profile', { title: 'GSO Arrangements Dashboard'});
});

router.get('/addsong', function(req, res, next) {
  res.render('../views/users/song', { title: 'GSO Arrangments - Add Song'});
});

router.get('/addsong_csv', function(req, res, next) {
  res.render('../views/users/upload_song_csv', { title: 'GSO Arrangements - Bulk Song Add'});
});

router.get('/arrangements', function(req, res, next) {
  res.render('../views/users/arrangements', { title: 'GSO Arrangements - View Arrangements'});
});

module.exports = router;
