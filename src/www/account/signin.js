const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, null, null, req.language)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  if (req.body && req.body.username) {
    const usernameField = doc.getElementById('username')
    usernameField.setAttribute('value', req.body.username.split("'").join('&quot;'))
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req || !req.body) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  let session
  try {
    session = await global.api.user.CreateSession.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (!session) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.account) {
    const query = req.query
    req.query = { accountid: session.accountid }
    req.account = await global.api.administrator.Account.get(req)
    req.query = query
  }
  req.session = session
  let cookieStr = 'httponly; path=/; SameSite=strict'
  if (req.secure) {
    cookieStr += '; secure'
  }
  if (global.domain) {
    const domainColon = global.domain.indexOf(':')
    if (domainColon > -1) {
      cookieStr += '; domain=' + global.domain.substring(0, domainColon)
      cookieStr += '; port=' + global.domain.substring(domainColon + 1)
    } else {
      cookieStr += '; domain=' + global.domain
    }
  } else {
    const address = global.dashboardServer.split('://')[1]
    const addressColon = address.indexOf(':')
    if (addressColon > -1) {
      cookieStr += '; domain=' + address.substring(0, addressColon)
      cookieStr += '; port=' + address.substring(addressColon + 1)
    } else {
      cookieStr += '; domain=' + address
    }
  }
  if (session.expires) {
    cookieStr += '; expires=' + dashboard.Timestamp.date(session.expires).toUTCString()
  }
  res.setHeader('set-cookie', [
    `sessionid=${session.sessionid}; ${cookieStr}`,
    `token=${session.token}; ${cookieStr}`
  ])
  const nextURL = req.query && req.query['return-url'] ? req.query['return-url'] : '/home'
  res.writeHead(302, {
    location: nextURL
  })
  return res.end()
}
