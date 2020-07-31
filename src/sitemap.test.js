const assert = require('assert')
const HTML = require('./html.js')
const Server = require('./server.js')
const Timestamp = require('./timestamp.js')
const TestHelper = require('../test-helper.js')

/* eslint-env mocha */
describe('internal-api/sitemap', () => {
  describe('Sitemap#authenticateRequest', () => {
    it('should substitute language HTML file', async () => {
      Timestamp.now -= 10000
      const user = await TestHelper.createUser()
      user.session = await TestHelper.createSession(user, 'days')
      Timestamp.now += 10000
      const req = TestHelper.createRequest('/account/change-password')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      req.headers = {}
      req.body = {
        username: user.account.username,
        password: user.account.password
      }
      const res = {
        setHeader: () => {
        },
        end: (page) => {
          const doc = HTML.parse(page)
          const redirectURL = TestHelper.extractRedirectURL(doc)
          assert.strictEqual(redirectURL, '/account/verify?return-url=/account/change-password')
        }
      }
      return Server.receiveRequest(req, res)
    })
  })
})
