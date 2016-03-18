import {component, h, ho} from 'fixi'
import {run} from 'examples'

run(app())

function app () {
  // input :: VNode {stream :: ClickEvent}
  let input = ho('input.field', {type: 'text'}, [], {
    'input': (ev) => ev.target.value
  })

  // name :: Property String
  let name = input.stream
    .filter(({type}) => type === 'input')
    .map(({value}) => value)
    .toProperty(() => '')

  // main :: Property VNode {}
  let main = name.map((name) => {
    return h('div', [
      h('label.label', ['Name:']),
      input,
      h('hr'),
      h('h1.header', [`Hello ${name}`])
    ])
  })

  // :: VNode {}
  return component(main)
}
