const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  const requirements = {
    object: 'requirements',
    minimumUsernameLength: global.minimumUsernameLength,
    minimumPasswordLength: global.minimumPasswordLength
  }
  const doc = dashboard.HTML.parse(req.html || req.route.html, requirements, 'requirements')
  if (global.disableRegistration) {
    messageTemplate = 'registration-disabled'
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'registration-disabled') {
      const submitForm = doc.getElementById('form-container')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const removeFields = [].concat(global.profileFields)
  if (!global.requireProfile) {
    for (const id of removeFields) {
      const element = doc.getElementById(`${id}-container`)
      element.parentNode.removeChild(element)
    }
  } else {
    const profileFields = req.userProfileFields || global.userProfileFields
    for (const field of profileFields) {
      removeFields.splice(removeFields.indexOf(field), 1)
    }
    for (const id of removeFields) {
      const element = doc.getElementById(`${id}-container`)
      if (!element || !element.parentNode) {
        continue
      }
      element.parentNode.removeChild(element)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (global.disableRegistration) {
    return renderPage(req, res)
  }
  if (!req || !req.body) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.username || !req.body.username.length) {
    return renderPage(req, res, 'invalid-username')
  }
  if (!req.body.password || !req.body.password.length) {
    return renderPage(req, res, 'invalid-password')
  }
  req.body.username = req.body.username.trim ? req.body.username.trim() : req.body.username
  if (global.minimumUsernameLength > req.body.username.length ||
      global.maximumUsernameLength < req.body.username.length) {
    return renderPage(req, res, 'invalid-username-length')
  }
  req.body.password = req.body.password.trim ? req.body.password.trim() : req.body.password
  if (global.minimumPasswordLength > req.body.password.length ||
      global.maximumPasswordLength < req.body.password.length) {
    return renderPage(req, res, 'invalid-password-length')
  }
  if (req.body.confirm !== req.body.password) {
    return renderPage(req, res, 'invalid-confirm')
  }
  if (global.requireProfile) {
    const profileFields = req.userProfileFields || global.userProfileFields
    for (const field of profileFields) {
      switch (field) {
        case 'full-name':
          if (!req.body['first-name'] || !req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name')
          }
          req.body['first-name'] = req.body['first-name'].trim ? req.body['first-name'].trim() : req.body['first-name']
          if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
            global.maximumProfileFirstNameLength < req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name-length')
          }
          if (!req.body['last-name'] || !req.body['last-name'].length) {
            return renderPage(req, res, 'invalid-last-name')
          }
          req.body['last-name'] = req.body['last-name'].trim ? req.body['last-name'].trim() : req.body['last-name']
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
          req.body['display-name'] = req.body['display-name'].trim ? req.body['display-name'].trim() : req.body['display-name']
          if (global.minimumProfileDisplayNameLength > req.body[field].length ||
            global.maximumProfileDisplayNameLength < req.body[field].length) {
            return renderPage(req, res, 'invalid-display-name-length')
          }
          continue
        case 'company-name':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          req.body['company-name'] = req.body['company-name'].trim ? req.body['company-name'].trim() : req.body['company-name']
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
  }
  try {
    await global.api.user.CreateAccount.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  req.route = global.sitemap['/account/signin']
  return req.route.api.post(req, res)
}
