/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/create-reset-code', () => {
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('unspecified querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/create-reset-code')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          'secret-code': '1'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/create-reset-code?accountid=invalid')
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          'secret-code': '1'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-secret-code', () => {
      it('missing posted secret-code', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          'secret-code': ''
        }
        global.minimumResetCodeLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })
    })

    describe('invalid-secret-code-length', () => {
      it('invalid posted secret-code length', async () => {
        const administrator = await TestHelper.createOwner()
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
        req.account = administrator.account
        req.session = administrator.session
        req.body = {
          'secret-code': '1'
        }
        global.minimumResetCodeLength = 100
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code-length')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        'secret-code': '12345678'
      }
      req.filename = __filename
      req.saveResponse = true
      const resetCode = await req.post()
      assert.strictEqual(resetCode.object, 'resetCode')
    })
  })

  describe('configuration', () => {
    it('environment MINIMUM_RESET_CODE_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        'secret-code': '1'
      }
      global.minimumResetCodeLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-secret-code-length')
    })

    it('environment MAXIMUM_RESET_CODE_LENGTH', async () => {
      const administrator = await TestHelper.createOwner()
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/administrator/create-reset-code?accountid=${user.account.accountid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.body = {
        'secret-code': '10000000'
      }
      global.maximumResetCodeLength = 3
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-secret-code-length')
    })
  })
})
