/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/accounts', function () {
  const cachedResponses = {}
  const cachedAccounts = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createUser()
    cachedAccounts.push(administrator.account.accountid)
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const user = await TestHelper.createUser()
      cachedAccounts.unshift(user.account.accountid)
    }
    const req1 = TestHelper.createRequest('/api/administrator/accounts?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/accounts?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/accounts?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/accounts')
    req4.account = administrator.account
    req4.session = administrator.session
    req4.filename = __filename
    req4.saveResponse = true
    cachedResponses.returns = await req4.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req4.get()
  })
  describe('receives', () => {
    it('optional querystring offset (integer)', async () => {
      const offset = 1
      const accountsNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(accountsNow[i].accountid, cachedAccounts[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const accountsNow = cachedResponses.limit
      assert.strictEqual(accountsNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const accountsNow = cachedResponses.all
      assert.strictEqual(accountsNow.length, cachedAccounts.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const accountsNow = cachedResponses.returns
      assert.strictEqual(accountsNow.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('usernameHash', async () => {
      const accounts = cachedResponses.returns
      assert.strictEqual(accounts[0].usernameHash, undefined)
    })

    it('passwordHash', async () => {
      const accounts = cachedResponses.returns
      assert.strictEqual(accounts[0].passwordHash, undefined)
    })

    it('sessionKey', async () => {
      const accounts = cachedResponses.returns
      assert.strictEqual(accounts[0].sessionKey, undefined)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const accountsNow = cachedResponses.pageSize
      assert.strictEqual(accountsNow.length, global.pageSize)
    })
  })
})
