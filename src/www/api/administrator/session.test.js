/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/session', () => {
  describe('exceptions', () => {
    describe('invalid-sessionid', () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/session')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })

      it('invalid querystring sessionid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/session?sessionid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-sessionid')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const session = await req.get()
      assert.strictEqual(session.sessionid, user.session.sessionid)
      assert.strictEqual(session.accountid, user.session.accountid)
    })
  })

  describe('redacts', () => {
    it('tokenHash', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      const session = await req.get()
      assert.strictEqual(session.tokenHash, undefined)
    })
  })
})
