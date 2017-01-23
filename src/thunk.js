import deepEqual from 'lodash/isEqual'
import {Tree} from './vtree'
import shallowEqual from 'shallow-equals'

export function thunk (render, eq = shallowEqual) {
  return function (...args) {
    // We add render to the args to also compare it
    return Tree.Thunk(renderSpread, {args, render}, eqWithRender)
  }

  function renderSpread ({args}) {
    return render(...args)
  }

  function eqWithRender (t1, t2) {
    return t1.render === t2.render && eq(t1.args, t2.args)
  }
}


export function thunkDeepEqual (render) {
  return thunk(render, deepEqual)
}
