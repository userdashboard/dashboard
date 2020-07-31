/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/sessions', function () {
  const cachedResponses = {}
  const cachedSessions = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const user = await TestHelper.createUser()
    cachedSessions.unshift(user.session.sessionid)
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      await TestHelper.createSession(user)
      cachedSessions.unshift(user.session.sessionid)
    }
    const req1 = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&offset=1`)
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&limit=1`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}&all=true`)
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/user/sessions?accountid=${user.account.accountid}`)
    req4.account = user.account
    req4.session = user.session
    req4.filename = __filename
    req4.saveResponse = true
    cachedResponses.returns = await req4.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req4.get()
  })
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/sessions')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/sessions?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/sessions?accountid=${user2.account.accountid}`)
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

  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const sessionsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(sessionsNow[i].sessionid, cachedSessions[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const sessionsNow = cachedResponses.limit
      assert.strictEqual(sessionsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const sessionsNow = cachedResponses.all
      assert.strictEqual(sessionsNow.length, cachedSessions.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const sessions = cachedResponses.returns
      assert.strictEqual(sessions.length, global.pageSize)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const sessionsNow = cachedResponses.pageSize
      assert.strictEqual(sessionsNow.length, global.pageSize)
    })
  })
})
