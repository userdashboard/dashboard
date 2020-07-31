/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/sessions', function () {
  const cachedResponses = {}
  const cachedSessions = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const administrator = await TestHelper.createOwner()
    cachedSessions.unshift(administrator.session.sessionid)
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const user = await TestHelper.createUser()
      cachedSessions.unshift(user.session.sessionid)
    }
    const req1 = TestHelper.createRequest('/api/administrator/sessions?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/sessions?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/sessions?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/administrator/sessions?accountid=${administrator.account.accountid}`)
    req4.account = administrator.account
    req4.session = administrator.session
    cachedResponses.accountid = await req4.get()
    const req5 = TestHelper.createRequest('/api/administrator/sessions')
    req5.account = administrator.account
    req5.session = administrator.session
    req5.filename = __filename
    req5.saveResponse = true
    cachedResponses.returns = await req5.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req5.get()
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

    it('optional querystring accountid (string)', async () => {
      const sessionsNow = cachedResponses.accountid
      assert.strictEqual(sessionsNow.length, 1)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const sessions = cachedResponses.returns
      assert.strictEqual(sessions.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('tokenHash', async () => {
      const sessions = cachedResponses.returns
      assert.strictEqual(undefined, sessions[0].tokenHash)
      assert.strictEqual(undefined, sessions[1].tokenHash)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const profilesNow = cachedResponses.pageSize
      assert.strictEqual(profilesNow.length, global.pageSize)
    })
  })
})
