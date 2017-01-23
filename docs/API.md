API Documentation
=================

The Fixi API consists of three parts.

* Building static virtual nodes using the `h()` function and property helpers
* Creating stateful components and special purpose nodes like thunks and raw
  elements.
* A function to render virtual node into the DOM


Static Markup
-------------

Static virtual nodes are created through the `h` function.

~~~js
import {h} from 'fixi'

h(tag, properties?, children?)
~~~

* `tag` is a string specifying the HTML element tag
* `properties` is an object mapping property names to values.
* `children` is a mixed array of nodes, strings, and falsy values.

### Properties

A property object maps keys to property values. A property value is either a
string or a value returned by a special property constructor (see below for
examples).

String values are applied to an element by setting an attribute for the key
value pair. Property values created with property constructors use custom logic
to attach themselves.

### Event listeners

Event listeners can be attached to elements using the `ev()` property
constructor.

~~~js
import {h, ev} from 'fixi'

h('input', {
  click: ev((e) => console.log(ev.target.value))
})
~~~

The property key specifies the event name and is the first argument to
`.addEventListener`. The `ev()` constructor takes the listener function as an
argument.


### Element styles

Element styles can be applied using the `style()` property constructor.

~~~js
import {h, style} from 'fixi'

h('div', {
  style: style({color: 'red'})
}, ['Hello'])
~~~


Components
----------

Components allow you to create stateful DOM trees.

All component constructors are convenience functions implemented on top of
`Component.primitive()`

~~~js
import * as Component from 'fixi/component'
// or
import {Component} from 'fixi'
~~~

### `Component.primitive(mount)`

The argument has the signature `mount(paint, getEventStream, emit): unmount`. It
is run whenever the component is injected into the DOM and returns a cleanup
function to be called when the component is removed from the DOM.

All three arguments to `mount` are functions

* `paint(node, renderedCb)`  If called replaces the current DOM tree with the
  node passed. The `renderedCb` callback will be called with the actual DOM node
  after the new tree has been painted.
* `getEventStream(name)` returns a Kefir stream that emits DOM events captured
  on the root of the component. The stream ends when the component is unmounted.
* `emit(ev)` dispatches a DOM event on the root of the component tree


### `Component.stateful(render, initial)` <a name="Component.stateful">

Create a component that builds a tree from a state value and can update the state
with a callback.

~~~js
const counter = Component.simple((value, update) => {
  return h('div', [
    h('span', [`Clicked ${value} times`]),
    h('buttons',
      {click: ev(() => update(value + 1))},
      ['Click me']
    ),
  ], 0)
})
~~~

The first parameter `render(state, update)` is a function that accepts the state
of the component and the `update` callback as parameters. The second parameter
is the state to call `render` with initially.

Whenever `update(value)` is called the component is rerendered with the given
state.


### `Component.fromProperty(prop, render)` <a name="Component.fromProperty">

Create a component that changes whenever the value of [Kefir][] Property
changes.

~~~js
const clock = Component.fromProperty(time$, (time) => {
  return h('div', [
    `The current time is: ${time.toISOString()}`
  ])
})
~~~

If the `render` argument is omitted the identify function is used. This means
that the property must emit VTrees as values.

The interface required for `prop` is simple. It is just one method
`#toESObservable()` that returns an [ES Observable][].


Thunks
------

TODO


[Kefir]: https://rpominov.github.io/kefir
[ES Observable]: https://github.com/tc39/proposal-observable
