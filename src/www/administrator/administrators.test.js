/* eslint-env mocha */
const TestHelper = require('../../../test-helper.js')
const assert = require('assert')

describe('/administrator/administrators', function () {
  const cachedResponses = {}
  const cachedAccounts = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const owner = await TestHelper.createOwner()
    cachedAccounts.unshift(owner.account.accountid)
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const administrator = await TestHelper.createAdministrator(owner)
      cachedAccounts.unshift(administrator.account.accountid)
    }
    const req1 = TestHelper.createRequest('/administrator/administrators')
    req1.account = owner.account
    req1.session = owner.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator' },
      { click: '/administrator/administrators' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/administrator/administrators?offset=1')
    req2.account = owner.account
    req2.session = owner.session
    cachedResponses.offset = await req2.get()
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.administrators.length, global.pageSize)
      assert.strictEqual(data.administrators[0].accountid, cachedAccounts[0])
      assert.strictEqual(data.administrators[1].accountid, cachedAccounts[1])
    })
  })

  describe('view', () => {
    it('should present the administrators table (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const row = doc.getElementById(cachedAccounts[0])
      assert.strictEqual(row.tag, 'tr')
    })

    it('should return one page', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('administrators-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('administrators-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedAccounts[offset + i]).tag, 'tr')
      }
    })
  })
})
