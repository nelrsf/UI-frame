// Karma configuration file
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage'),
      subdir: 'ui-frame',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
        { type: 'text-summary' }
      ],
      // Coverage thresholds enforced for the Shell v1 effort (SC-006, NFR-Quality-01).
      // These are global thresholds applied across all instrumented source files.
      // Core services (src/app/core/services/) and state (src/app/core/state/) are
      // the primary contributors expected to meet this bar; T043 raises their coverage
      // to satisfy SC-006 for all metrics.
      check: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    restartOnFileChange: true
  });
};
