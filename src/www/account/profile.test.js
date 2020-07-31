/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/profile', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.profile.profileid, user.profile.profileid)
    })
  })

  describe('view', () => {
    it('should present the profile table (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/profiles' },
        { click: `/account/profile?profileid=${user.profile.profileid}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('profiles-table')
      const tbody = table.getElementById(user.profile.profileid)
      assert.strictEqual(tbody.tag, 'tbody')
    })

    it('should show fields if data exists', async () => {
      const user = await TestHelper.createUser()
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
      const req = TestHelper.createRequest(`/account/profile?profileid=${user.profile.profileid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
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
        const req2 = TestHelper.createRequest(`/account/profile?profileid=${user.profile.profileid}`)
        req2.account = user.account
        req2.session = user.session
        const result2 = await req2.get()
        const doc2 = TestHelper.extractDoc(result2.html)
        assert.strictEqual(doc2.getElementById('contact-email').tag, 'tr')
        assert.strictEqual(doc2.getElementById('full-name').tag, 'tr')
        assert.strictEqual(doc2.getElementById(field).tag, 'tr')
      }
    })
  })
})
