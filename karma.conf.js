// Karma configuration
// Generated on Tue Jun 21 2016 10:33:52 GMT-0700 (Pacific Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.12.2.min.js",
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-route/angular-route.js',
      "https://secure.aadcdn.microsoftonline-p.com/lib/1.0.0/js/adal.min.js",
      "https://secure.aadcdn.microsoftonline-p.com/lib/1.0.0/js/adal-angular.min.js",
      'bower_components/angular-animate/angular-animate.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/ngprogress/build/ngprogress.min.js',
      "http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0-rc2/angular-material.min.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular-aria.min.js",
      'src/api-explorer-init.js',
      'src/api-explorer-app.js',
      'src/api-explorer-svc.js',
      'src/*.js',
      'spec/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
