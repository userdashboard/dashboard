const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.profileid) {
    throw new Error('invalid-profileid')
  }
  const profile = await global.api.administrator.Profile.get(req)
  if (!profile) {
    throw new Error('invalid-profile')
  }
  profile.createdFormatted = dashboard.Format.date(profile.created)
  req.data = { profile }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.profile, 'profile')
  const removeFields = [].concat(global.profileFields)
  const usedFields = []
  for (const field of removeFields) {
    if (usedFields.indexOf(field) > -1) {
      continue
    }
    if (field === 'full-name') {
      if (req.data.profile.firstName &&
        removeFields.indexOf('full-name') > -1 &&
        usedFields.indexOf(field) === -1) {
        usedFields.push(field)
      }
      continue
    }
    const displayName = global.profileFieldMap[field]
    if (req.data.profile[displayName] &&
      removeFields.indexOf(field) > -1 &&
      usedFields.indexOf(field) === -1) {
      usedFields.push(field)
    }
  }
  for (const id of removeFields) {
    if (usedFields.indexOf(id) === -1) {
      const element = doc.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
