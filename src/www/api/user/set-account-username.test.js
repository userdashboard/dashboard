/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/set-account-username', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-username')
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
        const req = TestHelper.createRequest('/api/user/set-account-username?accountid=invalid')
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
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user2.account.accountid}`)
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
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-username': '1234567890',
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
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-username': '1234567890',
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

    describe('invalid-new-username', () => {
      it('missing posted new-username', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-username': '',
          password: '1234567890'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-username')
      })
    })

    describe('invalid-new-username-length', () => {
      it('posted new-username too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-username': '1',
          password: user.account.password
        }
        global.minimumUsernameLength = 100
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-username-length')
      })

      it('posted new-username too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'new-username': '12345678',
          password: user.account.password
        }
        global.maximumUsernameLength = 1
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-new-username-length')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-username?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'new-username': 'a1234567890',
        password: user.account.password
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.patch()
      assert.strictEqual(account.object, 'account')
    })
  })
})
