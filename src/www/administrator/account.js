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
  const account = await global.api.administrator.Account.get(req)
  account.createdFormatted = dashboard.Format.date(account.created)
  account.lastSignedInFormatted = dashboard.Format.date(account.lastSignedIn)
  req.query.profileid = account.profileid
  const profiles = await global.api.administrator.Profiles.get(req)
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      profile.createdFormatted = dashboard.Format.date(profile.created)
    }
  }
  const sessions = await global.api.administrator.Sessions.get(req)
  if (sessions && sessions.length) {
    for (const session of sessions) {
      session.createdFormatted = dashboard.Format.date(session.created)
      session.expiresFormatted = dashboard.Format.date(session.expires)
    }
  }
  const resetCodes = await global.api.administrator.ResetCodes.get(req)
  if (resetCodes && resetCodes.length) {
    for (const resetCode of resetCodes) {
      resetCode.createdFormatted = dashboard.Format.date(resetCode.created)
    }
  }
  req.data = { account, profiles, sessions, resetCodes }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.account, 'account', req.language)
  await navbar.setup(doc, req.data.account)
  if (req.data.sessions && req.data.sessions.length) {
    dashboard.HTML.renderTable(doc, req.data.sessions, 'session-row', 'sessions-table')
  } else {
    const sessionsTable = doc.getElementById('sessions-table')
    sessionsTable.parentNode.removeChild(sessionsTable)
  }
  if (req.data.resetCodes && req.data.resetCodes.length) {
    dashboard.HTML.renderTable(doc, req.data.resetCodes, 'reset-code-row', 'reset-codes-table')
  } else {
    const resetCodesContainer = doc.getElementById('reset-codes-container')
    resetCodesContainer.parentNode.removeChild(resetCodesContainer)
  }
  if (req.data.profiles && req.data.profiles.length) {
    dashboard.HTML.renderTable(doc, req.data.profiles, 'profile-row', 'profiles-table')
  } else {
    const profilesTable = doc.getElementById('profiles-table')
    profilesTable.parentNode.removeChild(profilesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
