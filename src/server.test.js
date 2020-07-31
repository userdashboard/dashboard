const assert = require('assert')
const HTML = require('./html.js')
const http = require('http')
const Server = require('./server.js')
const Timestamp = require('./timestamp.js')
const TestHelper = require('../test-helper.js')

/* eslint-env mocha */
describe('internal-api/server', () => {
  describe('Server#authenticateRequest', () => {
    it('should reject missing token', async () => {
      const req = TestHelper.createRequest('/account/change-username')
      req.headers = {}
      const result = await Server.authenticateRequest(req)
      assert.strictEqual(result, undefined)
    })

    it('should reject invalid token', async () => {
      const req = TestHelper.createRequest('/account/change-username')
      req.headers = {
        cookie: 'sessionid=invalid; token=invalid'
      }
      req.cookie = {
        sessionid: 'invalid',
        token: 'invalid'
      }
      const result = await Server.authenticateRequest(req)
      assert.strictEqual(result, undefined)
    })

    it('should identify user from token', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.method = 'GET'
      const expires = Timestamp.date(user.session.expires).toUTCString()
      req.headers = {
        cookie: `sessionid=${user.session.sessionid}; token=${user.session.token}; expires=${expires}; path=/`
      }
      const result = await Server.authenticateRequest(req)
      assert.strictEqual(result.account.accountid, user.account.accountid)
    })
  })

  describe('Server#parsePostData', () => {
    it('should ignore file uploads', async () => {
      const req = TestHelper.createRequest('/account/change-username')
      req.headers = {
        'content-type': 'multipart/form-data',
        'content-length': '1234'
      }
      const bodyRaw = await Server.parsePostData(req)
      assert.strictEqual(bodyRaw, undefined)
    })

    it('should ignore no-content uploads', (callback) => {
      const requestOptions = {
        host: 'localhost',
        path: '/account/signin',
        port: global.port,
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': 0
        }
      }
      const proxyRequest = http.request(requestOptions, (proxyResponse) => {
        let body = ''
        proxyResponse.on('data', (chunk) => {
          body += chunk
        })
        return proxyResponse.on('end', () => {
          const doc = TestHelper.extractDoc(body)
          const username = doc.getElementById('username')
          assert.strictEqual(username.attr.value, undefined)
          return callback()
        })
      })
      return proxyRequest.end()
    })

    it('should parse post data', (callback) => {
      const postData = 'username=value1&password=value2'
      const requestOptions = {
        host: 'localhost',
        path: '/account/signin',
        port: global.port,
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': postData.length
        }
      }
      const proxyRequest = http.request(requestOptions, (proxyResponse) => {
        let body = ''
        proxyResponse.on('data', (chunk) => {
          body += chunk
        })
        return proxyResponse.on('end', () => {
          const doc = TestHelper.extractDoc(body)
          const username = doc.getElementById('username')
          assert.strictEqual(username.attr.value, 'value1')
          return callback()
        })
      })
      proxyRequest.write(postData)
      return proxyRequest.end()
    })
  })

  describe('Server#receiveRequest', () => {
    it('should bind query data of URL to req', async () => {
      const req = TestHelper.createRequest('/account/change-username?param1=1&param2=this')
      req.headers = {}
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.query.param1, '1')
          assert.strictEqual(req.query.param2, 'this')
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should not bind route for unknown url', async () => {
      const req = TestHelper.createRequest('/not-real')
      req.method = 'GET'
      delete (req.route)
      req.headers = {
        'user-agent': 'test'
      }
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.route, undefined)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should bind route to req', async () => {
      const req = TestHelper.createRequest('/account/change-username?param1=1&param2=this')
      req.method = 'GET'
      delete (req.route)
      req.headers = {
        'user-agent': 'test'
      }
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.route.api, global.sitemap['/account/change-username'].api)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should redirect user to verification', async () => {
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

    it('should execute "before" server handler before identifying user', async () => {
      global.packageJSON.dashboard.server = [
        {
          before: async (req) => {
            req.executedBeforeRequest = true
          }
        }
      ]
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.headers = {
        cookie: `sessionid=${user.session.sessionid}; token=${user.session.token}`
      }
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.executedBeforeRequest, true)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should execute "after" server handler after identifying user', async () => {
      global.packageJSON.dashboard.server = [
        {
          after: async (req) => {
            req.executedAfterRequest = true
          }
        }
      ]
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.headers = {
        cookie: `sessionid=${user.session.sessionid}; token=${user.session.token}`
      }
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.executedAfterRequest, true)
          assert.strictEqual(req.account.accountid, user.account.accountid)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should execute "after" server handler after identifying guest', async () => {
      global.packageJSON.dashboard.server = [
        {
          after: async (req) => {
            req.executedAfterRequest = true
          }
        }
      ]
      const req = TestHelper.createRequest('/')
      req.headers = {}
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.executedAfterRequest, true)
          assert.strictEqual(req.account, undefined)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should execute "before" and "after" server handler', async () => {
      global.packageJSON.dashboard.server = [
        {
          before: async (req) => {
            req.executedBeforeRequest = true
          },
          after: async (req) => {
            req.executedAfterRequest = true
          }
        }
      ]
      const req = TestHelper.createRequest('/')
      req.headers = {}
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.executedBeforeRequest, true)
          assert.strictEqual(req.executedAfterRequest, true)
        }
      }
      return Server.receiveRequest(req, res)
    })

    it('should execute each server handler', async () => {
      global.packageJSON.dashboard.server = [
        {
          before: async (req) => {
            req.executedBeforeRequest = true
          }
        }, {
          after: async (req) => {
            req.executedAfterRequest = true
          }
        }
      ]
      const req = TestHelper.createRequest('/')
      req.headers = {}
      req.method = 'GET'
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(req.executedBeforeRequest, true)
          assert.strictEqual(req.executedAfterRequest, true)
        }
      }
      return Server.receiveRequest(req, res)
    })
  })
})
