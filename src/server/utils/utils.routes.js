var utilCtrlr = require('./utils.controller.js');

module.exports = function(app, router) {
    app.use(router);

    app.route('/api/v1/authenticate')
        .post(utilCtrlr.authenticate);

    //app.route('/api/v1/logout')
    //    .get(utilCtrlr.logout);
        
    app.route('/api/v1/signup/mail')
        .post(utilCtrlr.mailVerify);
        
    app.route('/api/v1/signup')
        .post(utilCtrlr.signup);
        
    app.route('/signup/:hash')
        .get(utilCtrlr.signupVerify);
};