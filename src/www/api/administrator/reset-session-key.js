const dashboard = require('../../../../index.js')

module.exports = {
  /**
   * End all of a user's sessions by generating a new
   * session key that invalidates all previous sessions
   */
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    await dashboard.StorageObject.setProperties(`${req.appid}/account/${req.query.accountid}`, {
      sessionKey: dashboard.UUID.random(64),
      sessionKeyLastReset: dashboard.Timestamp.now,
      sessionKeyNumber: account.sessionKeyNumber + 1
    })
    return global.api.administrator.Account.get(req)
  }
}
