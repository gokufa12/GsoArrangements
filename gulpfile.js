var gulp        = require('gulp');
var path        = require('path');
var _           = require('lodash');
var gutil       = require('gulp-util');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var nodemon     = require('gulp-nodemon');
var inject      = require('gulp-inject');
var livereload  = require('gulp-livereload');
var browserSync = require('browser-sync');
var bsSpa       = require('browser-sync-spa');
var wiredep     = require('wiredep').stream;
var proxyMid    = require('http-proxy-middleware');
var spawn       = require('child_process').spawn;

var sysConf     = require('./gulp/sys-conf.js');
var node;

browserSync.use(bsSpa({
    selector: '[ng-app]'
}));

// executes without any additional args; the default
gulp.task('default', ['run']);

gulp.task('watch-changes', function() {
    gulp.watch(path.join(sysConf.paths.src, '/**/*.js'), ['inject', 'jshint', 'bs-reload']);
    gulp.watch(path.join(sysConf.paths.src, '/**/*.html'), ['inject', 'bs-reload']);
    gulp.watch(path.join(sysConf.paths.src, '/**/*.css'), ['inject', 'bs-reload']);
});

// execute to start up the server
gulp.task('run', ['kickoff-backend', 'inject', 'start-server', 'watch-changes']);

gulp.task('start-server', function() {
    browserSync.init({
        startPath: '/',
        port: 8080,
        server: {
            baseDir: ['out', sysConf.paths.src],
            routes: {
                '/bower_components': 'bower_components'
            },
            middleware: [
                proxyMid(
                    ['/api/**'],
                    {
                        target: {
                            host: sysConf.server.host,
                            port: sysConf.server.port,
                            protocol: 'http' // TODO change to https
                        },
                        xfwd: true,
                        changeOrigin: true
                    }
                )
            ]
        }
    });
});

// jslint - to force us to write better code
gulp.task('jshint', function() {
    gulp.src(path.join(sysConf.paths.src, '/**/*.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('bs-reload', function() {
    browserSync.reload();
});

// minifies all JS files from the client/server code
gulp.task('uglify-js', function() {
    gulp.src(path.join(sysConf.paths.src, '/**/*.js'))
        .pipe(uglify())
        .pipe(concat('minified.js'))
        .pipe(gulp.dest('out'));
});

gulp.task('move-views', function() {
    gulp.src(path.join(sysConf.paths.src, '/client/**/views/*.html'))
        .pipe(gulp.dest('out'));
});

gulp.task('inject', function() {
    var injStyles = gulp.src(path.join(sysConf.paths.src, '/client/**/styles/*.css'));
    var injScripts = gulp.src([
        path.join(sysConf.paths.src, '/client/**/*.module.js'),
        path.join(sysConf.paths.src, '/client/**/*.js'),
        path.join(sysConf.paths.src, '/client/*.module.js'),
        path.join(sysConf.paths.src, '/client/*.js')
    ]);
    
    gulp.src('src/index.html')
        .pipe(inject(injStyles, {addRootSlash: false, ignorePath: sysConf.paths.src}))
        .pipe(inject(injScripts, {addRootSlash: false, ignorePath: sysConf.paths.src}))
        .pipe(wiredep(_.extend({}, sysConf.wiredep)))
        .pipe(gulp.dest('out'));
});

gulp.task('kickoff-backend', function() {
    if (node) node.kill();
    node = spawn('node', ['./server.js'], {stdio: 'inherit'});
});