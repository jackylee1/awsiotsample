var gulp = require('gulp'),
watch = require('gulp-watch'),
sass = require('gulp-sass'),
runSequence = require('run-sequence');


gulp.task('watch', ()=>{
	return watch(['*.html', 'scss/**/*', 'js/**/*']
		,{ ignoreInitial: false }
		,runSequence('sass'));
});

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
});