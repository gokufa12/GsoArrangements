var songCtrlr = require('./song.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/song')
        .post(songCtrlr.createSong);
    
    app.route('/api/v1/song')
        .get(songCtrlr.getSongsAll);
    
    app.route('/api/v1/song/id')
        .get(songCtrlr.getSongsSingle);
    
    app.route('/api/v1/song')
        .put(songCtrlr.updateSong);
    
    app.route('/api/v1/song/:song_id')
        .delete(songCtrlr.deleteSong);
    
    /* Miscellaneous operations below */
    
    app.route('/api/song/testrt')
        .get(songCtrlr.testFcn);
    
    // TODO is it preferred to use /api/v1/song/csv?
    app.route('/api/song/csv')
        .get(songCtrlr.csv);
};