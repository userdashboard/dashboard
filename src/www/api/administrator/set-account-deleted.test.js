/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/set-account-deleted', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/set-account-deleted')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/set-account-deleted?accountid=invalid')
        req.account = administrator.account
        req.session = administrator.session
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
      it('ineligible querystring account is already deleted', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('invalid-account', () => {
    it('querystring accountid is deleted', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      global.deleteDelay = 1
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.floor((accountNow.deleted - now) / 60 / 60 / 24)
      const days2 = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days === 1 || days2 === 1, true)
    })
  })

  describe('configuration', () => {
    it('environment DELETE_DELAY', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-account-deleted?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      global.deleteDelay = 7
      const accountNow = await req.patch()
      const now = Math.floor(new Date().getTime() / 1000)
      const days = Math.floor((accountNow.deleted - now) / 60 / 60 / 24)
      const days2 = Math.ceil((accountNow.deleted - now) / 60 / 60 / 24)
      assert.strictEqual(days === 7 || days2 === 7, true)
    })
  })
})
