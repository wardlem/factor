module.exports = function (config) {
  const reporters = ['mocha']
  const plugins = [
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-rollup-preprocessor',
    'karma-chai',
    'karma-chrome-launcher',
    'karma-firefox-launcher'
  ]
  const files = ['test/runner.js']
  const preprocessors = {
    'test/runner.js': ['rollup']
  }
  config.set({
    frameworks: ['mocha', 'chai'],
    browsers: ['Firefox'],
    files,
    reporters,
    plugins,
    preprocessors,

    rollupPreprocessor: {
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'factortest', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      }
    }
  })
}
