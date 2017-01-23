import {Tree} from './vtree'
import * as T from './thunk'

/**
 * This module exports a collection of component contructors.
 *
 * All constructors are based on the `component` function that
 * constructs a `Tree.Component` value.
 *
 * The first argument of the `Component` constructor is a 'mount'
 * function with the type
 *
 *     mount: (Tree -> IO ())
 *         -> (String -> Stream)
 *         -> (String -> a -> IO ())
 *         -> IO ()
 *
 * The arguments are
 *
 * - `paint: Tree -> IO ()` A function that renders the given tree in
 *   the component
 * - `getEventsStream: String -> Stream` Given an event name returns a Kefir
 *   stream of DOM events emitted on the component.
 * - `emit: String -> a -> Stream` Dispatch an event on the current
 *   node
 *
 * The second argument to `component` is a list of evet names to emit
 * on the `events$` stream.
 *
 * The function returned by `mount` is a cleanup action that is run
 * when the component unmounts.
 */
export function primitive (mount, key) {
  return Tree.Component(mount, key)
}


/**
 * Build a component that builds a tree from a state value and can update the state
 * with a callback.
 *
 * ~~~js
 * const counter = Component.stateful((value, update) => {
 *   return h('div', [
 *     h('span', [`Clicked ${value} times`]),
 *     h('buttons',
 *       {click: ev(() => update(value + 1))},
 *       ['Click me']
 *     ),
 *   ], 0)
 * })
 * ~~~
 *
 * The first parameter `render(state, update)` is a function that accepts the state
 * of the component and the `update` callback as parameters. The second parameter
 * is the state to call `render` with initially.
 *
 * Calling `update(newState)` will rerender the component with the new state.
 *
 * @param {render(state, update, events): VTree}
 * @param {initial: any}
 * @returns {Node}
 */
export function stateful (render, initial) {
  return primitive((paint, events) => {
    update(initial)
    function update (state) {
      paint(render(state, update, events))
    }
  })
}


export const fromProperty = T.thunk((prop, render) => {
  return fromObservable(prop.toESObservable(), render)
})


/**
 * Take a [ES Observable] and a render function and create a component
 * that changes its tree when the observable emits a new value.
 *
 * [ES Observable]: https://tc39.github.io/proposal-observable
 *
 * @param {Observable<T>} obs
 * @param {T => Tree} render
 * @returns {Tree}
 */
function fromObservable (obs, render = id) {
  return primitive((paint) => {
    const subscription = obs.subscribe({
      next (state) {
        paint(render(state))
      },

      error (error) {
        throw error
      },
    })

    return function () {
      subscription.unsubscribe()
    }
  })
}

function id (x) {
  return x
}
