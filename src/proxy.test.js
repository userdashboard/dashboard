/* eslint-env mocha */
const assert = require('assert')
const http = require('http')
const Multiparty = require('multiparty')
const path = require('path')
const Proxy = require('./proxy.js')
const querystring = require('querystring')
const TestHelper = require('../test-helper.js')

describe('internal-api/proxy', () => {
  describe('Proxy#pass', () => {
    let port, requestHandler
    beforeEach(async () => {
      let server = http.createServer((req, res) => {
        if (requestHandler) {
          requestHandler(req, res)
        }
        res.end()
        server.close()
        server = null
      })
      port = port || global.port + 7 + Math.floor(10000 * Math.random())
      port++
      server.listen(port, 'localhost')
      global.applicationServer = `http://localhost:${port}`
      global.applicationServerToken = 'secret'
      requestHandler = null
    })

    it('should include x-accountid header', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(requestOptions.headers['x-accountid'], user.account.accountid)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })

    it('should include x-sessionid header', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(requestOptions.headers['x-sessionid'], user.session.sessionid)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })

    it('should include x-dashboard-server header', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(requestOptions.headers['x-dashboard-server'], global.dashboardServer)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })

    it('should create x-application-server-token header', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.notStrictEqual(requestOptions.headers['x-application-server-token'], null)
          assert.notStrictEqual(requestOptions.headers['x-application-server-token'], undefined)
          assert.notStrictEqual(requestOptions.headers['x-application-server-token'].length, 0)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })

    it('should include referer header', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(requestOptions.headers.referer, `${global.dashboardServer}/some-application-page`)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })

    it('should send POST data', async () => {
      requestHandler = (req, res) => {
        let body = ''
        req.on('data', (data) => {
          body += data
        })
        return req.on('end', () => {
          req.body = querystring.parse(body, '&', '=')
          assert.strictEqual(req.body.simple, 'payload')
        })
      }
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      req.headers = {
        'content-type': 'x-www-form-urlencoded'
      }
      req.body = {
        simple: 'payload'
      }
      await req.post()
    })

    it('should send multipart POST data', async () => {
      requestHandler = (req, res) => {
        const form = new Multiparty.Form()
        return form.parse(req, async (error, fields) => {
          if (error) {
            throw error
          }
          req.body = {}
          for (const field in fields) {
            req.body[field] = fields[field][0]
          }
          assert.strictEqual(req.body.complex, 'payload')
        })
      }
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      req.body = TestHelper.createMultiPart(req, {
        complex: 'payload'
      })
      await req.post()
    })

    it('should send file upload POST data', async () => {
      requestHandler = (req, res) => {
        const form = new Multiparty.Form()
        return form.parse(req, async (error, _, files) => {
          if (error) {
            throw error
          }
          assert.notStrictEqual(files['upload-name'], null)
          assert.notStrictEqual(files['upload-name'], undefined)
        })
      }
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/api/user/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      req.body = TestHelper.createMultiPart(req, {}, {
        'upload-name': {
          filename: 'proxy.js',
          name: 'upload-name',
          path: path.join(__dirname, 'proxy.js')
        }
      })
      await req.post()
    })

    it('should execute proxy handlers', async () => {
      global.packageJSON.dashboard = {
        proxy: [
          async (_, requestOptions) => {
            requestOptions.executedProxyRequest = true
          }
        ]
      }
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/some-application-page')
      req.account = user.account
      req.session = user.session
      req.method = 'GET'
      const res = {
        headers: {},
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(requestOptions.executedProxyRequest, true)
        }
      }
      const requestOptions = await Proxy.pass(req, res)
    })
  })
})
