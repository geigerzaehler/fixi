import sinon from 'sinon'
import * as JSDom from 'jsdom'

import vdomEngine from 'fixi/engines/virtual-dom'
import * as Preact from 'fixi/engines/preact'
import initSnabbdom from 'fixi/engines/snabbdom'

import {h} from 'fixi'
import * as C from 'fixi/component'

/**
 * This module exports document factories for the different engines.
 */

export function forVDom () {
  const doc = createDocument()

  // TODO use default import
  const create = vdomEngine({
    document: doc,
    raf: sinon.stub().yields(),
  })

  Object.assign(doc, {
    engine: 'virtual-dom',
    destroy () {},
    paint: makeMountPoint(doc.body, create),
  })

  return doc
}

export function forPreact () {
  const doc = createDocument()

  Preact.setOptions({
    document: doc,
    raf: sinon.stub().yields(),
  })

  const unexpose = expose(global, {
    document: doc,
    SVGElement: function () {},
    Element: doc.defaultView.Element,
    Text: doc.defaultView.Text,
  })

  Object.assign(doc, {
    engine: 'preact',

    destroy () {
      unexpose()
    },

    paint: makeMountPoint(doc.body, Preact.create),
  })


  return doc
}

// TODO use this
export function forSnabbdom () {
  const doc = createDocument()

  const create = initSnabbdom(doc)


  const unexpose = expose(global, {
    document: doc,
    SVGElement: function () {},
    Element: doc.defaultView.Element,
    Text: doc.defaultView.Text,
  })

  Object.assign(doc, {
    destroy () {
      unexpose()
    },

    paint: makeMountPoint(doc.body, create),
  })

  return doc
}


function createDocument () {
  const virtualConsole = JSDom.createVirtualConsole()
  virtualConsole.on('jsdomError', function (error) {
    throw error.detail
  })

  return JSDom.jsdom(undefined, {
    virtualConsole,
  })
}


function makeMountPoint (parent, create) {
  let innerPaint
  const c = C.primitive((p) => {
    innerPaint = p
    innerPaint(h('noscript'))
  })
  const el = create(c)
  parent.appendChild(el)
  return function paint (node) {
    if (innerPaint) {
      innerPaint(node)
    }
  }
}


function expose (global, api) {
  for (const k in api) {
    global[k] = api[k]
  }

  return function dispose () {
    for (const k in api) {
      delete global[k]
    }
  }
}
