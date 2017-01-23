import {caseof} from 'sum-types'
import capitalize from 'lodash/capitalize'

import {Tree, Attribute, componentEqual, thunkEqual} from '../vtree'
import EventStreamPool from './utils/EventStreamPool'

/**
 * Engine factory parameterized by the Preact instance.
 *
 * This allows us to create an engine for React as well.
 *
 * Returns an object with three properties
 * - interpret: VNode -> EngineNode
 * - create: VNode -> DOM.Node
 * - renderInto: DOM.Node -> VNode -> IO ()
 */
export default function makeEngine (
  createElement, // createElement(tag, props, ...children)
  BaseComponent, // Base constructor for the component class
  render,        // render(vdom, element)
  getNativeEvent // getNativeEvent(syntheticEvent). Needed for react because the
                 // only emit synthetic events
) {
  const interpret = makeInterpret(createElement, BaseComponent, getNativeEvent)
  const renderInto = makeRenderInto(render, interpret)
  const create = makeCreate(renderInto)
  return { interpret, create, renderInto }
}

function makeRenderInto (render, interpret) {
  return function renderInto (tree, container) {
    render(interpret(tree), container)
    return function destroy () {
      // TODO
    }
  }
}

function makeCreate (renderInto) {
  return function create (tree, renderOpts = {}) {
    const doc = renderOpts.document || document
    const container = doc.createElement('div')
    renderInto(tree, container)
    return container
  }
}


function makeInterpret (createElement, BaseComponent, getNativeEvent) {
  const interpretProps = makeInterpretProps(getNativeEvent)
  const Component = makeComponent(BaseComponent, interpret)
  const Thunk = makeThunk(BaseComponent, interpret)
  const Raw = makeRaw(BaseComponent, interpret)
  return interpret

  function interpret (tree) {
    return caseof(tree, [
      [
        Tree.Element, ({tag, props, children}) =>
          createElement(tag, interpretProps(props), ...children.map(interpret)),
      ], [
        Tree.Text, ({text}) => text,
      ], [
        Tree.Component, (props) => {
          // 'props' has a prototype and React will warn us about this.
          props = Object.assign({}, props)
          return createElement(Component, props)
        },
      ], [
        Tree.Thunk, (props) => {
          props = Object.assign({}, props)
          return createElement(Thunk, props)
        },
      ], [
        Tree.Raw, (props) => {
          return createElement(Raw, props)
        },
      ],
    ])
  }
}


function makeInterpretProps (getNativeEvent) {
  return function interpretProps (props) {
    const res = {}
    // TODO use lodash.fromPairs
    for (const [key, value] of props) {
      caseof(value, [
        [Attribute.Attribute, ({value}) => {
          res[key] = value
        }],
        [Attribute.Property, ({value}) => {
          res[key] = value
        }],
        [Attribute.Event, ({handler}) => {
          // TODO use compose
          res['on' + capitalize(key)] = (ev) => handler(getNativeEvent(ev))
        }],
      ])
    }
    return res
  }
}


function makeComponent (BaseComponent, interpret) {
  return class Component extends BaseComponent {
    componentWillMount () {
      this.doMount(this.props)
    }

    componentWillUnmount () {
      this.cleanup()
      this.eventStreamPool = null
      this.props = null
    }

    componentWillReceiveProps (nextProps) {
      if (!componentEqual(this.props, nextProps)) {
        this.cleanup()
        this.doMount(nextProps)
      }
    }

    cleanup () {
      this.eventStreamPool.destroy()
      if (this.onUnmount) {
        this.onUnmount()
      }
    }

    doMount ({mount}) {
      this.eventStreamPool = new EventStreamPool()

      const paint = (node, rendered) => {
        this.setState({node, rendered})
      }

      const getEventStream = (name) => {
        return this.eventStreamPool.getEventStream(name)
      }

      const emit = (ev) => {
        // TODO we need to prevent loops
        this.base.parentNode.dispatchEvent(ev)
      }

      this.onUnmount = mount(paint, getEventStream, emit)
    }

    componentDidUpdate () {
      this.eventStreamPool.setTarget(this.base)
      if (this.state.rendered) {
        this.state.rendered(this.base)
      }
    }

    componentDidMount () {
      this.componentDidUpdate()
    }

    render () {
      return interpret(this.state.node)
    }
  }
}

function makeThunk (BaseComponent, interpret) {
  return class Thunk extends BaseComponent {
    shouldComponentUpdate (nextProps) {
      return !thunkEqual(this.props, nextProps)
    }

    render () {
      const {render, value} = this.props
      return interpret(render(value))
    }
  }
}

function makeRaw (BaseComponent, interpret) {
  return class Raw extends BaseComponent {
    componentWillMount () {
      this.init(this.props)
    }

    componentWillUnmount () {
      this.destroy()
      this.props = null
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.create !== nextProps.create) {
        this.destroy()
        this.init(nextProps)
      }
    }

    destroy () {
      if (this._destroy) {
        this._destroy()
      }
    }

    init ({create}) {
      const {node, destroy} = create()
      this._destroy = destroy
      this._node = node
    }

    componentDidUpdate () {
      // TODO we should replace the node and copy all Preact metadata
      this.base.appendChild(this._node)
    }

    componentDidMount () {
      this.componentDidUpdate()
    }

    render () {
      return interpret(Tree.Element('div', [], []))
    }
  }
}
