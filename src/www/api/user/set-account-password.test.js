/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/set-account-password', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-password')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-password?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-password', () => {
      it('missing posted password', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-password': '1234567890',
          password: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })

      it('invalid posted password', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-password': '1234567890',
          password: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })
    })

    describe('invalid-new-password', () => {
      it('missing posted new-password', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-password': '',
          password: '1234567890'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-password')
      })
    })

    describe('invalid-new-password-length', () => {
      it('posted new-password too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-password': '1',
          password: user.account.password
        }
        global.minimumPasswordLength = 100
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-password-length')
      })

      it('posted new-password too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-password': '12345678',
          password: user.account.password
        }
        global.maximumPasswordLength = 1
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-password-length')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-password?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-password': '1234567890',
        password: user.account.password
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.patch()
      assert.strictEqual(account.object, 'account')
    })
  })
})
