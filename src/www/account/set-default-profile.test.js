/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/set-default-profile', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      const profile2 = await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const profile3 = await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const req = TestHelper.createRequest('/account/set-default-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      await req.route.api.before(req)
      assert.strictEqual(req.data.profile.profileid, profile1.profileid)
      assert.strictEqual(req.data.profiles.length, 3)
      assert.strictEqual(req.data.profiles[0].profileid, profile3.profileid)
      assert.strictEqual(req.data.profiles[1].profileid, profile2.profileid)
      assert.strictEqual(req.data.profiles[2].profileid, profile1.profileid)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const profile1 = user.profile
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': user.profile.contactEmail,
        default: 'true'
      })
      const req = TestHelper.createRequest('/account/set-default-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1.profileid
      }
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should set the profile as default (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const profile1id = user.profile.profileid
      await TestHelper.createProfile(user, {
        'first-name': user.profile.firstName,
        'last-name': user.profile.lastName,
        'contact-email': TestHelper.nextIdentity().email,
        default: 'true'
      })
      const req = TestHelper.createRequest('/account/set-default-profile')
      req.account = user.account
      req.session = user.session
      req.body = {
        profileid: profile1id
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/profiles' },
        { click: `/account/profile?profileid=${profile1id}` },
        { click: `/account/set-default-profile?profileid=${profile1id}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })
})
