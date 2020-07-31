/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/delete-account-complete', () => {
  describe('view', () => {
    it('should present 3 days remaining message', async () => {
      global.deleteDelay = 3
      await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const duration = doc.getElementById('scheduled-delete')
      assert.strictEqual(duration.tag, 'div')
    })

    it('should present 7 days remaining message', async () => {
      global.deleteDelay = 7
      await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const duration = doc.getElementById('scheduled-delete')
      assert.strictEqual(duration.tag, 'div')
    })

    it('should present instant deletion message', async () => {
      global.deleteDelay = 0
      await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const duration = doc.getElementById('instant-delete')
      assert.strictEqual(duration.tag, 'div')
    })

    it('should present instant delete message (screenshots)', async () => {
      global.deleteDelay = 0
      await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/delete-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/delete-account' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const instant = doc.getElementById('instant-delete')
      assert.strictEqual(instant.tag, 'div')
    })
  })
})
