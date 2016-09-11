import browserify from 'browserify-middleware'
import express from 'express'
import path from 'path'

browserify.settings({
  transform: 'babelify',
})


express()

.get('/assets/fixi.js', browserify([{
  './src/index.js': {expose: 'fixi'},
}]))

.get('/assets/examples.js', browserify([{
  './examples/index.js': {expose: 'examples'},
}], {external: ['fixi']}))

.use('/examples', browserify('./examples', {
  external: ['fixi', 'examples'],
}))

.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

.listen(3000, () => {
  /* eslint no-console: off */
  console.log('listening to http://localhost:3000')
})
