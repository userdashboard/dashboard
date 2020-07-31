/* eslint-env mocha */
const assert = require('assert')
const dashboard = require('../../../index.js')
const TestHelper = require('../../../test-helper.js')

describe('/account/register', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = await TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should disable the form', async () => {
      global.disableRegistration = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'registration-disabled')
    })

    it('should have elements for full-name', async () => {
      global.userProfileFields = ['full-name']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('full-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for contact-email', async () => {
      global.userProfileFields = ['contact-email']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('contact-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for display-email', async () => {
      global.userProfileFields = ['display-email']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('display-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for dob', async () => {
      global.userProfileFields = ['dob']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('dob-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for phone', async () => {
      global.userProfileFields = ['phone']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('phone-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for occupation', async () => {
      global.userProfileFields = ['occupation']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('occupation-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for location', async () => {
      global.userProfileFields = ['location']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('location-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for company-name', async () => {
      global.userProfileFields = ['company-name']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('company-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for website', async () => {
      global.userProfileFields = ['website']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('website-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })
  })

  describe('submit', () => {
    it('should create new account with full name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'first-name': 'Test',
        'last-name': 'Person'
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with contact email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': TestHelper.nextIdentity().email
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with display email', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': TestHelper.nextIdentity().email
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with display name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['display-name']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '@user'
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with dob in YYYY-MM-DD', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        dob: '2017-11-01'
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with dob in MM-DD-YYYY', async () => {
      global.requireProfile = true
      global.userProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        dob: '12-13-1968'
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with phone', async () => {
      global.requireProfile = true
      global.userProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        phone: 'test value ' + Math.random()
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with occupation', async () => {
      global.requireProfile = true
      global.userProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        occupation: 'test value ' + Math.random()
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with location', async () => {
      global.requireProfile = true
      global.userProfileFields = ['location']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        location: 'test value ' + Math.random()
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with company-name', async () => {
      global.requireProfile = true
      global.userProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'company-name': 'test value ' + Math.random()
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create new profile with website', async () => {
      global.requireProfile = true
      global.userProfileFields = ['website']
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        website: 'test value ' + Math.random()
      }
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })

    it('should create 20-minute session', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      await req.post()
      const req2 = TestHelper.createRequest('/api/user/create-session')
      req2.body = {
        username: req.body.username,
        password: req.body.password
      }
      const secondSession = await req2.post()
      const req3 = TestHelper.createRequest(`/api/user/sessions?accountid=${secondSession.accountid}`)
      req3.account = { accountid: secondSession.accountid }
      req3.session = secondSession
      const sessions = await req3.get()
      const hours = Math.floor((sessions[1].expires - dashboard.Timestamp.now) / 60 / 60)
      assert.strictEqual(hours, 0)
    })

    it('should create account (screenshots)', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password'
      }
      req.filename = __filename
      req.screenshots = [
        { click: '/account/register' },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      assert.strictEqual(result.redirect, '/home')
    })
  })

  describe('errors', () => {
    it('invalid-username', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '',
        password: 'new-password',
        confirm: 'new-password'
      }
      const result = await req.post()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('invalid-username-length', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '1',
        password: 'new-password',
        confirm: 'new-password'
      }
      global.minimumUsernameLength = 100
      const result = await req.post()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username-length')
    })

    it('invalid-password', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-username',
        password: '',
        confirm: 'new-password'
      }
      const result = await req.post()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })

    it('invalid-password-length', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-username',
        password: '1',
        confirm: '1'
      }
      global.minimumPasswordLength = 100
      const result = await req.post()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password-length')
    })

    it('invalid-confirm', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: '1234567890123',
        password: '1234567890123',
        confirm: '123'
      }
      const result = await req.post()
      const doc = await TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-confirm')
    })

    it('invalid-first-name', async () => {
      global.userProfileFields = ['full-name']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.userProfileFields = ['full-name']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.userProfileFields = ['contact-email']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'contact-email': 'invalid'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-contact-email')
    })

    it('invalid-display-email', async () => {
      global.userProfileFields = ['display-email']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '123456789'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('invalid-dob', async () => {
      global.userProfileFields = ['dob']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'display-name': '123456789',
        dob: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        dob: '2017-13-52'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-dob')
    })

    it('invalid-phone', async () => {
      global.userProfileFields = ['phone']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        phone: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-phone')
    })

    it('invalid-occupation', async () => {
      global.userProfileFields = ['occupation']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        occupation: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-occupation')
    })

    it('invalid-location', async () => {
      global.userProfileFields = ['location']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        location: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-location')
    })

    it('invalid-company-name', async () => {
      global.userProfileFields = ['company-name']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
        'company-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-company-name')
    })

    it('invalid-website', async () => {
      global.userProfileFields = ['website']
      global.requireProfile = true
      const req = TestHelper.createRequest('/account/register')
      req.body = {
        username: 'new-user-' + new Date().getTime(),
        password: 'a-user-password',
        confirm: 'a-user-password',
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
