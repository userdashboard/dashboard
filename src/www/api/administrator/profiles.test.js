/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/profiles', function () {
  const cachedResponses = {}
  const cachedProfiles = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    cachedProfiles.push(administrator.profile.profileid)
    global.delayDiskWrites = true
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      const user = await TestHelper.createUser()
      cachedProfiles.unshift(user.profile.profileid)
    }
    const req1 = TestHelper.createRequest('/api/administrator/profiles?offset=1')
    req1.account = administrator.account
    req1.session = administrator.session
    cachedResponses.offset = await req1.get()
    const req2 = TestHelper.createRequest('/api/administrator/profiles?limit=1')
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.limit = await req2.get()
    const req3 = TestHelper.createRequest('/api/administrator/profiles?all=true')
    req3.account = administrator.account
    req3.session = administrator.session
    cachedResponses.all = await req3.get()
    const req4 = TestHelper.createRequest(`/api/administrator/profiles?accountid=${administrator.account.accountid}`)
    req4.account = administrator.account
    req4.session = administrator.session
    cachedResponses.accountid = await req4.get()
    const req5 = TestHelper.createRequest('/api/administrator/profiles')
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
      const profilesNow = cachedResponses.offset
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(profilesNow[i].profileid, cachedProfiles[offset + i])
      }
    })

    it('optional querystring limit (integer)', async () => {
      const limit = 1
      const profilesNow = cachedResponses.limit
      assert.strictEqual(profilesNow.length, limit)
    })

    it('optional querystring all (boolean)', async () => {
      const profilesNow = cachedResponses.all
      assert.strictEqual(profilesNow.length, cachedProfiles.length)
    })

    it('optional querystring accountid (string)', async () => {
      const profilesNow = cachedResponses.accountid
      assert.strictEqual(profilesNow.length, 1)
    })
  })

  describe('returns', () => {
    it('array', async () => {
      const profilesNow = cachedResponses.returns
      assert.strictEqual(profilesNow.length, global.pageSize)
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
