const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.accountid) {
      index = `${req.appid}/account/sessions/${req.query.accountid}`
    } else {
      index = `${req.appid}/sessions`
    }
    let sessionids
    if (req.query.all) {
      sessionids = await dashboard.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      sessionids = await dashboard.StorageList.list(index, offset, limit)
    }
    if (!sessionids || !sessionids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/session`, sessionids)
    const sessions = []
    for (const sessionid of sessionids) {
      req.query.sessionid = sessionid
      const session = await global.api.administrator.Session.get(req)
      sessions.push(session)
    }
    return sessions
  }
}
