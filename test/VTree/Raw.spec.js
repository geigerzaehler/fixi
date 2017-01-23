import {
  assert,
  sinon,
  describeEachEngine,
} from 'support'

import {h} from 'fixi'
import {Tree} from 'fixi/vtree'

describeEachEngine('VTree.Raw', function () {
  test('raw dom element', function (doc) {
    const el1 = doc.createElement('div')
    el1.setAttribute('id', 'target-1')
    const destroy1 = sinon.spy()
    const create1 = sinon.spy(() => {
      return {node: el1, destroy: destroy1}
    })
    const c1 = Tree.Raw(create1)
    doc.paint(c1)
    assert.same(doc.getElementById('target-1'), el1)

    // Render component again should not recreate
    doc.paint(c1)
    assert.calledOnce(create1)

    // Replace with other raw element
    const el2 = doc.createElement('div')
    el2.setAttribute('id', 'target-2')
    const destroy2 = sinon.spy()
    const c2 = Tree.Raw(() => {
      return {node: el2, destroy: destroy2}
    })
    doc.paint(c2)
    assert.calledOnce(destroy1)
    assert.same(doc.getElementById('target-2'), el2)

    // Replace with other element
    doc.paint(h('div', []))
    assert.calledOnce(destroy2)
  })
})
