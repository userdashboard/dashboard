const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
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
  if (!req.body['secret-code'] || !req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body['new-password'] || !req.body['new-password'].length) {
    return renderPage(req, res, 'invalid-new-password')
  }
  if (global.minimumPasswordLength > req.body['new-password'].length) {
    return renderPage(req, res, 'invalid-new-password-length')
  }
  if (req.body['new-password'] !== req.body['confirm-password']) {
    return renderPage(req, res, 'invalid-confirm-password')
  }
  try {
    await global.api.user.ResetAccountPassword.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.body.password = req.body['new-password']
  req.route = global.sitemap['/account/signin']
  return req.route.api.post(req, res)
}
