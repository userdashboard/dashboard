const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  patch: async (req) => {
    if (!req.body || !req.body['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    if (!req.body.username) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length ||
      global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (!req.body['new-password'] || !req.body['new-password'].length) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body['new-password'].length) {
      throw new Error('invalid-password-length')
    }
    if (!req.body['secret-code'] || !req.body['secret-code'].length) {
      throw new Error('invalid-secret-code')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const usernameHash = await dashboard.Hash.sha512Hash(req.body.username, dashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const query = req.query
    req.query = { accountid }
    const account = await global.api.administrator.Account.get(req)
    req.query = query
    if (!account) {
      throw new Error('invalid-username')
    }
    if (account.deleted) {
      throw new Error('invalid-account')
    }
    if (account.deleted < dashboard.Timestamp.now) {
      throw new Error('invalid-account')
    }
    const secretCodeHash = await dashboard.Hash.sha512Hash(req.body['secret-code'], dashboardEncryptionKey)
    const codeid = await dashboard.Storage.read(`${req.appid}/map/account/resetCodes/${accountid}/${secretCodeHash}`)
    if (!codeid) {
      throw new Error('invalid-reset-code')
    }
    const passwordHash = await dashboard.Hash.bcryptHashHash(req.body['new-password'], dashboardEncryptionKey)
    await dashboard.StorageObject.setProperties(`${req.appid}/account/${accountid}`, {
      passwordHash,
      resetCodeLastUsed: dashboard.Timestamp.now,
      sessionKey: dashboard.UUID.random(64),
      sessionKeyLastReset: dashboard.Timestamp.now,
      passwordLastChanged: dashboard.Timestamp.now,
      sessionKeyNumber: account.sessionKeyNumber + 1
    })
    await dashboard.Storage.delete(`${req.appid}/resetCode/${codeid}`)
    await dashboard.StorageList.remove(`${req.appid}/resetCodes`, codeid)
    await dashboard.StorageList.remove(`${req.appid}/account/resetCodes/${accountid}`, codeid)
    await dashboard.Storage.delete(`${req.appid}/map/account/resetCodes/${accountid}/${secretCodeHash}`)
    return true
  }
}
