import {h, create} from 'fixi'
import {map, flatten} from 'lodash'

export function setup () {
  let links = flatten(map({
    cycle: 'CycleJS',
    hello: 'Hello World',
    routing: 'Routing',
    continuation: 'Continuation',
    'simple-list/index': 'Simple List',
    'simple-list/events': 'Simple List (event based)'
  }, exampleLink))

  let nav = h('div', flatten(['Examples: ', links, h('hr')]))

  document.body.appendChild(create(nav))
  document.body.appendChild(create(h('.app')))

  let exampleName = window.location.search.slice(1)
  loadScript('examples/' + exampleName + '.js')
}

export function run (vnode) {
  let app = document.querySelector('.app')
  app.appendChild(create(vnode))
}

function exampleLink (label, name) {
  let href = '?' + name
  return [h('a', {attributes: {href}}, label), ' ']
}

function loadScript (src) {
  let script = h('script', {attributes: {src}})
  document.body.appendChild(create(script))
}
