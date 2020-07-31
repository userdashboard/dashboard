/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-reset-code', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/create-reset-code')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/create-reset-code?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-accountid', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-secret-code', () => {
      it('missing posted secret-code', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })
    })

    describe('invalid-secret-code-length', () => {
      it('posted secret code too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'secret-code': '1'
        }
        global.minimumResetCodeLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code-length')
      })

      it('posted secret code too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'secret-code': 'adsf'
        }
        global.maximumResetCodeLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code-length')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      req.body = {
        'secret-code': 'this-is-the-code'
      }
      const code = await req.post()
      assert.strictEqual(code.object, 'resetCode')
    })
  })
})
