/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator', () => {
  describe('view', () => {
    it('should return page (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/administrator')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.notStrictEqual(doc, undefined)
      assert.notStrictEqual(doc, null)
    })
  })
})
