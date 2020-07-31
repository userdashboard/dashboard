/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/reset-codes', function () {
  const cachedResponses = {}
  const cachedResetCodes = []
  const accountResetCodes = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const user = await TestHelper.createUser()
      await TestHelper.createResetCode(user)
      cachedResetCodes.unshift(user.resetCode.codeid)
    }
    for (let i = 0, len = 3; i < len; i++) {
      await TestHelper.createResetCode(administrator)
      cachedResetCodes.unshift(administrator.resetCode.codeid)
      accountResetCodes.unshift(administrator.resetCode.codeid)
    }
    const req1 = TestHelper.createRequest('/api/administrator/reset-codes?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/reset-codes?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/reset-codes?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/administrator/reset-codes?accountid=${administrator.account.accountid}&all=true`)
    req4.account = administrator.account
    req4.session = administrator.session
    cachedResponses.accountid = await req4.get()
    const req5 = TestHelper.createRequest('/api/administrator/reset-codes')
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
      const codesNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(codesNow[i].codeid, cachedResetCodes[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const codesNow = cachedResponses.limit
      assert.strictEqual(codesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const codesNow = cachedResponses.all
      assert.strictEqual(codesNow.length, cachedResetCodes.length)
    })

    it('optional querystring accountid (string)', async () => {
      const codesNow = cachedResponses.accountid
      assert.strictEqual(codesNow.length, accountResetCodes.length)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const resetCodes = cachedResponses.returns
      assert.strictEqual(resetCodes.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('secretCodeHash', async () => {
      const resetCodes = cachedResponses.returns
      assert.strictEqual(undefined, resetCodes[0].secretCodeHash)
    })
  })

  describe('configuration', () => {
    it('environment PAGE_SIZE', async () => {
      global.pageSize = 3
      const codesNow = cachedResponses.pageSize
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })
})
