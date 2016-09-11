import rafDefault from 'raf'
import {diff, patch, create} from 'virtual-dom'

import {log} from './utils'

export default function component (make, renderOpts = {}) {
  return createWidget(() => {
    let scheduler = rafScheduler(redraw, renderOpts.raf)

    let destroy = null
    let currentTree = null
    let newTree = null
    let target = null

    log('init component')
    destroy = make(update)
    // TODO maybe use <noscript> tag
    if (!target) {
      throw new Error('You must paint the component on initializing')
    }

    return {
      element: target,
      destroy () {
        log('remove component')
        if (destroy) {
          destroy();
        }
        scheduler.cancel()
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
        scheduler.schedule()
        log('update component tree')
      }
    }

    function redraw () {
      let patches = diff(currentTree, newTree)
      target = patch(target, patches)
      currentTree = newTree
      log('redraw', target.outerHTML)
    }
  })
}


function createWidget (init) {
  let destroy_ = null;
  return {
    type: 'Widget',
    init () {
      let {destroy, element} = init()
      destroy_ = destroy
      return element
    },
    destroy () {
      if (destroy_) destroy_()
    }
  }
}


function rafScheduler (fn, raf = rafDefault) {
  let scheduled = false
  let canceled = false;

  return {schedule, cancel}

  function schedule () {
    if (scheduled) return

    raf(function () {
      if (canceled) return
      fn()
      scheduled = false
    })
  }

  function cancel () {
    fn = null
    canceled = true
  }
}
