/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/create-account', () => {
  describe('exceptions', () => {
    describe('invalid-username', () => {
      it('missing posted username', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '',
          password: 'password'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username')
      })
    })

    describe('invalid-username-length', () => {
      it('posted username too short', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password'
        }
        let errorMessage
        global.minimumUsernameLength = 100
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username-length')
      })

      it('posted username too long', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password'
        }
        global.maximumUsernameLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-username-length')
      })
    })

    describe('invalid-password', () => {
      it('missing posted password', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: ''
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password')
      })
    })

    describe('invalid-password-length', () => {
      it('posted password too short', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: '1'
        }
        global.minimumPasswordLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password-length')
      })

      it('posted password too long', async () => {
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: '12345'
        }
        global.maximumPasswordLength = 1
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-password-length')
      })
    })

    describe('invalid-first-name', () => {
      it('missing posted first-name', async () => {
        global.requireProfile = true
        global.userProfileFields = ['full-name']
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: '123456',
          password: 'password',
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

    describe('invalid-company-name', () => {
      it('missing posted company-name', async () => {
        global.requireProfile = true
        global.userProfileFields = ['company-name']
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-company-name')
      })
    })

    describe('invalid-company-name-length', () => {
    })

    describe('invalid-contact-email', () => {
      it('missing posted contact-email', async () => {
        global.requireProfile = true
        global.userProfileFields = ['contact-email']
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
        const req = TestHelper.createRequest('/api/user/create-account')
        req.body = {
          username: 'username',
          password: 'password'
        }
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
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'first-name': 'Testing',
        'last-name': 'Person'
      }
      const account = await req.post()
      assert.strictEqual(account.firstName, 'Testing')
    })

    it('optionally-required posted last-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'first-name': 'Person',
        'last-name': 'Testing'
      }
      const account = await req.post()
      assert.strictEqual(account.lastName, 'Testing')
    })

    it('optionally-required posted display-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'display-name': 'Testing'
      }
      const account = await req.post()
      assert.strictEqual(account.displayName, 'Testing')
    })

    it('optionally-required posted company-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['company-name']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'company-name': 'Testing'
      }
      const account = await req.post()
      assert.strictEqual(account.companyName, 'Testing')
    })

    it('optionally-required posted contact-email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'contact-email': 'test@test.com'
      }
      const account = await req.post()
      assert.strictEqual(account.contactEmail, 'test@test.com')
    })

    it('optionally-required posted display-email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        'display-email': 'test@test.com'
      }
      const account = await req.post()
      assert.strictEqual(account.displayEmail, 'test@test.com')
    })

    it('optionally-required posted location', async () => {
      global.requireProfile = true
      global.userProfileFields = ['location']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        location: 'testing'
      }
      const account = await req.post()
      assert.strictEqual(account.location, 'testing')
    })

    it('optionally-required posted occupation', async () => {
      global.requireProfile = true
      global.userProfileFields = ['occupation']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        occupation: 'testing'
      }
      const account = await req.post()
      assert.strictEqual(account.occupation, 'testing')
    })

    it('optionally-required posted phone', async () => {
      global.requireProfile = true
      global.userProfileFields = ['phone']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        phone: '123-456-7890'
      }
      const account = await req.post()
      assert.strictEqual(account.phone, '123-456-7890')
    })

    it('optionally-required posted dob', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username',
        password: 'password',
        dob: '1950-01-01'
      }
      const account = await req.post()
      assert.strictEqual(account.dob, '1950-01-01')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      global.requireProfile = false
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234'
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.post()
      assert.strictEqual(account.object, 'account')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_USERNAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password'
      }
      global.minimumUsernameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('environment MAXIMUM_USERNAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password'
      }
      global.maximumUsernameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-username-length')
    })

    it('environment MINIMUM_PASSWORD_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password'
      }
      global.minimumPasswordLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('environment MAXIMUM_PASSWORD_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234'
      }
      global.maximumPasswordLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-password-length')
    })

    it('environment REQUIRE_PROFILE', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: 'username-' + new Date().getTime(),
        password: 'password1234',
        confirm: 'password1234',
        'first-name': 'Tester',
        'last-name': 'Person'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-contact-email')
    })

    it('environment USER_PROFILE_FIELDS', async () => {
      global.requireProfile = true
      const req = TestHelper.createRequest('/api/user/create-account')
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
          username: 'username-' + new Date().getTime(),
          password: 'password1234',
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
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
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

    it('environment MAXIMUM_PROFILE_FIRST_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
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

    it('environment MINIMUM_PROFILE_LAST_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
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

    it('environment MAXIMUM_PROFILE_LAST_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
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

    it('environment MINIMUM_PROFILE_DISPLAY_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
        'display-name': '1'
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

    it('environment MAXIMUM_PROFILE_DISPLAY_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
        'display-name': 'meeeee123'
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

    it('environment MINIMUM_PROFILE_COMPANY_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
        'company-name': '1'
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

    it('environment MAXIMUM_PROFILE_COMPANY_NAME_LENGTH', async () => {
      const req = TestHelper.createRequest('/api/user/create-account')
      req.body = {
        username: '123456',
        password: 'password',
        'company-name': 'acme inc'
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

    it('override req.userProfileFields', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'display-email', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
      const req = TestHelper.createRequest('/api/user/create-account')
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
        req.body = {
          username: 'username-' + new Date().getTime(),
          password: 'password1234',
          confirm: 'password1234'
        }
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
