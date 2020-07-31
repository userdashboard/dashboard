const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.sessionid) {
      throw new Error('invalid-sessionid')
    }
    let session
    if (req.cacheData && req.cacheData[req.query.sessionid]) {
      session = req.cacheData[req.query.sessionid]
    } else {
      session = await dashboard.Storage.read(`${req.appid}/session/${req.query.sessionid}`)
    }
    if (!session) {
      throw new Error('invalid-sessionid')
    }
    try {
      session = JSON.parse(session)
    } catch (error) {
    }
    if (!session || session.object !== 'session') {
      throw new Error('invalid-sessionid')
    }
    delete (session.tokenHash)
    if (!session.ended) {
      const query = req.query
      req.query.accountid = session.accountid
      const account = await global.api.administrator.Account.get(req)
      req.query = query
      if (session.sessionKeyNumber < account.sessionKeyNumber) {
        session.ended = account.sessionKeyLastReset
      } else if (session.expires <= dashboard.Timestamp.now) {
        session.ended = session.expires
      }
    }
    return session
  }
}
