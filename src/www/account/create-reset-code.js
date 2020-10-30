const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (messageTemplate === 'success') {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    return dashboard.Response.end(req, res, doc)
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  const codeField = doc.getElementById('secret-code')
  if (req.body && req.body['secret-code']) {
    codeField.setAttribute('value', req.body['secret-code'].split("'").join('&quot;'))
  } else {
    codeField.setAttribute('value', dashboard.UUID.random(10))
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
  req.body['secret-code'] = req.body['secret-code'] && req.body['secret-code'].trim ? req.body['secret-code'].trim() : req.body['secret-code']
  if (!req.body['secret-code'] || !req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  if (global.minimumResetCodeLength > req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code-length')
  }
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  try {
    await global.api.user.CreateResetCode.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  }
  res.writeHead(302, {
    location: `${req.urlPath}?message=success`
  })
  return res.end()
}
