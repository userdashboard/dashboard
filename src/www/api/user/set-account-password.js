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
    if (!req.body || !req.body['new-password']) {
      throw new Error('invalid-new-password')
    }
    if (global.minimumPasswordLength > req.body['new-password'].length ||
      global.maximumPasswordLength < req.body['new-password'].length) {
      throw new Error('invalid-new-password-length')
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
    const newPasswordHash = await dashboard.Hash.bcryptHashHash(req.body['new-password'], dashboardEncryptionKey)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'passwordHash', newPasswordHash)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'passwordLastChanged', dashboard.Timestamp.now)
    return global.api.user.Account.get(req)
  }
}
