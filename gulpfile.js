var gulp = require('gulp');
var stylus = require('gulp-stylus');
var prefix = require('gulp-autoprefixer');
var exec = require('child_process').exec;
var gulpsync = require('gulp-sync')(gulp);
var Q = require('q');
var fs = require('fs');


gulp.task('popup-style', function () {
    return gulp.src('./chrome/popup/css/popup.styl')
        .pipe(stylus())
        .pipe(prefix())
        .pipe(gulp.dest('./chrome/popup/css'));
});


var base = './chrome/',
    jss = base+'popup/js/',
    csss = base+'popup/css/',
    imgs = base+'popup/img/**/';

var concat = require('gulp-concat'),
    jsmin = require('gulp-jsmin'),
    minifyCSS = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    rimraf = require('rimraf');


var chromeBuild = './chrome-build/',
    safariBuild = './safari/safari.safariextension/',
    firefoxBuild = './firefox/data/',
    desktopBuild = './desktop/',
    desktopRelease = './Raindrop.app/Contents/Resources/app/';


//REMOVE FOLDERS
gulp.task('clean-chrome-css', function (cb) {
    rimraf(chromeBuild+'css', cb);
});
gulp.task('clean-chrome-js', function (cb) {
    rimraf(chromeBuild+'js', cb);
});
gulp.task('clean-chrome-popup', function (cb) {
    rimraf(chromeBuild+'popup', cb);
});

gulp.task('clean-safari-css', function (cb) {
    rimraf(safariBuild+'css', cb);
});
gulp.task('clean-safari-js', function (cb) {
    rimraf(safariBuild+'js', cb);
});
gulp.task('clean-safari-popup', function (cb) {
    rimraf(safariBuild+'popup', cb);
});

gulp.task('clean-firefox-css', function (cb) {
    rimraf(firefoxBuild+'css', cb);
});
gulp.task('clean-firefox-js', function (cb) {
    rimraf(firefoxBuild+'js', cb);
});
gulp.task('clean-firefox-popup', function (cb) {
    rimraf(firefoxBuild+'popup', cb);
});

gulp.task('clean-desktop', function (cb) {
    rimraf(desktopRelease, cb);
});


//JS
gulp.task('js', function() {
    return gulp.src([
        jss+'_links.js',
        jss+'angular.js',
        jss+'angular-translate.js',
        jss+'angular-local-storage.js',
        //jss+'angular-cookies.min.js',
        jss+'angular-ui-router.js',
        jss+'angular-animate.min.js',
        jss+'angular-sanitize.js',
        jss+'angular-drag-and-drop-lists.js',
        jss+'jquery.nanoscroller.min.js',
        jss+'ng-infinite-scroll.min.js',
        jss+'bindonce.min.js',
        jss+'elastic.js',
        jss+'services.js',
        jss+'models.js',
        jss+'languages.js',
        jss+'css_browser_selector.js',
        jss+'underscore-min.js',
        jss+'moment.js',
        jss+'popup.js',
        jss+'bridge.js',
    ])
        .pipe(concat('all.js'))
        //.pipe(jsmin())
        .pipe(gulp.dest('./chrome-build/popup/js'))
});



//CSS
gulp.task('css', function() {
    return gulp.src([
        csss+'normalize.css',
        csss+'nanoscroller.css',
        csss+'popup.css',
    ])
        .pipe(concat('all.css'))
        //.pipe(minifyCSS())
        .pipe(gulp.dest('./chrome-build/popup/css'))
});



//IMG
gulp.task('img', function() {
    return gulp.src(imgs+'*')
        //.pipe(imagemin())
        .pipe(gulp.dest('./chrome-build/popup/img'))
});



//COPY
gulp.task('copy', function(cb) {
    var deferred = Q.defer();

    gulp.src(base+'_locales/**/*')
        .pipe(gulp.dest(chromeBuild+'_locales'));

    gulp.src(base+'images/**/*')
        .pipe(gulp.dest(chromeBuild+'images'))

    gulp.src(base+'chrome/**/*')
        .pipe(gulp.dest(chromeBuild+'chrome'))

    gulp.src(base+'environment/**/*')
        .pipe(gulp.dest(chromeBuild+'environment'))

    gulp.src(base+'import/**/*')
        .pipe(gulp.dest(chromeBuild+'import'))

    gulp.src(base+'js/**/*')
        //.pipe(jsmin())
        .pipe(gulp.dest(chromeBuild+'js'))

    gulp.src(base+'css/**/*')
        .pipe(gulp.dest(chromeBuild+'css'))

    gulp.src(base+'manifest.json')
        .pipe(gulp.dest(chromeBuild))

    gulp.src('./popup.html')
        .pipe(gulp.dest(chromeBuild+'popup'))

    gulp.src(base+'popup/js/placeholder.js')
        //.pipe(jsmin())
        .pipe(gulp.dest(chromeBuild+'popup/js'))

    gulp.src(base+'popup/css/placeholder.css')
        .pipe(gulp.dest(chromeBuild+'popup/css'))

    gulp.src(base+'popup/placeholder.html')
        .pipe(gulp.dest(chromeBuild+'popup'))

    gulp.src(base+'popup/fonts/**/*')
        .pipe(gulp.dest(chromeBuild+'popup/fonts'))

    gulp.src(base+'popup/templates/**/*')
        .pipe(gulp.dest(chromeBuild+'popup/templates'));

    setTimeout(function(){deferred.resolve();}, 3000);
    return deferred.promise;
});



//OTHER
gulp.task('other', function(cb) {
    var deferred = Q.defer();

    gulp.src(chromeBuild+'css/**/*')
        .pipe(gulp.dest(safariBuild+'css'))
    gulp.src(chromeBuild+'js/**/*')
        .pipe(gulp.dest(safariBuild+'js'))
    gulp.src(chromeBuild+'import/**/*')
        .pipe(gulp.dest(safariBuild+'import'))
    gulp.src(chromeBuild+'popup/**/*')
        .pipe(gulp.dest(safariBuild+'popup'))

    gulp.src(chromeBuild+'css/**/*')
        .pipe(gulp.dest(firefoxBuild+'css'))
    gulp.src(chromeBuild+'js/**/*')
        .pipe(gulp.dest(firefoxBuild+'js'))
    gulp.src(chromeBuild+'popup/**/*')
        .pipe(gulp.dest(firefoxBuild+'popup'))

    gulp.src(chromeBuild+'css/**/*')
        .pipe(gulp.dest(desktopBuild+'css'))
    gulp.src(chromeBuild+'js/**/*')
        .pipe(gulp.dest(desktopBuild+'js'))
    gulp.src(chromeBuild+'import/**/*')
        .pipe(gulp.dest(desktopBuild+'import'))
    gulp.src(chromeBuild+'popup/**/*')
        .pipe(gulp.dest(desktopBuild+'popup'))

    setTimeout(function(){
        deferred.resolve();
    }, 3000);
    return deferred.promise;
});



//DESKTOP
gulp.task('desktop', function() {
    var deferred = Q.defer();

    gulp.src(desktopBuild+'/**/*')
        .pipe(gulp.dest(desktopRelease))

    setTimeout(function(){
        fs.unlinkSync(desktopRelease + '/settings.json');

        fs.rename(desktopRelease + '/defaults.json', desktopRelease + '/settings.json', function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        setTimeout(function() {
            deferred.resolve();
        }, 200);
    }, 4000);
    return deferred.promise;
});



gulp.task('firefox-xpi', function(cb) {
    exec('cfx xpi --pkgdir firefox --update-link https://raindrop.io/releases/raindropio.xpi --update-url https://raindrop.io/raindropio.update.rdf', function(err) {
        if (err) return cb(err); // return error
        cb(); // finished task
    });
});




gulp.task('default', gulpsync.sync([
    'popup-style',
    'clean-chrome-css',
    'clean-chrome-js',
    'clean-chrome-popup',
    'clean-safari-css',
    'clean-safari-js',
    'clean-safari-popup',
    'clean-firefox-css',
    'clean-firefox-js',
    'clean-firefox-popup',
    'clean-desktop',
    'js', 'css', 'img', 'copy', 'other', 'desktop', 'firefox-xpi'
]));