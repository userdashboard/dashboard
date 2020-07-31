/* eslint-env mocha */
const TestHelper = require('../../../../test-helper.js')
const assert = require('assert')
const dashboard = require('../../../../index.js')

describe('/api/user/create-session', () => {
  describe('exceptions', () => {
    describe('invalid-username', () => {
      it('missing posted username', async () => {
        const req = TestHelper.createRequest('/api/user/create-session')
        req.body = {
          username: '',
          password: 'password'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username')
      })
    })

    describe('invalid-password', () => {
      it('missing posted password', async () => {
        const req = TestHelper.createRequest('/api/user/create-session')
        req.body = {
          username: 'username',
          password: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })
    })
  })

  describe('receives', () => {
    it('optional posted remember (hours|days)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'hours'
      }
      const session = await req.post()
      const hours = Math.ceil((session.expires - dashboard.Timestamp.now) / 60 / 60)
      assert.strictEqual(hours, 8)
      req.body = {
        username: user.account.username,
        password: user.account.password,
        remember: 'days'
      }
      const session2 = await req.post()
      const days = Math.ceil((session2.expires - dashboard.Timestamp.now) / 60 / 60 / 24)
      assert.strictEqual(days, 30)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/create-session')
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      req.filename = __filename
      req.saveResponse = true
      const session = await req.post()
      const minutes = Math.ceil((session.expires - dashboard.Timestamp.now) / 60)
      assert.strictEqual(minutes, 20)
    })
  })
})
