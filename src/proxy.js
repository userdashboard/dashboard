const http = require('http')
const https = require('https')
const HTML = require('./html.js')
const Response = require('./response.js')

module.exports = { pass }

async function pass (req, res) {
  let baseURL = (req.applicationServer || global.applicationServer).split('://')[1]
  const baseSlash = baseURL.indexOf('/')
  if (baseSlash > -1) {
    baseURL = baseURL.substring(0, baseSlash)
  }
  let port
  const portColon = baseURL.indexOf(':')
  if (portColon > -1) {
    port = baseURL.substring(portColon + 1)
    baseURL = baseURL.substring(0, portColon)
  } else {
    port = global.applicationServer.startsWith('https') ? 443 : 80
  }
  const requestOptions = {
    host: baseURL,
    path: req.url,
    method: req.method,
    port,
    headers: {
      referer: `${global.dashboardServer}${req.url}`,
      'x-dashboard-server': global.dashboardServer
    }
  }
  if (req.method === 'GET' && req.headers && req.headers['if-none-match']) {
    requestOptions.headers['if-none-match'] = req.headers['if-none-match']
  }
  if (req.account) {
    requestOptions.headers['x-accountid'] = req.account.accountid
    requestOptions.headers['x-sessionid'] = req.session.sessionid
  }
  requestOptions.headers['x-application-server-token'] = req.applicationServerToken || global.applicationServerToken
  const proxyHandlers = global.packageJSON.dashboard.proxy
  if (proxyHandlers && proxyHandlers.length) {
    for (const handler of proxyHandlers) {
      await handler(req, requestOptions)
    }
  }
  if (req.body && req.bodyRaw) {
    requestOptions.headers['content-length'] = req.headers['content-length'] || req.bodyRaw.length
    requestOptions.headers['content-type'] = req.headers['content-type'] || 'application/x-www-form-urlencoded'
  } else if (req.body) {
    const boundary = '--------------------------' + (Math.random() + '').split('.')[1]
    const body = []
    for (const field in req.body) {
      let nextPostData = `--${boundary}\r\n`
      nextPostData += `Content-Disposition: form-data; name="${field}"\r\n\r\n`
      nextPostData += `${req.body[field]}\r\n`
      body.push(nextPostData)
    }
    for (const field in req.uploads) {
      let nextPostData = `--${boundary}\r\n`
      nextPostData += `Content-Disposition: form-data; name="${field}"; filename="${req.uploads[field].name}"\r\n`
      nextPostData += `Content-Type: ${req.uploads[field].type}\r\n\r\n`
      nextPostData += req.uploads[field].buffer.toString('binary')
      nextPostData += '\r\n'
      body.push(nextPostData)
    }
    body.push(`--${boundary}--`)
    req.body = req.bodyRaw = Buffer.from(body.join(''), 'binary')
    requestOptions.headers['content-length'] = Buffer.byteLength(req.body)
    requestOptions.headers['content-type'] = 'multipart/form-data; boundary=' + boundary
  }
  const protocol = (req.applicationServerToken || global.applicationServer).startsWith('https') ? https : http
  const proxyRequest = protocol.request(requestOptions, (proxyResponse) => {
    let body
    proxyResponse.on('data', (chunk) => {
      body = body ? Buffer.concat([body, chunk]) : chunk
    })
    proxyResponse.on('end', () => {
      switch (proxyResponse.statusCode) {
        case 200:
          if (proxyResponse.headers['content-type'] && proxyResponse.headers['content-type'].indexOf('text/html') === 0) {
            body = body.toString()
            const htmlTagIndex = body.indexOf('<html')
            if (htmlTagIndex > -1) {
              let htmlTag = body.substring(htmlTagIndex)
              htmlTag = htmlTag.substring(0, htmlTag.indexOf('>'))
              if (htmlTag.indexOf(' template="false"') > -1 ||
                htmlTag.indexOf(" template='false'") > -1 ||
                htmlTag.indexOf(' template=false') > -1) {
                return res.end(body)
              }
              const doc = HTML.parse(body)
              return Response.end(req, res, doc)
            }
          }
          if (proxyResponse.headers['content-type']) {
            res.setHeader('content-type', proxyResponse.headers['content-type'])
          }
          if (proxyResponse.headers['content-disposition']) {
            res.setHeader('content-disposition', proxyResponse.headers['content-disposition'])
          }
          if (proxyResponse.headers['content-length']) {
            res.setHeader('content-length', proxyResponse.headers['content-length'])
          }
          res.statusCode = 200
          return res.end(body)
        case 302:
          return Response.redirect(req, res, proxyResponse.headers.location)
        case 304:
          res.statusCode = 304
          return res.end()
        case 404:
          if (req.urlPath.startsWith('/api/')) {
            res.setHeader('content-type', 'application/json')
            return res.end('{ "object": "error", "message": "Invalid content was returned from the application server" }')
          }
          return Response.throw404(req, res)
        case 511:
          if (req.urlPath.startsWith('/api/')) {
            res.setHeader('content-type', 'application/json')
            return res.end('{ "object": "error", "message": "Invalid content was returned from the application server" }')
          }
          return Response.redirectToSignIn(req, res)
        case 500:
        default:
          if (req.urlPath.startsWith('/api/')) {
            res.setHeader('content-type', 'application/json')
            return res.end('{ object": "error", "message": "Invalid content was returned from the application server" }')
          }
          return Response.throw500(req, res)
      }
    })
  })
  if (req.bodyRaw) {
    proxyRequest.write(req.bodyRaw)
  } else if (req.body) {
    proxyRequest.write(req.body)
  }
  proxyRequest.end()
  return requestOptions
}
