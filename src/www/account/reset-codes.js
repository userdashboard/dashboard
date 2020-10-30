const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.ResetCodesCount.get(req)
  const resetCodes = await global.api.user.ResetCodes.get(req)
  if (resetCodes && resetCodes.length) {
    for (const code of resetCodes) {
      code.createdFormatted = dashboard.Format.date(code.created)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { resetCodes, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
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
