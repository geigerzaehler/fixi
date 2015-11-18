import * as K from 'kefir'

// TODO Check if this works with error
export default function fix (creator) {
  let stream_
  let stream = K.stream(function (emitter) {
    // TODO We might need schedule .emitEvent asynchronously
    // let listener = (ev) => emitter.emitEvent(ev)
    let listener = function (ev) {
      // console.log(ev)
      emitter.emitEvent(ev)
    }
    setImmediate(() => stream_.onAny(listener))
    return () => stream_.offAny(listener)
  }).delay(1)
  stream_ = creator(stream)
  if (!stream) {
    throw new Error('Functions passed to \'fix\' must return a stream')
  }
  if (stream_.getType() === 'property') {
    return stream.toProperty()
  } else {
    return stream
  }
}

function setImmediate (fn) {
  setTimeout(fn, 0)
}
