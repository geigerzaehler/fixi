import raf from 'raf'
import VText from 'virtual-dom/vnode/vtext'
import {diff, patch, create} from 'virtual-dom'
import * as K from 'kefir'

import {log} from './utils'

export default function component (obs, renderOpts) {
  if (typeof obs.onAny !== 'function') {
    throw new TypeError('Expected observable')
  }

  let scheduleRedraw = rafScheduler(redraw);
  let currentTree = new VText('')
  let newTree = null;
  let target = null;

  let stream = obs.flatMapLatest((node) => {
    return node.stream || K.never()
  })

  return {
    type: 'Widget',
    stream: stream,

    init () {
      log('init component', obs.toString())
      obs.onAny(dispatch)
      target = create(currentTree, renderOpts)
      return target
    },
    destroy () {
      log('remove component')
      if (obs) obs.offAny(dispatch)
    }
  }

  function dispatch (event) {
    if (event.type === 'value') {
      update(event.value)
    } else if (event.type === 'end') {
      // Don’t know if this is necessary
      obs.offAny(dispatch)
      obs = null
    } else {
      throw event.value
    }
  }

  function update (tree) {
    if (tree !== currentTree) {
      newTree = tree
      scheduleRedraw();
      log('update')
    }
  }

  function redraw () {
    log('redraw start')
    let patches = diff(currentTree, newTree)
    target = patch(target, patches)
    currentTree = newTree
    log('redraw finished', target.outerHTML)
  }
}


function rafScheduler (fn) {
  let scheduled = false

  return function schedule () {
    if (scheduled) return

    raf(function () {
      fn()
      scheduled = false
    })
  }
}
