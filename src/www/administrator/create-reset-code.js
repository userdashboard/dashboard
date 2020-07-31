const dashboard = require('../../../index.js')
const navbar = require('./navbar-account.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.accountid) {
    throw new Error('invalid-accountid')
  }
  const account = await global.api.administrator.Account.get(req)
  if (!account || account.deleted) {
    throw new Error('invalid-account')
  }
  account.createdFormatted = dashboard.Format.date(account.created)
  account.lastSignedInFormatted = dashboard.Format.date(account.lastSignedIn)
  req.data = { account }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account', req.language)
  await navbar.setup(doc, req.data.account)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
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
  if (!req.body['secret-code'] || !req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  if (global.minimumResetCodeLength > req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code-length')
  }
  try {
    await global.api.administrator.CreateResetCode.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?accountid=${req.query.accountid}&message=success`
    })
    return res.end()
  }
}
