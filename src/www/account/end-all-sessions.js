const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.ResetSessionKey.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.query = {}
  req.url = req.urlPath = '/home'
  return dashboard.Response.redirectToSignIn(req, res)
}
