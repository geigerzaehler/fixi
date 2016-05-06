import rafDefault from 'raf'
import {diff, patch, create} from 'virtual-dom'
import * as K from 'kefir'

import {log} from './utils'

export default function component (prop, renderOpts = {}) {
  if (typeof prop.onAny !== 'function') {
    throw new TypeError('Expected observable')
  }

  let scheduleRedraw = rafScheduler(redraw, renderOpts.raf)
  let currentTree = null
  let newTree = null
  let target = null

  let stream = prop.flatMapLatest((node) => {
    return node.stream || K.never()
  })

  return {
    type: 'Widget',
    stream: stream,

    init () {
      log('init component', prop.toString())
      // Since 'prop' is a property this calls dispatch synchronously
      // and sets 'target'
      prop.onAny(dispatch)
      if (!target) {
        throw new Error('Property did not yield current value')
      }
      return target
    },
    destroy () {
      log('remove component')
      if (prop) prop.offAny(dispatch)
    },
  }

  function dispatch (event) {
    if (event.type === 'value') {
      update(event.value)
    } else if (event.type === 'end') {
      // Don’t know if this is necessary
      prop.offAny(dispatch)
      prop = null
    } else {
      throw event.value
    }
  }

  function update (tree) {
    if (!target) {
      // First call with initial value
      currentTree = tree
      target = create(currentTree, renderOpts)
      log('create', tree)
    } else if (tree !== currentTree) {
      newTree = tree
      scheduleRedraw()
      log('update component tree')
    }
  }

  function redraw () {
    let patches = diff(currentTree, newTree)
    target = patch(target, patches)
    currentTree = newTree
    log('redraw', target.outerHTML)
  }
}


function rafScheduler (fn, raf = rafDefault) {
  let scheduled = false

  return function schedule () {
    if (scheduled) return

    raf(function () {
      fn()
      scheduled = false
    })
  }
}
