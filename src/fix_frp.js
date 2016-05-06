import * as K from 'kefir'

/**
 * Create the stream or property fixpoint for a function.
 *
 * For `s = fix(f)`, the stream `s` will satisfy `s = f(s)`.
 */
// TODO Check if this works with error
export default function fix (creator) {
  let stream_
  let stream = K.stream(function (emitter) {
    if (!stream_) {
      throw new Error('Cannot subscribe to stream in fix()')
    }
    stream_.onAny(listener)
    return () => stream_.offAny(listener)

    function listener (ev) {
      emitter.emitEvent(ev)
    }
  })

  stream_ = creator(stream)

  if (!stream_) {
    throw new Error('Functions passed to \'fix()\' must return a stream')
  }

  if (stream_.getType() === 'property') {
    return stream.toProperty()
  } else {
    return stream
  }
}
