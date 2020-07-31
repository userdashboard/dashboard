/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/delete-reset-code', () => {
  describe('exceptions', () => {
    describe('invalid-reset-codeid', () => {
      it('missing querystring codeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/delete-reset-code')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-codeid')
      })

      it('invalid querystring codeid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/delete-reset-code?codeid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-codeid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring codeid', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        await TestHelper.createResetCode(user2)
        const req = TestHelper.createRequest(`/api/user/delete-reset-code?codeid=${user2.resetCode.codeid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.delete()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest(`/api/user/delete-reset-code?codeid=${user.resetCode.codeid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const deleted = await req.delete()
      assert.strictEqual(deleted, true)
    })
  })
})
