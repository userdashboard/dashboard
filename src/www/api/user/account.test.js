/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/account', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/account')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/account?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
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
        const req = TestHelper.createRequest(`/api/user/account?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const account = await req.get()
      assert.strictEqual(account.accountid, user.account.accountid)
    })
  })

  describe('redacts', () => {
    it('usernameHash', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.get()
      assert.strictEqual(undefined, account.usernameHash)
    })

    it('passwordHash', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.get()
      assert.strictEqual(undefined, account.passwordHash)
    })

    it('sessionKey', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/account?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const account = await req.get()
      assert.strictEqual(undefined, account.sessionKey)
    })
  })
})
