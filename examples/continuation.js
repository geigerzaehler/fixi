import {component, h, observe, fix, ev} from 'fixi'
import * as K from 'kefir'
import {run} from 'examples'
import {extend} from 'lodash'

run(app())

// TODO maybe this should only use streams instead of promises

export function app () {
  return continuation(makeButton(0))
}

// Number -> VNode { stream :: Stream VNode }
function makeButton (count) {
  if (count > 3) {
    return h('div', ['Limit reached'])
  }
  let button = h('button', [`clicked ${count} times`])
  let observed = observe('click', button, () => {
    return makeLoad(count + 1)
  })
  return observed
}

// Number -> VNode { stream :: Stream VNode }
function makeLoad (count) {
  let info = h('span', [`Loading ${count}`])
  let stream =
    K.constant(makeButton(count))
    // .changes()
    .delay(500)
  return extend(info, {stream})
}

// VNode {stream :: Stream VNode } -> VNode
function continuation (a) {
  return component(fix((x) =>
    x.flatMapLatest(({stream}) =>
      stream ? stream.take(1) : K.never()
    )
    .toProperty(() => a)
  ))
}
