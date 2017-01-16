var songCtrlr = require('./song.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.post('/api/v1/song', songCtrlr.createSong);
    
    app.get('/api/v1/song', songCtrlr.getSongsAll);
    
    app.get('/api/v1/song/id', songCtrlr.getSongsSingle);
    
    app.put('/api/v1/song', songCtrlr.updateSong);
    
    app.delete('/api/v1/song/:song_id', songCtrlr.deleteSong);
    
    /* Miscellaneous operations below */
    
    app.get('/api/song/testrt', songCtrlr.testFcn);
    
    // TODO is it preferred to use /api/v1/song/csv?
    app.get('/api/song/csv', songCtrlr.csv);
};