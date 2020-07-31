/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-account-deleted', () => {
  describe('exceptions', () => {
    describe('invalid-username', () => {
      it('missing posted username', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest('/api/user/reset-account-deleted')
        req.body = {
          username: '',
          password: 'password'
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
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest('/api/user/reset-account-deleted')
        req.body = {
          username: 'invalid',
          password: 'password'
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
      it('missing posted password', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest('/api/user/reset-account-deleted')
        req.body = {
          username: 'username',
          password: ''
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })

      it('invalid posted password', async () => {
        const user = await TestHelper.createUser()
        await TestHelper.setDeleted(user)
        const req = TestHelper.createRequest('/api/user/reset-account-deleted')
        req.body = {
          username: user.account.username,
          password: 'invalid'
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

    describe('invalid-account', () => {
      it('credentialed account is not scheduled for deletion', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/reset-account-deleted')
        req.account = user.account
        req.session = user.session
        req.body = {
          username: user.account.username,
          password: user.account.password
        }
        let errorMessage
        try {
          await req.patch()
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
      await TestHelper.setDeleted(user)
      const req = TestHelper.createRequest('/api/user/reset-account-deleted')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      req.filename = __filename
      req.saveResponse = true
      const accountNow = await req.patch()
      assert.strictEqual(undefined, accountNow.deleted)
    })
  })
})
