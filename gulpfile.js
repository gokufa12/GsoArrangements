var gulp        = require('gulp');
var gutil       = require('gulp-util');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var nodemon     = require('gulp-nodemon');
var livereload  = require('gulp-livereload');


// executes without any additional args; the default
gulp.task('default', ['watch-changes', 'run']);

gulp.task('watch-changes', function() {
    gulp.watch('src/**/*.js', ['jshint', 'uglify-js']); 
});

// execute to start up the server
gulp.task('run', ['start-server']);

gulp.task('start-server', function() {
    livereload.listen();
    
    nodemon({
        script: './bin/www',
        ext: 'html js css',
        env: {
            env: 'development'
        }
    }).on('restart', function() {
        gulp.src('./bin/www')
            .pipe(livereload());
    });
});

// jslint - to force us to write better code
gulp.task('jshint', function() {
    gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// minifies all JS files from the client/server code
gulp.task('uglify-js', function() {
    gulp.src('src/**/*.js')
        .pipe(uglify())
        .pipe(concat('minified.js'))
        .pipe(gulp.dest('out'));
});