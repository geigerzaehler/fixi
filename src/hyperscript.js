import VDom from 'virtual-dom'
import extend from 'lodash/extend'
import map from 'lodash/map'
import * as K from 'kefir'

export default function h (...args) {
  let [tag, props, children, baseStream] = normalizeArgs(...args)

  let streams =
    map(props, (hook) => typeof hook === 'object' && hook.stream)
    .filter((x) => !!x)

  if (baseStream) {
    streams.push(baseStream)
  }
  let node = VDom.h(tag, props, children)

  if (streams.length === 0) {
    return node
  } else if (streams.length === 1) {
    return extend(node, {stream: streams[0]})
  } else {
    return extend(node, {stream: K.merge(streams)})
  }
}


function normalizeArgs (...args) {
  let tag = ''
  let props = {}
  let children = []
  let extension

  let current = args.shift()
  if (typeof current === 'string') {
    tag = current
    current = args.shift()
  }

  if (!Array.isArray(current)) {
    props = current
    current = args.shift()
  }

  if (current) {
    children = current
    current = args.shift()
  }

  if (current) {
    extension = current
  }

  return [tag, props, children, extension]
}

