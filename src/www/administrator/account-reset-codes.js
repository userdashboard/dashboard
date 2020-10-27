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
  const total = await global.api.administrator.ResetCodesCount.get(req)
  const resetCodes = await global.api.administrator.ResetCodes.get(req)
  if (resetCodes && resetCodes.length) {
    for (const resetCode of resetCodes) {
      resetCode.createdFormatted = dashboard.Format.date(resetCode.created)
    }
  }
  const account = await global.api.administrator.Account.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { resetCodes, account, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.account, 'account', req.language)
  await navbar.setup(doc, req.data.account)
  if (req.data.resetCodes && req.data.resetCodes.length) {
    dashboard.HTML.renderTable(doc, req.data.resetCodes, 'reset-code-row', 'reset-codes-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noResetCodes = doc.getElementById('no-reset-codes')
    noResetCodes.parentNode.removeChild(noResetCodes)
  } else {
    const resetCodesTable = doc.getElementById('reset-codes-table')
    resetCodesTable.parentNode.removeChild(resetCodesTable)
  }
  return dashboard.Response.end(req, res, doc)
}
