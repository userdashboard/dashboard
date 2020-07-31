/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account', () => {
  describe('view', () => {
    it('should return page (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.notStrictEqual(doc, undefined)
      assert.notStrictEqual(doc, null)
      const accountPreferences = doc.getElementById('account-preferences-container')
      assert.strictEqual(accountPreferences, undefined)
    })

    it('should not link to account preferences', async () => {
      global.enableLanguagePreference = false
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const accountPreferences = doc.getElementById('account-preferences-container')
      assert.strictEqual(accountPreferences, undefined)
    })

    it('should link to account preferences', async () => {
      global.enableLanguagePreference = true
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account')
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const accountPreferences = doc.getElementById('language-preference-container')
      assert.strictEqual(accountPreferences.tag, 'div')
    })
  })
})
