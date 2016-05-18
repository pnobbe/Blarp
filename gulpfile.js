//meer packages?
//npm install 'name' 
//bijv: npm install gulp-concat

var gulp = require('gulp')
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var minify = require('gulp-minify');

/** ### TASK SCRIPTS ### */
gulp.task('scripts', function () {
    return gulp.src('./app/**/*.js') //Pak alle files uit de folder app die eindigen op .js
        .pipe(concat('app.js')) //Stop deze gezamelijk in de file app.js
        .pipe(minify())
        .pipe(gulp.dest('./dist/')); //plaats deze app.js file in de dist folder
});

/** ### TASK WATCH ###  */
gulp.task('watch', function () {
    watch('./app/**/*.js', {}, function (e) { //Kijk naar alle files in de folder app die eindigen op .js
        gulp.start('scripts'); //Veranderd een file? Run dan de task 'scripts' 
    });
})

/** ### TASK DEFAULT */
gulp.task('default', [], function () {
    gulp.start('scripts', 'watch');
});