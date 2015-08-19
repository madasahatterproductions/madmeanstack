var gulp = require('gulp');
var path = require('path');

var concat = require('gulp-concat');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var compass = require('gulp-compass');
var cucumber = require('gulp-cucumber');
var flatten = require('gulp-flatten');
var usemin = require('gulp-jade-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var Server = require('karma').Server;
var protractor = require('gulp-protractor').protractor;
var sourcemaps = require('gulp-sourcemaps');
var scsslint = require('gulp-scss-lint');
var del = require('del');

var paths = {
  html: [
    'src/components/*/client/html/**/*.html'
  ],
  js: [
    'src/components/core/client/js/ng-core.js',
    'src/components/*/client/js/**/*.js'
  ],
  scss: [
    'src/components/*/client/scss/**/*.scss'
  ]
};

// Prolly gonna wanna just build the dev site. Good call.
gulp.task('default', ['build', 'devserver']);
gulp.task('live', ['publish', 'liveserver']);

gulp.task('build', ['html', 'sass', 'js']);

gulp.task('docs', ['ngdocs', 'serve-docs']);

// Task builds out the published version of the site.
gulp.task('publish', ['liveInit', 'build', /*'test',*/ 'copy', 'usemin'], function() {
  gulp.src('src/assets/lib/ng-file-upload/FileAPI.min.js')
    .pipe(gulp.dest('dist/assets/js'));

  gulp.src('src/assets/lib/ng-file-upload/FileAPI.flash.swf')
    .pipe(gulp.dest('dist/assets/flash'));

  gulp.src(['dist/assets/inc/js/**/*.js'])
    .pipe(gulp.dest('dist/assets/js'));

  gulp.src(['dist/assets/inc/css/**/*.css'])
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/assets/css'));
  // Do a little cleanup
  return del(['dist/assets/inc/js', 'dist/assets/inc/css']);
});

// Testing tasks.
gulp.task('test', ['unit', /*'e2e'*/]);

/********************************************************************/
/******                      HTML TASKS                         *****/
/********************************************************************/

// Copy project html into the assets html folder
gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(flatten())
    .pipe(gulp.dest('src/assets/html/'));
});

/********************************************************************/
/******                      SASS TASKS                         *****/
/********************************************************************/

// Build out sass files in core and packages
gulp.task('sass', ['scss-lint'], function() {
  gulp.src(paths.scss)
    .pipe(concat('_generated.scss'))
    .pipe(gulp.dest('src/scss/generated'));

  return gulp.src('src/scss/app.scss')
    .pipe(compass({
        config_file: 'src/scss/config.rb',
        css:         'src/assets/css',
        sass:        'src/scss'
      })
      .on('error', function(error) {
        console.log(error);
      }))
    .pipe(sourcemaps.write());
});

// Lint that sassy sass
gulp.task('scss-lint', function() {
  return gulp.src(paths.scss)
    .pipe(scsslint());
});

/********************************************************************/
/******                   JAVASCRIPT TASKS                      *****/
/********************************************************************/

gulp.task('js', ['jshint'], function() {
  return gulp.src(paths.js)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('src/assets/js/'));
});

gulp.task('jshint', function() {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('devserver', ['build'], function () {
  nodemon({
    script: 'bin/dev',
    ext: 'js scss jade html',
    env: { 'NODE_ENV': 'development' },
    tasks: ['build']
  });
});

gulp.task('liveserver', ['publish'], function () {
  nodemon({
    script: 'bin/www',
    env: { 'NODE_ENV': 'development' },
  });
});

/********************************************************************/
/******                     TESTING TASKS                       *****/
/********************************************************************/

gulp.task('unit', function(done) {
  new Server({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('e2e', function() {
  gulp.src(['./tests/e2e/**/*.js'])
    .pipe(protractor({
      configFile: "tests/protractor.conf.js",
      args: ['--baseUrl', 'http://127.0.0.1:3000']
    }))
    .on('error', function(e) { throw e; });
});

/********************************************************************/
/******                     PUBLISH TASKS                       *****/
/********************************************************************/

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  return gulp.src(['./src/components/**/*.js'])
    .pipe(gulpDocs.process({

    }))
    .pipe(gulp.dest('./doc'));
});

gulp.task('serve-docs', function() {
  connect.server({
    root: 'doc'
  });
});

gulp.task('liveInit', function() {
  del('dist');
  paths.js.push('src/js/live.js');
});

gulp.task('copy', ['build'], function() {
  return gulp.src([
      'src/assets/fonts/**/*',
      'src/assets/html/**/*',
      'src/assets/images/**/*',
      'src/assets/upload/**/*',
      'src/assets/favicon.ico',
      'src/assets/robots.txt',
      'src/auth/**/*',
      'src/components/*/server/**/*',
      'src/app.js',
      'src/config.js'
    ], {base: './app'})
    .pipe(gulp.dest('dist'));
});

gulp.task('usemin', ['copy'], function() {
  return gulp.src('src/assets/inc/*.jade')
    .pipe(usemin({
      css: ['concat'],
      js: [uglify()],
      options: {
        outputRelativePath: '../assets'
      }
    }))
    .pipe(gulp.dest('./dist/assets/inc'));
});
