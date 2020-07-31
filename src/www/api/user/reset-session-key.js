const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKey', dashboard.UUID.random(64))
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKeyLastReset', dashboard.Timestamp.now)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'sessionKeyNumber', req.account.sessionKeyNumber + 1)
    return true
  }
}
