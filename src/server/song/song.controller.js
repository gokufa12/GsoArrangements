var db = require('../database.js');

/* SQL */
var sql = {
    song_insert : "INSERT INTO song (user_id, title, game_title, date, duration, orchestra_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    song_select_all : "SELECT song.*, gso_user.name, orchestra.orchestra_name as orc FROM (song NATURAL JOIN gso_user) INNER JOIN orchestra ON orchestra.orchestra_id = song.orchestra_id",
    song_by_user : "SELECT song.*, gso_user.name, orchestra.orchestra_name as orc FROM (song NATURAL JOIN gso_user) INNER JOIN orchestra ON orchestra.orchestra_id = song.orchestra_id WHERE user_id = $1",
    song_update : "UPDATE song SET title=$1, date=$2 WHERE song_id=$3",
    //TODO: Delete will have to cascade to satisfy foreign key constraints
    song_delete : "DELETE FROM song WHERE song_id=$1"
};

/* CRUD operations for SONGs */

exports.createSong = function(req, res) {
    var vals = [req.body.user_id, req.body.title, req.body.game_title, 
        req.body.date, req.body.duration, req.body.orchestra_id];
    db.executePair([sql.song_insert, sql.song_select_all], vals, res);
};

exports.getSongsAll = function(req, res) {
    db.executeQuery(sql.song_select_all,[],res);
};

exports.getSongsSingle = function(req, res) {
    db.executeQuery(sql.song_by_user,[req.user.user_id],res);
};

exports.updateSong = function(req, res) {
    var vals = [req.body.title, req.body.date, req.body.song_id];
    db.executeQuery(sql.song_update,vals,res);
};

exports.deleteSong = function(req, res) {
    var vals = [req.params.song_id];
    db.executePair([sql.song_delete, sql.song_select_all], vals, res); 
};

/* Miscellaneous functions for SONGs */

exports.loadCSV = function(req, res) {
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
        
        function addRow(row, index, array) {
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
                    //See if orchestra exists - keep a set here so we don't have to keep querying everything
                    db.executeQuery('SELECT orchestra_id FROM orchestra WHERE orchestra_name = $1', [orchestra],null)
                    .then(function(orc){
                        if (!orc || orc.length === 0) {
                            //add orc
                            logger.log('Adding new orchestra: ' + orchestra);
                            return db.executeQuery(db.orchestra_insert, [orchestra,'no email'],null);
                        } else {
                            return new Promise(function(resolve){
                                resolve(orc);
                            });
                        }
                    })
                    .then(function(orc_id) {
                        //Finally, we can insert the song
                        return db.executeQuery(sql.song_insert,[user_id[0].user_id, title, game, date, duration, orc_id[0].orchestra_id], null);
                    });
                });
            });
        }
            
        output.forEach(addRow);
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
};