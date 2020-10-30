const dashboard = require('../../../index.js')

module.exports = {
  get: renderPage
}

function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (global.deleteDelay) {
    const data = {
      numDays: global.deleteDelay
    }
    dashboard.HTML.renderTemplate(doc, data, 'scheduled-delete-template', 'message-container')
  } else {
    dashboard.HTML.renderTemplate(doc, null, 'instant-delete-template', 'message-container')
  }
  return dashboard.Response.end(req, res, doc)
}
