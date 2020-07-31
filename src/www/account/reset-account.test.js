/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/reset-account', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should reset session key', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        'new-password': 'my-new-password',
        'confirm-password': 'my-new-password',
        'secret-code': user.resetCode.code
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.account = administrator.account
      req2.session = administrator.session
      const account = await req2.get(req2)
      assert.notStrictEqual(account.resetCodeLastUsed, undefined)
      assert.notStrictEqual(account.resetCodeLastUsed, null)
      assert.notStrictEqual(account.sessionKeyLastReset, undefined)
      assert.notStrictEqual(account.sessionKeyLastReset, null)
    })

    it('should reset code last used', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        'new-password': 'my-new-password',
        'confirm-password': 'my-new-password',
        'secret-code': user.resetCode.code
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${user.account.accountid}`)
      req2.accout = administrator.account
      req2.session = administrator.session
      const account = await req2.get(req2)
      assert.notStrictEqual(account.resetCodeLastUsed, undefined)
      assert.notStrictEqual(account.resetCodeLastUsed, null)
    })

    it('should sign in (screenshots)', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        'new-password': 'my-new-password',
        'confirm-password': 'my-new-password',
        'secret-code': user.resetCode.code
      }
      req.filename = __filename
      req.screenshots = [
        { index: true },
        { click: '/account/signin' },
        { click: '/account/reset-account' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })
  })

  describe('errors', () => {
    it('invalid-username', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: '',
        'new-password': 'new-password',
        'confirm-password': 'new-password',
        'secret-code': 'reset-code'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('invalid-secret-code', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        'new-password': 'new-password',
        'confirm-password': 'new-password',
        'secret-code': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-secret-code')
    })

    it('invalid-new-password', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        'new-password': '',
        'confirm-password': 'new-password',
        'secret-code': 'reset-code'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password')
    })

    it('invalid-new-password-length', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        'new-password': '1',
        'confirm-password': '1',
        'secret-code': 'reset-code'
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password-length')
    })

    it('invalid-confirm-password', async () => {
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: 'username',
        'new-password': 'new-password',
        'confirm-password': '',
        'secret-code': 'reset-code'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm-password')
    })

    it('invalid-account', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      global.deleteDelay = -1
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/account/reset-account')
      req.body = {
        username: user.account.username,
        'new-password': 'my-new-password',
        'confirm-password': 'my-new-password',
        'secret-code': user.resetCode.code
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
    })
  })
})
