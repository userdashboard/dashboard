/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/set-account-deleted', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-deleted')
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
        const req = TestHelper.createRequest('/api/user/set-account-deleted?accountid=invalid')
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
        const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user2.account.accountid}`)
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
        const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
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
        const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
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
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.patch()
      assert.strictEqual(account.object, 'account')
    })
  })

  describe('configuration', () => {
    it('environment DELETE_DELAY', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        password: user.account.password
      }
      global.deleteDelay = 3
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.floor((accountNow.deleted - now) / 60 / 60 / 24)
      const days2 = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days === 3 || days2 === 3, true)
    })
  })
})
