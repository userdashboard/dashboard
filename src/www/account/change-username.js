const dashboard = require('../../../index.js')
const navbar = require('./navbar-account.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  navbar.setup(doc)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  req.body['new-username'] = req.body['new-username'].trim ? req.body['new-username'].trim() : req.body['new-username']
  if (!req.body['new-username'] || !req.body['new-username'].length) {
    return renderPage(req, res, 'invalid-new-username')
  }
  if (global.minimumUsernameLength > req.body['new-username'].length ||
    global.maximumUsernameLength < req.body['new-username'].length) {
    return renderPage(req, res, 'invalid-new-username-length')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountUsername.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?message=success`
    })
    return res.end()
  }
}
