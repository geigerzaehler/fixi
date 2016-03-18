import {VNode} from 'virtual-dom'
import * as K from 'kefir'
import mapValues from 'lodash/object/mapValues'
import extend from 'lodash/object/extend'
import forEach from 'lodash/collection/forEach'
import map from 'lodash/collection/map'

import * as H from './hooks'
import _h from './hyperscript'


/**
 * observeClick :: Node {|r} -> Node {click: Event|r}
 */
export default function observe (event, node, trsf) {
  let props = node.properties
  let hook = H.eventStream(trsf)
  props[event] = hook
  let observed = new VNode(
    node.tagName,
    props,
    node.children,
    node.key,
    node.namespace
  )
  observed.stream = hook.stream
  return observed
}

export function h (tag, props, children, baseStream) {
  let streams =
    map(props, (hook) => typeof hook === 'object' && hook.stream)
    .filter((x) => !!x)

  if (baseStream) {
    streams.push(baseStream)
  }
  let node = _h(tag, props, children)

  if (streams.length === 0) {
    return node
  } else if (streams.length === 1) {
    return extend(node, {stream: streams[0]})
  } else {
    return extend(node, {stream: K.merge(streams)})
  }
}

observe.all = observeAll
export function observeAll (events, vnode) {
  let props = vnode.properties
  let hooks = mapValues(events, H.eventStream)
  extend(props, hooks)
  let observed = new VNode(
    vnode.tagName,
    props,
    vnode.children,
    vnode.key,
    vnode.namespace
  )
  forEach(hooks, (hook, name) => {
    observed['$' + name] = hook.stream
  })
  return observed
}
