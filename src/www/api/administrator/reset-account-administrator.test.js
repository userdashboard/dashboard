/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/reset-account-administrator', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/reset-account-administrator')
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
        const req = TestHelper.createRequest('/api/administrator/reset-account-administrator?accountid=invalid')
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
      it('accessing account is not owner', async () => {
        const owner = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/reset-account-administrator?accountid=${user.account.accountid}`)
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

      it('querystring accountid is not administrator', async () => {
        const owner = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/reset-account-administrator?accountid=${user.account.accountid}`)
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

  describe('returns', () => {
    it('object', async () => {
      const owner = await TestHelper.createOwner()
      const administrator2 = await TestHelper.createAdministrator(owner)
      const req = TestHelper.createRequest(`/api/administrator/reset-account-administrator?accountid=${administrator2.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.filename = __filename
      req.saveResponse = true
      const accountNow = await req.patch()
      assert.strictEqual(accountNow.administrator, undefined)
    })
  })
})
