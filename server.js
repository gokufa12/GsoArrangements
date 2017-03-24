#!/bin/env node
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.C9_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8081;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP or C9_NODEJS_IP vars detected, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        var routes = require('./routes/index');
        var users = require('./routes/users');
        
        self.routes = { };

        self.routes['routes'] = routes;
        self.routes['users'] = users;        
    };
    
    self.redirect = function redirectSec(req, res, next) {
            if (req.headers['x-forwarded-proto'] == 'http') {
                res.redirect('https://' + req.headers.host + req.path);
            } else {
                return next();
            }
        };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        
        // view engine setup
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        //var engine = require('ejs-locals');
        var serverRoutes = require('./src/server/server-routes.js');
        
        //self.app.set('views', path.join(__dirname, 'views'));
        //self.app.engine('ejs', engine);
        //self.app.set('view engine', 'ejs');
        //self.app.set('view engine', 'jade');
        self.app.set('secret','ThisIsMySecretPassword');
        //jwt
        var jwt = require('express-jwt');
        var jwtCheck = jwt({
          secret: self.app.get('secret'),
          getToken: function fromCookie(req) {
            if (req.cookies) {
              return req.cookies.access_token;
            } else {
              return null;
            }
          } //TODO: isRevoked
        });
        
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        self.app.use(logger('dev'));
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({ extended: false }));
        self.app.use(cookieParser());
        //self.app.use(express.static(path.join(__dirname, 'public')));
        self.app.use(self.redirect);
        
        self.app.use('/users/*', jwtCheck);
        self.app.use('/users', jwtCheck);
        self.app.use('/api/v1/*/id', jwtCheck);
        /*self.app.use('/', self.routes['routes']);
        self.app.use('/users', self.routes['users']);*/
        serverRoutes(self.app); // hooks in express routes
        
        // catch 404 and forward to error handler
        self.app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });
        
        // error handlers
        
        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
          self.app.use(function(err, req, res, next) {
            //Auth error, go to login
            if (err.status == 401){
                res.redirect('/login');
            }
            res.status(err.status || 500);
            res.send( {
              message: err.message,
              error: err
            });
          });
        }
        
        // production error handler
        // no stacktraces leaked to user
        self.app.use(function(err, req, res, next) {
          //Auth error, go to login
          if (err.status == 401){
                res.redirect('/login');
            }
          res.status(err.status || 500);
          res.render('error', {
            message: err.message,
            error: {}
          });
        });

        ////  Add handlers for the app (from the routes).
        //for (var r in self.routes) {
        //    self.app.get(r, self.routes[r]);
        //}
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
