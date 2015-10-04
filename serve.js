import browserify from 'browserify-middleware'
import express from 'express'
import path from 'path'

browserify.settings({
  transform: 'babelify',
})


express()

.get('/dist.js', browserify([{
  './examples/index.js': {expose: 'examples'},
  './src/index.js': {expose: 'fixi'},
}]))

.get('/purs.js', browserify([{
  './output/Main/index.js': {expose: 'Main'}
}]))

.get('/idris.js', (req, res) => {
  res.sendFile(path.resolve('dist/idris.js'))
})

.use('/examples', browserify('./examples', {
  external: ['fixi', 'examples'],
}))

.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'))
})

.listen(3000, () => console.log('listening to http://localhost:3000'))
