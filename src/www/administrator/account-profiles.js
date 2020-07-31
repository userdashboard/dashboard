const dashboard = require('../../../index.js')
const navbar = require('./navbar-account.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.accountid) {
    throw new Error('invalid-accountid')
  }
  const total = await global.api.administrator.ProfilesCount.get(req)
  const profiles = await global.api.administrator.Profiles.get(req)
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      profile.createdFormatted = dashboard.Format.date(profile.created)
    }
  }
  const account = await global.api.administrator.Account.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { profiles, account, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account', req.language)
  await navbar.setup(doc, req.data.account)
  const removeElements = []
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderTable(doc, req.data.profiles, 'profile-row', 'profiles-table')
    const removeFields = [].concat(global.profileFields)
    const profileFields = req.userProfileFields || global.userProfileFields
    for (const field of profileFields) {
      removeFields.splice(removeFields.indexOf(field), 1)
    }
    for (const field of removeFields) {
      removeElements.push(field)
    }
    for (const profile of req.data.profiles) {
      for (const field of removeFields) {
        removeElements.push(`${field}-${profile.profileid}`)
      }
    }
    if (req.data.total <= global.pageSize) {
      removeElements.push('page-links')
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    removeElements.push('no-profiles')
  } else {
    removeElements.push('profiles-table')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
