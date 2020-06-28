import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'test/runner.js',
  output: {
    dir: 'test/build',
    format: 'esm'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
}
