/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/session', () => {
  describe('exceptions', () => {
    describe('invalid-sessionid', () => {
      it('missing querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/session')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })

      it('invalid querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/session?sessionid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring sessionid', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/session?sessionid=${user2.session.sessionid}`)
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
      const req = TestHelper.createRequest(`/api/user/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const session = await req.get()
      assert.strictEqual(session.object, 'session')
    })
  })

  describe('redacts', () => {
    it('tokenHash', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const session = await req.get()
      assert.strictEqual(session.tokenHash, undefined)
    })
  })
})
