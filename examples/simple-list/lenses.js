export function get (key) {
  return function get (collection) {
    if (collection.get) {
      return collection.get(key)
    } else {
      return collection[key]
    }
  }
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
  return function toJS(collection) {
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
