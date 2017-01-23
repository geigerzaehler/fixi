import * as React from 'react'
import * as ReactDOM from 'react-dom'

import makeEngine from './preact-factory'

const {interpret, create} = makeEngine(
  React.createElement,
  React.Component,
  ReactDOM.render,
  (ev) => ev.nativeEvent
)

export {interpret, create}

export function setOptions (_opts) {
  // TODO
}
