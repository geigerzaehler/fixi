import logger from 'debug'

export let log = logger('fixi')

export function shallowEq (as, bs) {
  if (as.length !== bs.length) {
    return false
  }

  for (const i in as) {
    if (as[i] !== bs[i]) {
      return false
    }
  }

  return true
}
