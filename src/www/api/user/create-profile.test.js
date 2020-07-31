/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-profile', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/create-profile')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/create-profile?accountid=invalid')
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-accountid', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-first-name', () => {
      it('missing posted first-name', async () => {
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'last-name': 'Person'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-first-name')
      })
    })

    describe('invalid-first-name-length', () => {
      it('posted first-name too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'first-name': 'Test',
          'last-name': 'Person'
        }
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        global.minimumProfileFirstNameLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-first-name-length')
      })

      it('posted first-name too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'first-name': 'Test',
          'last-name': 'Person'
        }
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        global.maximumProfileFirstNameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-first-name-length')
      })
    })

    describe('invalid-last-name', () => {
      it('missing posted last-name', async () => {
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'first-name': 'Test'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-last-name')
      })
    })

    describe('invalid-last-name-length', () => {
      it('posted last-name too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'first-name': 'Test',
          'last-name': 'Person'
        }
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        global.minimumProfileLastNameLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-last-name-length')
      })

      it('posted last-name too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'first-name': 'Test',
          'last-name': 'Person'
        }
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        global.maximumProfileLastNameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-last-name-length')
      })
    })

    describe('invalid-display-name', () => {
      it('missing posted display-name', async () => {
        global.requireProfile = true
        global.userProfileFields = ['display-name']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-display-name')
      })
    })

    describe('invalid-display-name-length', () => {
      it('posted display-name too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'display-name': 'Test'
        }
        global.requireProfile = true
        global.userProfileFields = ['display-name']
        global.minimumProfileDisplayNameLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-display-name-length')
      })

      it('posted display-name too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'display-name': 'Test'
        }
        global.requireProfile = true
        global.userProfileFields = ['display-name']
        global.maximumProfileDisplayNameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-display-name-length')
      })
    })

    describe('invalid-company-name-length', () => {
      it('posted company-name too short', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'company-name': 'Test'
        }
        global.requireProfile = true
        global.userProfileFields = ['company-name']
        global.minimumProfileCompanyNameLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-company-name-length')
      })

      it('posted company-name too long', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'company-name': 'Test'
        }
        global.requireProfile = true
        global.userProfileFields = ['company-name']
        global.maximumProfileCompanyNameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-company-name-length')
      })
    })

    describe('invalid-company-name-length', () => {
      it('invalid-company-name-length', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          'company-name': 'Test'
        }
        global.requireProfile = true
        global.userProfileFields = ['company-name']
        global.maximumProfileCompanyNameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-company-name-length')
      })
    })

    describe('invalid-contact-email', () => {
      it('missing posted contact-email', async () => {
        global.requireProfile = true
        global.userProfileFields = ['contact-email']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-contact-email')
      })
    })

    describe('invalid-display-email', () => {
      it('missing posted display-email', async () => {
        global.requireProfile = true
        global.userProfileFields = ['display-email']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-display-email')
      })
    })

    describe('invalid-location', () => {
      it('missing posted location', async () => {
        global.requireProfile = true
        global.userProfileFields = ['location']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-location')
      })
    })

    describe('invalid-occupation', () => {
      it('missing posted occupation', async () => {
        global.requireProfile = true
        global.userProfileFields = ['occupation']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-occupation')
      })
    })

    describe('invalid-phone', () => {
      it('missing posted phone', async () => {
        global.requireProfile = true
        global.userProfileFields = ['phone']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-phone')
      })
    })

    describe('invalid-dob', () => {
      it('missing posted dob', async () => {
        global.requireProfile = true
        global.userProfileFields = ['dob']
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {}
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-dob')
      })
    })
  })

  describe('receives', () => {
    it('optionally-required posted first-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Testing',
        'last-name': 'Person'
      }
      const profile = await req.post()
      assert.strictEqual(profile.firstName, 'Testing')
    })

    it('optionally-required posted last-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Testing'
      }
      const profile = await req.post()
      assert.strictEqual(profile.lastName, 'Testing')
    })

    it('optionally-required posted display-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': 'Testing'
      }
      const profile = await req.post()
      assert.strictEqual(profile.displayName, 'Testing')
    })

    it('optionally-required posted company-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['company-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'company-name': 'Testing'
      }
      const profile = await req.post()
      assert.strictEqual(profile.companyName, 'Testing')
    })

    it('optionally-required posted contact-email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': 'test@test.com'
      }
      const profile = await req.post()
      assert.strictEqual(profile.contactEmail, 'test@test.com')
    })

    it('optionally-required posted display-email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': 'test@test.com'
      }
      const profile = await req.post()
      assert.strictEqual(profile.displayEmail, 'test@test.com')
    })

    it('optionally-required posted location', async () => {
      global.requireProfile = true
      global.userProfileFields = ['location']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        location: 'Testing'
      }
      const profile = await req.post()
      assert.strictEqual(profile.location, 'Testing')
    })

    it('optionally-required posted occupation', async () => {
      global.requireProfile = true
      global.userProfileFields = ['occupation']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        occupation: 'Testing'
      }
      const profile = await req.post()
      assert.strictEqual(profile.occupation, 'Testing')
    })

    it('optionally-required posted phone', async () => {
      global.requireProfile = true
      global.userProfileFields = ['phone']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        phone: '456-789-0123'
      }
      const profile = await req.post()
      assert.strictEqual(profile.phone, '456-789-0123')
    })

    it('optionally-required posted dob', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '1950-01-01'
      }
      const profile = await req.post()
      assert.strictEqual(profile.dob, '1950-01-01')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      global.requireProfile = true
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
      req.filename = __filename
      req.saveResponse = true
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': 'Test company',
        website: 'https://example.com'
      }
      const profile = await req.post()
      assert.strictEqual(profile.object, 'profile')
    })
  })

  describe('configuration', () => {
    it('environment USER_PROFILE_FIELDS', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const fields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
      const body = {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': 'Test company',
        website: 'https://example.com'
      }
      for (const field of fields) {
        req.body = {
          confirm: 'password1234'
        }
        if (field === 'full-name') {
          req.body['first-name'] = body['first-name']
          req.body['last-name'] = body['last-name']
        } else {
          req.body[field] = body[field]
        }
        global.userProfileFields = [field]
        const displayName = global.profileFieldMap[field]
        const account = await req.post()
        assert.strictEqual(account[displayName], body[field])
      }
    })

    it('environment MINIMUM_PROFILE_FIRST_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      global.userProfileFields = ['full-name']
      global.minimumProfileFirstNameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-first-name-length')
    })

    it('environment MAXIMUM_PROFILE_FIRST_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      global.userProfileFields = ['full-name']
      global.maximumProfileFirstNameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-first-name-length')
    })

    it('environment MINIMUM_PROFILE_LAST_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      global.userProfileFields = ['full-name']
      global.minimumProfileLastNameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-last-name-length')
    })

    it('environment MAXIMUM_PROFILE_LAST_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      global.userProfileFields = ['full-name']
      global.maximumProfileLastNameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-last-name-length')
    })

    it('environment MINIMUM_PROFILE_DISPLAY_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': '1'
      }
      global.userProfileFields = ['display-name']
      global.minimumProfileDisplayNameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-display-name-length')
    })

    it('environment MAXIMUM_PROFILE_DISPLAY_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': 'meeeee123'
      }
      global.userProfileFields = ['display-name']
      global.maximumProfileDisplayNameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-display-name-length')
    })

    it('environment MINIMUM_PROFILE_COMPANY_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'company-name': '1'
      }
      global.userProfileFields = ['company-name']
      global.minimumProfileCompanyNameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-company-name-length')
    })

    it('environment MAXIMUM_PROFILE_COMPANY_NAME_LENGTH', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        'company-name': 'acme inc'
      }
      global.userProfileFields = ['company-name']
      global.maximumProfileCompanyNameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-company-name-length')
    })

    it('override req.userProfileFields', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
      const req = TestHelper.createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const body = {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-email': 'test2@test.com',
        dob: '2000-01-01',
        'display-name': 'tester',
        phone: '456-789-0123',
        occupation: 'Programmer',
        location: 'USA',
        'company-name': 'Test company',
        website: 'https://example.com'
      }
      for (const field of global.userProfileFields) {
        req.userProfileFields = [field]
        req.body = {}
        if (field === 'full-name') {
          req.body['first-name'] = body['first-name']
          req.body['last-name'] = body['last-name']
        } else {
          req.body[field] = body[field]
        }
        const displayName = global.profileFieldMap[field]
        const account = await req.route.api.post(req)
        assert.strictEqual(account[displayName], body[field])
      }
    })
  })
})
