* We could have a default event name that components listen to and event
  delegators trigger. This would allow for the `Html a` typing where `a` is the
  type of the event data we are emitting.

* Combinator to create a component-sink pair.
  ~~~
  {tree, render} = makePair()
  create(tree)
  // render into created element
  paint(h('div', {}, ['Hello world']))
  ~~~

* It should be possible to run some (P)React acceptance tests against fixi

* Write an engine that renders the VTree to a string. It should be possible to
  specify how the engine should handle components. Either render the initial
  state once or throw an error.

* We should write tests for the examples. This would allow us to toy with a
  simple DOM testing framework

* It should be possible to come up with an efficient memoization strategy to
  make DOM patching faster. We could compute `hash(vtree)` recursively using a
  fast CRC checksum and use this as a key. We could also use ids generated with
  a 'WeakMap' for keys.

## Motivate Component Events

Components can propagate changes through the outside via callbacks.

Consider for example as custom `UI` library that exports a `button` component.
We want to handle clicks to that button without knowing the internals of the
implementation. To achieve this we pass a callback to the component constructor.

~~~js
function app () {
  const handleClick = () => console.log('click!')

  return h('div', [
    UI.button(handleClick)
  ])
}
~~~

TODO come up with a good use case where events are useful

Context menus? Stateful links? No global state, no passing down

We should make listening easy. By default we should listen to a hard-coded
`__fixi__` event. Listening to DOM events like click should be the exception

Events are kind of equivalent to passed callbacks. Both communicate changes from
a ancestor component back to a containing component.

If the communication interface is determined by the parent use events. This is
the case if for there is one implementation of the parent but multiple
different implementations of the children that use the parent interface. An
example is a dialog service

If the communication interface is determined by the ancestor component use
callbacks. This is the case if a specific component is used by different
container components. An example is a button with a click callback.


## Universal hyperscript

* Write react style hyperscript and convert it to VTree. This `h` should
  be able to handle React components
* Interpret VTree data as React hyperscript. This is basically an engine
