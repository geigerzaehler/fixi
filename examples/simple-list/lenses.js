import * as T from 'transducers-js'

export function map (fn) {
  return function (collection) {
    return collection.map(fn)
  }
}
export function get (key) {
  return function get (collection) {
    if (collection.get) {
      return collection.get(key)
    } else {
      return collection[key]
    }
  }
}

export function seq (...args) {
  let fns = args.reverse()
  return T.comp(...fns)
}

export function select (selected, fn) {
  fn = fn || id
  let filter = T.filter(({type}) => type === selected)
  let mapValue = T.map(({value}) => fn(value))
  return T.comp(filter, mapValue)
}

export function at (selected, fn) {
  return function ({type, value}) {
    if (type === selected) {
      return {type, value: fn(value)}
    } else {
      return {type, value}
    }
  }
}

export function atT (selected, fn) {
  return T.map(at(selected, fn))
}

export function atTT (selected, xf) {
  // let xf = T.compose(...xfs)
  return function (cont) {
    let t = xf({
      '@@transducer/init': function () {
        return cont['@@transducer/init']()
      },
      '@@transducer/step': function (result, value) {
        return cont['@@transducer/step'](result, {type: selected, value})
      },
      '@@transducer/result': function (result) {
        return cont['@@transducer/step'](result)
      }
    })

    return {
      '@@transducer/init': function () {
        return t['@@transducer/init']()
      },
      '@@transducer/step': function (result, x) {
        if (x.type === selected) {
          return t['@@transducer/step'](result, x.value)
        } else {
          return cont['@@transducer/step'](result, x)
        }
      },
      '@@transducer/result': function (result) {
        return t['@@transducer/step'](result)
      }
    }
  }
}

export function filterAt (selected, pred) {
  return function ({type, value}) {
    return type !== selected || pred(value)
  }
}

export function filterAtT (selected, pred) {
  return T.filter(filterAt(selected, pred))
}

export function push (value) {
  return function push (collection) {
    return collection.push(value)
  }
}

export function noop () {
  return function id (collection) {
    return collection;
  }
}

export function remove (i) {
  return function remove (collection) {
    return collection.remove(i)
  }
}

export function last () {
  return function last (collection) {
    return collection.last()
  }
}

export function toJS () {
  return function toJS (collection) {
    return collection.toJS()
  }
}

export function set (key) {
  return function (value) {
    return function (collection) {
      if (collection.set) {
        return collection.set(key, value)
      } else {
        collection[key] = value
        return collection
      }
    }
  }
}

export function modify (key, fn) {
  return function (collection) {
    let value = collection.get
                ? collection.get(key)
                : collection[key]

    if (collection.set) {
      return collection.set(key, fn(value))
    } else {
      collection[key] = fn(value)
      return collection
    }
  }
}

export function id (x) {
  return x
}
