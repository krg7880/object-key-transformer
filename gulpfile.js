const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const exec = require('child_process').exec
const jsdoc = require('gulp-jsdoc3');
const jsdoc2 = require("gulp-jsdoc");

gulp.task('doc', function (cb) {
   gulp.src(['README.md', './src/**/*.js'], {read: false})
       .pipe(jsdoc(cb));
});

gulp.task('nodemon', cb => {
  const stream = nodemon({
    script: 'index.js',
    ext: 'js',
    env: { NODE_ENV: 'development' },
    ignore: ['node_modules/']
  }) 
    .on('restart', () => {
      const tape = exec(
        `${__dirname}/node_modules/.bin/mocha`
      ) 
      tape.stdout.pipe(process.stdout)
      tape.stdin.pipe(process.stderr)
    })
    .on('crash', () => {
      console.error('Application has crashed!\n')
      stream.emit('restart', 10) // restart the server in 10 seconds
    })
})

gulp.task('default', ['nodemon', 'doc'])
