const dashboard = require('../../../index.js')
const navbar = require('./navbar-account.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!global.enableLanguagePreference) {
    throw new Error('language-preference-disabled')
  }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, null, null, req.language)
  navbar.setup(doc)
  if (messageTemplate === 'success') {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  } else if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  dashboard.HTML.renderList(doc, global.languages, 'language-option', 'language')
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body || !req.body.language) {
    return renderPage(req, res)
  }
  let found = false
  for (const language of global.languages) {
    found = language.code === req.body.language
    if (found) {
      break
    }
  }
  if (!found) {
    return renderPage(req, res, 'invalid-language')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountLanguage.patch(req)
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
