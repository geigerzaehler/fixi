# Fixi

[![Build Status](https://travis-ci.org/geigerzaehler/fixi.svg?branch=master)](https://travis-ci.org/geigerzaehler/fixi)

_A modular, functional library for building UI components for the DOM_

~~~js
import {renderInto, h, ev, Component} from 'fixi'

const app = Component.stateful(render, 0)

function render (count, update) {
  return h('button', {
    click: ev(() => update(count + 1))
  }, [
    `Clicked ${count} times`
  ])
}

renderInto(app, document.body)
~~~

[&gt; API Documentation](./docs/API.md)
