/* eslint-disable */
var P = require('path')

require('babel-register')({
  babelrc: false,
  presets: ['es2015'],
  plugins: [
    ['module-resolver', {
      alias: {
        'fixi': P.resolve('./src'),
        'support': P.resolve('./test/support'),
      },
    }],
  ],
})
