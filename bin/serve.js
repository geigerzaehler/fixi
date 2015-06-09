#!/usr/bin/env node

var express = require('express')
var path = require('path')

var staticDir = path.join(__dirname, '..')

express()
.use(express.static(staticDir))
.use(function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'))
})
.listen(3000)
