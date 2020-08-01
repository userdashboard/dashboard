/* eslint-env mocha */
const assert = require('assert')
const http = require('http')
const Multiparty = require('multiparty')
const Proxy = require('./proxy.js')
const querystring = require('querystring')
const TestHelper = require('../test-helper.js')

describe('internal-api/proxy', () => {
  describe('Proxy#pass', () => {
    let server, port, requestHandler
    before(async () => {
      server = http.createServer((req, res) => {
        if (requestHandler) {
          requestHandler(req, res)
        } else if (res) {
          res.end()
        }
      })
      port = global.port + 2007
      server.listen(port, 'localhost')
    })

    beforeEach(async () => {
      global.applicationServer = `http://localhost:${port}`
      global.applicationServerToken = 'secret'
      requestHandler = null
    })

    after(async () => {
      if (server) {
        server.close()
        server = null
      }
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
          res.end()
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
          res.end()
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
          res.end()
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
          path: `${__dirname}/proxy.js`
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
