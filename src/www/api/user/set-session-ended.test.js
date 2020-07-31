/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

/* eslint-env mocha */
describe('/api/user/set-session-ended', () => {
  describe('exceptions', () => {
    describe('invalid-sessionid', () => {
      it('missing querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-session-ended')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })

      it('invalid querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-session-ended?sessionid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })
    })

    describe('invalid-session', () => {
      it('querystring sessionid is not active session', async () => {
        const user = await TestHelper.createUser()
        const session1 = user.session
        await TestHelper.endSession(user)
        await TestHelper.createSession(user)
        const req = TestHelper.createRequest(`/api/user/set-session-ended?sessionid=${session1.sessionid}`)
        req.account = user.account
        req.session = user.session
        await req.patch()
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-session')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-session-ended?sessionid=${user2.session.sessionid}`)
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
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-session-ended?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const sessionNow = await req.patch()
      assert.strictEqual(sessionNow.object, 'session')
    })
  })
})
