import {
  assert,
  sinon,
  describeEachEngine,
} from 'support'

import {h, ev} from 'fixi'

/**
 * Test if nodes constructed with 'Elements' are rendered correctly.
 *
 * Also makes some assertions on how patching happens, e.g. not replacing nodes
 * but updating the attributes
 */
describeEachEngine('VTree.Element', function () {

  it('renders object attributes', function (doc) {
    const attrs = {
      id: 'id',
      class: 'jo',
      title: 'title',
    }
    doc.paint(h('div', attrs))
    const el = doc.getElementById('id')

    for (const key in attrs) {
      assert.equal(el.getAttribute(key), attrs[key])
    }

    attrs.title = 'new title'
    attrs.class = 'new class'
    doc.paint(h('div', attrs))
    for (const key in attrs) {
      assert.equal(el.getAttribute(key), attrs[key])
    }
  })

  it('renders input value', function (doc) {
    doc.paint(h('input', {
      id: 'id',
      value: 'VAL',
    }))
    const el = doc.getElementById('id')

    doc.paint(h('input', {
      id: 'id',
      value: 'NEW VAL',
    }))
    assert.equal(el.value, 'NEW VAL')
  })

  it('attaches event listener', function (doc) {
    const onclick = sinon.spy()
    doc.paint(h('div', {
      id: 'id',
      click: ev(onclick),
    }))
    const el = doc.getElementById('id')
    el.click()
    assert.calledOnce(onclick)
  })

  it('patches deep', function (doc) {
    doc.paint(h('div', {id: 'a'}, [
      h('div', {}, [
        h('div', {id: 'target'}),
      ]),
    ]))
    const el = doc.getElementById('id')
    doc.paint(h('div', {id: 'b'}, [
      h('div', {}, [
        h('div', {id: 'target'}),
      ]),
    ]))
    assert.same(el, doc.getElementById('id'))
  })

  it('uses key to rearrange elements', function (doc) {
    doc.paint(h('div', [
      h('div', {id: 'a', key: 'a'}),
      h('div', {id: 'b', key: 'b'}),
    ]))

    const a = doc.getElementById('a')
    const b = doc.getElementById('b')

    doc.paint(h('div', [
      h('div', {id: 'b', key: 'b'}),
      h('div', {id: 'a', key: 'a'}),
    ]))

    assert.same(doc.getElementById('a'), a)
    assert.same(doc.getElementById('b'), b)
  })
})
