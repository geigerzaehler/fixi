import rafDefault from 'raf'
import {caseof} from 'sum-types'
import * as V from 'virtual-dom'
import VNode from 'virtual-dom/vnode/vnode'
import VText from 'virtual-dom/vnode/vtext'

import rafScheduler from './raf-scheduler'
import interpretProps from './interpret-props'
import EventStreamPool from '../utils/EventStreamPool'

import {Tree, componentEqual, thunkEqual} from '../../vtree'

const defaultOptions = {
  raf: rafDefault,
}

export default function makeEngine (opts) {
  opts = Object.assign({}, defaultOptions, opts)
  const interpret = interpreter(opts)
  return function create (tree) {
    return V.create(interpret(tree), {
      document: opts.document,
    })
  }
}

function interpreter (opts) {
  opts = Object.assign({
    interpret,
  }, opts)

  return interpret

  function interpret (tree) {
    return caseof(tree, [
      [
        Tree.Element, ({tag, props, children}) => {
          const [vprops, key] = interpretProps(props)
          return new VNode(tag, vprops, children.map(interpret), key)
        },
      ], [
        Tree.Text, ({text}) => new VText(text),
      ], [
        Tree.Component, (props) => new Component(props, opts),
      ], [
        Tree.Thunk, (props) => new Thunk(props, interpret),
      ], [
        Tree.Raw, (props) => new Raw(props, interpret),
      ],
    ])
  }
}


// state : {
//   tree : VTree
//   node : DOM.Node
//   eventStreamPool : Listener
// }
// renderOpts : {
//   interpret : VTree -> VDom
//   document : Document
//   raf : (fn) -> void
// }
function drawer (state, renderOpts) {
  const interpret = renderOpts.interpret

  let scheduler = rafScheduler(redraw, renderOpts.raf)
  let nextTree = null
  let nextRenderCb = null
  let destroyed = false

  state = Object.assign({}, state)

  return {
    state: state,
    update: update,
    destroy () {
      scheduler.cancel()
      if (state.eventStreamPool) {
        state.eventStreamPool.destroy()
      }
      state = null
      scheduler = null
      nextTree = null
      nextRenderCb = null
      destroyed = true
    },
  }

  function update (tree, renderCb) {
    if (destroyed) {
      return
    }

    nextRenderCb = renderCb
    nextTree = tree
    if (!state.node) {
      redraw()
    } else if (tree !== state.tree) {
      scheduler.schedule()
    }
  }

  function redraw () {
    const newTree = interpret(nextTree)
    render(state, newTree, renderOpts)
    if (nextRenderCb) {
      nextRenderCb(state.node)
      nextRenderCb = null
    }
  }
}


function render (state, newTree, renderOpts) {
  if (!state.node || !state.tree) {
    state.node = V.create(newTree, renderOpts)
  } else {
    let patches = V.diff(state.tree, newTree)
    state.node = V.patch(state.node, patches, renderOpts)
  }
  if (state.eventStreamPool) {
    state.eventStreamPool.setTarget(state.node)
  }
  state.tree = newTree
}


class Component {
  constructor (component, opts) {
    this.type = 'Widget'
    // This tells virtual-dom to always call `update()` and let’s us determine
    // wheter we want to replace the component.
    this.name = true

    this.component = component
    this.mount = component.mount
    this.key = component.key

    this.opts = opts
  }

  init (state = {}) {
    state.eventStreamPool = new EventStreamPool(this.events)
    this.drawer = drawer(state, this.opts)
    this.unmount = this.mount(
      this.drawer.update,
      (eventName) => state.eventStreamPool.getEventStream(eventName),
      (ev) => this.drawer.state.node.dispatchEvent(ev)
    )
    if (!this.drawer.state.node) {
      throw new Error('You must paint the component on initializing')
    }
    return this.drawer.state.node
  }

  destroy () {
    this.drawer.destroy()
    this.unmount && this.unmount()
  }

  update (prev, node) {
    if (isVDomComponentEqual(prev, this)) {
      return node
    } else {
      prev.destroy()
      return this.init(prev.drawer.state)
    }
  }
}


function isVDomComponentEqual (a, b) {
  return (
    a instanceof Component &&
    b instanceof Component &&
    componentEqual(a.component, b.component)
  )
}


class Thunk {
  constructor (thunk, interpret) {
    this.type = 'Thunk'
    this._thunk = thunk
    this._interpret = interpret
  }

  render (previous) {
    if (isVDomThunkEqual(previous, this)) {
      return previous.vnode
    } else {
      return this._interpret(this._thunk.render(this._thunk.value))
    }
  }
}

function isVDomThunkEqual (a, b) {
  if (a && a.vnode) {
    return thunkEqual(a._thunk, b._thunk)
  } else {
    return false
  }
}

class Raw {
  constructor ({create}) {
    this.type = 'Widget'
    this._create = create
  }

  init () {
    const {node, destroy} = this._create()
    this._destroy = destroy
    return node
  }

  destroy () {
    if (this._destroy) {
      this._destroy()
    }
  }

  update (prev, node) {
    if (prev._create === this._create) {
      this._destroy = prev._destroy
      return node
    } else {
      prev.destroy()
      return this.init()
    }
  }
}
