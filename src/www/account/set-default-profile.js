const dashboard = require('../../../index.js')
const navbar = require('./navbar-profile.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  req.query.all = true
  const profiles = await global.api.user.Profiles.get(req)
  req.query.profileid = req.account.profileid
  const profile = await global.api.user.Profile.get(req)
  profile.createdFormatted = dashboard.Format.date(profile.created)
  req.data = { profile, profiles }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.profile, 'profile', req.language)
  navbar.setup(doc, req.data.profile)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderList(doc, req.data.profiles, 'profile-option', 'profileid')
    dashboard.HTML.setSelectedOptionByValue(doc, 'profileid', req.query.profileid)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body || !req.body.profileid) {
    return renderPage(req, res)
  }
  if (req.account.profileid === req.body.profileid) {
    return renderPage(req, res, 'default-profile')
  }
  if (!req.data.profiles || !req.data.profiles.length) {
    return renderPage(req, res, 'invalid-profileid')
  }
  let found
  for (const profile of req.data.profiles) {
    found = profile.profileid === req.body.profileid
    if (found) {
      break
    }
  }
  if (!found) {
    return renderPage(req, res, 'invalid-profileid')
  }
  try {
    req.query = req.query || {}
    req.query.accountid = req.account.accountid
    await global.api.user.SetAccountProfile.patch(req)
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
