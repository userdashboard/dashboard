const dashboard = require('../../../index.js')
const navbar = require('./navbar-profile.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  if (req.query.message === 'success') {
    req.data = {
      profile: {
        profileid: req.query.profileid
      }
    }
    return
  }
  if (req.query.profileid === req.account.profileid) {
    throw new Error('invalid-profile')
  }
  const profile = await global.api.user.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profileid')
  }
  profile.createdFormatted = dashboard.Format.date(profile.created)
  profile.default = req.account.profileid === profile.profileid
  req.data = { profile }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.profile, 'profile')
  await navbar.setup(doc, req.data.profile)
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
    await global.api.user.DeleteProfile.delete(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?profileid=${req.query.profileid}&message=success`
    })
    return res.end()
  }
}
