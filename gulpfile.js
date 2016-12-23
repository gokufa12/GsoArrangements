var gulp        = require('gulp');
var gutil       = require('gulp-util');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var nodemon     = require('gulp-nodemon');
var livereload  = require('gulp-livereload');


// executes without any additional args; the default
gulp.task('default', [/*'wiredep-inject',*/ 'watch-changes', 'run']);

gulp.task('watch-changes', function() {
    gulp.watch('src/**/*.js', ['jshint', 'uglify-js']); 
});

// execute to start up the server
gulp.task('run', ['start-server']);

gulp.task('start-server', function() {
    livereload.listen({port:8081});
    
    nodemon({
        script: 'server.js',
        ext: 'html js css',
        env: {
            env: 'development'
        }
    }).on('restart', function() {
        gulp.src('server.js')
            .pipe(livereload({port:8081}));
    });
});

// jslint - to force us to write better code
gulp.task('jshint', function() {
    gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// TODO need to determine how to pipe this in the correct order
/*
gulp.task('wiredep-inject', function() {
    var wiredep = require('wiredep').stream;
    gulp.src('src/client/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('src'));
});
*/

// minifies all JS files from the client/server code
gulp.task('uglify-js', function() {
    gulp.src('src/**/*.js')
        .pipe(uglify())
        .pipe(concat('minified.js'))
        .pipe(gulp.dest('out'));
});