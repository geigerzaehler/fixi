import {component, create, h, observe} from 'fixi'
import {run} from 'examples'

run(app())

function app () {

  // input :: VNode {stream :: ClickEvent}
  let input = observe('change', h('input.field', {type: 'text'}))

  // name :: Property String
  let name = input.stream
    .map((ev) => ev.target.value)
    .toProperty(() => '')

  // main :: Property VNode {}
  let main = name.map((name) => {
    return h('div', [
      h('label.label', 'Name:'),
      input,
      h('hr'),
      h('h1.header', 'Hello ' + name)
    ])
  })

  // :: VNode {}
  return component(main)
}
