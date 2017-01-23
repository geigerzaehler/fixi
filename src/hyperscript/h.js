import {Tree, Attribute} from '../vtree'
/**
 * Exports the well known `h()` function for constructing instances of
 * `VTree.Element`.
 */
export default function h (...args) {
  let [tag, props, nodes] = normalizeArgs(...args)

  nodes = nodes.reduce((ns, n) => {
    if (typeof n === 'string') {
      ns.push(Tree.Text(n))
    } else if (n) {
      assertTree(n)
      ns.push(n)
    }
    return ns
  }, [])

  return Tree.Element(tag, props, nodes)
}

function normalizeProps (props) {
  if (Array.isArray(props)) {
    return props
  } else {
    return objectPairs(props, (key, value) => {
      if (value instanceof Attribute) {
        return [key, value]
      } else {
        return [key, Attribute.Attribute(value)]
      }
    })
  }
}

function objectPairs (obj, fn) {
  const pairs = []
  for (const key in obj) {
    pairs.push(fn(key, obj[key]))
  }
  return pairs
}


function normalizeArgs (...args) {
  let tag = ''
  let props = {}
  let children = []

  let current = args.shift()

  if (typeof current === 'string') {
    tag = current
    current = args.shift()
  }

  if (Array.isArray(current)) {
    // TODO We should check if this uses the array style properties that make
    // more sense. Or we should separate this into two different functions
    props = []
  } else {
    props = normalizeProps(current)
    current = args.shift()
  }

  if (current) {
    children = current
    current = args.shift()
  } else {
    children = []
  }

  return [tag, props, children]
}

export function assertTree (x) {
  if (!(x instanceof Tree)) {
    throw new TypeError('Child is not a VTree instance')
  }
}
