/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/language', () => {
  describe('exceptions', () => {
    it('should require language enabled', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/language')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'language-preference-disabled')
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      global.enableLanguagePreference = true
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/language')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should change the language (screenshots)', async () => {
      global.enableLanguagePreference = true
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/language')
      req.account = user.account
      req.session = user.session
      req.body = {
        language: 'es'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/language' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
