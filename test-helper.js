/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname
global.appid = global.appid || 'tests'
global.testConfiguration = global.testConfiguration || {}

const defaultConfigurationValues = {
  domain: 'localhost',
  applicationServer: null,
  applicationServerToken: null,
  language: null,
  enableLanguagePreference: false,
  testModuleJSON: null,
  encryptionSecret: process.env.ENCRYPTION_SECRET || '',
  encryptionSecretIV: process.env.ENCRYPTION_SECRET_IV || '',
  requireProfile: false,
  disableRegistration: false,
  userProfileFields: ['full-name', 'contact-email'],
  apiDependencies: [],
  minimumUsernameLength: 1,
  maximumUsernameLength: 100,
  minimumPasswordLength: 1,
  maximumPasswordLength: 100,
  minimumResetCodeLength: 1,
  maximumResetCodeLength: 100,
  minimumProfileFirstNameLength: 1,
  maximumProfileFirstNameLength: 100,
  minimumProfileLastNameLength: 1,
  maximumProfileLastNameLength: 100,
  minimumProfileDisplayNameLength: 1,
  maximumProfileDisplayNameLength: 100,
  minimumProfileCompanyNameLength: 1,
  maximumProfileCompanyNameLength: 100,
  deleteDelay: 7,
  pageSize: 2,
  idLength: 7,
  allowPublicAPI: true,
  delayDiskWrites: false,
  bcryptWorkloadFactor: 4,
  sessionVerificationDelay: 14400
}
for (const property in defaultConfigurationValues) {
  global.testConfiguration[property] = global.testConfiguration[property] || defaultConfigurationValues[property]
}

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const querystring = require('querystring')
const util = require('util')
const mimeTypes = {
  js: 'text/javascript;',
  css: 'text/css',
  txt: 'text/plain',
  html: 'text/html',
  jpg: 'image/jpeg',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml'
}

let dashboard, faker, helperRoutes, TestHelperPuppeteer, Log
async function setupBefore () {
  const fakerPath = path.join(global.applicationPath, '/node_modules/faker/')
  faker = require(fakerPath)
  const dashboardPath = path.join(global.applicationPath, '/node_modules/@userdashboard/dashboard/')
  const logPath = path.join(dashboardPath, '/src/log.js')
  if (fs.existsSync(logPath)) {
    Log = require(logPath)('dashboard-test-helper')
    Log.info('dashboard is nested as module')
    dashboard = require(`${dashboardPath}/index.js`)
    helperRoutes = require(`${dashboardPath}/test-helper-routes.js`)
    TestHelperPuppeteer = require(`${dashboardPath}/test-helper-puppeteer.js`)
  } else {
    Log = require('./src/log.js')('dashboard-test-helper')
    Log.info('dashboard is application')
    dashboard = require('./index.js')
    helperRoutes = require('./test-helper-routes.js')
    TestHelperPuppeteer = require('./test-helper-puppeteer.js')
  }
  global.testConfiguration.port = global.port || process.env.PORT || 9000
  let dashboardServer = global.dashboardServer || process.env.DASHBOARD_SERVER || 'http://localhost:9000'
  if (dashboardServer.lastIndexOf(':') > dashboardServer.indexOf(':')) {
    dashboardServer = dashboardServer.substring(0, dashboardServer.lastIndexOf(':'))
  }
  global.testConfiguration.dashboardServer = `${dashboardServer}:${global.testConfiguration.port}`
  Log.info('starting server')
  while (true) {
    global.port = global.testConfiguration.port
    try {
      await dashboard.start(global.applicationPath || __dirname)
      break
    } catch (error) {
      Log.error('error starting server', error)
      global.testConfiguration.port++
      global.testConfiguration.dashboardServer = `${dashboardServer}:${global.testConfiguration.port}`
    }
  }
  global.testConfiguration.appid = `tests_${dashboard.Timestamp.now}`
  global.testConfiguration.testNumber = dashboard.Timestamp.now
}

async function setupBeforeEach () {
  Log.info('beforeEach')
  const mergePackageJSON = require(path.join(__dirname, '/src/merge-package-json.js'))
  global.packageJSON = mergePackageJSON()
  global.sitemap['/api/require-verification'] = helperRoutes.requireVerification
  for (const property in global.testConfiguration) {
    global[property] = global.testConfiguration[property]
  }
}

before(setupBefore)
before(flushAllStorage)
beforeEach(setupBeforeEach)
afterEach(flushAllStorage)

after((callback) => {
  dashboard.stop()
  global.testEnded = true
  delete (global.apiDependencies)
  TestHelperPuppeteer.close()
  return callback()
})

const wait = util.promisify(function (amount, callback) {
  return setTimeout(callback, amount || 1)
})

module.exports = {
  completeVerification,
  createAdministrator,
  createMultiPart,
  createOwner,
  createProfile,
  createRequest,
  createSession,
  createResetCode,
  createUser,
  deleteResetCode,
  endSession,
  nextIdentity,
  setDeleted,
  extractDoc,
  extractRedirectURL,
  requireVerification,
  wait,
  setupBefore,
  setupBeforeEach
}

async function flushAllStorage () {
  if (dashboard.Storage && dashboard.Storage.flush) {
    await dashboard.Storage.flush()
  }
  if (dashboard.StorageList && dashboard.StorageList.flush) {
    await dashboard.StorageList.flush()
  }
  if (global.packageJSON.dashboard.modules && global.packageJSON.dashboard.modules.length) {
    for (const addition of global.packageJSON.dashboard.modules) {
      if (addition.Storage === dashboard.Storage) {
        continue
      }
      if (addition.Storage && addition.Storage.flush) {
        await addition.Storage.flush()
      }
      if (addition.StorageList && addition.StorageList.flush) {
        await addition.StorageList.flush()
      }
    }
  }
}

function createRequest (rawURL) {
  const req = {
    language: global.language,
    appid: global.appid,
    url: rawURL,
    urlPath: rawURL.split('?')[0]
  }
  req.route = global.sitemap[req.urlPath]
  if (global.applicationServer && !req.route) {
    req.route = {}
  }
  req.query = querystring.parse(rawURL.split('?')[1])
  for (const verb of ['get', 'post', 'patch', 'delete', 'put']) {
    req[verb] = async () => {
      req.method = verb.toUpperCase()
      if (req.url.startsWith('/api/')) {
        global.apiDependencies = []
        let errorMessage
        try {
          const result = await proxy(verb, rawURL, req)
          if (process.env.GENERATE_RESPONSE && process.env.RESPONSE_PATH && req.saveResponse) {
            let responseFilePath = req.filename.substring(req.filename.indexOf('/src/www/') + '/src/www/'.length)
            responseFilePath = path.join(process.env.RESPONSE_PATH, responseFilePath)
            createFolderSync(responseFilePath.substring(0, responseFilePath.lastIndexOf('/')))
            fs.writeFileSync(responseFilePath + 'on', JSON.stringify(result, null, '  '))
          }
          if (!result || result.object !== 'error') {
            return result
          }
          errorMessage = result ? result.message : null
        } catch (error) {
          errorMessage = error
        }
        Log.error('request proxy error', errorMessage, req)
        if (errorMessage === 'socket hang up') {
          return req[verb]()
        }
        throw new Error(errorMessage.message || errorMessage || 'api proxying failed')
      }
      let result
      try {
        result = await TestHelperPuppeteer.fetch(req.method, req)
        if (!result) {
          throw new Error('there was no result from puppeteer')
        }
      } catch (error) {
        Log.error('request execution error', error)
      }
      return result
    }
  }
  return req
}

// function extractDoc (str) {
//   if (!str) {
//     return null
//   }
//   let doc
//   const templateDoc = str.node ? str : dashboard.HTML.parse(str)
//   const applicationIframe = templateDoc.getElementById('application-iframe')
//   if (applicationIframe && applicationIframe.attr && applicationIframe.attr.srcdoc) {
//     const pageSource = applicationIframe.attr.srcdoc.join(' ')
//     doc = dashboard.HTML.parse(pageSource)
//   } else {
//     doc = templateDoc
//   }
//   return doc
// }

function extractDoc (str) {
  if (!str) {
    return null
  }
  if (str.indexOf('srcdoc') === -1) {
    return dashboard.HTML.parse(str)
  }
  let srcdoc = str.substring(str.indexOf('srcdoc'))
  srcdoc = srcdoc.substring(srcdoc.indexOf('<html'))
  srcdoc = srcdoc.substring(0, srcdoc.indexOf('</html>') + '</html>'.length)
  return dashboard.HTML.parse(srcdoc)
}

function extractRedirectURL (doc) {
  const metaTags = doc.getElementsByTagName('meta')
  if (metaTags && metaTags.length) {
    for (const metaTag of metaTags) {
      if (!metaTag.attr || !metaTag.attr.content || metaTag.attr['http-equiv'] !== 'refresh') {
        continue
      }
      return metaTag.attr.content.split(';url=')[1]
    }
  }
  return null
}

function nextIdentity () {
  const gender = Math.random() > 0.5 ? 1 : 0
  const firstName = faker.name.firstName(gender)
  const lastName = faker.name.lastName(gender)
  return {
    firstName,
    lastName,
    email: faker.internet.email(firstName, lastName)
  }
}

async function createAdministrator (owner) {
  const administrator = await createUser('administrator-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!administrator.account.administrator) {
    if (!owner) {
      throw new Error('created a user with no owner to elevate permissions')
    }
    const credentials = administrator.account
    const req2 = createRequest(`/api/administrator/set-account-administrator?accountid=${administrator.account.accountid}`)
    req2.account = owner.account
    req2.session = owner.session
    administrator.account = await req2.patch(req2)
    administrator.account.username = credentials.username
    administrator.account.password = credentials.password
  }
  return administrator
}

async function createOwner () {
  const owner = await createUser('owner-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000))
  if (!owner.account.administrator) {
    await dashboard.StorageObject.setProperty(`${global.appid}/account/${owner.account.accountid}`, 'administrator', dashboard.Timestamp.now)
    await dashboard.StorageList.add(`${global.appid}/administrator/accounts`, owner.account.accountid)
    owner.account.administrator = dashboard.Timestamp.now
  }
  if (!owner.account.owner) {
    await dashboard.StorageObject.setProperty(`${global.appid}/account/${owner.account.accountid}`, 'owner', dashboard.Timestamp.now)
    owner.account.owner = dashboard.Timestamp.now
  }
  return owner
}

async function createUser (username) {
  username = username || 'user-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const password = username
  const req = createRequest('/api/user/create-account')
  const requireProfileWas = global.requireProfile
  const profileFieldsWere = global.userProfileFields
  global.requireProfile = true
  global.userProfileFields = ['full-name', 'contact-email']
  const identity = nextIdentity()
  req.body = {
    username,
    password,
    'first-name': identity.firstName,
    'last-name': identity.lastName,
    'contact-email': identity.email
  }
  let account = await req.post()
  account.username = username
  account.password = password
  const req2 = createRequest(`/api/user/create-session?accountid=${account.accountid}`)
  req2.body = {
    username,
    password
  }
  let session = await req2.post()
  const req4 = createRequest(`/api/user/account?accountid=${account.accountid}`)
  req4.account = account
  req4.session = session
  account = await req4.get()
  const req3 = createRequest(`/api/user/profile?profileid=${account.profileid}`)
  req3.account = account
  req3.session = session
  const profile = await req3.get()
  const req5 = createRequest(`/api/user/session?sessionid=${session.sessionid}`)
  req5.account = account
  req5.session = session
  const token = session.token
  session = await req5.get()
  const user = { profile, account, session }
  user.session.token = token
  user.account.username = username
  user.account.password = password
  global.requireProfile = requireProfileWas
  global.userProfileFields = profileFieldsWere
  return user
}

async function createSession (user, remember) {
  const req = createRequest(`/api/user/create-session?accountid=${user.account.accountid}`)
  req.body = {
    username: user.account.username,
    password: user.account.password,
    remember: remember || ''
  }
  user.session = await req.post()
  return user.session
}

async function requireVerification (user) {
  const req = createRequest(`/api/require-verification?sessionid=${user.session.sessionid}`)
  req.account = user.account
  req.session = user.session
  await req.patch()
}

async function completeVerification (user) {
  const req = createRequest(`/api/user/set-session-verified?sessionid=${user.session.sessionid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    username: user.account.username,
    password: user.account.password
  }
  await req.patch()
}

async function endSession (user) {
  const req = createRequest(`/api/user/end-session?sessionid=${user.session.sessionid}`)
  user.session = await req.patch()
  return user.session
}

async function setDeleted (user) {
  const req = createRequest(`/api/user/set-account-deleted?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    password: user.account.password
  }
  user.account = await req.patch()
  user.account.username = req.account.username
  user.account.password = req.account.password
  return user.account
}

async function createResetCode (user) {
  const code = 'resetCode-' + dashboard.Timestamp.now + '-' + Math.ceil(Math.random() * 100000)
  const req = createRequest(`/api/user/create-reset-code?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = {
    'secret-code': code
  }
  user.resetCode = await req.post()
  user.resetCode.code = code
  return user.resetCode
}

async function deleteResetCode (user) {
  const req = createRequest(`/api/user/delete-reset-code?codeid=${user.resetCode.codeid}`)
  req.account = user.account
  req.session = user.session
  await req.delete()
}

async function createProfile (user, properties) {
  const req = createRequest(`/api/user/create-profile?accountid=${user.account.accountid}`)
  req.account = user.account
  req.session = user.session
  req.body = properties
  user.profile = await req.post()
  return user.profile
}

const proxy = util.promisify((method, path, req, callback) => {
  const baseURLParts = global.dashboardServer.split('://')
  let host, port
  const colon = baseURLParts[1].indexOf(':')
  if (colon > -1) {
    port = baseURLParts[1].substring(colon + 1)
    host = baseURLParts[1].substring(0, colon)
  } else if (baseURLParts[0] === 'https') {
    port = 443
    host = baseURLParts[1]
  } else if (baseURLParts[0] === 'http') {
    port = 80
    host = baseURLParts[1]
  }
  const requestOptions = {
    host,
    path,
    port,
    timeout: 180000,
    method: method.toUpperCase(),
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0'
    }
  }
  let postData
  if (req.body) {
    if (req.body.length) {
      postData = req.body
      requestOptions.headers = req.headers
    } else {
      postData = querystring.stringify(req.body)
      requestOptions.headers['content-length'] = postData.length
    }
  }
  if (req.session && req.session.expires) {
    const expires = dashboard.Timestamp.date(req.session.expires)
    requestOptions.headers.cookie = `sessionid=${req.session.sessionid}; token=${req.session.token}; expires=${expires.toUTCString()}; path=/`
  }
  if (req.headers) {
    for (const header in req.headers) {
      requestOptions.headers[header] = req.headers[header]
    }
  }
  const protocol = baseURLParts[0] === 'https' ? https : http
  let ended
  const proxyRequest = protocol.request(requestOptions, (proxyResponse) => {
    let body = ''
    proxyResponse.on('data', (chunk) => {
      body += chunk
    })
    return proxyResponse.on('end', () => {
      if (ended) {
        return
      }
      if (!body) {
        return callback()
      }
      if (proxyResponse.headers['set-cookie']) {
        const cookie = proxyResponse.headers['set-cookie']
        const sessionid = cookie[0].substring(cookie[0].indexOf('=') + 1)
        const expires = cookie[0].substring(cookie[0].indexOf('expires=') + 'expires='.length)
        const token = cookie[1].substring(cookie[1].indexOf('=') + 1)
        req.session = {
          sessionid: sessionid.split(';')[0],
          token: token.split(';')[0],
          expires: dashboard.Timestamp.create(dashboard.Format.parseDate(expires))
        }
      }
      if (proxyResponse.headers['content-type']) {
        if (proxyResponse.headers['content-type'].startsWith('application/json')) {
          body = JSON.parse(body.toString())
          if (body.object === 'error') {
            return callback(new Error(body.message))
          }
          return callback(null, body)
        }
      }
      return callback(null, body)
    })
  })
  proxyRequest.on('error', (error) => {
    Log.error('dashboard proxy error', error)
    ended = true
    try {
      if (proxyRequest && proxyRequest.end) {
        proxyRequest.end()
      }
    } catch (error) {
    }
    return callback(error)
  })
  if (postData) {
    proxyRequest.write(postData)
  }
  return proxyRequest.end()
})

function createFolderSync (folderPath) {
  const nestedParts = folderPath.split('/')
  let nestedPath = ''
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}

function createMultiPart (req, body, uploads) {
  const boundary = '-----------------test' + global.testNumber
  const delimiter = `\r\n--${boundary}`
  const closeDelimiter = delimiter + '--'
  const buffers = []
  if (uploads) {
    for (const field in uploads) {
      const filename = uploads[field].filename
      const extension = filename.substring(filename.indexOf('.') + 1).toLowerCase()
      const type = mimeTypes[extension]
      const segment = [
        delimiter,
        `Content-Disposition: form-data; name="${field}"; filename="${filename}"`,
        `Content-Type: ${type}`,
        '\r\n'
      ]
      buffers.push(Buffer.from(segment.join('\r\n')), fs.readFileSync(uploads[field].path), Buffer.from('\r\n'))
    }
  }
  for (const field in body) {
    buffers.push(Buffer.from(`${delimiter}\r\nContent-Disposition: form-data; name="${field}"\r\n\r\n${body[field]}`))
  }
  buffers.push(Buffer.from(closeDelimiter))
  const multipartBody = Buffer.concat(buffers)
  req.headers = req.headers || {}
  req.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`
  req.headers['Content-Length'] = multipartBody.length
  return multipartBody
}
