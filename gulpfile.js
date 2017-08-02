var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var csso = require('gulp-csso');
var pug = require('gulp-pug');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var minify = require('gulp-minify');


gulp.task('compress', function() {
  gulp.src('dev/js/main.js')
    .pipe(minify({
      ext:{
        src:'-debug.js',
        min:'.js'
      },
      exclude: ['tasks'],
      ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('public/js'))
});

gulp.task("style", ["compress"], function() {
  gulp.src("dev/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("public/css"))
    .pipe(csso())
    .pipe(server.stream())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("public/css"))
    .pipe(server.stream())
});

gulp.task('images', ["style"], function() {
  return gulp.src('dev/img/**/*.{svg,jpg,png,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("public/img"));
});

gulp.task('fonts', ["images"], function () {
  gulp.src('dev/fonts/**/*.{eot,ttf,woff}')
    .pipe(gulp.dest("public/fonts"));
});

gulp.task('pug-html', ["fonts"], function () {
  return gulp.src('dev/pug/*.pug')
    .pipe(pug())
    .pipe(gulp.dest("public/"))
});



gulp.task("serve", ["pug-html"], function() {
  server.init({
    server: "public",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("dev/less/**/*.less", ["style"]);
  gulp.watch("dev/pug/**/*.pug", ["pug-html"]);
  gulp.watch("dev/img/**/*.{svg,jpg,png,gif}", ["images"]);
  gulp.watch("public/*.html", function() {
    server.reload()
  });
  gulp.watch("dev/js/*.js", ["compress"], server.reload());
});

