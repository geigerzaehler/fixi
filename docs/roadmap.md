## Misc
* Engines should be optional dependencies. We should only ship with Preact.
* Write sensible tests for keyed thunks and components

## Documentation
* Create WebpackBin with minimal example
* Document thunk and raw API.

## Features
* Implement `reducer()` as core component constructor.
* Create PureScript bindings and provide example
* Add option to `getEventStream` for obtaining the raw event instead of the
  `data` property

## Performance
* The functions passed to a component’s “mount” functions hold references to the
  complete component implementation. We should fix this leak by introducing a
  “destroyable” function

## Maintenance
* Dev test runner should rerun only failed
* Extract all utilities into 'util' folder and reference third-party libs there

## Make React Engine work

* `this.base` is not available in a Component instance. So injected event
  streams for components don’t work. We probably need to use the special `ref`
  property.

* The tests don’t not work because React uses a scheduler to update components
  asynchronously. We need to dig into the source code to find out how to modify
  this.
