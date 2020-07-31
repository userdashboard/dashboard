/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-account-password', () => {
  describe('exceptions', () => {
    describe('invalid-username', () => {
      it('missing posted username', async () => {
        const req = TestHelper.createRequest('/api/user/reset-account-password')
        req.body = {
          username: '',
          'new-password': 'password',
          'secret-code': 'code'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username')
      })

      it('invalid posted username', async () => {
        const req = TestHelper.createRequest('/api/user/reset-account-password')
        req.body = {
          username: 'invalid',
          'new-password': 'password',
          'secret-code': 'code'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username')
      })
    })

    describe('invalid-password', () => {
      it('missing posted new-password', async () => {
        const req = TestHelper.createRequest('/api/user/reset-account-password')
        req.body = {
          username: 'username',
          'new-password': '',
          'secret-code': 'code'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })
    })

    describe('invalid-secret-code', () => {
      it('missing posted secret-code', async () => {
        const req = TestHelper.createRequest('/api/user/reset-account-password')
        req.body = {
          username: 'username',
          'new-password': 'password'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })
    })

    describe('invalid-reset-code', () => {
      it('invalid posted secret-code', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/reset-account-password')
        req.body = {
          username: user.account.username,
          'new-password': 'password',
          'secret-code': 'invalid'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-reset-code')
      })
    })
  })

  describe('returns', () => {
    it('boolean', async () => {
      const user = await TestHelper.createUser()
      const code = await TestHelper.createResetCode(user)
      const req = TestHelper.createRequest('/api/user/reset-account-password')
      req.body = {
        username: user.account.username,
        'new-password': 'new-password',
        'secret-code': code.code
      }
      req.filename = __filename
      req.saveResponse = true
      const resetPassword = await req.patch()
      assert.strictEqual(resetPassword, true)
    })
  })
})
