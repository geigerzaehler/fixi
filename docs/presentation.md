## Goals

### Architecture

* Functional. OO is the root of all evil
  Not going to expand on this
* Minimal API. Only a handful of primitives should be available
  This does not mean the library should not export some convenience functions.
  But these functions should be built from the core primitives.
* Library, not a framework
* Easily typeable
  If you are using a typed language it should be possible to port the framework
  so that type errors help find problems.

### Features

## What’s Wrong With React?

* No first-class support for streams and events
* Functional components not functions. Not general enough
* Mixes state handling
* Classes


## API

First simple example

    import {create, h} from 'fixi'

    const tree = h('div', {}, [
      h('h1', {
        style: 'color: red'
      }, ['Hello World!'])
    ])

    document.appendChild(create(tree))


API is simple

    create: Tree a -> DOM.Element

    h : String -> Attributes -> Children -> Tree a


Modularizing with functions

    const tree = h('div', {}, [
      greeting('Alice')
    ])

    function greeting (name) {
      h('h1', {
        style: 'color: red'
      }, [`Hello ${name}!`])
    }

Thunks and memoization

    import {thunk} from 'fixi'

    const greeting = thunk((name, color) => {
      console.log('build')
      h('h1', {
        style: `color: ${color}`
      }, [`Hello ${name}!`])
    })

    const tree = h('div', {}, [
      greeting('Alice', 'red')
    ])

Only logs `build` when `tree` is rendered in DOM.

In React first approach would work but we would need to do the following

    const tree = h('div', {}, [
      h(greeting, {name: 'Alice', color: 'red'})
    ])

This makes derivations much easier

    const greetAlice = greeting.bind(null, 'Alice')

    const greetAliceReact = ({color}) => {
      return greetReact({
        name: 'Alice',
        color: color
      })
    }
