/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/verify', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should mark session as verified', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      await req.post()
      const req2 = TestHelper.createRequest(`/api/user/session?sessionid=${user.session.sessionid}`)
      req2.account = user.account
      req2.session = user.session
      const session = await req2.get()
      assert.notStrictEqual(session.lastVerified, undefined)
      assert.notStrictEqual(session.lastVerified, null)
    })

    it('should verify session (screenshots)', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.requireVerification(user)
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account' },
        {
          fill: '#submit-form',
          body: {
            username: user.account.username,
            password: user.account.password
          },
          waitBefore: async (page) => {
            await page.waitForSelector('#submit-button')
          },
          waitAfter: async (page) => {
            await page.waitForNavigation()
            await page.waitForNavigation()
            req.location = await page.url()
          }
        }
      ]
      await req.get()
      assert.strictEqual(req.location, `${global.dashboardServer}/account`)
    })
  })

  describe('errors', () => {
    it('invalid-username', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: '',
        password: 'password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-username')
    })

    it('invalid-password', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/verify?return-url=/redirecting')
      req.account = user.account
      req.session = user.session
      req.body = {
        username: user.account.username,
        password: 'invalid-password'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-password')
    })
  })
})
