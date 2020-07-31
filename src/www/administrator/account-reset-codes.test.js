/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/account-reset-codes', function () {
  const cachedResponses = {}
  const cachedResetCodes = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    global.delayDiskWrites = true
    const user = await TestHelper.createUser()
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      await TestHelper.createResetCode(user)
      cachedResetCodes.unshift(user.resetCode.codeid)
    }
    const req1 = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}`)
    req1.account = administrator.account
    req1.session = administrator.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator' },
      { click: '/administrator/accounts' },
      { click: `/administrator/account?accountid=${user.account.accountid}` },
      { click: `/administrator/account-reset-codes?accountid=${user.account.accountid}` }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest(`/administrator/account-reset-codes?accountid=${user.account.accountid}&offset=1`)
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.resetCodes.length, global.pageSize)
      assert.strictEqual(data.resetCodes[0].codeid, cachedResetCodes[0])
    })
  })

  describe('view', () => {
    it('should present the reset codes table (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const row = doc.getElementById(cachedResetCodes[0])
      assert.strictEqual(row.tag, 'tr')
    })

    it('should return one page', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('reset-codes-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedResetCodes[offset + i]).tag, 'tr')
      }
    })
  })
})
