/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/create-profile', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should have elements for full-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('full-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for contact-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('contact-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for display-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('display-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for dob', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('dob-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for phone', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('phone-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for occupation', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['occupation']

      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('occupation-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for location', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['location']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('location-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for company-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('company-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for website', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['website']

      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('website-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })
  })

  describe('submit', () => {
    it('should create profile (screenshots)', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name', 'display-name', 'contact-email', 'website']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person',
        'contact-email': 'test1@test.com',
        'display-name': 'tester',
        website: 'https://example.com',
        default: 'true'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/profiles' },
        { click: '/account/create-profile' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with full-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile and set default', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': 'Person',
        default: 'true'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with display name', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': user.profile.firstName + ' ' + user.profile.lastName.substring(0, 1)
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with contact-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with display-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with dob in YYYY-MM-DD', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '2017-11-01'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with dob in MM-DD-YYYY', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: '12-13-1968'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with phone', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        phone: 'test value ' + Math.random()
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with occupation', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        occupation: 'test value ' + Math.random()
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with location', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['location']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        location: 'test value ' + Math.random()
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with company-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'company-name': 'test value ' + Math.random()
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create profile with website', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['website']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        website: 'test value ' + Math.random()
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-first-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '',
        'last-name': 'Test'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name')
    })

    it('invalid-first-name-length', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '1',
        'last-name': 'Test'
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 1
      req.body = {
        'first-name': '123456789',
        'last-name': 'Test'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-first-name-length')
    })

    it('invalid-last-name', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': 'Test',
        'last-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-last-name')
    })

    it('invalid-last-name-length', async () => {
      global.userProfileFields = ['full-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'first-name': '1',
        'last-name': 'Test'
      }
      global.minimumProfileLastNameLength = 10
      global.maximumProfileLastNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-last-name-length')
      global.minimumProfileLastNameLength = 1
      global.maximumProfileLastNameLength = 1
      req.body = {
        'first-name': '123456789',
        'last-name': 'Test'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-last-name-length')
    })

    it('invalid-contact-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'contact-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
      req.body = {
        'contact-email': 'invalid'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-contact-email')
    })

    it('invalid-display-email', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
      req.body = {
        'display-email': 'invalid'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-email')
    })

    it('invalid-display-name', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name')
    })

    it('invalid-display-name-length', async () => {
      global.userProfileFields = ['display-name']
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'display-name': '1'
      }
      global.minimumProfileDisplayNameLength = 10
      global.maximumProfileDisplayNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name-length')
      global.minimumProfileDisplayNameLength = 1
      global.maximumProfileDisplayNameLength = 1
      req.body = {
        'display-name': '123456789'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('invalid-dob', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        dob: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
      req.body = {
        dob: '2017-13-52'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-dob')
    })

    it('invalid-phone', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        phone: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-phone')
    })

    it('invalid-occupation', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        occupation: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-occupation')
    })

    it('invalid-location', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['location']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        location: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-location')
    })

    it('invalid-company-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        'company-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-company-name')
    })

    it('invalid-website', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['website']
      const req = TestHelper.createRequest('/account/create-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        website: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-website')
    })
  })
})
