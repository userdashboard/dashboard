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
  const profile = await global.api.user.Profile.get(req)
  req.data = { profile }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.profile, 'profile', req.language)
  navbar.setup(doc, req.data.profile)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
    return dashboard.Response.end(req, res, doc)
  }
  const removeFields = [].concat(global.profileFields)
  const profileFields = req.userProfileFields || global.userProfileFields
  for (const field of profileFields) {
    removeFields.splice(removeFields.indexOf(field), 1)
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      removeFields.push('submit-form')
    }
  }
  for (const id of removeFields) {
    const element = doc.getElementById(`${id}-container`)
    if (!element || !element.parentNode) {
      continue
    }
    element.parentNode.removeChild(element)
  }
  if (req.method === 'GET') {
    for (const field in req.data.profile) {
      const element = doc.getElementById(field)
      if (!element) {
        continue
      }
      element.attr.value = req.data.profile[field]
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  const profileFields = req.userProfileFields || global.userProfileFields
  for (const field of profileFields) {
    switch (field) {
      case 'full-name':
        if (!req.body['first-name'] || !req.body['first-name'].length) {
          return renderPage(req, res, 'invalid-first-name')
        }
        if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
          global.maximumProfileFirstNameLength < req.body['first-name'].length) {
          return renderPage(req, res, 'invalid-first-name-length')
        }
        if (!req.body['last-name'] || !req.body['last-name'].length) {
          return renderPage(req, res, 'invalid-last-name')
        }
        if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
          global.maximumProfileLastNameLength < req.body['last-name'].length) {
          return renderPage(req, res, 'invalid-last-name-length')
        }
        continue
      case 'contact-email':
        if (!req.body[field] || req.body[field].indexOf('@') < 1) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
      case 'display-email':
        if (!req.body[field] || req.body[field].indexOf('@') < 1) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
      case 'display-name':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        if (global.minimumProfileDisplayNameLength > req.body[field].length ||
          global.maximumProfileDisplayNameLength < req.body[field].length) {
          return renderPage(req, res, 'invalid-display-name-length')
        }
        continue
      case 'company-name':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        if (global.minimumProfileCompanyNameLength > req.body[field].length ||
          global.maximumProfileCompanyNameLength < req.body[field].length) {
          return renderPage(req, res, 'invalid-company-name-length')
        }
        continue
      case 'dob':
        if (!req.body[field] || !req.body[field].length) {
          return renderPage(req, res, `invalid-${field}`)
        }
        try {
          const date = dashboard.Format.parseDate(req.body[field])
          if (!date || !date.getFullYear) {
            return renderPage(req, res, `invalid-${field}`)
          }
        } catch (error) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
      default:
        if (!req.body || !req.body[field]) {
          return renderPage(req, res, `invalid-${field}`)
        }
        continue
    }
  }
  try {
    await global.api.user.UpdateProfile.patch(req)
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
