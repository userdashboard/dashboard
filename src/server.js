const fs = require('fs')
const http = require('http')
const Multiparty = require('multiparty')
const querystring = require('querystring')
const Response = require('./response.js')
const util = require('util')
let dashboard, Hash, Log, Proxy

const parsePostData = util.promisify((req, callback) => {
  if (req.headers &&
      req.headers['content-type'] &&
      req.headers['content-type'].indexOf('multipart/form-data') > -1) {
    return callback()
  }
  let body = ''
  req.on('data', (data) => {
    body += data
  })
  return req.on('end', () => {
    if (!body) {
      return callback()
    }
    return callback(null, body)
  })
})

const parseMultiPartData = util.promisify((req, callback) => {
  const form = new Multiparty.Form()
  return form.parse(req, async (error, fields, files) => {
    if (error) {
      return callback(error)
    }
    req.body = {}
    for (const field in fields) {
      req.body[field] = fields[field][0]
    }
    req.uploads = {}
    for (const field in files) {
      const file = files[field][0]
      if (!file.size) {
        continue
      }
      req.uploads[field] = {
        type: file.headers['content-type'],
        buffer: fs.readFileSync(file.path),
        name: file.originalFilename
      }
      fs.unlinkSync(file.path)
    }
    return callback()
  })
})

let server
const fileCache = {}
const statCache = {}

module.exports = {
  authenticateRequest,
  parsePostData,
  parseMultiPartData,
  receiveRequest,
  start: util.promisify(start),
  stop,
  staticFile
}

function start (callback) {
  dashboard = require('../index.js')
  Hash = require('./hash.js')
  Log = require('./log.js')('dashboard-server')
  Proxy = require('./proxy.js')
  server = http.createServer(receiveRequest)
  server.on('error', (error) => {
    callback(error)
    callback = null
  })
  try {
    server.listen(global.port, global.host)
  } catch (error) {
    return callback(error)
  }
  return setTimeout(() => {
    if (callback) {
      return callback(null, server)
    }
  }, 100)
}

function stop () {
  if (server) {
    server.close()
  }
}

async function receiveRequest (req, res) {
  const question = req.url.indexOf('?')
  req.appid = global.appid
  req.ip = requestIPAddress(req)
  req.urlPath = question === -1 ? req.url : req.url.substring(0, question)
  if (!req.urlPath.startsWith('/public/')) {
    Log.info('request', req.appid, req.method, req.ip, req.url)
  }
  const dot = req.urlPath.lastIndexOf('.')
  req.route = global.sitemap[`${req.urlPath}/index`] || global.sitemap[req.urlPath]
  req.extension = dot > -1 ? req.urlPath.substring(dot + 1) : null
  if (question !== -1) {
    req.query = querystring.parse(req.url.substring(question + 1), '&', '=')
  }
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
    if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data;') > -1) {
      try {
        await parseMultiPartData(req)
      } catch (error) {
        Log.error('multi-part error', error)
        return Response.throw500(req, res)
      }
    }
    if (!req.body) {
      try {
        req.bodyRaw = await parsePostData(req)
      } catch (error) {
        Log.error('post error', error)
        return Response.throw500(req, res)
      }
      if (req.bodyRaw) {
        req.body = querystring.parse(req.bodyRaw, '&', '=')
      }
    }
  }
  if (req.urlPath.startsWith('/public/') || req.urlPath === '/favicon.ico' || req.urlPath === '/robots.txt') {
    if (req.method === 'GET') {
      return staticFile(req, res)
    } else {
      return Response.throw404(req, res)
    }
  }
  try {
    await executeHandlers(req, res, 'before', global.packageJSON.dashboard.server, global.packageJSON.dashboard.serverFilePaths)
  } catch (error) {
    Log.error('before error', error)
    if (error.message === 'invalid-route') {
      return Response.throw404(req, res)
    }
    return Response.throw500(req, res)
  }
  if (res.ended) {
    return
  }
  let applicationServer = global.applicationServer
  if (req.server) {
    applicationServer = req.server.applicationServer || applicationServer
  }
  if (req.headers['x-application-server'] && req.headers['x-application-server'] === applicationServer) {
    const receivedToken = req.headers['x-application-server-token']
    req.applicationServer = receivedToken === req.server.applicationServerToken || receivedToken === global.applicationServerToken
  }
  if (!req.applicationServer && req.headers['x-application-server']) {
    return Response.throw500(req, res)
  }
  if (req.urlPath.startsWith('/api/') && !global.allowPublicAPI && !req.applicationServer && !req.allowAPIRequest) {
    return Response.throw404(req, res)
  }
  if (req.route && req.route.api !== 'static-page') {
    const methodHandler = req.route.api[req.method.toLowerCase()]
    if (!methodHandler) {
      return Response.throw404(req, res)
    }
  }
  let user
  if (req.applicationServer) {
    if (req.headers['x-accountid']) {
      const query = req.query
      req.query = { accountid: req.headers['x-accountid'] }
      let account
      try {
        account = await global.api.administrator.Account.get(req)
      } catch (error) {
      }
      if (!account) {
        return Response.throw500(req, res)
      }
      req.query.sessionid = req.headers['x-sessionid']
      let session
      try {
        session = await global.api.administrator.Session.get(req)
      } catch (error) {
      }
      if (!session) {
        return Response.throw500(req, res)
      }
      req.query = query
      user = { account, session }
    }
  } else {
    try {
      user = await authenticateRequest(req)
    } catch (error) {
      Log.error('authenticate error', error)
    }
  }
  if (user) {
    req.session = user.session
    req.account = user.account
  }
  if (!req.account && req.route && req.route.auth !== false) {
    if (req.urlPath.startsWith('/api/')) {
      res.statusCode = 511
      res.setHeader('content-type', 'application/json')
      return res.end('{ "object": "auth", "message": "Sign in required" }')
    }
    return Response.redirectToSignIn(req, res)
  }
  try {
    await executeHandlers(req, res, 'after', global.packageJSON.dashboard.server, global.packageJSON.dashboard.serverFilePaths)
  } catch (error) {
    Log.error('after error', error)
    if (error.message === 'invalid-route') {
      return Response.throw404(req, res)
    }
    return Response.throw500(req, res)
  }
  if (res.ended) {
    return
  }
  if (req.urlPath === '/administrator' || req.urlPath.startsWith('/administrator/') || req.urlPath.startsWith('/api/administrator/')) {
    if (!req.account) {
      return Response.redirectToSignIn(req, res)
    }
    if (!req.account.administrator) {
      return Response.throw500(req, res)
    }
  }
  if (req.session && global.sessionVerificationDelay) {
    const requireVerification = dashboard.Timestamp.now - req.session.lastVerified > 14400
    if (requireVerification &&
      (req.urlPath === '/administrator' || req.urlPath.startsWith('/administrator/') ||
       req.urlPath === '/account' || req.urlPath.startsWith('/account/')) &&
      req.urlPath !== '/account/signout' &&
      req.urlPath !== '/account/signin' &&
      req.urlPath !== '/account/end-all-sessions' &&
      req.urlPath !== '/account/verify') {
      return Response.redirectToVerify(req, res)
    }
  }
  if (!req.route) {
    if (global.applicationServer) {
      return Proxy.pass(req, res)
    } else {
      return Response.throw404(req, res)
    }
  }
  if (process.env.HOT_RELOAD && req.route.reload) {
    req.route.reload()
  }
  if (req.route.api === 'static-page') {
    const doc = dashboard.HTML.parse(req.html || req.route.html)
    return Response.end(req, res, doc)
  }
  if (req.route.iframe) {
    return Response.end(req, res)
  }
  if (req.urlPath.startsWith('/api/')) {
    return executeAPIRequest(req, res)
  }
  try {
    if (req.route.api.before) {
      await req.route.api.before(req)
    }
    await req.route.api[req.method.toLowerCase()](req, res)
  } catch (error) {
    Log.error('route error', error)
    return Response.throw500(req, res)
  }
}

async function executeAPIRequest (req, res) {
  let result
  try {
    result = await req.route.api[req.method.toLowerCase()](req)
  } catch (error) {
    Log.error('api error', req.url, req.body, req.uploads, error)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    return res.end(`{ "object": "error", "message": "${error.message || 'An error ocurred'}" }`)
  }
  res.statusCode = 200
  res.setHeader('content-type', 'application/json; charset=utf-8')
  return res.end(result ? JSON.stringify(result) : '')
}

async function executeHandlers (req, res, method, handlers) {
  if (!handlers || !handlers.length) {
    return
  }
  for (const handler of handlers) {
    if (!handler || !handler[method]) {
      continue
    }
    await handler[method](req, res)
    if (res.ended) {
      return
    }
  }
}

async function staticFile (req, res) {
  let filePath = `${global.rootPath}${req.urlPath}`
  let resolvedPath
  if (!fs.existsSync(filePath)) {
    if (req.urlPath === '/public/content-additional.css' || req.urlPath === '/public/template-additional.css') {
      res.setHeader('content-type', 'text/css')
      res.statusCode = 200
      return res.end('')
    }
    filePath = `@userdashboard/dashboard/src/www${req.urlPath}`
    try {
      resolvedPath = require.resolve(filePath)
    } catch (error) {
    }
    if (!resolvedPath) {
      if (global.packageJSON.dashboard.moduleNames && global.packageJSON.dashboard.moduleNames.length) {
        for (const moduleName of global.packageJSON.dashboard.moduleNames) {
          filePath = `${moduleName}/src/www${req.urlPath}`
          resolvedPath = require.resolve(filePath)
          if (resolvedPath) {
            break
          }
        }
      }
    }
  }
  if (resolvedPath) {
    const stat = statCache[resolvedPath] || fs.statSync(resolvedPath)
    statCache[resolvedPath] = stat
    if (stat.isDirectory()) {
      return Response.throw404(req, res)
    }
    if (process.env.HOT_RELOAD) {
      delete (fileCache[filePath])
    }
    const blob = fileCache[filePath] || fs.readFileSync(resolvedPath)
    fileCache[filePath] = fileCache[filePath] || blob
    const browserCached = req.headers['if-none-match']
    req.eTag = Response.eTag(blob)
    if (browserCached && browserCached === req.eTag) {
      res.statusCode = 304
      return res.end()
    }
    return Response.end(req, res, null, blob)
  }
  if (global.applicationServer) {
    return Proxy.pass(req, res)
  }
  return Response.throw404(req, res)
}

async function authenticateRequest (req) {
  if (!req.headers.cookie || !req.headers.cookie.length) {
    return
  }
  const segments = req.headers.cookie.split(';')
  const cookie = {}
  for (const segment of segments) {
    if (!segment || segment.indexOf('=') === -1) {
      continue
    }
    const parts = segment.split('=')
    const key = parts.shift().trim()
    const value = parts.join('=')
    cookie[key] = decodeURI(value)
  }
  if (!cookie.sessionid || !cookie.token) {
    return
  }
  let session
  try {
    const sessionRaw = await dashboard.Storage.read(`${req.appid}/session/${cookie.sessionid}`)
    if (sessionRaw && sessionRaw.length) {
      session = JSON.parse(sessionRaw)
    }
  } catch (error) {
  }
  if (!session || session.ended) {
    return
  }
  let account
  try {
    const accountRaw = await dashboard.Storage.read(`${req.appid}/account/${session.accountid}`)
    if (accountRaw && accountRaw.length) {
      account = JSON.parse(accountRaw)
    }
  } catch (error) {
  }
  if (!account || account.deleted) {
    return
  }
  let dashboardEncryptionKey = global.dashboardEncryptionKey
  let dashboardSessionKey = global.dashboardSessionKey
  if (req.server) {
    dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    dashboardSessionKey = req.server.dashboardSessionKey || dashboardSessionKey
  }
  const tokenHash = await Hash.sha512Hash(`${account.accountid}/${cookie.token}/${account.sessionKey}/${dashboardSessionKey}`, dashboardEncryptionKey)
  if (session.tokenHash !== tokenHash) {
    return
  }
  return { session, account }
}

function requestIPAddress (req) {
  const xForwardFor = req.headers['x-forwarded-for']
  if (xForwardFor) {
    const comma = xForwardFor.indexOf(',')
    if (comma > -1) {
      return xForwardFor.substring(0, comma)
    }
    return xForwardFor
  }
  if (req.connection) {
    if (req.connection.remoteAddress) {
      return req.connection.remoteAddress
    } else if (req.connection.socket) {
      return req.connection.socket
    }
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress
  }
}
