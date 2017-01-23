import {primitive} from '../component'
import {evDel} from '../hyperscript'
import * as K from 'kefir-extra'

/**
 * ~~~js
 * const initialState = {value: 0, count: 0}
 *
 * const counter = Component.reducer(initialState, reduce, render)
 *
 * function reduce (state, action) {
 *   state.count++
 *   if (action === 'inc') {
 *     state.value++
 *   } else {
 *     state.value--
 *   }
 *   return state
 * }
 *
 * function render (state, dispatch) {
 *   return h('div', [
 *     h('div', [`Value: ${state.value}`]),
 *     h('div', [`Clicked: ${state.count} times`]),
 *     h('button',
 *       {click: ev(() => dispatch('inc')},
 *       ['+1']
 *     ),
 *     h('button',
 *       {click: ev(() => dispatch('dec')},
 *       ['-1']
 *     )),
 *   ])
 * })
 * ~~~
 */
// TODO test
export function reducer (state, reduce, render) {
  return primitive((paint) => {
    updateWith(identity)

    function dispatch (action) {
      updateWith((state) => reduce(state, action, updateWith))
    }

    function updateWith (fn) {
      state = fn(state)
      paint(render(state, dispatch))
    }
  })
}


export function evi (trsf) {
  return evDel('fixi', trsf)
}

// TODO does this make sense? test!
export function eventReducer (state, reduce, render, publish) {
  return primitive((paint, getEvent, emit) => {
    paint(render(state, dispatch))

    return K.onValue(getEvent('fixi'), (ev) => dispatch(ev.data))

    // TODO reduce should return promise
    function dispatch (action) {
      updateWith((state) => reduce(state, action, updateWith))
    }

    function updateWith (fn) {
      state = fn(state)
      if (publish) {
        emit(publish(state))
      }
      paint(render(state, dispatch))
    }
  })
}

function identity (x) {
  return x
}
