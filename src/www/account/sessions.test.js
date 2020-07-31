/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/sessions', function () {
  const cachedResponses = {}
  const cachedSessions = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const user = await TestHelper.createUser()
    cachedSessions.push(user.session.sessionid)
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      await TestHelper.createSession(user)
      cachedSessions.unshift(user.session.sessionid)
    }
    const req1 = TestHelper.createRequest(`/account/sessions?accountid=${user.account.accountid}`)
    req1.account = user.account
    req1.session = user.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account' },
      { click: '/account/sessions' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest(`/account/sessions?accountid=${user.account.accountid}&offset=1`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.sessions.length, global.pageSize)
      assert.strictEqual(data.sessions[0].sessionid, cachedSessions[0])
    })

    it('should exclude ended sessions', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/signout')
      req.account = user.account
      req.session = user.session
      await req.get()
      const endedSession = user.session.sessionid
      await TestHelper.createSession(user)
      const req2 = TestHelper.createRequest(`/account/sessions?accountid=${user.account.accountid}`)
      req2.account = user.account
      req2.session = user.session
      await req2.route.api.before(req2)
      for (const session of req2.data.sessions) {
        assert.notStrictEqual(session.sessionid, endedSession.sessionid)
      }
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('sessions-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedSessions[offset + i]).tag, 'tr')
      }
    })
  })
})
