var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del')
    karma = require('karma').server
    usemin = require('gulp-usemin');

gulp.task('default', ['clean', 'test'], function() {
    gulp.start('build');
});

gulp.task('clean', function(cb) {
    del(['dist/*'], cb);
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('tdd', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});

gulp.task('build', function () {
    gulp.src('src/index.html')
        .pipe(usemin({
            css: [minifyCss()],
            js: [uglify()],
            css_lib: [],
            js_lib: [],
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src('src/bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest('dist/fonts'));
});