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
var wiredep     = require('wiredep').stream;
var sysConf     = require('./gulp/sys-conf.js');

// executes without any additional args; the default
gulp.task('default', ['run']);

gulp.task('watch-changes', function() {
    gulp.watch(path.join(sysConf.paths.src, '/**/*.js'), ['jshint', 'bs-reload']);
    gulp.watch(path.join(sysConf.paths.src, '/**/*.html'), ['bs-reload']);
    gulp.watch(path.join(sysConf.paths.src, '/**/*.css'), ['bs-reload']);
});

// execute to start up the server
gulp.task('run', ['inject', 'start-server', 'watch-changes']);

gulp.task('start-server', function() {
    browserSync.init({
        startPath: '/',
        port: 8080,
        server: {
            baseDir: ['out', sysConf.paths.src],
            routes: {
                '/bower_components': 'bower_components'
            }
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