import * as S from 'snabbdom'
import h from 'snabbdom/h'
import {caseof} from 'sum-types'

import attributes from 'snabbdom/modules/attributes'

import {Tree, Attribute} from '../vtree'

/**
 * TODO
 * - Handle properties and attributes
 * - Make component destroy work
 */

export default function init (document) {
  const patch = S.init([
    attributes,
  ])
  const interpret = makeInterpret(patch)
  return function create (vtree) {
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.setAttribute('id', 'container')
    root.setAttribute('id', 'root')
    container.appendChild(root)
    patch(root, interpret(vtree))
    return container
  }
}

function makeInterpret (patch) {
  return interpret

  function interpret (vtree) {
    return caseof(vtree, [
      [
        Tree.Element, ({tag, props, children}) =>
          h(tag, interpretProps(props), children),
      ], [
        Tree.Text, ({text}) => text,
      ], [
        Tree.Component, (props) => {
          let currentVnode
          const hook = {insert, destroy, remove}
          return h('component', {hook})

          function insert (vnode) {
            currentVnode = vnode
            props.mount(paint)

            function paint (node) {
              const nextVnode = interpret(node)
              patch(currentVnode, nextVnode)
              currentVnode = nextVnode
            }
          }

          function destroy (_vnode) {
          }

          function remove (_vnode) {
          }
        },
      ],
    ])
  }
}

function interpretProps (props) {
  const data = {
    attrs: {},
    props: {},
    on: {},
  }
  // TODO use lodash.fromPairs
  for (const [key, value] of props) {
    caseof(value, [
      [Attribute.Attribute, ({value}) => {
        data.attrs[key] = value
      }],
      [Attribute.Property, ({value}) => {
        data.props[key] = value
      }],
      [Attribute.Event, ({handler}) => {
        data.on[key] = handler
      }],
    ])
  }
  return data
}
