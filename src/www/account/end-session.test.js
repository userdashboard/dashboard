/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/end-session', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/end-session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.session.sessionid, user.session.sessionid)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/end-session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should end the session (screenshots)', async () => {
      const user = await TestHelper.createUser()
      const firstSession = user.session
      await TestHelper.createSession(user)
      const req = TestHelper.createRequest(`/account/end-session?sessionid=${firstSession.sessionid}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        { click: '/account/sessions' },
        { click: `/account/session?sessionid=${firstSession.sessionid}` },
        { click: `/account/end-session?sessionid=${firstSession.sessionid}` },
        { fill: '#submit-form' }
      ]
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should end current session', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/end-session?sessionid=${user.session.sessionid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.post()
      assert.strictEqual(result.redirect, '/account/signin?return-url=/home')
    })
  })
})
