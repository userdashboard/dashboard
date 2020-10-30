const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage
}

async function renderPage (req, res, messageTemplate) {
  if (req.session) {
    req.query = req.query || {}
    req.query.sessionid = req.session.sessionid
    await global.api.user.SetSessionEnded.patch(req)
  }
  const now = new Date()
  const expires = new Date(now.getTime() + 1000).toUTCString()
  let cookieStr = 'httponly; path=/'
  if (req.secure) {
    cookieStr += '; secure'
  }
  if (global.domain) {
    cookieStr += `; domain=${global.domain}`
  }
  cookieStr += '; expires=' + expires
  const cookie = [
    `sessionid=x; ${cookieStr}`,
    `token=x; ${cookieStr}`
  ]
  res.setHeader('set-cookie', cookie)
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  res.writeHead(302, {
    location: '/account/signout-complete'
  })
  return res.end(doc.toString())
}
