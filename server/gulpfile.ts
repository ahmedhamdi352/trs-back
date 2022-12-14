import gulp from 'gulp';
import javascriptObfuscator from 'gulp-javascript-obfuscator';

function defaultTask(cb) {
  gulp
    .src(['build/**/*.js'])
    .pipe(
      javascriptObfuscator({
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        log: false,
        mangle: false,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        stringArray: true,
        // stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        unicodeEscapeSequence: false,
      })
    )
    .pipe(gulp.dest('./dist'));
  cb();
}

export default defaultTask;
