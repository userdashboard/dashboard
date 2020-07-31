/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/restore-account', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should unset account deleted (screenshots)', async () => {
      global.deleteDelay = 1
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      req.filename = __filename
      req.screenshots = [
        { click: '/account/signin' },
        { click: '/account/restore-account' },
        { fill: '#submit-form' }
      ]
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get()
      assert.strictEqual(account.deleted, undefined)
    })
  })

  describe('errors', () => {
    it('invalid-username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('invalid-password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/restore-account')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('invalid-account', async () => {
      global.deleteDelay = -1
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/restore-account')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
    })
  })
})
