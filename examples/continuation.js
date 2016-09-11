import {component, h, fix, ev} from 'fixi'
import * as K from 'kefir'
import {run} from 'examples'

run(app())

export function app () {
  return continuation(makeButton(0))
}

// Number -> VNode VNode
function makeButton (count) {
  if (count > 3) {
    let resetButton = makeResetButton()
    return h('div', [
      'Limit reached', h('br'),
      resetButton,
    ], resetButton.stream)
  } else {
    let click = ev(() => makeLoad(count + 1))
    return h('button', {click}, [`clicked ${count} times`])
  }
}

// VNode VNode
function makeResetButton () {
  let click = ev(() => makeButton(0))
  return h('button', {click}, ['Reset'])
}

// Number -> VNode VNode
function makeLoad (count) {
  let stream = K.later(500, makeButton(count))
  return h('span', [`Loading ${count}`], stream)
}

// VNode VNode -> VNode ()
function continuation (a) {
  return component(fix((x) =>
    x.flatMapLatest(({stream}) =>
      stream ? stream.take(1) : K.never()
    )
    .toProperty(() => a)
  ))
}
