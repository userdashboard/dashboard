/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/reset-codes', function () {
  const cachedResponses = {}
  const cachedResetCodes = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const user = await TestHelper.createUser()
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      await TestHelper.createResetCode(user)
      cachedResetCodes.unshift(user.resetCode.codeid)
    }
    const req1 = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}&offset=1`)
    req1.account = user.account
    req1.session = user.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}&limit=1`)
    req2.account = user.account
    req2.session = user.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}&all=true`)
    req3.account = user.account
    req3.session = user.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user.account.accountid}`)
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
        const req = TestHelper.createRequest('/api/user/reset-codes')
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
        const req = TestHelper.createRequest('/api/user/reset-codes?accountid=invalid')
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
        const req = TestHelper.createRequest(`/api/user/reset-codes?accountid=${user2.account.accountid}`)
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
  })

  describe('returns', () => {
    it('array', async () => {
      const codesNow = cachedResponses.returns
      assert.strictEqual(codesNow.length, global.pageSize)
    })
  })

  describe('redacts', () => {
    it('secretCodeHash', async () => {
      const codesNow = cachedResponses.all
      assert.strictEqual(codesNow[0].secretCodeHash, undefined)
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
