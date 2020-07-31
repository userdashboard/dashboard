/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/administrator-accounts-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const owner = await TestHelper.createOwner()
      await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest('/api/administrator/administrator-accounts-count')
      req.account = owner.account
      req.session = owner.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize)
    })
  })
})
