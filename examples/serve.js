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

.use('/examples', browserify('./examples', {
  external: ['fixi', 'examples'],
}))

.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
})

.listen(3000, () => console.log('listening to http://localhost:3000'))
