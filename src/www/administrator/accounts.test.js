/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/accounts', function () {
  const cachedResponses = {}
  const cachedAccounts = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    cachedAccounts.unshift(administrator.account.accountid)
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const user = await TestHelper.createUser()
      cachedAccounts.unshift(user.account.accountid)
    }
    const req1 = TestHelper.createRequest('/administrator/accounts')
    req1.account = administrator.account
    req1.session = administrator.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator' },
      { click: '/administrator/accounts' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/administrator/accounts?offset=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.offset = await req2.get()
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.accounts.length, global.pageSize)
      assert.strictEqual(data.accounts[0].accountid, cachedAccounts[0])
      assert.strictEqual(data.accounts[1].accountid, cachedAccounts[1])
    })
  })

  describe('view', () => {
    it('should present the accounts table (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('accounts-table')
      const row1 = table.getElementById(cachedAccounts[0])
      const row2 = table.getElementById(cachedAccounts[1])
      assert.strictEqual(row1.tag, 'tr')
      assert.strictEqual(row2.tag, 'tr')
    })

    it('should return one page', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('accounts-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('accounts-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      global.delayDiskWrites = true
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedAccounts[offset + i]).tag, 'tr')
      }
    })
  })
})
