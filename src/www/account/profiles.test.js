/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/profiles', function () {
  const cachedResponses = {}
  const cachedProfiles = []
  before(async () => {
    await TestHelper.setupBeforeEach()
    global.delayDiskWrites = true
    const user = await TestHelper.createUser()
    cachedProfiles.push(user.profile.profileid)
    for (let i = 0, len = global.pageSize + 1; i < len; i++) {
      await TestHelper.createProfile(user, {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com'
      })
      cachedProfiles.unshift(user.profile.profileid)
    }
    const req1 = TestHelper.createRequest('/account/profiles')
    req1.account = user.account
    req1.session = user.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account' },
      { click: '/account/profiles' }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest('/account/profiles?offset=1')
    req2.account = user.account
    req2.session = user.session
    cachedResponses.offset = await req2.get()
  })

  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.profiles.length, global.pageSize)
      assert.strictEqual(data.profiles[0].profileid, cachedProfiles[0])
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('profiles-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('profiles-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedProfiles[offset + i]).tag, 'tr')
      }
    })

    it('should show fields if data exists', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/profiles')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById(`full-name-${user.profile.profileid}`).tag, 'td')
      assert.strictEqual(doc.getElementById(`contact-email-${user.profile.profileid}`).tag, 'td')
      const fields = {
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': 'Test company',
        website: 'https://' + user.profile.contactEmail.split('@')[1]
      }
      for (const field in fields) {
        assert.strictEqual(doc.getElementById(field), undefined)
      }
      for (const field in fields) {
        global.userProfileFields = ['full-name', 'contact-email', field]
        await TestHelper.createProfile(user, {
          'first-name': 'Test',
          'last-name': 'Person',
          'contact-email': 'test1@test.com',
          [field]: fields[field]
        })
        const result2 = await req.get()
        const doc2 = TestHelper.extractDoc(result2.html)
        assert.strictEqual(doc2.getElementById(`${field}-${user.profile.profileid}`).tag, 'td')
        assert.strictEqual(doc2.getElementById(`contact-email-${user.profile.profileid}`).tag, 'td')
        assert.strictEqual(doc2.getElementById(`full-name-${user.profile.profileid}`).tag, 'td')
      }
    })
  })
})
