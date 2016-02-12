var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    inject = require('gulp-inject'),
    karma = require('karma').server,
    usemin = require('gulp-usemin');

gulp.task('default', ['clean', 'test'], function() {
    gulp.start('build');
});

gulp.task('install', ['clean'], function() {
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
        .pipe(inject(gulp.src(['src/analytics.html']), {
            starttag: '<!-- inject:analytics -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }))
        .pipe(inject(gulp.src(['src/forkme.html']), {
            starttag: '<!-- inject:forkme -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }))
        .pipe(inject(gulp.src(['src/share.html']), {
            starttag: '<!-- inject:share -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }))
        .pipe(usemin({
            css: [cssmin()],
            js: [uglify()],
            css_lib: [cssmin()],
            js_lib: [uglify()]
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src('src/fonts/*')
        .pipe(gulp.dest('dist/fonts'));

    gulp.src('src/bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest('dist/fonts'));

    gulp.src('src/bower_components/jquery/dist/jquery.min.map')
        .pipe(gulp.dest('dist/js'));
});