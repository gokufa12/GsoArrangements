var reviewCtrlr = require('./review.controller.js');

module.exports = function(app, router) {
    app.use(router);
    
    /* CRUD operations below */
    
    app.route('/api/v1/review')
        .post(reviewCtrlr.createReview);
    
    app.route('/api/v1/review')
        .get(reviewCtrlr.getReviewsAll);
    
    // TODO we will want to change the route for this one...
    app.route('/api/v1/song/:song_id/review')
        .get(reviewCtrlr.getReviewSong);
    
    app.route('/api/v1/review')
        .put(reviewCtrlr.updateReview);
    
    app.route('/api/v1/review/:review_id')
        .delete(reviewCtrlr.deleteReview);
    
    /* Miscellaneous operations below */
    
    app.route('/api/review/testrt')
        .get(reviewCtrlr.testFcn);
    
};