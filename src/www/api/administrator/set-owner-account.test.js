/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/set-owner-account', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/set-owner-account')
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
        const req = TestHelper.createRequest('/api/administrator/set-owner-account?accountid=invalid')
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
      it('ineligible accessing account', async () => {
        const owner = await TestHelper.createOwner()
        const administrator = await TestHelper.createAdministrator(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
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

      it('ineligible querystring account is already owner', async () => {
        const owner = await TestHelper.createOwner()
        const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${owner.account.accountid}`)
        req.account = owner.account
        req.session = owner.session
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

  describe('requires', () => {
    it('accessing account is owner', async () => {
      const owner = await TestHelper.createOwner()
      const administrator = await TestHelper.createAdministrator(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
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

    it('querystring account is not owner', async () => {
      const owner = await TestHelper.createOwner()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      let errorMessage
      try {
        await req.patch(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-account')
    })

    it('querystring account is not deleted', async () => {
      const owner = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
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
      const owner = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/set-owner-account?accountid=${user.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.filename = __filename
      req.saveResponse = true
      const accountNow = await req.patch()
      assert.notStrictEqual(accountNow.owner, undefined)
      assert.notStrictEqual(accountNow.owner, null)
      const req2 = TestHelper.createRequest(`/api/administrator/account?accountid=${owner.account.accountid}`)
      req2.account = req.account
      req2.session = req.session
      const ownerAccountNow = await req2.get()
      assert.strictEqual(ownerAccountNow.owner, undefined)
    })
  })
})
