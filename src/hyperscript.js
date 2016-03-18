import VDom from 'virtual-dom'
import extend from 'lodash/object/extend'

export default function h (...args) {
  let [tag, props, children, extension] = normalizeArgs(...args)
  return extend(VDom.h(tag, props, children), extension)
}


function normalizeArgs (...args) {
  let tag = ''
  let props = {}
  let children = []
  let extension = {}

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

