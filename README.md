# Fixi

## API

~~~js
import * as fixi from 'fixi'
~~~

### `fixi.fix`

Create the stream or property fix point for a function. For `s = fix(f)`, the
stream `s` will satisfy `s = f(s)`.

For example
~~~js
let s = fixi.fix((stream) => {
  return stream
    .delay(10)
    .take(4)
    .toProperty(() => null)
})
let values = runStream(s)
assert.equal(values, [null, null, null, null])
~~~

One can iterativley compute the fixed point by setting
~~~
let s1 = f(K.never())
let s2 = f(s1)
// ...
~~~

The fix point will then be the limit of this sequence. (It will, in fact, be the
least fix point.)

#### Decoupling

The function `f` must return a stream that is decoupled from the input stream.
For example, the function
~~~js
let f = (stream) => {
  return stream
    .map((x) => x + 1)
    .toProperty(() => 0)
}
~~~
does not have a fix point.

However, one can delay a stream
~~~js
let s = fixi.fix((stream) => {
  return stream
    .delay()
    .map((x) => x + 1)
    .toProperty(() => 0)
})
~~~
This will produce the sequence `0, 1, 2, ...` and emit one value on every tick.


### `fix.ev`

~~~js
let n = ho('div', {click: ev(() => 'hey')})
n.stream.onValue((x) => {
  console.log('clicked element', x)
})
~~~
