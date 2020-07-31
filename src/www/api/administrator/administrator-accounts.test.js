/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/administrator-accounts', function () {
  const cachedResponses = {}
  const cachedAccounts = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const owner = await TestHelper.createOwner()
    cachedAccounts.push(owner.account.accountid)
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const administrator = await TestHelper.createAdministrator(owner)
      cachedAccounts.unshift(administrator.account.accountid)
    }
    const req1 = TestHelper.createRequest('/api/administrator/administrator-accounts?offset=1')
    req1.account = owner.account
    req1.session = owner.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/administrator-accounts?limit=1')
    req2.account = owner.account
    req2.session = owner.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/administrator-accounts?all=true')
    req3.account = owner.account
    req3.session = owner.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest('/api/administrator/administrator-accounts')
    req4.account = owner.account
    req4.session = owner.session
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
      const administrators = cachedResponses.returns
      assert.strictEqual(administrators.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('usernameHash', async () => {
      const administrators = cachedResponses.returns
      assert.strictEqual(undefined, administrators[0].usernameHash)
    })

    it('passwordHash', async () => {
      const administrators = cachedResponses.returns
      assert.strictEqual(undefined, administrators[0].passwordHash)
    })

    it('sessionKey', async () => {
      const administrators = cachedResponses.returns
      assert.strictEqual(undefined, administrators[0].sessionKey)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const administrators = cachedResponses.pageSize
      assert.strictEqual(administrators.length, global.pageSize)
    })
  })
})
