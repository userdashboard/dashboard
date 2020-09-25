/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/set-account-language', () => {
  let languages
  before(() => {
    languages = global.languages
  })
  beforeEach(() => {
    global.languages = JSON.parse(JSON.stringify(languages))
    for (const language of global.languages) {
      if (language.code === 'es') {
        return
      }
    }
    global.languages.push({ object: 'language', code: 'es', name: 'Español' })
  })
  afterEach(() => {
    global.languages = JSON.parse(JSON.stringify(languages))
  })
  describe('exceptions', () => {
    describe('invalid-accountid', () => {
      it('missing querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-language')
        req.account = user.account
        req.session = user.session
        req.body = {
          language: 'es'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })

      it('invalid querystring accountid', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/set-account-language?accountid=invalid')
        req.account = user.account
        req.session = user.session
        req.body = {
          language: 'es'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-accountid')
      })
    })

    describe('invalid-account', () => {
      it('ineligible accessing account', async () => {
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-language?accountid=${user2.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          language: 'es'
        }
        let errorMessage
        try {
          await req.patch()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-language', () => {
      it('missing posted language', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-language?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          language: ''
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-language')
      })

      it('invalid posted language', async () => {
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest(`/api/user/set-account-language?accountid=${user.account.accountid}`)
        req.account = user.account
        req.session = user.session
        req.body = {
          language: 'invalid'
        }
        let errorMessage
        try {
          await req.patch(req)
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-language')
      })
    })
  })

  describe('receives', () => {
    it('required posted language', async () => {
      const user = await TestHelper.createUser()
      assert.strictEqual(user.account.language, undefined)
      const req = TestHelper.createRequest(`/api/user/set-account-language?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        language: 'es'
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.patch()
      assert.strictEqual(account.language, 'es')
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/set-account-language?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      req.body = {
        language: 'es'
      }
      req.filename = __filename
      req.saveResponse = true
      const account = await req.patch()
      assert.strictEqual(account.object, 'account')
    })
  })
})
