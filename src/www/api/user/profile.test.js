/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/profile', () => {
  describe('exceptions', () => {
    describe('invalid-profileid', () => {
      it('missing querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/profile')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-profileid')
      })

      it('invalid querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/profile?profileid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-profileid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible querystring profileid', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/profile?profileid=${user2.account.profileid}`)
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
      const req = TestHelper.createRequest(`/api/user/profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const profile = await req.get()
      assert.strictEqual(profile.object, 'profile')
    })
  })
})
