/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/change-password', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should apply new password (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '123456789',
        password: user.account.password
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/change-password' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-new-password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '',
        'confirm-password': 'new-password',
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password')
    })

    it('invalid-new-password-length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': 'new-password',
        'confirm-password': 'new-password',
        password: user.account.password
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-new-password-length')
    })

    it('invalid-confirm-password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '4567890123',
        password: user.account.password
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm-password')
    })

    it('invalid-password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '123456789',
        'confirm-password': '123456789',
        password: 'invalid'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })
  })
})
