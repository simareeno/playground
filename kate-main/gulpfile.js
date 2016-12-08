var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

var AutoPrefixPlugin = require('less-plugin-autoprefix');
var autoprefix = new AutoPrefixPlugin({
	browsers: ['last 2 versions', 'opera >= 12']
});

gulp.task('styles', function () {
  return gulp.src('./libs/styles/*.less')
    .pipe(plumber())
    .pipe(less({
			plugins: [autoprefix]
		}))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist'));
});

gulp.task('images', function () {
  return gulp.src('./libs/img/**/*')
  .pipe(gulp.dest('./dist/img/'));
});

gulp.task('html', function () {
  return gulp.src('./*.html')
  .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function () {
  return gulp.src('./libs/scripts*.js')
  .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('watch', function() {
  watch('./libs/styles/*.less', function() {
		gulp.start('styles');
	});
	watch('./*.html', function() {
		gulp.start('html');
	});
});


gulp.task('default', ['images', 'styles', 'html', 'scripts', 'watch']);
