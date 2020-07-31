/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/signout-complete', () => {
  describe('view', () => {
    it('should sign out (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signout')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/signout' }
      ]
      const result = await req.get()
      assert.strictEqual(result.redirect, '/account/signout-complete')
    })
  })
})
