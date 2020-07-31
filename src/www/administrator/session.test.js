/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/session', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.session.accountid, user.account.accountid)
    })
  })

  describe('view', () => {
    it('should present the session table (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/administrator/session?sessionid=${user.session.sessionid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator' },
        { click: '/administrator/sessions' },
        { click: `/administrator/session?sessionid=${user.session.sessionid}` }
      ]
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('sessions-table')
      const tbody = table.getElementById(user.session.sessionid)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
