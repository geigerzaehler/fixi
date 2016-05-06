import {component, h, evi} from 'fixi'
import {run} from 'examples'

run(app())

function app () {
  // input :: VNode String
  let input = h('input.field', {
    type: 'text',
    input: evi((ev) => ev.target.value)
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
