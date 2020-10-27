const dashboard = require('../../../index.js')
const navbar = require('./navbar-profile.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.sessionid) {
    throw new Error('invalid-sessionid')
  }
  if (req.query.message === 'success') {
    req.data = {
      session: {
        sessionid: req.query.sessionid
      }
    }
    return
  }
  const session = await global.api.user.Session.get(req)
  session.createdFormatted = dashboard.Format.date(session.created)
  session.expiresFormatted = dashboard.Format.date(session.expires)
  req.data = { session }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.session, 'session', req.language)
  await navbar.setup(doc, req.data.session)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  } else {
    dashboard.HTML.renderTemplate(doc, null, 'instant-delete', 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.SetSessionEnded.patch(req)
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
  if (req.query.sessionid === req.session.sessionid) {
    req.query = {}
    req.urlPath = req.url = '/home'
    return dashboard.Response.redirectToSignIn(req, res)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?sessionid=${req.query.sessionid}&message=success`
    })
    return res.end()
  }
}
