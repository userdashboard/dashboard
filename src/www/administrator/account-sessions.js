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
  const total = await global.api.administrator.SessionsCount.get(req)
  const sessions = await global.api.administrator.Sessions.get(req)
  if (sessions && sessions.length) {
    for (const session of sessions) {
      session.createdFormatted = dashboard.Format.date(session.created)
      session.expiresFormatted = dashboard.Format.date(session.expires)
    }
  }
  const account = await global.api.administrator.Account.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { sessions, account, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.account, 'account', req.language)
  await navbar.setup(doc, req.data.account)
  if (req.data.sessions && req.data.sessions.length) {
    dashboard.HTML.renderTable(doc, req.data.sessions, 'session-row', 'sessions-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noSessions = doc.getElementById('no-sessions')
    noSessions.parentNode.removeChild(noSessions)
  } else {
    const sessionsTable = doc.getElementById('sessions-table')
    sessionsTable.parentNode.removeChild(sessionsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
