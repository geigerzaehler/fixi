import * as K from 'kefir'

export default function fix (creator) {
  let stream_
  let stream = K.stream(function (emitter) {
    let listener = (ev) => emitter.emitEvent(ev)
    setImmediate(() => stream_.onAny(listener))
    return () => stream_.offAny(listener)
  })
  stream_ =  creator(stream)
  return stream
}

function setImmediate (fn) {
  setTimeout(fn, 0)
}
