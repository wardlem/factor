const path = require('path')

module.exports = function (config) {
  const IS_COVERAGE = process.env.NODE_ENV === 'coverage'

  const reporters = ['mocha']
  const plugins = [
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-rollup-preprocessor',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-firefox-launcher'
  ]
  if (IS_COVERAGE) {
    reporters.push('coverage-istanbul')
    reporters.push('karma-coverage-istanbul-reporter')
  }
  config.set({
    frameworks: ['mocha', 'chai'],
    browsers: ['Firefox'],
    files: ['test/runner.js'],
    reporters,
    plugins,
    preprocessors: {
      'test/runner.js': ['rollup']
    },

    rollupPreprocessor: {
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'factortest', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      }
    },
    coverageIstanbulReporter: {
      reports: ['html', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
      skipFilesWithNoCoverage: false,
      'report-config': {
        html: {
          subdir: 'html'
        }
      },
      thresholds: {
        emitWarning: false
      }
    }
  })
}
