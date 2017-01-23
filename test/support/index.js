import sinon from 'sinon'
import * as assertLocal from './assert'
import {assert as assertChai} from 'chai'
import * as Doc from './document'
import * as nodeAssert from 'assert'


export {sinon}

export const assert = Object.assign(
  sinon.assert, assertChai, assertLocal,
  {fail: nodeAssert.fail}
)

export function describeEachEngine (desc, make) {
  describeEach(desc, {
    'for Preact': Doc.forPreact,
    'for virtual-dom': Doc.forVDom,
  }, function () {
    afterEach(function (doc) {
      doc.destroy()
    })

    make()
  })
}
