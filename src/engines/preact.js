import * as P from 'preact'

import makeEngine from './preact-factory'


const {interpret, create, renderInto} = makeEngine(P.h, P.Component, P.render, id)

export {interpret, create, renderInto}

export function setOptions (opts) {
  if ('raf' in opts) {
    P.options.debounceRendering = opts.raf
  }
}

function id (x) {
  return x
}
