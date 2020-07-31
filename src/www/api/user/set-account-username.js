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
    if (!req.body || !req.body['new-username']) {
      throw new Error('invalid-new-username')
    }
    if (global.minimumUsernameLength > req.body['new-username'].length ||
      global.maximumUsernameLength < req.body['new-username'].length) {
      throw new Error('invalid-new-username-length')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const realPasswordHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${req.query.accountid}`, 'passwordHash')
    const validPassword = await dashboard.Hash.bcryptHashCompare(req.body.password, realPasswordHash, dashboardEncryptionKey)
    if (!validPassword) {
      throw new Error('invalid-password')
    }
    const usernameHash = await dashboard.Hash.sha512Hash(req.body['new-username'], dashboardEncryptionKey)
    const oldUsernameHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameHash')
    await dashboard.Storage.delete(`${req.appid}/map/usernames/${oldUsernameHash}`)
    await dashboard.Storage.write(`${req.appid}/map/usernames/${usernameHash}`, req.query.accountid)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameHash', usernameHash)
    req.account.usernameLastChanged = dashboard.Timestamp.now
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'usernameLastChanged', dashboard.Timestamp.now)
    return req.account
  }
}
