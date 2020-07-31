/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/reset-code', () => {
  describe('exceptions', () => {
    describe('invalid-reset-codeid', () => {
      it('missing querystring codeid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/reset-code')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-codeid')
      })

      it('invalid querystring codeid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/reset-code?codeid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-codeid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = administrator.account
      req.session = administrator.session
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
    })
  })

  describe('redacts', () => {
    it('secretCodeHash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/administrator/reset-code?codeid=${user.resetCode.codeid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const codeNow = await req.get()
      assert.strictEqual(codeNow.accountid, user.account.accountid)
      assert.strictEqual(undefined, codeNow.secretCodeHash)
    })
  })
})
