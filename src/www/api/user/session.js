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
    if (session.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    delete (session.tokenHash)
    if (!session.ended) {
      if (session.sessionKeyNumber < req.account.sessionKeyNumber) {
        session.ended = req.account.sessionKeyLastReset
      } else if (session.expires <= dashboard.Timestamp.now) {
        session.ended = session.expires
      }
    }
    return session
  }
}
