var gulp        = require('gulp');
var gutil       = require('gulp-util');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var nodemon     = require('gulp-nodemon');
var inject      = require('gulp-inject');
var livereload  = require('gulp-livereload');
var browserSync = require('browser-sync');
var wiredep     = require('wiredep').stream;

// executes without any additional args; the default
gulp.task('default', [/*'wiredep-inject',*/ 'watch-changes', 'run']);

gulp.task('watch-changes', function() {
    gulp.watch('src/**/*.js', ['jshint', 'uglify-js']); 
});

// execute to start up the server
gulp.task('run', ['inject', 'start-server']);

gulp.task('start-server', function() {
    /*livereload.listen({port:8081, basePath: 'out'});
    
    nodemon({
        script: 'server.js',
        ext: 'html js css',
        env: {
            env: 'development'
        }
    }).on('restart', function() {
        gulp.src('server.js')
            .pipe(livereload({port:8081}));
    });*/
    browserSync.init({
        startPath: '/',
        port: 8080,
        server: {baseDir: 'out'}
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

gulp.task('move-views', function() {
    gulp.src('src/client/**/views/*.html')
        .pipe(gulp.dest('out'));
});

gulp.task('inject', function() {
    var injStyles = gulp.src('src/client/**/styles/*.css');
    var injScripts = gulp.src([
        'src/client/**/*.module.js',
        'src/client/**/*.js',
        'src/client/*.module.js',
        'src/client/*.js'
    ]);
    
    gulp.src('src/index.html')
        .pipe(inject(injStyles))
        .pipe(inject(injScripts))
        .pipe(wiredep())
        .pipe(gulp.dest('out'));
});