var reviewCtrlr = require('./review.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.post('/api/v1/review', reviewCtrlr.createReview);
    
    app.get('/api/v1/review', reviewCtrlr.getReviewsAll);
    
    // TODO we will want to change the route for this one...
    app.get('/api/v1/song/:song_id/review', reviewCtrlr.getReviewSong);
    
    app.put('/api/v1/review', reviewCtrlr.updateReview);
    
    app.delete('/api/v1/review/:review_id', reviewCtrlr.deleteReview);
    
    /* Miscellaneous operations below */
    
    app.get('/api/review/testrt', reviewCtrlr.testFcn);
    
};