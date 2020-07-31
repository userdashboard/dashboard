const dashboard = require('../../../index.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.codeid) {
    throw new Error('invalid-reset-codeid')
  }
  if (req.query.message === 'success') {
    req.data = {
      resetCode: {
        codeid: req.query.codeid
      }
    }
    return
  }
  const resetCode = await global.api.user.ResetCode.get(req)
  if (!resetCode) {
    throw new Error('invalid-reset-codeid')
  }
  resetCode.createdFormatted = dashboard.Format.date(resetCode.created)
  req.data = { resetCode }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.resetCode, 'resetCode', req.language)
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
    await global.api.user.DeleteResetCode.delete(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?codeid=${req.query.codeid}&message=success`
    })
    return res.end()
  }
}
